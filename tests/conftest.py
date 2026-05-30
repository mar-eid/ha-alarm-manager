"""Test fixtures for SCADA Alarm Manager."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from homeassistant.core import HomeAssistant

from custom_components.scada_alarm_manager.alarm_manager import AlarmManager
from custom_components.scada_alarm_manager.const import DOMAIN, AlarmPriority, TriggerType
from custom_components.scada_alarm_manager.models import (
    AlarmChannel,
    AlarmDefinition,
)


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
