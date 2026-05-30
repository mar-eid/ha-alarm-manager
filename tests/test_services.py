"""Tests for HA service registration and handlers."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall

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
    async_register_services,
    async_unregister_services,
)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for testing."""
    yield


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


class TestGetManager:
    """Test the _get_manager helper."""

    def test_finds_manager_in_hass_data(self, hass: HomeAssistant):
        """Test that _get_manager finds the manager."""
        mock_manager = MagicMock()
        hass.data[DOMAIN] = {"entry1": {"manager": mock_manager}}

        result = _get_manager(hass)
        assert result is mock_manager

    def test_raises_for_missing_manager(self, hass: HomeAssistant):
        """Test that _get_manager raises when not initialized."""
        hass.data[DOMAIN] = {}

        with pytest.raises(ValueError, match="not initialized"):
            _get_manager(hass)


class TestServiceRegistration:
    """Test service registration and unregistration."""

    async def test_register_services(self, hass: HomeAssistant):
        """Test that all services are registered."""
        # Set up hass data with a mock manager
        mock_manager = MagicMock()
        mock_manager.alarms = {}
        mock_manager.channels = {}
        mock_manager.runtime_states = {}
        mock_manager.async_acknowledge = AsyncMock()
        mock_manager.async_acknowledge_all = AsyncMock(return_value=0)
        mock_manager.async_shelve = AsyncMock()
        mock_manager.async_unshelve = AsyncMock()
        mock_manager.async_enable = AsyncMock()
        mock_manager.async_disable = AsyncMock()
        mock_manager.async_reset = AsyncMock()
        mock_manager._notification_router = None
        mock_manager._database = AsyncMock()
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}

        await async_register_services(hass)

        # Verify all services are registered
        expected_services = [
            "acknowledge", "acknowledge_all", "shelve", "unshelve",
            "enable", "disable", "reset", "test_notification",
            "list_alarms", "get_alarm", "create_alarm", "update_alarm", "delete_alarm",
            "list_channels", "get_channel", "create_channel", "update_channel", "delete_channel",
            "list_events",
        ]

        for service_name in expected_services:
            assert hass.services.has_service(DOMAIN, service_name), (
                f"Service {service_name} not registered"
            )

    async def test_unregister_services(self, hass: HomeAssistant):
        """Test that all services are unregistered."""
        mock_manager = MagicMock()
        mock_manager.alarms = {}
        mock_manager.channels = {}
        mock_manager.runtime_states = {}
        mock_manager.async_acknowledge = AsyncMock()
        mock_manager.async_acknowledge_all = AsyncMock(return_value=0)
        mock_manager.async_shelve = AsyncMock()
        mock_manager.async_unshelve = AsyncMock()
        mock_manager.async_enable = AsyncMock()
        mock_manager.async_disable = AsyncMock()
        mock_manager.async_reset = AsyncMock()
        mock_manager._notification_router = None
        mock_manager._database = AsyncMock()
        hass.data[DOMAIN] = {"test_entry": {"manager": mock_manager}}

        await async_register_services(hass)
        await async_unregister_services(hass)

        assert not hass.services.has_service(DOMAIN, "acknowledge")


class TestActionServiceHandlers:
    """Test action-only service handlers."""

    @pytest.fixture(autouse=True)
    async def setup_services(self, hass: HomeAssistant):
        """Set up services with a mock manager for each test."""
        self.mock_manager = MagicMock()
        self.mock_manager.alarms = {}
        self.mock_manager.channels = {}
        self.mock_manager.runtime_states = {}
        self.mock_manager.async_acknowledge = AsyncMock()
        self.mock_manager.async_acknowledge_all = AsyncMock(return_value=0)
        self.mock_manager.async_shelve = AsyncMock()
        self.mock_manager.async_unshelve = AsyncMock()
        self.mock_manager.async_enable = AsyncMock()
        self.mock_manager.async_disable = AsyncMock()
        self.mock_manager.async_reset = AsyncMock()
        self.mock_manager._notification_router = AsyncMock()
        self.mock_manager._database = AsyncMock()
        hass.data[DOMAIN] = {"test_entry": {"manager": self.mock_manager}}

        await async_register_services(hass)
        yield

    async def test_acknowledge_service(self, hass: HomeAssistant):
        """Test the acknowledge service handler."""
        await hass.services.async_call(
            DOMAIN, "acknowledge",
            {"alarm_id": "test_alarm"},
            blocking=True,
        )
        self.mock_manager.async_acknowledge.assert_awaited_once()
        call_args = self.mock_manager.async_acknowledge.call_args
        assert call_args[0][0] == "test_alarm"

    async def test_acknowledge_all_service(self, hass: HomeAssistant):
        """Test the acknowledge_all service handler."""
        await hass.services.async_call(
            DOMAIN, "acknowledge_all",
            {"channel": "ch1", "priority": 2},
            blocking=True,
        )
        self.mock_manager.async_acknowledge_all.assert_awaited_once()
        call_kwargs = self.mock_manager.async_acknowledge_all.call_args[1]
        assert call_kwargs["channel_id"] == "ch1"
        assert call_kwargs["priority"] == AlarmPriority.HIGH

    async def test_shelve_service(self, hass: HomeAssistant):
        """Test the shelve service handler."""
        await hass.services.async_call(
            DOMAIN, "shelve",
            {"alarm_id": "test_alarm", "duration": 30},
            blocking=True,
        )
        self.mock_manager.async_shelve.assert_awaited_once()
        call_args = self.mock_manager.async_shelve.call_args
        assert call_args[0][0] == "test_alarm"
        assert call_args[1]["duration_minutes"] == 30

    async def test_unshelve_service(self, hass: HomeAssistant):
        """Test the unshelve service handler."""
        await hass.services.async_call(
            DOMAIN, "unshelve",
            {"alarm_id": "test_alarm"},
            blocking=True,
        )
        self.mock_manager.async_unshelve.assert_awaited_once()

    async def test_enable_service(self, hass: HomeAssistant):
        """Test the enable service handler."""
        await hass.services.async_call(
            DOMAIN, "enable",
            {"alarm_id": "test_alarm"},
            blocking=True,
        )
        self.mock_manager.async_enable.assert_awaited_once()

    async def test_disable_service(self, hass: HomeAssistant):
        """Test the disable service handler."""
        await hass.services.async_call(
            DOMAIN, "disable",
            {"alarm_id": "test_alarm"},
            blocking=True,
        )
        self.mock_manager.async_disable.assert_awaited_once()

    async def test_reset_service(self, hass: HomeAssistant):
        """Test the reset service handler."""
        await hass.services.async_call(
            DOMAIN, "reset",
            {"alarm_id": "test_alarm"},
            blocking=True,
        )
        self.mock_manager.async_reset.assert_awaited_once()

    async def test_test_notification_service(self, hass: HomeAssistant):
        """Test the test_notification service handler."""
        channel = _make_channel("ch1")
        self.mock_manager.channels = {"ch1": channel}

        await hass.services.async_call(
            DOMAIN, "test_notification",
            {"channel_id": "ch1"},
            blocking=True,
        )
        self.mock_manager._notification_router.async_send_test_notification.assert_awaited_once()


class TestCRUDServiceHandlers:
    """Test CRUD service handlers with response data."""

    @pytest.fixture(autouse=True)
    async def setup_services(self, hass: HomeAssistant):
        """Set up services with a mock manager for each test."""
        self.mock_manager = MagicMock()
        self.mock_manager.alarms = {}
        self.mock_manager.channels = {}
        self.mock_manager.runtime_states = {}
        self.mock_manager.async_acknowledge = AsyncMock()
        self.mock_manager.async_acknowledge_all = AsyncMock(return_value=0)
        self.mock_manager.async_shelve = AsyncMock()
        self.mock_manager.async_unshelve = AsyncMock()
        self.mock_manager.async_enable = AsyncMock()
        self.mock_manager.async_disable = AsyncMock()
        self.mock_manager.async_reset = AsyncMock()
        self.mock_manager._notification_router = None
        self.mock_manager._database = AsyncMock()
        hass.data[DOMAIN] = {"test_entry": {"manager": self.mock_manager}}

        await async_register_services(hass)
        yield

    async def test_list_alarms_empty(self, hass: HomeAssistant):
        """Test listing alarms when none exist."""
        result = await hass.services.async_call(
            DOMAIN, "list_alarms", {}, blocking=True, return_response=True,
        )
        assert result == {"alarms": []}

    async def test_list_alarms_with_data(self, hass: HomeAssistant):
        """Test listing alarms returns alarm data."""
        alarm = _make_alarm()
        runtime = _make_runtime()
        self.mock_manager.alarms = {"alarm1": alarm}
        self.mock_manager.runtime_states = {"alarm1": runtime}

        result = await hass.services.async_call(
            DOMAIN, "list_alarms", {}, blocking=True, return_response=True,
        )
        assert len(result["alarms"]) == 1
        assert result["alarms"][0]["id"] == "alarm1"

    async def test_get_alarm(self, hass: HomeAssistant):
        """Test getting a single alarm."""
        alarm = _make_alarm()
        runtime = _make_runtime()
        self.mock_manager.alarms = {"alarm1": alarm}
        self.mock_manager.runtime_states = {"alarm1": runtime}

        result = await hass.services.async_call(
            DOMAIN, "get_alarm", {"alarm_id": "alarm1"},
            blocking=True, return_response=True,
        )
        assert result["id"] == "alarm1"
        assert result["name"] == "Test Alarm"

    async def test_get_alarm_not_found(self, hass: HomeAssistant):
        """Test getting a nonexistent alarm raises error."""
        with pytest.raises(ValueError, match="Alarm not found"):
            await hass.services.async_call(
                DOMAIN, "get_alarm", {"alarm_id": "nonexistent"},
                blocking=True, return_response=True,
            )

    async def test_create_alarm(self, hass: HomeAssistant):
        """Test creating an alarm via service."""
        async def mock_create(alarm):
            self.mock_manager.alarms[alarm.id] = alarm
            self.mock_manager.runtime_states[alarm.id] = AlarmRuntimeState(
                alarm_id=alarm.id, state=AlarmState.NORMAL
            )
            return alarm

        self.mock_manager.async_create_alarm = AsyncMock(side_effect=mock_create)

        result = await hass.services.async_call(
            DOMAIN, "create_alarm",
            {
                "name": "New Alarm",
                "source_entity_id": "sensor.test",
                "trigger_type": "analog",
                "trigger_config": {"operator": ">", "threshold": 50},
            },
            blocking=True, return_response=True,
        )
        assert result is not None
        assert result["name"] == "New Alarm"
        self.mock_manager.async_create_alarm.assert_awaited_once()

    async def test_update_alarm(self, hass: HomeAssistant):
        """Test updating an alarm via service."""
        alarm = _make_alarm()
        runtime = _make_runtime()
        self.mock_manager.alarms = {"alarm1": alarm}
        self.mock_manager.runtime_states = {"alarm1": runtime}

        async def mock_update(a):
            return a

        self.mock_manager.async_update_alarm = AsyncMock(side_effect=mock_update)

        result = await hass.services.async_call(
            DOMAIN, "update_alarm",
            {"alarm_id": "alarm1", "name": "Updated Alarm"},
            blocking=True, return_response=True,
        )
        assert result is not None
        assert result["name"] == "Updated Alarm"

    async def test_update_alarm_not_found(self, hass: HomeAssistant):
        """Test updating a nonexistent alarm raises error."""
        with pytest.raises(ValueError, match="Alarm not found"):
            await hass.services.async_call(
                DOMAIN, "update_alarm",
                {"alarm_id": "nonexistent", "name": "Updated"},
                blocking=True, return_response=True,
            )

    async def test_delete_alarm(self, hass: HomeAssistant):
        """Test deleting an alarm via service."""
        self.mock_manager.async_delete_alarm = AsyncMock()

        result = await hass.services.async_call(
            DOMAIN, "delete_alarm",
            {"alarm_id": "alarm1"},
            blocking=True, return_response=True,
        )
        assert result == {"success": True}
        self.mock_manager.async_delete_alarm.assert_awaited_once_with("alarm1")

    async def test_list_channels(self, hass: HomeAssistant):
        """Test listing channels."""
        channel = _make_channel()
        self.mock_manager.channels = {"ch1": channel}

        result = await hass.services.async_call(
            DOMAIN, "list_channels", {}, blocking=True, return_response=True,
        )
        assert len(result["channels"]) == 1
        assert result["channels"][0]["name"] == "Test Channel"

    async def test_get_channel(self, hass: HomeAssistant):
        """Test getting a channel."""
        channel = _make_channel()
        self.mock_manager.channels = {"ch1": channel}

        result = await hass.services.async_call(
            DOMAIN, "get_channel", {"channel_id": "ch1"},
            blocking=True, return_response=True,
        )
        assert result["id"] == "ch1"
        assert result["name"] == "Test Channel"

    async def test_get_channel_not_found(self, hass: HomeAssistant):
        """Test getting a nonexistent channel raises error."""
        with pytest.raises(ValueError, match="Channel not found"):
            await hass.services.async_call(
                DOMAIN, "get_channel", {"channel_id": "nonexistent"},
                blocking=True, return_response=True,
            )

    async def test_create_channel(self, hass: HomeAssistant):
        """Test creating a channel via service."""
        async def mock_create(channel):
            return channel

        self.mock_manager.async_create_channel = AsyncMock(side_effect=mock_create)

        result = await hass.services.async_call(
            DOMAIN, "create_channel",
            {"name": "New Channel"},
            blocking=True, return_response=True,
        )
        assert result is not None
        assert result["name"] == "New Channel"

    async def test_update_channel(self, hass: HomeAssistant):
        """Test updating a channel via service."""
        channel = _make_channel()
        self.mock_manager.channels = {"ch1": channel}

        async def mock_update(c):
            return c

        self.mock_manager.async_update_channel = AsyncMock(side_effect=mock_update)

        result = await hass.services.async_call(
            DOMAIN, "update_channel",
            {"channel_id": "ch1", "name": "Updated Channel"},
            blocking=True, return_response=True,
        )
        assert result["name"] == "Updated Channel"

    async def test_update_channel_not_found(self, hass: HomeAssistant):
        """Test updating a nonexistent channel raises error."""
        with pytest.raises(ValueError, match="Channel not found"):
            await hass.services.async_call(
                DOMAIN, "update_channel",
                {"channel_id": "nonexistent", "name": "Updated"},
                blocking=True, return_response=True,
            )

    async def test_delete_channel(self, hass: HomeAssistant):
        """Test deleting a channel via service."""
        self.mock_manager.async_delete_channel = AsyncMock()

        result = await hass.services.async_call(
            DOMAIN, "delete_channel",
            {"channel_id": "ch1"},
            blocking=True, return_response=True,
        )
        assert result == {"success": True}

    async def test_list_events(self, hass: HomeAssistant):
        """Test listing events."""
        event = AlarmEvent(
            id=1,
            alarm_id="alarm1",
            event_type=AlarmEventType.TRIGGERED,
            old_state=AlarmState.NORMAL,
            new_state=AlarmState.ACTIVE_UNACKED,
        )
        self.mock_manager._database.async_get_events = AsyncMock(return_value=[event])
        alarm = _make_alarm()
        self.mock_manager.alarms = {"alarm1": alarm}

        result = await hass.services.async_call(
            DOMAIN, "list_events", {},
            blocking=True, return_response=True,
        )
        assert len(result["events"]) == 1
        assert result["events"][0]["alarm_name"] == "Test Alarm"

    async def test_list_events_with_filters(self, hass: HomeAssistant):
        """Test listing events with filters."""
        self.mock_manager._database.async_get_events = AsyncMock(return_value=[])

        result = await hass.services.async_call(
            DOMAIN, "list_events",
            {
                "alarm_id": "alarm1",
                "event_type": "triggered",
                "limit": 10,
                "offset": 5,
            },
            blocking=True, return_response=True,
        )
        assert result == {"events": []}
        call_kwargs = self.mock_manager._database.async_get_events.call_args[1]
        assert call_kwargs["alarm_id"] == "alarm1"
        assert call_kwargs["event_type"] == AlarmEventType.TRIGGERED
        assert call_kwargs["limit"] == 10
        assert call_kwargs["offset"] == 5
