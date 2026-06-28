"""Tests for F6: trigger on-delay / clear-delay (debounce)."""

from __future__ import annotations

import tempfile
from pathlib import Path
from unittest.mock import MagicMock

import aiosqlite
import pytest

from custom_components.scada_alarm_manager import alarm_manager as am
from custom_components.scada_alarm_manager.alarm_manager import AlarmManager
from custom_components.scada_alarm_manager.const import AlarmPriority, AlarmState, TriggerType
from custom_components.scada_alarm_manager.database import AlarmDatabase
from custom_components.scada_alarm_manager.models import AlarmDefinition, AlarmRuntimeState


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _analog_alarm(trigger_delay=None, clear_delay=None, ack_required=True, auto_clear=True):
    return AlarmDefinition(
        id="alarm_1",
        name="Temp High",
        priority=AlarmPriority.HIGH,
        source_entity_id="sensor.temperature",
        trigger_type=TriggerType.ANALOG,
        trigger_config={"operator": ">", "threshold": 50.0},
        ack_required=ack_required,
        auto_clear=auto_clear,
        trigger_delay=trigger_delay,
        clear_delay=clear_delay,
        enabled=True,
    )


@pytest.fixture
def manager(hass, mock_database, mock_store):
    return AlarmManager(hass, mock_database, mock_store)


def _register(manager, alarm, state):
    manager._alarms[alarm.id] = alarm
    manager._runtime_states[alarm.id] = AlarmRuntimeState(alarm_id=alarm.id, state=state)


def _capture_timers(monkeypatch):
    """Patch async_call_later so timers are captured, not really scheduled."""
    calls: list = []

    def fake_call_later(hass, delay, cb):
        cancel = MagicMock()
        calls.append({"delay": delay, "cb": cb, "cancel": cancel})
        return cancel

    monkeypatch.setattr(am, "async_call_later", fake_call_later)
    return calls


class TestOnDelay:
    async def test_arms_timer_without_activating(self, hass, manager, monkeypatch):
        calls = _capture_timers(monkeypatch)
        alarm = _analog_alarm(trigger_delay=10)
        _register(manager, alarm, AlarmState.NORMAL)
        hass.states.async_set("sensor.temperature", "60")  # above threshold → condition met

        await manager._async_evaluate_alarm(alarm, hass.states.get("sensor.temperature"))

        # Not yet active — the on-delay timer is pending.
        assert manager.runtime_states["alarm_1"].state == AlarmState.NORMAL
        assert manager._pending_delays["alarm_1"][0] == "activate"
        assert calls and calls[0]["delay"] == 10.0

    async def test_fires_after_delay_when_still_met(self, hass, manager):
        alarm = _analog_alarm(trigger_delay=10)
        _register(manager, alarm, AlarmState.NORMAL)
        hass.states.async_set("sensor.temperature", "60")

        await manager._async_delay_fired("alarm_1", "activate")

        assert manager.runtime_states["alarm_1"].state == AlarmState.ACTIVE_UNACKED

    async def test_does_not_fire_if_condition_cleared(self, hass, manager):
        alarm = _analog_alarm(trigger_delay=10)
        _register(manager, alarm, AlarmState.NORMAL)
        hass.states.async_set("sensor.temperature", "10")  # below threshold → not met

        await manager._async_delay_fired("alarm_1", "activate")

        assert manager.runtime_states["alarm_1"].state == AlarmState.NORMAL

    async def test_pending_cancelled_when_condition_clears_early(self, hass, manager, monkeypatch):
        calls = _capture_timers(monkeypatch)
        alarm = _analog_alarm(trigger_delay=10)
        _register(manager, alarm, AlarmState.NORMAL)

        hass.states.async_set("sensor.temperature", "60")
        await manager._async_evaluate_alarm(alarm, hass.states.get("sensor.temperature"))
        assert "alarm_1" in manager._pending_delays

        # Condition clears before the timer fires.
        hass.states.async_set("sensor.temperature", "10")
        await manager._async_evaluate_alarm(alarm, hass.states.get("sensor.temperature"))

        assert "alarm_1" not in manager._pending_delays
        assert calls[0]["cancel"].called
        assert manager.runtime_states["alarm_1"].state == AlarmState.NORMAL

    async def test_no_delay_activates_immediately(self, hass, manager):
        alarm = _analog_alarm(trigger_delay=None)
        _register(manager, alarm, AlarmState.NORMAL)
        hass.states.async_set("sensor.temperature", "60")

        await manager._async_evaluate_alarm(alarm, hass.states.get("sensor.temperature"))

        assert manager.runtime_states["alarm_1"].state == AlarmState.ACTIVE_UNACKED
        assert "alarm_1" not in manager._pending_delays


class TestClearDelay:
    async def test_arms_timer_without_clearing(self, hass, manager, monkeypatch):
        calls = _capture_timers(monkeypatch)
        alarm = _analog_alarm(clear_delay=10, ack_required=False)
        _register(manager, alarm, AlarmState.ACTIVE_UNACKED)
        hass.states.async_set("sensor.temperature", "10")  # below threshold → not met

        await manager._async_evaluate_alarm(alarm, hass.states.get("sensor.temperature"))

        assert manager.runtime_states["alarm_1"].state == AlarmState.ACTIVE_UNACKED
        assert manager._pending_delays["alarm_1"][0] == "clear"
        assert calls[0]["delay"] == 10.0

    async def test_fires_after_delay_when_still_cleared(self, hass, manager):
        alarm = _analog_alarm(clear_delay=10, ack_required=False, auto_clear=True)
        _register(manager, alarm, AlarmState.ACTIVE_UNACKED)
        hass.states.async_set("sensor.temperature", "10")

        await manager._async_delay_fired("alarm_1", "clear")

        assert manager.runtime_states["alarm_1"].state == AlarmState.NORMAL

    async def test_pending_cancelled_on_retrigger(self, hass, manager, monkeypatch):
        calls = _capture_timers(monkeypatch)
        alarm = _analog_alarm(clear_delay=10, ack_required=False)
        _register(manager, alarm, AlarmState.ACTIVE_UNACKED)

        hass.states.async_set("sensor.temperature", "10")
        await manager._async_evaluate_alarm(alarm, hass.states.get("sensor.temperature"))
        assert "alarm_1" in manager._pending_delays

        # Condition re-triggers before the clear timer fires.
        hass.states.async_set("sensor.temperature", "60")
        await manager._async_evaluate_alarm(alarm, hass.states.get("sensor.temperature"))

        assert "alarm_1" not in manager._pending_delays
        assert calls[0]["cancel"].called
        assert manager.runtime_states["alarm_1"].state == AlarmState.ACTIVE_UNACKED


class TestTimerCleanup:
    async def test_async_stop_cancels_pending(self, manager):
        cancel = MagicMock()
        manager._pending_delays["alarm_1"] = ("activate", cancel)
        await manager.async_stop()
        assert cancel.called
        assert manager._pending_delays == {}

    async def test_delete_cancels_pending(self, hass, manager):
        alarm = _analog_alarm(trigger_delay=10)
        _register(manager, alarm, AlarmState.NORMAL)
        cancel = MagicMock()
        manager._pending_delays["alarm_1"] = ("activate", cancel)

        await manager.async_delete_alarm("alarm_1")

        assert cancel.called
        assert "alarm_1" not in manager._pending_delays


# --- v5 schema fixture: alarm_definitions WITHOUT trigger_delay/clear_delay ---
_V5_SQL = """
CREATE TABLE schema_version (version INTEGER NOT NULL);
INSERT INTO schema_version (version) VALUES (5);
CREATE TABLE alarm_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    priority INTEGER NOT NULL DEFAULT 1,
    area TEXT NOT NULL DEFAULT '',
    equipment TEXT NOT NULL DEFAULT '',
    tag TEXT NOT NULL DEFAULT '',
    channel_id TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    latching INTEGER NOT NULL DEFAULT 0,
    ack_required INTEGER NOT NULL DEFAULT 1,
    auto_clear INTEGER NOT NULL DEFAULT 1,
    condition_template TEXT,
    notification_title_template TEXT,
    notification_text_template TEXT,
    hysteresis REAL,
    repeat_interval INTEGER,
    escalation_delay INTEGER,
    source_entity_id TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    trigger_config TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
INSERT INTO alarm_definitions
    (id, name, source_entity_id, trigger_type, trigger_config, created_at, updated_at)
VALUES
    ('old1', 'Old Alarm', 'sensor.x', 'analog', '{"operator": ">", "threshold": 50}',
     '2026-01-01T00:00:00+00:00', '2026-01-01T00:00:00+00:00');
"""


class TestMigrationV6:
    async def test_roundtrip_delays(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db = AlarmDatabase(Path(tmpdir) / "t.db")
            await db.async_init()
            alarm = AlarmDefinition(
                id="a1",
                name="Delayed",
                source_entity_id="sensor.x",
                trigger_type=TriggerType.ANALOG,
                trigger_config={"operator": ">", "threshold": 50},
                trigger_delay=30,
                clear_delay=15,
            )
            await db.async_create_alarm(alarm)
            got = await db.async_get_alarm("a1")
            assert got is not None
            assert got.trigger_delay == 30
            assert got.clear_delay == 15
            await db.async_close()

    async def test_migrate_v5_to_v6_preserves_rows(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "v5.db"
            conn = await aiosqlite.connect(str(path))
            await conn.executescript(_V5_SQL)
            await conn.commit()
            await conn.close()

            db = AlarmDatabase(path)
            await db.async_init()  # runs the v6 migration

            async with db._db.execute("SELECT version FROM schema_version") as cur:
                version = (await cur.fetchone())[0]
            assert version == 6

            async with db._db.execute("PRAGMA table_info(alarm_definitions)") as cur:
                columns = {row[1] for row in await cur.fetchall()}
            assert "trigger_delay" in columns
            assert "clear_delay" in columns

            # Existing row survives, new columns default to NULL.
            got = await db.async_get_alarm("old1")
            assert got is not None
            assert got.name == "Old Alarm"
            assert got.trigger_delay is None
            assert got.clear_delay is None
            await db.async_close()
