"""Tests for the WebSocket API."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from homeassistant.core import HomeAssistant

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
)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for testing."""
    yield


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


@pytest.fixture
def mock_manager():
    """Create a comprehensive mock alarm manager."""
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


class TestAlarmWithStateHelper:
    """Test the _alarm_with_state helper function."""

    def test_combines_alarm_and_runtime(self):
        """Test combining alarm definition with runtime state."""
        manager = MagicMock()
        alarm = _make_alarm()
        runtime = _make_runtime()
        manager.alarms = {"alarm1": alarm}
        manager.runtime_states = {"alarm1": runtime}

        result = _alarm_with_state(manager, "alarm1")
        assert result is not None
        assert result["id"] == "alarm1"
        assert "runtime" in result

    def test_returns_none_for_missing(self):
        """Test returns None when alarm not found."""
        manager = MagicMock()
        manager.alarms = {}
        manager.runtime_states = {}

        result = _alarm_with_state(manager, "missing")
        assert result is None


class TestGetManager:
    """Test the _get_manager helper function."""

    def test_finds_manager(self, hass: HomeAssistant):
        """Test finding manager in hass data."""
        mgr = MagicMock()
        hass.data[DOMAIN] = {"entry1": {"manager": mgr}}
        assert _get_manager(hass) is mgr

    def test_raises_when_not_found(self, hass: HomeAssistant):
        """Test raising when manager not found."""
        hass.data[DOMAIN] = {}
        with pytest.raises(ValueError):
            _get_manager(hass)


class TestAlarmListCommand:
    """Test the alarm/list WebSocket command."""

    async def test_list_empty(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test listing alarms when none exist."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({"id": 1, "type": "scada_alarm_manager/alarm/list"})
        msg = await client.receive_json()

        assert msg["success"]
        assert msg["result"]["alarms"] == []

    async def test_list_with_alarms(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test listing alarms returns data."""
        alarm = _make_alarm()
        runtime = _make_runtime()
        mock_manager.alarms = {"alarm1": alarm}
        mock_manager.runtime_states = {"alarm1": runtime}
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({"id": 1, "type": "scada_alarm_manager/alarm/list"})
        msg = await client.receive_json()

        assert msg["success"]
        assert len(msg["result"]["alarms"]) == 1
        assert msg["result"]["alarms"][0]["id"] == "alarm1"


class TestAlarmGetCommand:
    """Test the alarm/get WebSocket command."""

    async def test_get_existing(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test getting an existing alarm."""
        alarm = _make_alarm()
        runtime = _make_runtime()
        mock_manager.alarms = {"alarm1": alarm}
        mock_manager.runtime_states = {"alarm1": runtime}
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/alarm/get",
            "alarm_id": "alarm1",
        })
        msg = await client.receive_json()

        assert msg["success"]
        assert msg["result"]["id"] == "alarm1"
        assert msg["result"]["name"] == "Test Alarm"

    async def test_get_not_found(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test getting a nonexistent alarm returns error."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/alarm/get",
            "alarm_id": "nonexistent",
        })
        msg = await client.receive_json()

        assert not msg["success"]
        assert msg["error"]["code"] == "not_found"


class TestAlarmCreateCommand:
    """Test the alarm/create WebSocket command."""

    async def test_create_alarm(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test creating an alarm via WebSocket."""
        async def mock_create(alarm):
            mock_manager.alarms[alarm.id] = alarm
            mock_manager.runtime_states[alarm.id] = AlarmRuntimeState(
                alarm_id=alarm.id, state=AlarmState.NORMAL
            )
            return alarm

        mock_manager.async_create_alarm = AsyncMock(side_effect=mock_create)
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/alarm/create",
            "name": "New Alarm",
            "source_entity_id": "sensor.temp",
            "trigger_type": "analog",
            "trigger_config": {"operator": ">", "threshold": 50},
        })
        msg = await client.receive_json()

        assert msg["success"]
        assert msg["result"]["name"] == "New Alarm"
        mock_manager.async_create_alarm.assert_awaited_once()


class TestAlarmUpdateCommand:
    """Test the alarm/update WebSocket command."""

    async def test_update_alarm(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test updating an alarm via WebSocket."""
        alarm = _make_alarm()
        runtime = _make_runtime()
        mock_manager.alarms = {"alarm1": alarm}
        mock_manager.runtime_states = {"alarm1": runtime}

        async def mock_update(a):
            return a

        mock_manager.async_update_alarm = AsyncMock(side_effect=mock_update)
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/alarm/update",
            "alarm_id": "alarm1",
            "name": "Updated Alarm",
        })
        msg = await client.receive_json()

        assert msg["success"]
        assert msg["result"]["name"] == "Updated Alarm"

    async def test_update_not_found(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test updating a nonexistent alarm returns error."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/alarm/update",
            "alarm_id": "nonexistent",
            "name": "Updated",
        })
        msg = await client.receive_json()

        assert not msg["success"]
        assert msg["error"]["code"] == "not_found"


class TestAlarmDeleteCommand:
    """Test the alarm/delete WebSocket command."""

    async def test_delete_alarm(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test deleting an alarm via WebSocket."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/alarm/delete",
            "alarm_id": "alarm1",
        })
        msg = await client.receive_json()

        assert msg["success"]
        assert msg["result"]["success"] is True
        mock_manager.async_delete_alarm.assert_awaited_once_with("alarm1")


class TestAlarmActionCommands:
    """Test the alarm action WebSocket commands."""

    async def test_acknowledge(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test acknowledging an alarm via WebSocket."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/alarm/acknowledge",
            "alarm_id": "alarm1",
        })
        msg = await client.receive_json()

        assert msg["success"]
        mock_manager.async_acknowledge.assert_awaited_once()

    async def test_acknowledge_all(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test acknowledging all alarms via WebSocket."""
        mock_manager.async_acknowledge_all = AsyncMock(return_value=3)
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/alarm/acknowledge_all",
        })
        msg = await client.receive_json()

        assert msg["success"]
        assert msg["result"]["acknowledged"] == 3

    async def test_shelve(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test shelving an alarm via WebSocket."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/alarm/shelve",
            "alarm_id": "alarm1",
            "duration": 15,
        })
        msg = await client.receive_json()

        assert msg["success"]
        mock_manager.async_shelve.assert_awaited_once()
        call_args = mock_manager.async_shelve.call_args
        assert call_args[0][0] == "alarm1"
        assert call_args[1]["duration_minutes"] == 15

    async def test_unshelve(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test unshelving an alarm via WebSocket."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/alarm/unshelve",
            "alarm_id": "alarm1",
        })
        msg = await client.receive_json()

        assert msg["success"]
        mock_manager.async_unshelve.assert_awaited_once()

    async def test_reset(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test resetting an alarm via WebSocket."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/alarm/reset",
            "alarm_id": "alarm1",
        })
        msg = await client.receive_json()

        assert msg["success"]
        mock_manager.async_reset.assert_awaited_once()


class TestChannelCommands:
    """Test channel WebSocket commands."""

    async def test_channel_list(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test listing channels."""
        channel = _make_channel()
        mock_manager.channels = {"ch1": channel}
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({"id": 1, "type": "scada_alarm_manager/channel/list"})
        msg = await client.receive_json()

        assert msg["success"]
        assert len(msg["result"]["channels"]) == 1

    async def test_channel_get(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test getting a single channel."""
        channel = _make_channel()
        mock_manager.channels = {"ch1": channel}
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/channel/get",
            "channel_id": "ch1",
        })
        msg = await client.receive_json()

        assert msg["success"]
        assert msg["result"]["id"] == "ch1"

    async def test_channel_get_not_found(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test getting a nonexistent channel returns error."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/channel/get",
            "channel_id": "nonexistent",
        })
        msg = await client.receive_json()

        assert not msg["success"]
        assert msg["error"]["code"] == "not_found"

    async def test_channel_create(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test creating a channel via WebSocket."""
        async def mock_create(channel):
            return channel

        mock_manager.async_create_channel = AsyncMock(side_effect=mock_create)
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/channel/create",
            "name": "New Channel",
        })
        msg = await client.receive_json()

        assert msg["success"]
        assert msg["result"]["name"] == "New Channel"

    async def test_channel_update(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test updating a channel via WebSocket."""
        channel = _make_channel()
        mock_manager.channels = {"ch1": channel}

        async def mock_update(c):
            return c

        mock_manager.async_update_channel = AsyncMock(side_effect=mock_update)
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/channel/update",
            "channel_id": "ch1",
            "name": "Updated Channel",
        })
        msg = await client.receive_json()

        assert msg["success"]
        assert msg["result"]["name"] == "Updated Channel"

    async def test_channel_update_not_found(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test updating a nonexistent channel returns error."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/channel/update",
            "channel_id": "nonexistent",
            "name": "Updated",
        })
        msg = await client.receive_json()

        assert not msg["success"]
        assert msg["error"]["code"] == "not_found"

    async def test_channel_delete(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test deleting a channel via WebSocket."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/channel/delete",
            "channel_id": "ch1",
        })
        msg = await client.receive_json()

        assert msg["success"]
        mock_manager.async_delete_channel.assert_awaited_once_with("ch1")


class TestEventListCommand:
    """Test the event/list WebSocket command."""

    async def test_event_list_empty(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test listing events when none exist."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/event/list",
        })
        msg = await client.receive_json()

        assert msg["success"]
        assert msg["result"]["events"] == []

    async def test_event_list_with_data(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test listing events with data."""
        event = AlarmEvent(
            id=1,
            alarm_id="alarm1",
            event_type=AlarmEventType.TRIGGERED,
            old_state=AlarmState.NORMAL,
            new_state=AlarmState.ACTIVE_UNACKED,
        )
        mock_manager._database.async_get_events = AsyncMock(return_value=[event])
        alarm = _make_alarm()
        mock_manager.alarms = {"alarm1": alarm}

        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/event/list",
        })
        msg = await client.receive_json()

        assert msg["success"]
        assert len(msg["result"]["events"]) == 1
        assert msg["result"]["events"][0]["alarm_name"] == "Test Alarm"

    async def test_event_list_with_filters(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test listing events with filters."""
        mock_manager._database.async_get_events = AsyncMock(return_value=[])
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/event/list",
            "alarm_id": "alarm1",
            "event_type": "triggered",
            "limit": 10,
            "offset": 5,
        })
        msg = await client.receive_json()

        assert msg["success"]
        call_kwargs = mock_manager._database.async_get_events.call_args[1]
        assert call_kwargs["alarm_id"] == "alarm1"
        assert call_kwargs["event_type"] == AlarmEventType.TRIGGERED
        assert call_kwargs["limit"] == 10
        assert call_kwargs["offset"] == 5


class TestSubscribeCommand:
    """Test the subscribe WebSocket command."""

    async def test_subscribe(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test subscribing to alarm state changes."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/subscribe",
        })
        msg = await client.receive_json()

        assert msg["success"]

    async def test_subscribe_receives_events(
        self, hass: HomeAssistant, hass_ws_client, mock_manager
    ):
        """Test that subscription receives fired events."""
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}
        async_register_websocket_commands(hass)

        client = await hass_ws_client(hass)
        await client.send_json({
            "id": 1, "type": "scada_alarm_manager/subscribe",
        })
        msg = await client.receive_json()
        assert msg["success"]

        # Fire an alarm state change event
        hass.bus.async_fire(
            EVENT_ALARM_STATE_CHANGED,
            {
                "alarm_id": "alarm1",
                "alarm_name": "Test Alarm",
                "old_state": "normal",
                "new_state": "active_unacknowledged",
                "priority": 2,
                "priority_name": "high",
                "channel_id": None,
            },
        )
        await hass.async_block_till_done()

        msg = await client.receive_json()
        assert msg["id"] == 1
        assert msg["type"] == "event"
        assert msg["event"]["alarm_id"] == "alarm1"
        assert msg["event"]["new_state"] == "active_unacknowledged"
