"""Tests for F19: escalation suppression (Very Low suppresses Low on the same sensor)."""

from __future__ import annotations

import tempfile
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import aiosqlite
import pytest

from custom_components.scada_alarm_manager import state_machine as sm
from custom_components.scada_alarm_manager.alarm_manager import AlarmManager
from custom_components.scada_alarm_manager.const import AlarmEventType, AlarmPriority, AlarmState, TriggerType
from custom_components.scada_alarm_manager.database import AlarmDatabase
from custom_components.scada_alarm_manager.models import AlarmDefinition, AlarmRuntimeState

SENSOR = "sensor.battery"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _limit(alarm_id, operator, threshold, *, priority=AlarmPriority.WARNING, entity=SENSOR, **kwargs):
    return AlarmDefinition(
        id=alarm_id,
        name=alarm_id,
        priority=priority,
        source_entity_id=entity,
        trigger_type=TriggerType.ANALOG,
        trigger_config={"operator": operator, "threshold": threshold},
        enabled=True,
        **kwargs,
    )


@pytest.fixture
def manager(hass, mock_database, mock_store):
    mgr = AlarmManager(hass, mock_database, mock_store)
    router = MagicMock()
    router.async_send_alarm_notification = AsyncMock()
    router.async_dismiss_alarm_notification = AsyncMock()
    mgr.set_notification_router(router)
    return mgr


def _register(manager, *alarms):
    for alarm in alarms:
        manager._alarms[alarm.id] = alarm
        manager._runtime_states[alarm.id] = AlarmRuntimeState(alarm_id=alarm.id, state=AlarmState.NORMAL)


def _set(hass, manager, value, entity=SENSOR):
    """Set the sensor and evaluate like the state-change listener does (most extreme first)."""
    hass.states.async_set(entity, str(value))

    async def _run():
        from custom_components.scada_alarm_manager.alarm_manager import _severity_sort_key

        for alarm in sorted(manager._alarms.values(), key=_severity_sort_key):
            if alarm.source_entity_id == entity:
                await manager._async_evaluate_alarm(alarm, hass.states.get(entity))

    return _run()


def _state(manager, alarm_id):
    return manager.runtime_states[alarm_id].state


def _logged(mock_database, event_type):
    return [c.args[0] for c in mock_database.async_log_event.call_args_list if c.args[0].event_type == event_type]


class TestLowLowChain:
    async def test_full_escalation_and_return(self, hass, manager, mock_database):
        """The user scenario: Low → Very Low suppresses Low → back to Low (visible + notified) → normal."""
        low = _limit("low", "<", 20)
        very_low = _limit("very_low", "<", 10, priority=AlarmPriority.HIGH)
        _register(manager, low, very_low)
        router = manager._notification_router

        await _set(hass, manager, 15)
        assert _state(manager, "low") == AlarmState.ACTIVE_UNACKED
        assert _state(manager, "very_low") == AlarmState.NORMAL

        router.async_send_alarm_notification.reset_mock()
        await _set(hass, manager, 5)
        assert _state(manager, "very_low") == AlarmState.ACTIVE_UNACKED
        assert _state(manager, "low") == AlarmState.NORMAL  # suppressed, no ack owed
        router.async_dismiss_alarm_notification.assert_any_await(low)
        sent = [c.args[0].id for c in router.async_send_alarm_notification.await_args_list]
        assert sent == ["very_low"]
        suppressed = _logged(mock_database, AlarmEventType.SUPPRESSED)
        assert len(suppressed) == 1
        assert suppressed[0].alarm_id == "low"
        assert suppressed[0].details == {"suppressed_by": "very_low", "suppressed_by_name": "very_low"}
        assert manager.get_suppressor("low") is very_low

        router.async_send_alarm_notification.reset_mock()
        await _set(hass, manager, 15)
        assert _state(manager, "very_low") == AlarmState.RTN_UNACKED
        assert _state(manager, "low") == AlarmState.ACTIVE_UNACKED  # comes back on
        sent = [c.args[0].id for c in router.async_send_alarm_notification.await_args_list]
        assert sent == ["low"]
        assert manager.get_suppressor("low") is None

        await _set(hass, manager, 50)
        assert _state(manager, "low") == AlarmState.RTN_UNACKED

    async def test_drop_straight_to_very_low_never_fires_low(self, hass, manager):
        low = _limit("low", "<", 20)
        very_low = _limit("very_low", "<", 10)
        _register(manager, low, very_low)

        await _set(hass, manager, 5)

        assert _state(manager, "very_low") == AlarmState.ACTIVE_UNACKED
        assert _state(manager, "low") == AlarmState.NORMAL
        sent = [c.args[0].id for c in manager._notification_router.async_send_alarm_notification.await_args_list]
        assert sent == ["very_low"]

    async def test_low_evaluated_first_is_cleaned_up_by_sibling_reevaluation(self, hass, manager):
        """Even if Low wins the race, Very Low activating re-evaluates and suppresses it."""
        low = _limit("low", "<", 20)
        very_low = _limit("very_low", "<", 10)
        _register(manager, low, very_low)
        hass.states.async_set(SENSOR, "5")

        await manager._async_evaluate_alarm(low, hass.states.get(SENSOR))
        assert _state(manager, "low") == AlarmState.ACTIVE_UNACKED
        await manager._async_evaluate_alarm(very_low, hass.states.get(SENSOR))

        assert _state(manager, "low") == AlarmState.NORMAL

    async def test_acked_very_low_still_suppresses(self, hass, manager):
        low = _limit("low", "<", 20)
        very_low = _limit("very_low", "<", 10)
        _register(manager, low, very_low)
        await _set(hass, manager, 5)

        await manager.async_acknowledge("very_low")
        await _set(hass, manager, 4)

        assert _state(manager, "very_low") == AlarmState.ACTIVE_ACKED
        assert _state(manager, "low") == AlarmState.NORMAL

    async def test_three_level_chain(self, hass, manager):
        high = _limit("h", ">", 25)
        high_high = _limit("hh", ">", 30)
        high3 = _limit("hhh", ">", 40)
        _register(manager, high, high_high, high3)

        await _set(hass, manager, 45)
        assert _state(manager, "hhh") == AlarmState.ACTIVE_UNACKED
        assert _state(manager, "hh") == AlarmState.NORMAL
        assert _state(manager, "h") == AlarmState.NORMAL
        assert manager.get_suppressor("h") is high3

        await _set(hass, manager, 35)
        assert _state(manager, "hh") == AlarmState.ACTIVE_UNACKED
        assert _state(manager, "h") == AlarmState.NORMAL
        assert manager.get_suppressor("h") is high_high


class TestOptOut:
    async def test_suppress_milder_off_keeps_both_active(self, hass, manager):
        low = _limit("low", "<", 20)
        very_low = _limit("very_low", "<", 10, suppress_milder=False)
        _register(manager, low, very_low)

        await _set(hass, manager, 5)

        assert _state(manager, "very_low") == AlarmState.ACTIVE_UNACKED
        assert _state(manager, "low") == AlarmState.ACTIVE_UNACKED

    async def test_turning_flag_off_via_update_restores_milder(self, hass, manager):
        low = _limit("low", "<", 20)
        very_low = _limit("very_low", "<", 10)
        _register(manager, low, very_low)
        await _set(hass, manager, 5)
        assert _state(manager, "low") == AlarmState.NORMAL

        updated = _limit("very_low", "<", 10, suppress_milder=False)
        await manager.async_update_alarm(updated)

        assert _state(manager, "low") == AlarmState.ACTIVE_UNACKED

    async def test_deleting_suppressor_restores_milder(self, hass, manager):
        low = _limit("low", "<", 20)
        very_low = _limit("very_low", "<", 10)
        _register(manager, low, very_low)
        await _set(hass, manager, 5)

        await manager.async_delete_alarm("very_low")

        assert _state(manager, "low") == AlarmState.ACTIVE_UNACKED


class TestScope:
    async def test_other_sensor_not_suppressed(self, hass, manager):
        low = _limit("low", "<", 20, entity="sensor.other")
        very_low = _limit("very_low", "<", 10)
        _register(manager, low, very_low)

        hass.states.async_set("sensor.other", "15")
        await manager._async_evaluate_alarm(low, hass.states.get("sensor.other"))
        await _set(hass, manager, 5)

        assert _state(manager, "low") == AlarmState.ACTIVE_UNACKED

    async def test_opposite_direction_not_suppressed(self, hass, manager):
        low = _limit("low", "<", 20)
        high = _limit("high", ">", 10)
        _register(manager, low, high)

        await _set(hass, manager, 15)

        assert _state(manager, "low") == AlarmState.ACTIVE_UNACKED
        assert _state(manager, "high") == AlarmState.ACTIVE_UNACKED

    async def test_equal_thresholds_do_not_suppress_each_other(self, hass, manager):
        a = _limit("a", "<", 10)
        b = _limit("b", "<=", 10)
        _register(manager, a, b)

        await _set(hass, manager, 5)

        assert _state(manager, "a") == AlarmState.ACTIVE_UNACKED
        assert _state(manager, "b") == AlarmState.ACTIVE_UNACKED

    async def test_digital_alarm_never_participates(self, hass, manager):
        low = _limit("low", "<", 20)
        digital = AlarmDefinition(
            id="dig",
            name="dig",
            source_entity_id=SENSOR,
            trigger_type=TriggerType.DIGITAL,
            trigger_config={"target_state": "5"},
        )
        _register(manager, low, digital)

        await _set(hass, manager, 5)

        assert _state(manager, "low") == AlarmState.ACTIVE_UNACKED
        assert _state(manager, "dig") == AlarmState.ACTIVE_UNACKED

    async def test_shelved_suppressor_does_not_suppress(self, hass, manager):
        low = _limit("low", "<", 20)
        very_low = _limit("very_low", "<", 10)
        _register(manager, low, very_low)
        manager._runtime_states["very_low"] = AlarmRuntimeState(alarm_id="very_low", state=AlarmState.SHELVED)

        await _set(hass, manager, 5)

        assert _state(manager, "low") == AlarmState.ACTIVE_UNACKED


class TestDelays:
    async def test_on_delay_does_not_activate_when_suppressed(self, hass, manager):
        low = _limit("low", "<", 20, trigger_delay=30)
        very_low = _limit("very_low", "<", 10)
        _register(manager, low, very_low)
        await _set(hass, manager, 5)

        await manager._async_delay_fired("low", "activate")

        assert _state(manager, "low") == AlarmState.NORMAL

    async def test_suppression_bypasses_clear_delay_and_latching(self, hass, manager):
        low = _limit("low", "<", 20, clear_delay=60, latching=True, auto_clear=False)
        very_low = _limit("very_low", "<", 10)
        _register(manager, low, very_low)
        manager._runtime_states["low"] = AlarmRuntimeState(alarm_id="low", state=AlarmState.ACTIVE_ACKED)

        await _set(hass, manager, 5)

        assert _state(manager, "low") == AlarmState.NORMAL
        assert "low" not in manager._pending_delays


class TestStateMachine:
    @pytest.mark.parametrize(
        "state", [AlarmState.ACTIVE_UNACKED, AlarmState.ACTIVE_ACKED, AlarmState.RTN_UNACKED]
    )
    def test_active_states_go_to_normal(self, state):
        low, very_low = _limit("low", "<", 20), _limit("very_low", "<", 10)
        runtime = AlarmRuntimeState(alarm_id="low", state=state, acked_by="me")

        new, events = sm.suppress(runtime, low, very_low, "5")

        assert new.state == AlarmState.NORMAL
        assert new.acked_by is None
        assert len(events) == 1
        assert events[0].event_type == AlarmEventType.SUPPRESSED
        assert events[0].old_state == state

    @pytest.mark.parametrize("state", [AlarmState.NORMAL, AlarmState.SHELVED, AlarmState.DISABLED])
    def test_inactive_states_unchanged(self, state):
        low, very_low = _limit("low", "<", 20), _limit("very_low", "<", 10)
        runtime = AlarmRuntimeState(alarm_id="low", state=state)

        new, events = sm.suppress(runtime, low, very_low, "5")

        assert new.state == state
        assert events == []


class TestPersistence:
    async def test_defaults_on_and_roundtrips(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db = AlarmDatabase(Path(tmpdir) / "t.db")
            await db.async_init()
            await db.async_create_alarm(_limit("on", "<", 10))
            await db.async_create_alarm(_limit("off", "<", 10, suppress_milder=False))
            assert (await db.async_get_alarm("on")).suppress_milder is True
            assert (await db.async_get_alarm("off")).suppress_milder is False
            await db.async_close()

    async def test_migration_v8_defaults_existing_alarms_on(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "v8.db"
            db = AlarmDatabase(path)
            await db.async_init()
            await db.async_create_alarm(_limit("old", "<", 10))
            await db.async_close()

            # Downgrade the file to a v8 layout (no suppress_milder column).
            conn = await aiosqlite.connect(str(path))
            await conn.execute("ALTER TABLE alarm_definitions DROP COLUMN suppress_milder")
            await conn.execute("UPDATE schema_version SET version = 8")
            await conn.commit()
            await conn.close()

            db = AlarmDatabase(path)
            await db.async_init()
            got = await db.async_get_alarm("old")
            assert got is not None
            assert got.suppress_milder is True
            await db.async_close()

    def test_from_dict_defaults_on(self):
        data = _limit("x", "<", 10).to_dict()
        data.pop("suppress_milder")
        assert AlarmDefinition.from_dict(data).suppress_milder is True
