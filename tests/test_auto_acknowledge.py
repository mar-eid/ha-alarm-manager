"""Tests for F20: auto-acknowledge after an alarm has sat returned-to-normal."""

from __future__ import annotations

import tempfile
from datetime import UTC, datetime, timedelta
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.scada_alarm_manager import state_machine as sm
from custom_components.scada_alarm_manager.alarm_manager import AlarmManager
from custom_components.scada_alarm_manager.const import AlarmEventType, AlarmPriority, AlarmState, TriggerType
from custom_components.scada_alarm_manager.database import AlarmDatabase
from custom_components.scada_alarm_manager.models import AlarmDefinition, AlarmRuntimeState


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _event_alarm(**kwargs):
    defaults = {
        "id": "doorbell",
        "name": "Doorbell",
        "priority": AlarmPriority.HIGH,
        "source_entity_id": "binary_sensor.doorbell",
        "trigger_type": TriggerType.EXTERNAL,
        "trigger_config": {},
        "ack_required": True,
        "auto_ack_delay": 900,
    }
    defaults.update(kwargs)
    return AlarmDefinition(**defaults)


@pytest.fixture
def manager(hass, mock_database, mock_store):
    mgr = AlarmManager(hass, mock_database, mock_store)
    router = MagicMock()
    router.async_send_alarm_notification = AsyncMock()
    router.async_dismiss_alarm_notification = AsyncMock()
    mgr.set_notification_router(router)
    return mgr


def _register(manager, alarm, state=AlarmState.NORMAL, **runtime):
    manager._alarms[alarm.id] = alarm
    manager._runtime_states[alarm.id] = AlarmRuntimeState(alarm_id=alarm.id, state=state, **runtime)


def _ago(**kwargs):
    return datetime.now(UTC) - timedelta(**kwargs)


class TestPulseEvent:
    async def test_trigger_clear_pulse_records_returned_at(self, manager):
        alarm = _event_alarm()
        _register(manager, alarm)

        await manager.async_trigger_external("doorbell")
        await manager.async_clear_external("doorbell")

        runtime = manager.runtime_states["doorbell"]
        assert runtime.state == AlarmState.RTN_UNACKED
        assert runtime.returned_at is not None
        manager._notification_router.async_send_alarm_notification.assert_awaited_once()

    async def test_auto_acks_after_delay_and_dismisses(self, manager, mock_database):
        alarm = _event_alarm()
        _register(manager, alarm, AlarmState.RTN_UNACKED, triggered_at=_ago(minutes=20), returned_at=_ago(minutes=16))

        await manager._async_periodic_check(datetime.now(UTC))

        runtime = manager.runtime_states["doorbell"]
        assert runtime.state == AlarmState.NORMAL
        assert runtime.acked_by == "auto"
        assert runtime.returned_at is None
        manager._notification_router.async_dismiss_alarm_notification.assert_awaited_once_with(alarm)
        logged = [c.args[0] for c in mock_database.async_log_event.call_args_list]
        assert [e.event_type for e in logged] == [AlarmEventType.AUTO_ACKNOWLEDGED]

    async def test_waits_until_delay_has_passed(self, manager):
        alarm = _event_alarm()
        _register(manager, alarm, AlarmState.RTN_UNACKED, returned_at=_ago(minutes=5))

        await manager._async_periodic_check(datetime.now(UTC))

        assert manager.runtime_states["doorbell"].state == AlarmState.RTN_UNACKED


class TestScope:
    async def test_never_acks_active_alarm(self, manager):
        alarm = _event_alarm()
        _register(manager, alarm, AlarmState.ACTIVE_UNACKED, triggered_at=_ago(days=3))

        await manager._async_periodic_check(datetime.now(UTC))

        assert manager.runtime_states["doorbell"].state == AlarmState.ACTIVE_UNACKED

    async def test_off_when_delay_not_set(self, manager):
        alarm = _event_alarm(auto_ack_delay=None)
        _register(manager, alarm, AlarmState.RTN_UNACKED, returned_at=_ago(days=3))

        await manager._async_periodic_check(datetime.now(UTC))

        assert manager.runtime_states["doorbell"].state == AlarmState.RTN_UNACKED

    async def test_legacy_rtn_without_returned_at_uses_triggered_at(self, manager):
        """Alarms already in RTN when upgrading have no returned_at yet."""
        alarm = _event_alarm()
        _register(manager, alarm, AlarmState.RTN_UNACKED, triggered_at=_ago(hours=2))

        await manager._async_periodic_check(datetime.now(UTC))

        assert manager.runtime_states["doorbell"].state == AlarmState.NORMAL

    async def test_retrigger_resets_the_clock(self, manager):
        alarm = _event_alarm()
        _register(manager, alarm, AlarmState.RTN_UNACKED, returned_at=_ago(minutes=16))

        await manager.async_trigger_external("doorbell")
        assert manager.runtime_states["doorbell"].returned_at is None
        await manager.async_clear_external("doorbell")
        await manager._async_periodic_check(datetime.now(UTC))

        assert manager.runtime_states["doorbell"].state == AlarmState.RTN_UNACKED

    async def test_works_for_evaluated_alarms(self, hass, manager):
        alarm = _event_alarm(
            trigger_type=TriggerType.DIGITAL, trigger_config={"target_state": "on"}, auto_ack_delay=60
        )
        _register(manager, alarm)
        hass.states.async_set("binary_sensor.doorbell", "on")
        await manager._async_evaluate_alarm(alarm, hass.states.get("binary_sensor.doorbell"))
        hass.states.async_set("binary_sensor.doorbell", "off")
        await manager._async_evaluate_alarm(alarm, hass.states.get("binary_sensor.doorbell"))
        assert manager.runtime_states["doorbell"].state == AlarmState.RTN_UNACKED

        await manager._async_periodic_check(datetime.now(UTC) + timedelta(minutes=2))
        assert manager.runtime_states["doorbell"].state == AlarmState.RTN_UNACKED  # uses wall clock, not arg

        manager._runtime_states["doorbell"].returned_at = _ago(minutes=2)
        await manager._async_periodic_check(datetime.now(UTC))
        assert manager.runtime_states["doorbell"].state == AlarmState.NORMAL


class TestStateMachine:
    @pytest.mark.parametrize(
        "state", [AlarmState.NORMAL, AlarmState.ACTIVE_UNACKED, AlarmState.ACTIVE_ACKED, AlarmState.SHELVED]
    )
    def test_only_rtn_unacked_is_acknowledged(self, state):
        runtime = AlarmRuntimeState(alarm_id="a", state=state)
        new, events = sm.auto_acknowledge(runtime)
        assert new is runtime
        assert events == []

    def test_manual_ack_clears_returned_at(self):
        runtime = AlarmRuntimeState(alarm_id="a", state=AlarmState.RTN_UNACKED, returned_at=_ago(minutes=1))
        new, _ = sm.acknowledge(runtime, "user")
        assert new.state == AlarmState.NORMAL
        assert new.returned_at is None


class TestPersistence:
    async def test_definition_and_runtime_roundtrip(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db = AlarmDatabase(Path(tmpdir) / "t.db")
            await db.async_init()
            await db.async_create_alarm(_event_alarm())
            assert (await db.async_get_alarm("doorbell")).auto_ack_delay == 900

            returned = _ago(minutes=3)
            await db.async_save_runtime_state(
                AlarmRuntimeState(alarm_id="doorbell", state=AlarmState.RTN_UNACKED, returned_at=returned)
            )
            loaded = (await db.async_load_runtime_states())["doorbell"]
            assert loaded.returned_at == returned
            await db.async_close()

    def test_from_dict_defaults_off(self):
        data = _event_alarm().to_dict()
        data.pop("auto_ack_delay")
        assert AlarmDefinition.from_dict(data).auto_ack_delay is None
