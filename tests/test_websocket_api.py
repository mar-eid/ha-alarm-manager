"""Tests for the WebSocket API."""

from __future__ import annotations

import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.scada_alarm_manager.const import (
    DOMAIN,
    EVENT_ALARM_STATE_CHANGED,
    AlarmEventType,
    AlarmPriority,
    AlarmState,
    TriggerType,
)
from custom_components.scada_alarm_manager.models import (
    AlarmChannel,
    AlarmDefinition,
    AlarmEvent,
    AlarmRuntimeState,
)
from custom_components.scada_alarm_manager.websocket_api import (
    _alarm_with_state,
    _get_manager,
    async_register_websocket_commands,
    ws_alarm_list,
    ws_alarm_get,
    ws_alarm_create,
    ws_alarm_update,
    ws_alarm_delete,
    ws_alarm_acknowledge,
    ws_alarm_acknowledge_all,
    ws_alarm_shelve,
    ws_alarm_unshelve,
    ws_alarm_reset,
    ws_channel_list,
    ws_channel_get,
    ws_channel_create,
    ws_channel_update,
    ws_channel_delete,
    ws_event_list,
    ws_subscribe,
)


def _unwrap(func):
    """Unwrap a websocket_api decorated handler to get the raw async function."""
    return getattr(func, "__wrapped__", func)


def _make_alarm(alarm_id: str = "alarm1") -> AlarmDefinition:
    """Create a sample alarm."""
    return AlarmDefinition(
        id=alarm_id,
        name="Test Alarm",
        source_entity_id="sensor.test",
        trigger_type=TriggerType.ANALOG,
        trigger_config={"operator": ">", "threshold": 50},
        priority=AlarmPriority.HIGH,
    )


def _make_runtime(alarm_id: str = "alarm1", state: AlarmState = AlarmState.NORMAL) -> AlarmRuntimeState:
    """Create a sample runtime state."""
    return AlarmRuntimeState(alarm_id=alarm_id, state=state)


def _make_channel(channel_id: str = "ch1") -> AlarmChannel:
    """Create a sample channel."""
    return AlarmChannel(
        id=channel_id,
        name="Test Channel",
        notification_targets=["mobile_app_phone"],
    )


def _mock_connection():
    """Create a mock WebSocket connection."""
    conn = MagicMock()
    conn.send_result = MagicMock()
    conn.send_error = MagicMock()
    conn.send_message = MagicMock()
    conn.subscriptions = {}
    conn.user = MagicMock()
    conn.user.id = "test_user"
    return conn


def _mock_manager():
    """Create a mock alarm manager."""
    manager = MagicMock()
    manager.alarms = {}
    manager.channels = {}
    manager.runtime_states = {}
    manager.async_create_alarm = AsyncMock()
    manager.async_update_alarm = AsyncMock()
    manager.async_delete_alarm = AsyncMock()
    manager.async_acknowledge = AsyncMock()
    manager.async_acknowledge_all = AsyncMock(return_value=0)
    manager.async_shelve = AsyncMock()
    manager.async_unshelve = AsyncMock()
    manager.async_reset = AsyncMock()
    manager.async_create_channel = AsyncMock()
    manager.async_update_channel = AsyncMock()
    manager.async_delete_channel = AsyncMock()
    manager._database = AsyncMock()
    manager._database.async_get_events = AsyncMock(return_value=[])
    return manager


class TestHelpers:
    """Test helper functions."""

    def test_alarm_with_state_combines(self):
        """Test _alarm_with_state returns combined dict."""
        manager = MagicMock()
        alarm = _make_alarm()
        runtime = _make_runtime()
        manager.alarms = {"alarm1": alarm}
        manager.runtime_states = {"alarm1": runtime}

        result = _alarm_with_state(manager, "alarm1")
        assert result is not None
        assert result["id"] == "alarm1"
        assert "runtime" in result

    def test_alarm_with_state_missing(self):
        """Test _alarm_with_state returns None for missing."""
        manager = MagicMock()
        manager.alarms = {}
        manager.runtime_states = {}
        assert _alarm_with_state(manager, "missing") is None

    def test_get_manager(self):
        """Test _get_manager finds manager."""
        hass = MagicMock()
        mgr = MagicMock()
        hass.data = {DOMAIN: {"entry": {"manager": mgr}}}
        assert _get_manager(hass) is mgr

    def test_get_manager_raises(self):
        """Test _get_manager raises when not found."""
        hass = MagicMock()
        hass.data = MagicMock()
        hass.data.get = MagicMock(return_value={})
        with pytest.raises(ValueError):
            _get_manager(hass)


class TestAlarmListWS:
    """Test ws_alarm_list handler."""

    async def test_list_empty(self):
        """Test listing alarms when none exist."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_alarm_list)(hass, conn, {"id": 1, "type": "scada_alarm_manager/alarm/list"})

        conn.send_result.assert_called_once_with(1, {"alarms": []})

    async def test_list_with_alarms(self):
        """Test listing alarms returns data."""
        hass = MagicMock()
        manager = _mock_manager()
        alarm = _make_alarm()
        runtime = _make_runtime()
        manager.alarms = {"alarm1": alarm}
        manager.runtime_states = {"alarm1": runtime}
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_alarm_list)(hass, conn, {"id": 1, "type": "scada_alarm_manager/alarm/list"})

        result = conn.send_result.call_args[0][1]
        assert len(result["alarms"]) == 1
        assert result["alarms"][0]["id"] == "alarm1"


class TestAlarmGetWS:
    """Test ws_alarm_get handler."""

    async def test_get_existing(self):
        """Test getting an existing alarm."""
        hass = MagicMock()
        manager = _mock_manager()
        alarm = _make_alarm()
        runtime = _make_runtime()
        manager.alarms = {"alarm1": alarm}
        manager.runtime_states = {"alarm1": runtime}
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_alarm_get)(hass, conn, {"id": 1, "alarm_id": "alarm1"})

        result = conn.send_result.call_args[0][1]
        assert result["id"] == "alarm1"

    async def test_get_not_found(self):
        """Test getting a nonexistent alarm."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_alarm_get)(hass, conn, {"id": 1, "alarm_id": "nonexistent"})

        conn.send_error.assert_called_once_with(1, "not_found", "Alarm not found")


class TestAlarmCreateWS:
    """Test ws_alarm_create handler."""

    async def test_create(self):
        """Test creating an alarm."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        async def mock_create(alarm):
            manager.alarms[alarm.id] = alarm
            manager.runtime_states[alarm.id] = AlarmRuntimeState(
                alarm_id=alarm.id, state=AlarmState.NORMAL
            )
            return alarm

        manager.async_create_alarm = AsyncMock(side_effect=mock_create)

        msg = {
            "id": 1,
            "name": "New Alarm",
            "source_entity_id": "sensor.test",
            "trigger_type": "analog",
            "trigger_config": {"operator": ">", "threshold": 50},
        }

        await _unwrap(ws_alarm_create)(hass, conn, msg)

        manager.async_create_alarm.assert_awaited_once()
        conn.send_result.assert_called_once()


class TestAlarmUpdateWS:
    """Test ws_alarm_update handler."""

    async def test_update(self):
        """Test updating an alarm."""
        hass = MagicMock()
        manager = _mock_manager()
        alarm = _make_alarm()
        runtime = _make_runtime()
        manager.alarms = {"alarm1": alarm}
        manager.runtime_states = {"alarm1": runtime}
        manager.async_update_alarm = AsyncMock(side_effect=lambda a: a)
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        msg = {"id": 1, "alarm_id": "alarm1", "name": "Updated"}
        await _unwrap(ws_alarm_update)(hass, conn, msg)

        assert alarm.name == "Updated"
        conn.send_result.assert_called_once()

    async def test_update_not_found(self):
        """Test updating nonexistent alarm."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        msg = {"id": 1, "alarm_id": "nonexistent", "name": "Updated"}
        await _unwrap(ws_alarm_update)(hass, conn, msg)

        conn.send_error.assert_called_once()


class TestAlarmDeleteWS:
    """Test ws_alarm_delete handler."""

    async def test_delete(self):
        """Test deleting an alarm."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_alarm_delete)(hass, conn, {"id": 1, "alarm_id": "alarm1"})

        manager.async_delete_alarm.assert_awaited_once_with("alarm1")
        conn.send_result.assert_called_once_with(1, {"success": True})


class TestActionCommandsWS:
    """Test alarm action WS commands."""

    async def test_acknowledge(self):
        """Test acknowledging an alarm."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_alarm_acknowledge)(hass, conn, {"id": 1, "alarm_id": "alarm1"})

        manager.async_acknowledge.assert_awaited_once()
        conn.send_result.assert_called_once_with(1, {"success": True})

    async def test_acknowledge_all(self):
        """Test acknowledging all alarms."""
        hass = MagicMock()
        manager = _mock_manager()
        manager.async_acknowledge_all = AsyncMock(return_value=3)
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_alarm_acknowledge_all)(hass, conn, {"id": 1})

        manager.async_acknowledge_all.assert_awaited_once()
        conn.send_result.assert_called_once_with(1, {"acknowledged": 3})

    async def test_acknowledge_all_with_filters(self):
        """Test acknowledging all with channel_id and priority filters."""
        hass = MagicMock()
        manager = _mock_manager()
        manager.async_acknowledge_all = AsyncMock(return_value=2)
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await ws_alarm_acknowledge_all.__wrapped__(
            hass, conn, {"id": 1, "channel_id": "ch1", "priority": 2}
        )

        call_kwargs = manager.async_acknowledge_all.call_args[1]
        assert call_kwargs["channel_id"] == "ch1"
        assert call_kwargs["priority"] == AlarmPriority.HIGH

    async def test_shelve(self):
        """Test shelving an alarm."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_alarm_shelve)(hass, conn, {"id": 1, "alarm_id": "alarm1", "duration": 15})

        call_kwargs = manager.async_shelve.call_args
        assert call_kwargs[0][0] == "alarm1"
        assert call_kwargs[1]["duration_minutes"] == 15

    async def test_unshelve(self):
        """Test unshelving an alarm."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_alarm_unshelve)(hass, conn, {"id": 1, "alarm_id": "alarm1"})

        manager.async_unshelve.assert_awaited_once()

    async def test_reset(self):
        """Test resetting an alarm."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_alarm_reset)(hass, conn, {"id": 1, "alarm_id": "alarm1"})

        manager.async_reset.assert_awaited_once()


class TestChannelCommandsWS:
    """Test channel WS commands."""

    async def test_channel_list(self):
        """Test listing channels."""
        hass = MagicMock()
        manager = _mock_manager()
        channel = _make_channel()
        manager.channels = {"ch1": channel}
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_channel_list)(hass, conn, {"id": 1})

        result = conn.send_result.call_args[0][1]
        assert len(result["channels"]) == 1

    async def test_channel_get(self):
        """Test getting a channel."""
        hass = MagicMock()
        manager = _mock_manager()
        channel = _make_channel()
        manager.channels = {"ch1": channel}
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_channel_get)(hass, conn, {"id": 1, "channel_id": "ch1"})

        result = conn.send_result.call_args[0][1]
        assert result["id"] == "ch1"

    async def test_channel_get_not_found(self):
        """Test getting a nonexistent channel."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_channel_get)(hass, conn, {"id": 1, "channel_id": "missing"})

        conn.send_error.assert_called_once_with(1, "not_found", "Channel not found")

    async def test_channel_create(self):
        """Test creating a channel."""
        hass = MagicMock()
        manager = _mock_manager()
        manager.async_create_channel = AsyncMock(side_effect=lambda c: c)
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_channel_create)(hass, conn, {"id": 1, "name": "New Channel"})

        manager.async_create_channel.assert_awaited_once()
        conn.send_result.assert_called_once()

    async def test_channel_update(self):
        """Test updating a channel."""
        hass = MagicMock()
        manager = _mock_manager()
        channel = _make_channel()
        manager.channels = {"ch1": channel}
        manager.async_update_channel = AsyncMock(side_effect=lambda c: c)
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_channel_update)(hass, conn, {"id": 1, "channel_id": "ch1", "name": "Updated"})

        assert channel.name == "Updated"
        conn.send_result.assert_called_once()

    async def test_channel_update_with_object_targets(self):
        """Test updating a channel with object-typed notification targets (target + min_priority)."""
        hass = MagicMock()
        manager = _mock_manager()
        channel = _make_channel()
        manager.channels = {"ch1": channel}
        manager.async_update_channel = AsyncMock(side_effect=lambda c: c)
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        targets = [
            {"target": "notify.mobile_app_phone", "min_priority": 2},
            {"target": "notify.mobile_app_tablet", "min_priority": 0},
        ]
        await _unwrap(ws_channel_update)(
            hass, conn, {"id": 1, "channel_id": "ch1", "notification_targets": targets}
        )

        assert channel.notification_targets == targets
        conn.send_result.assert_called_once()

    async def test_channel_update_not_found(self):
        """Test updating nonexistent channel."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_channel_update)(hass, conn, {"id": 1, "channel_id": "missing", "name": "X"})

        conn.send_error.assert_called_once()

    async def test_channel_delete(self):
        """Test deleting a channel."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_channel_delete)(hass, conn, {"id": 1, "channel_id": "ch1"})

        manager.async_delete_channel.assert_awaited_once_with("ch1")
        conn.send_result.assert_called_once_with(1, {"success": True})


class TestEventListWS:
    """Test ws_event_list handler."""

    async def test_event_list_empty(self):
        """Test listing events when none exist."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_event_list)(hass, conn, {"id": 1})

        result = conn.send_result.call_args[0][1]
        assert result["events"] == []

    async def test_event_list_with_data(self):
        """Test listing events returns enriched data."""
        hass = MagicMock()
        manager = _mock_manager()
        event = AlarmEvent(
            id=1, alarm_id="alarm1", event_type=AlarmEventType.TRIGGERED,
            old_state=AlarmState.NORMAL, new_state=AlarmState.ACTIVE_UNACKED,
        )
        manager._database.async_get_events = AsyncMock(return_value=[event])
        alarm = _make_alarm()
        manager.alarms = {"alarm1": alarm}
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_event_list)(hass, conn, {"id": 1})

        result = conn.send_result.call_args[0][1]
        assert len(result["events"]) == 1
        assert result["events"][0]["alarm_name"] == "Test Alarm"

    async def test_event_list_deleted_alarm_name(self):
        """Test that deleted alarm shows 'Deleted alarm' name."""
        hass = MagicMock()
        manager = _mock_manager()
        event = AlarmEvent(
            id=1, alarm_id="deleted_alarm", event_type=AlarmEventType.TRIGGERED,
        )
        manager._database.async_get_events = AsyncMock(return_value=[event])
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        await _unwrap(ws_event_list)(hass, conn, {"id": 1})

        result = conn.send_result.call_args[0][1]
        assert result["events"][0]["alarm_name"] == "Deleted alarm"

    async def test_event_list_with_filters(self):
        """Test listing events with filters passes correct params."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()

        msg = {
            "id": 1,
            "alarm_id": "alarm1",
            "event_type": "triggered",
            "limit": 10,
            "offset": 5,
        }
        await _unwrap(ws_event_list)(hass, conn, msg)

        call_kwargs = manager._database.async_get_events.call_args[1]
        assert call_kwargs["alarm_id"] == "alarm1"
        assert call_kwargs["event_type"] == AlarmEventType.TRIGGERED
        assert call_kwargs["limit"] == 10
        assert call_kwargs["offset"] == 5


class TestSubscribeWS:
    """Test ws_subscribe handler."""

    async def test_subscribe(self):
        """Test subscribing to alarm state changes."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()
        unsub_mock = MagicMock()
        hass.bus.async_listen = MagicMock(return_value=unsub_mock)

        await _unwrap(ws_subscribe)(hass, conn, {"id": 1})

        hass.bus.async_listen.assert_called_once()
        call_args = hass.bus.async_listen.call_args
        assert call_args[0][0] == EVENT_ALARM_STATE_CHANGED
        assert callable(call_args[0][1])
        conn.send_result.assert_called_once_with(1)
        assert 1 in conn.subscriptions

    async def test_subscribe_stores_unsub(self):
        """Test that subscribe stores the unsubscribe callback."""
        hass = MagicMock()
        manager = _mock_manager()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = _mock_connection()
        unsub_mock = MagicMock()
        hass.bus.async_listen = MagicMock(return_value=unsub_mock)

        await _unwrap(ws_subscribe)(hass, conn, {"id": 42})

        assert conn.subscriptions[42] is unsub_mock


class TestRegisterCommands:
    """Test the register function."""

    def test_registers_all_commands(self):
        """Test that all WebSocket commands are registered."""
        hass = MagicMock()
        with patch("custom_components.scada_alarm_manager.websocket_api.websocket_api") as mock_ws_api:
            async_register_websocket_commands(hass)
            # 19 commands total (17 original + trigger + clear)
            assert mock_ws_api.async_register_command.call_count == 19
