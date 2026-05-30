"""Test fixtures for SCADA Alarm Manager."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from homeassistant.core import HomeAssistant

from custom_components.scada_alarm_manager.const import DOMAIN
from custom_components.scada_alarm_manager.models import (
    AlarmChannel,
    AlarmDefinition,
)
from custom_components.scada_alarm_manager.const import AlarmPriority, TriggerType


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
