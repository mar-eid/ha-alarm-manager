"""Tests for HA service registration and handlers."""

from __future__ import annotations

import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import voluptuous as vol

from custom_components.scada_alarm_manager.const import (
    DOMAIN,
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
from custom_components.scada_alarm_manager.services import (
    SCHEMA_ACKNOWLEDGE,
    SCHEMA_ACKNOWLEDGE_ALL,
    SCHEMA_CREATE_ALARM,
    SCHEMA_CREATE_CHANNEL,
    SCHEMA_DELETE_ALARM,
    SCHEMA_DELETE_CHANNEL,
    SCHEMA_DISABLE,
    SCHEMA_ENABLE,
    SCHEMA_GET_ALARM,
    SCHEMA_GET_CHANNEL,
    SCHEMA_LIST_ALARMS,
    SCHEMA_LIST_CHANNELS,
    SCHEMA_LIST_EVENTS,
    SCHEMA_RESET,
    SCHEMA_SHELVE,
    SCHEMA_TEST_NOTIFICATION,
    SCHEMA_UNSHELVE,
    SCHEMA_UPDATE_ALARM,
    SCHEMA_UPDATE_CHANNEL,
    _alarm_with_state,
    _get_manager,
)


def _make_alarm(alarm_id: str = "alarm1", name: str = "Test Alarm") -> AlarmDefinition:
    """Create a sample alarm."""
    return AlarmDefinition(
        id=alarm_id,
        name=name,
        source_entity_id="sensor.test",
        trigger_type=TriggerType.ANALOG,
        trigger_config={"operator": ">", "threshold": 50},
        priority=AlarmPriority.HIGH,
    )


def _make_channel(channel_id: str = "ch1", name: str = "Test Channel") -> AlarmChannel:
    """Create a sample channel."""
    return AlarmChannel(
        id=channel_id,
        name=name,
        notification_targets=["mobile_app_phone"],
        min_priority=AlarmPriority.WARNING,
    )


def _make_runtime(alarm_id: str = "alarm1", state: AlarmState = AlarmState.NORMAL) -> AlarmRuntimeState:
    """Create a sample runtime state."""
    return AlarmRuntimeState(alarm_id=alarm_id, state=state)


class TestSchemaValidation:
    """Test that service schemas correctly validate input."""

    def test_acknowledge_requires_alarm_id(self):
        """Test acknowledge schema requires alarm_id."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_ACKNOWLEDGE({})

    def test_acknowledge_valid(self):
        """Test acknowledge schema accepts valid input."""
        result = SCHEMA_ACKNOWLEDGE({"alarm_id": "test123"})
        assert result["alarm_id"] == "test123"

    def test_shelve_requires_alarm_id_and_duration(self):
        """Test shelve schema requires both fields."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_SHELVE({"alarm_id": "test123"})

        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_SHELVE({"duration": 15})

    def test_shelve_duration_bounds(self):
        """Test shelve duration must be in valid range."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_SHELVE({"alarm_id": "test", "duration": 0})

        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_SHELVE({"alarm_id": "test", "duration": 10081})

        result = SCHEMA_SHELVE({"alarm_id": "test", "duration": 60})
        assert result["duration"] == 60

    def test_create_alarm_requires_name_source_trigger(self):
        """Test create_alarm schema requires mandatory fields."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_CREATE_ALARM({"name": "Test"})

    def test_create_alarm_valid(self):
        """Test create_alarm schema accepts valid input."""
        result = SCHEMA_CREATE_ALARM({
            "name": "Test",
            "source_entity_id": "sensor.test",
            "trigger_type": "analog",
            "trigger_config": {"operator": ">", "threshold": 50},
        })
        assert result["name"] == "Test"
        assert result["priority"] == 1  # default
        assert result["enabled"] is True  # default

    def test_create_alarm_invalid_trigger_type(self):
        """Test create_alarm rejects invalid trigger type."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_CREATE_ALARM({
                "name": "Test",
                "source_entity_id": "sensor.test",
                "trigger_type": "invalid",
                "trigger_config": {},
            })

    def test_create_channel_valid(self):
        """Test create_channel schema accepts valid input."""
        result = SCHEMA_CREATE_CHANNEL({"name": "Safety"})
        assert result["name"] == "Safety"
        assert result["notification_targets"] == []  # default
        assert result["min_priority"] == 0  # default

    def test_list_events_defaults(self):
        """Test list_events schema provides defaults."""
        result = SCHEMA_LIST_EVENTS({})
        assert result["limit"] == 50
        assert result["offset"] == 0

    def test_list_events_limit_bounds(self):
        """Test list_events limit has valid bounds."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_LIST_EVENTS({"limit": 0})

        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_LIST_EVENTS({"limit": 501})

    def test_acknowledge_all_optional_fields(self):
        """Test acknowledge_all accepts optional fields."""
        result = SCHEMA_ACKNOWLEDGE_ALL({})
        assert "channel" not in result
        assert "priority" not in result

        result = SCHEMA_ACKNOWLEDGE_ALL({"channel": "ch1", "priority": 2})
        assert result["channel"] == "ch1"
        assert result["priority"] == 2

    def test_update_alarm_only_alarm_id_required(self):
        """Test update_alarm only requires alarm_id."""
        result = SCHEMA_UPDATE_ALARM({"alarm_id": "test123"})
        assert result["alarm_id"] == "test123"

    def test_update_channel_only_channel_id_required(self):
        """Test update_channel only requires channel_id."""
        result = SCHEMA_UPDATE_CHANNEL({"channel_id": "ch1"})
        assert result["channel_id"] == "ch1"

    def test_enable_requires_alarm_id(self):
        """Test enable schema requires alarm_id."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_ENABLE({})

    def test_disable_requires_alarm_id(self):
        """Test disable schema requires alarm_id."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_DISABLE({})

    def test_reset_requires_alarm_id(self):
        """Test reset schema requires alarm_id."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_RESET({})

    def test_unshelve_requires_alarm_id(self):
        """Test unshelve schema requires alarm_id."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_UNSHELVE({})

    def test_get_alarm_requires_alarm_id(self):
        """Test get_alarm schema requires alarm_id."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_GET_ALARM({})

    def test_get_channel_requires_channel_id(self):
        """Test get_channel schema requires channel_id."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_GET_CHANNEL({})

    def test_delete_alarm_requires_alarm_id(self):
        """Test delete_alarm schema requires alarm_id."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_DELETE_ALARM({})

    def test_delete_channel_requires_channel_id(self):
        """Test delete_channel schema requires channel_id."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_DELETE_CHANNEL({})

    def test_test_notification_requires_channel_id(self):
        """Test test_notification schema requires channel_id."""
        with pytest.raises(vol.MultipleInvalid):
            SCHEMA_TEST_NOTIFICATION({})

    def test_create_alarm_with_all_optional_fields(self):
        """Test create_alarm with all optional fields."""
        result = SCHEMA_CREATE_ALARM({
            "name": "Full Alarm",
            "source_entity_id": "sensor.test",
            "trigger_type": "digital",
            "trigger_config": {"target_state": "on"},
            "description": "A full alarm",
            "priority": 3,
            "area": "Plant A",
            "equipment": "Reactor",
            "tag": "TT-101",
            "channel_id": "ch1",
            "enabled": False,
            "latching": True,
            "ack_required": False,
            "auto_clear": False,
            "repeat_interval": 300,
            "escalation_delay": 900,
        })
        assert result["name"] == "Full Alarm"
        assert result["priority"] == 3
        assert result["latching"] is True
        assert result["ack_required"] is False

    def test_list_alarms_empty_schema(self):
        """Test list_alarms schema accepts empty dict."""
        result = SCHEMA_LIST_ALARMS({})
        assert result == {}

    def test_list_channels_empty_schema(self):
        """Test list_channels schema accepts empty dict."""
        result = SCHEMA_LIST_CHANNELS({})
        assert result == {}


class TestAlarmWithState:
    """Test the _alarm_with_state helper."""

    def test_returns_combined_dict(self):
        """Test that _alarm_with_state returns a combined dict."""
        manager = MagicMock()
        alarm = _make_alarm()
        runtime = _make_runtime()
        manager.alarms = {"alarm1": alarm}
        manager.runtime_states = {"alarm1": runtime}

        result = _alarm_with_state(manager, "alarm1")

        assert result is not None
        assert result["id"] == "alarm1"
        assert result["name"] == "Test Alarm"
        assert "runtime" in result
        assert result["runtime"]["state"] == AlarmState.NORMAL.value

    def test_returns_none_for_missing_alarm(self):
        """Test that _alarm_with_state returns None for missing alarm."""
        manager = MagicMock()
        manager.alarms = {}
        manager.runtime_states = {}

        result = _alarm_with_state(manager, "nonexistent")
        assert result is None

    def test_returns_none_for_missing_runtime(self):
        """Test that _alarm_with_state returns None when runtime is missing."""
        manager = MagicMock()
        alarm = _make_alarm()
        manager.alarms = {"alarm1": alarm}
        manager.runtime_states = {}

        result = _alarm_with_state(manager, "alarm1")
        assert result is None


class TestGetManager:
    """Test the _get_manager helper."""

    def test_finds_manager_in_hass_data(self):
        """Test that _get_manager finds the manager."""
        mock_hass = MagicMock()
        mock_manager = MagicMock()
        mock_hass.data = {DOMAIN: {"entry1": {"manager": mock_manager}}}

        result = _get_manager(mock_hass)
        assert result is mock_manager

    def test_raises_for_missing_manager(self):
        """Test that _get_manager raises when not initialized."""
        mock_hass = MagicMock()
        mock_hass.data = {DOMAIN: {}}

        with pytest.raises(ValueError, match="not initialized"):
            _get_manager(mock_hass)

    def test_raises_when_domain_missing(self):
        """Test that _get_manager raises when domain not in hass data."""
        mock_hass = MagicMock()
        mock_hass.data = MagicMock()
        mock_hass.data.get = MagicMock(return_value={})

        with pytest.raises(ValueError, match="not initialized"):
            _get_manager(mock_hass)


class TestServiceRegistration:
    """Test service registration."""

    async def test_register_services_registers_all(self, hass):
        """Test that all services are registered via async_register."""
        from custom_components.scada_alarm_manager.services import async_register_services

        mock_manager = MagicMock()
        mock_manager.alarms = {}
        mock_manager.channels = {}
        mock_manager.runtime_states = {}
        mock_manager._notification_router = None
        mock_manager._database = AsyncMock()
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}

        await async_register_services(hass)

        # Verify all 22 services are registered (10 action + 11 CRUD + 1 maintenance)
        expected_services = [
            "acknowledge", "acknowledge_all", "shelve", "unshelve",
            "enable", "disable", "reset", "test_notification",
            "trigger", "clear",
            "list_alarms", "get_alarm", "create_alarm", "update_alarm", "delete_alarm",
            "list_channels", "get_channel", "create_channel", "update_channel",
            "delete_channel", "list_events",
            "export_alarms", "import_alarms", "maintenance_mode",
        ]
        for service_name in expected_services:
            assert hass.services.has_service(DOMAIN, service_name), (
                f"Service {service_name} not registered"
            )

    async def test_unregister_services(self, hass):
        """Test that all services are unregistered."""
        from custom_components.scada_alarm_manager.services import (
            async_register_services,
            async_unregister_services,
        )

        mock_manager = MagicMock()
        mock_manager.alarms = {}
        mock_manager.channels = {}
        mock_manager.runtime_states = {}
        mock_manager._notification_router = None
        mock_manager._database = AsyncMock()
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}

        await async_register_services(hass)
        await async_unregister_services(hass)

        # All services should now be unregistered
        assert not hass.services.has_service(DOMAIN, "acknowledge")
        assert not hass.services.has_service(DOMAIN, "list_alarms")


class TestCRUDHandlers:
    """Test CRUD service handler execution and response data."""

    @pytest.fixture
    async def registered_hass(self, hass):
        """Set up hass with services registered and a populated mock manager."""
        from custom_components.scada_alarm_manager.services import async_register_services

        alarm = _make_alarm("alarm1", "Test Alarm")
        channel = _make_channel("ch1", "Test Channel")
        runtime = _make_runtime("alarm1")

        manager = MagicMock()
        manager.alarms = {"alarm1": alarm}
        manager.channels = {"ch1": channel}
        manager.runtime_states = {"alarm1": runtime}
        manager._notification_router = MagicMock()
        manager._notification_router.maintenance_mode = False

        # async CRUD methods
        async def mock_create_alarm(a):
            manager.alarms[a.id] = a
            manager.runtime_states[a.id] = _make_runtime(a.id)
            return a

        async def mock_update_alarm(a):
            manager.alarms[a.id] = a
            return a

        async def mock_delete_alarm(alarm_id):
            manager.alarms.pop(alarm_id, None)
            manager.runtime_states.pop(alarm_id, None)

        async def mock_create_channel(c):
            manager.channels[c.id] = c
            return c

        async def mock_update_channel(c):
            manager.channels[c.id] = c
            return c

        async def mock_delete_channel(channel_id):
            manager.channels.pop(channel_id, None)

        manager.async_create_alarm = AsyncMock(side_effect=mock_create_alarm)
        manager.async_update_alarm = AsyncMock(side_effect=mock_update_alarm)
        manager.async_delete_alarm = AsyncMock(side_effect=mock_delete_alarm)
        manager.async_create_channel = AsyncMock(side_effect=mock_create_channel)
        manager.async_update_channel = AsyncMock(side_effect=mock_update_channel)
        manager.async_delete_channel = AsyncMock(side_effect=mock_delete_channel)
        manager.async_acknowledge = AsyncMock()
        manager.async_acknowledge_all = AsyncMock()
        manager.async_shelve = AsyncMock()
        manager.async_unshelve = AsyncMock()
        manager.async_enable = AsyncMock()
        manager.async_disable = AsyncMock()
        manager.async_reset = AsyncMock()
        manager.async_trigger_external = AsyncMock()
        manager.async_clear_external = AsyncMock()
        manager._database = AsyncMock()
        manager._database.async_get_events = AsyncMock(return_value=[])

        hass.data[DOMAIN] = {"test_entry": {"manager": manager}}
        await async_register_services(hass)
        return hass, manager

    async def test_list_alarms_returns_all(self, registered_hass):
        hass, manager = registered_hass
        result = await hass.services.async_call(
            DOMAIN, "list_alarms", {}, blocking=True, return_response=True,
        )
        assert "alarms" in result
        assert len(result["alarms"]) == 1
        assert result["alarms"][0]["id"] == "alarm1"
        assert "runtime" in result["alarms"][0]

    async def test_get_alarm_returns_single(self, registered_hass):
        hass, _ = registered_hass
        result = await hass.services.async_call(
            DOMAIN, "get_alarm", {"alarm_id": "alarm1"}, blocking=True, return_response=True,
        )
        assert result["id"] == "alarm1"
        assert result["name"] == "Test Alarm"
        assert "runtime" in result

    async def test_get_alarm_raises_for_missing(self, registered_hass):
        hass, _ = registered_hass
        with pytest.raises(ValueError, match="Alarm not found"):
            await hass.services.async_call(
                DOMAIN, "get_alarm", {"alarm_id": "nonexistent"}, blocking=True, return_response=True,
            )

    async def test_create_alarm_returns_new(self, registered_hass):
        hass, manager = registered_hass
        result = await hass.services.async_call(
            DOMAIN,
            "create_alarm",
            {
                "name": "New Alarm",
                "source_entity_id": "sensor.new",
                "trigger_type": "digital",
                "trigger_config": {"target_state": "on"},
            },
            blocking=True,
            return_response=True,
        )
        assert result["name"] == "New Alarm"
        assert "runtime" in result
        manager.async_create_alarm.assert_called_once()

    async def test_update_alarm_applies_changes(self, registered_hass):
        hass, manager = registered_hass
        result = await hass.services.async_call(
            DOMAIN,
            "update_alarm",
            {"alarm_id": "alarm1", "name": "Updated Name", "priority": 3},
            blocking=True,
            return_response=True,
        )
        assert result["name"] == "Updated Name"
        manager.async_update_alarm.assert_called_once()
        updated_alarm = manager.async_update_alarm.call_args[0][0]
        assert updated_alarm.name == "Updated Name"
        assert updated_alarm.priority == AlarmPriority.CRITICAL

    async def test_update_alarm_raises_for_missing(self, registered_hass):
        hass, _ = registered_hass
        with pytest.raises(ValueError, match="Alarm not found"):
            await hass.services.async_call(
                DOMAIN, "update_alarm", {"alarm_id": "nonexistent", "name": "X"}, blocking=True, return_response=True,
            )

    async def test_delete_alarm_returns_success(self, registered_hass):
        hass, manager = registered_hass
        result = await hass.services.async_call(
            DOMAIN, "delete_alarm", {"alarm_id": "alarm1"}, blocking=True, return_response=True,
        )
        assert result == {"success": True}
        manager.async_delete_alarm.assert_called_once_with("alarm1")

    async def test_list_channels_returns_all(self, registered_hass):
        hass, _ = registered_hass
        result = await hass.services.async_call(
            DOMAIN, "list_channels", {}, blocking=True, return_response=True,
        )
        assert "channels" in result
        assert len(result["channels"]) == 1
        assert result["channels"][0]["id"] == "ch1"

    async def test_get_channel_returns_single(self, registered_hass):
        hass, _ = registered_hass
        result = await hass.services.async_call(
            DOMAIN, "get_channel", {"channel_id": "ch1"}, blocking=True, return_response=True,
        )
        assert result["id"] == "ch1"
        assert result["name"] == "Test Channel"

    async def test_get_channel_raises_for_missing(self, registered_hass):
        hass, _ = registered_hass
        with pytest.raises(ValueError, match="Channel not found"):
            await hass.services.async_call(
                DOMAIN, "get_channel", {"channel_id": "nope"}, blocking=True, return_response=True,
            )

    async def test_create_channel_returns_new(self, registered_hass):
        hass, manager = registered_hass
        result = await hass.services.async_call(
            DOMAIN,
            "create_channel",
            {"name": "New Channel", "mobile_push": False},
            blocking=True,
            return_response=True,
        )
        assert result["name"] == "New Channel"
        manager.async_create_channel.assert_called_once()

    async def test_update_channel_applies_changes(self, registered_hass):
        hass, manager = registered_hass
        result = await hass.services.async_call(
            DOMAIN,
            "update_channel",
            {"channel_id": "ch1", "name": "Renamed Channel"},
            blocking=True,
            return_response=True,
        )
        assert result["name"] == "Renamed Channel"
        manager.async_update_channel.assert_called_once()

    async def test_update_channel_raises_for_missing(self, registered_hass):
        hass, _ = registered_hass
        with pytest.raises(ValueError, match="Channel not found"):
            await hass.services.async_call(
                DOMAIN, "update_channel", {"channel_id": "nope", "name": "X"}, blocking=True, return_response=True,
            )

    async def test_delete_channel_returns_success(self, registered_hass):
        hass, manager = registered_hass
        result = await hass.services.async_call(
            DOMAIN, "delete_channel", {"channel_id": "ch1"}, blocking=True, return_response=True,
        )
        assert result == {"success": True}
        manager.async_delete_channel.assert_called_once_with("ch1")

    async def test_list_events_returns_events(self, registered_hass):
        hass, manager = registered_hass
        mock_event = AlarmEvent(
            alarm_id="alarm1",
            event_type=AlarmEventType.TRIGGERED,
            old_state=AlarmState.NORMAL,
            new_state=AlarmState.ACTIVE_UNACKED,
        )
        manager._database.async_get_events = AsyncMock(return_value=[mock_event])

        result = await hass.services.async_call(
            DOMAIN, "list_events", {}, blocking=True, return_response=True,
        )
        assert "events" in result
        assert len(result["events"]) == 1
        assert result["events"][0]["alarm_name"] == "Test Alarm"

    async def test_list_events_with_filters(self, registered_hass):
        hass, manager = registered_hass
        manager._database.async_get_events = AsyncMock(return_value=[])

        await hass.services.async_call(
            DOMAIN,
            "list_events",
            {"alarm_id": "alarm1", "event_type": "triggered", "limit": 10, "offset": 5},
            blocking=True,
            return_response=True,
        )
        call_kwargs = manager._database.async_get_events.call_args[1]
        assert call_kwargs["alarm_id"] == "alarm1"
        assert call_kwargs["event_type"] == AlarmEventType.TRIGGERED
        assert call_kwargs["limit"] == 10
        assert call_kwargs["offset"] == 5

    async def test_list_events_deleted_alarm_name(self, registered_hass):
        hass, manager = registered_hass
        mock_event = AlarmEvent(alarm_id="deleted_id", event_type=AlarmEventType.TRIGGERED)
        manager._database.async_get_events = AsyncMock(return_value=[mock_event])

        result = await hass.services.async_call(
            DOMAIN, "list_events", {}, blocking=True, return_response=True,
        )
        assert result["events"][0]["alarm_name"] == "Deleted alarm"

    async def test_export_alarms_returns_both(self, registered_hass):
        hass, _ = registered_hass
        result = await hass.services.async_call(
            DOMAIN, "export_alarms", {}, blocking=True, return_response=True,
        )
        assert "alarms" in result
        assert "channels" in result
        assert len(result["alarms"]) == 1
        assert len(result["channels"]) == 1

    async def test_maintenance_mode_toggle(self, registered_hass):
        hass, manager = registered_hass
        result = await hass.services.async_call(
            DOMAIN, "maintenance_mode", {"enabled": True}, blocking=True, return_response=True,
        )
        assert result == {"maintenance_mode": True}
        assert manager._notification_router.maintenance_mode is True

        result = await hass.services.async_call(
            DOMAIN, "maintenance_mode", {"enabled": False}, blocking=True, return_response=True,
        )
        assert result == {"maintenance_mode": False}

    async def test_acknowledge_calls_manager(self, registered_hass):
        hass, manager = registered_hass
        await hass.services.async_call(
            DOMAIN, "acknowledge", {"alarm_id": "alarm1"}, blocking=True,
        )
        manager.async_acknowledge.assert_called_once()

    async def test_trigger_calls_manager(self, registered_hass):
        hass, manager = registered_hass
        await hass.services.async_call(
            DOMAIN, "trigger", {"alarm_id": "alarm1", "message": "test msg"}, blocking=True,
        )
        manager.async_trigger_external.assert_called_once()

    async def test_clear_calls_manager(self, registered_hass):
        hass, manager = registered_hass
        await hass.services.async_call(
            DOMAIN, "clear", {"alarm_id": "alarm1"}, blocking=True,
        )
        manager.async_clear_external.assert_called_once()
