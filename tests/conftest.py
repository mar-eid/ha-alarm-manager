"""Test fixtures for SCADA Alarm Manager."""

from __future__ import annotations

import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.scada_alarm_manager.alarm_manager import AlarmManager
from custom_components.scada_alarm_manager.const import DOMAIN, AlarmPriority, TriggerType
from custom_components.scada_alarm_manager.models import (
    AlarmChannel,
    AlarmDefinition,
)

# On Windows, pytest-homeassistant-custom-component can't load (missing fcntl).
# Provide fallback fixtures so tests can run with `-p no:homeassistant`.
_HA_PLUGIN_AVAILABLE = "pytest_homeassistant_custom_component" in sys.modules


if not _HA_PLUGIN_AVAILABLE:
    import asyncio

    from homeassistant.core import HomeAssistant

    @pytest.fixture
    async def hass() -> MagicMock:
        """Provide a mocked HomeAssistant instance for Windows compatibility."""
        loop = asyncio.get_running_loop()
        mock_hass = MagicMock(spec=HomeAssistant)
        mock_hass.data = {}
        mock_hass.loop = loop
        mock_hass.states = MagicMock()
        mock_hass.states.get = MagicMock(return_value=None)
        mock_hass.states.async_set = MagicMock()
        mock_hass.bus = MagicMock()
        mock_hass.bus.async_listen = MagicMock(return_value=MagicMock())
        mock_hass.bus.async_fire = MagicMock()
        mock_hass.services = MagicMock()
        mock_hass.services.async_register = MagicMock()
        mock_hass.services.async_remove = MagicMock()
        mock_hass.services.async_call = AsyncMock()
        mock_hass.services.has_service = MagicMock(return_value=False)
        mock_hass.config = MagicMock()
        mock_hass.config.path = MagicMock(side_effect=lambda *args: "/".join(args))
        mock_hass.config_entries = MagicMock()
        mock_hass.config_entries.async_forward_entry_setups = AsyncMock()
        mock_hass.config_entries.async_unload_platforms = AsyncMock(return_value=True)
        mock_hass.async_create_task = MagicMock(side_effect=lambda coro: loop.create_task(coro))
        mock_hass.async_block_till_done = AsyncMock()
        mock_hass.http = MagicMock()
        mock_hass.http.async_register_static_paths = AsyncMock()
        mock_hass.components = MagicMock()
        return mock_hass

    @pytest.fixture
    def enable_custom_integrations():
        """No-op fixture for Windows compatibility."""
        return None


@pytest.fixture
def mock_alarm_definition() -> AlarmDefinition:
    """Create a test alarm definition."""
    return AlarmDefinition(
        id="test_alarm_1",
        name="Test Temperature High",
        description="Temperature exceeds threshold",
        priority=AlarmPriority.HIGH,
        area="Kitchen",
        equipment="Oven",
        tag="TT-101",
        source_entity_id="sensor.kitchen_temperature",
        trigger_type=TriggerType.ANALOG,
        trigger_config={"operator": ">", "threshold": 50.0},
        ack_required=True,
        auto_clear=True,
        latching=False,
        enabled=True,
    )


@pytest.fixture
def mock_digital_alarm() -> AlarmDefinition:
    """Create a test digital alarm definition."""
    return AlarmDefinition(
        id="test_alarm_2",
        name="Door Open",
        description="Door sensor triggered",
        priority=AlarmPriority.WARNING,
        source_entity_id="binary_sensor.front_door",
        trigger_type=TriggerType.DIGITAL,
        trigger_config={"target_state": "on"},
    )


@pytest.fixture
def mock_latching_alarm() -> AlarmDefinition:
    """Create a test latching alarm definition."""
    return AlarmDefinition(
        id="test_alarm_3",
        name="Leak Detected",
        description="Water leak sensor",
        priority=AlarmPriority.CRITICAL,
        source_entity_id="binary_sensor.leak_sensor",
        trigger_type=TriggerType.DIGITAL,
        trigger_config={"target_state": "on"},
        latching=True,
        auto_clear=False,
        ack_required=True,
    )


@pytest.fixture
def mock_channel() -> AlarmChannel:
    """Create a test alarm channel."""
    return AlarmChannel(
        id="test_channel_1",
        name="Safety",
        notification_targets=["mobile_app_phone"],
        min_priority=AlarmPriority.WARNING,
        persistent_notification=True,
        mobile_push=True,
        critical_notification=False,
    )


@pytest.fixture
def mock_critical_channel() -> AlarmChannel:
    """Create a test alarm channel with critical notification enabled."""
    return AlarmChannel(
        id="test_channel_critical",
        name="Critical Safety",
        notification_targets=["mobile_app_phone"],
        min_priority=AlarmPriority.INFO,
        persistent_notification=True,
        mobile_push=True,
        critical_notification=True,
    )


@pytest.fixture
def mock_database() -> AsyncMock:
    """Create a mocked AlarmDatabase."""
    db = AsyncMock()
    db.async_init = AsyncMock()
    db.async_close = AsyncMock()
    db.async_list_alarms = AsyncMock(return_value=[])
    db.async_list_channels = AsyncMock(return_value=[])
    db.async_create_alarm = AsyncMock()
    db.async_update_alarm = AsyncMock()
    db.async_delete_alarm = AsyncMock()
    db.async_create_channel = AsyncMock()
    db.async_update_channel = AsyncMock()
    db.async_delete_channel = AsyncMock()
    db.async_log_event = AsyncMock()
    db.async_get_events = AsyncMock(return_value=[])
    db.async_get_event_count = AsyncMock(return_value=0)
    db.async_purge_events = AsyncMock(return_value=0)
    db.async_get_alarm = AsyncMock(return_value=None)
    db.async_get_channel = AsyncMock(return_value=None)
    return db


@pytest.fixture
def mock_store() -> AsyncMock:
    """Create a mocked AlarmStore."""
    store = AsyncMock()
    store.async_load = AsyncMock(return_value=([], []))
    store.async_save = AsyncMock()
    store.async_remove = AsyncMock()
    return store


@pytest.fixture
def mock_config_entry() -> MagicMock:
    """Create a mock config entry."""
    entry = MagicMock()
    entry.entry_id = "test_entry_id"
    entry.domain = DOMAIN
    entry.data = {}
    entry.options = {}
    entry.title = "SCADA Alarm Manager"
    entry.unique_id = DOMAIN
    return entry


@pytest.fixture
def mock_alarm_manager(
    hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
) -> AlarmManager:
    """Create an AlarmManager with mocked database and store."""
    manager = AlarmManager(hass, mock_database, mock_store)
    return manager
