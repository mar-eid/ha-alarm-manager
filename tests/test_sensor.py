"""Tests for the sensor platform."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from custom_components.scada_alarm_manager.const import (
    DOMAIN,
    AlarmPriority,
    AlarmState,
    TriggerType,
)
from custom_components.scada_alarm_manager.models import (
    AlarmDefinition,
    AlarmRuntimeState,
)
from custom_components.scada_alarm_manager.sensor import (
    ScadaActiveCountSensor,
    ScadaHighestSeveritySensor,
    ScadaUnackedCountSensor,
)


def _make_manager(
    alarms: dict | None = None,
    runtime_states: dict | None = None,
) -> MagicMock:
    """Create a mock alarm manager."""
    from custom_components.scada_alarm_manager.alarm_manager import AlarmManager

    manager = MagicMock(spec=AlarmManager)
    manager.alarms = alarms or {}
    manager.runtime_states = runtime_states or {}
    manager.register_entity_update_callback = MagicMock()
    manager.unregister_entity_update_callback = MagicMock()

    # Wire up the actual summary methods to operate on the mocked data
    def get_active_count():
        return sum(
            1 for r in manager.runtime_states.values()
            if r.state in (AlarmState.ACTIVE_UNACKED, AlarmState.ACTIVE_ACKED, AlarmState.RTN_UNACKED)
        )

    def get_unacked_count():
        return sum(
            1 for r in manager.runtime_states.values()
            if r.state in (AlarmState.ACTIVE_UNACKED, AlarmState.RTN_UNACKED)
        )

    def get_highest_severity():
        highest = None
        for runtime in manager.runtime_states.values():
            if runtime.state not in (
                AlarmState.ACTIVE_UNACKED, AlarmState.ACTIVE_ACKED, AlarmState.RTN_UNACKED,
            ):
                continue
            alarm = manager.alarms.get(runtime.alarm_id)
            if alarm and (highest is None or alarm.priority > highest):
                highest = alarm.priority
        return highest

    manager.get_active_count = get_active_count
    manager.get_unacked_count = get_unacked_count
    manager.get_highest_severity = get_highest_severity

    return manager


def _make_alarm(alarm_id: str, priority: AlarmPriority = AlarmPriority.WARNING) -> AlarmDefinition:
    """Create a sample alarm definition."""
    return AlarmDefinition(
        id=alarm_id,
        name=f"Alarm {alarm_id}",
        source_entity_id="sensor.test",
        trigger_type=TriggerType.ANALOG,
        trigger_config={"operator": ">", "threshold": 50},
        priority=priority,
    )


def _make_runtime(alarm_id: str, state: AlarmState = AlarmState.NORMAL) -> AlarmRuntimeState:
    """Create a sample runtime state."""
    return AlarmRuntimeState(alarm_id=alarm_id, state=state)


class TestActiveCountSensor:
    """Test the active count sensor."""

    def test_unique_id(self):
        """Test unique ID is correctly set."""
        manager = _make_manager()
        sensor = ScadaActiveCountSensor(manager, "test_entry")
        assert sensor._attr_unique_id == f"{DOMAIN}_test_entry_active_count"

    def test_name(self):
        """Test sensor name."""
        manager = _make_manager()
        sensor = ScadaActiveCountSensor(manager, "test_entry")
        assert sensor._attr_name == "Active Alarm Count"

    def test_zero_active(self):
        """Test native_value with no active alarms."""
        manager = _make_manager()
        sensor = ScadaActiveCountSensor(manager, "test_entry")
        assert sensor.native_value == 0

    def test_one_active(self):
        """Test native_value with one active alarm."""
        manager = _make_manager(
            alarms={"a1": _make_alarm("a1")},
            runtime_states={"a1": _make_runtime("a1", AlarmState.ACTIVE_UNACKED)},
        )
        sensor = ScadaActiveCountSensor(manager, "test_entry")
        assert sensor.native_value == 1

    def test_multiple_active_states(self):
        """Test native_value counts ACTIVE_UNACKED, ACTIVE_ACKED, and RTN_UNACKED."""
        manager = _make_manager(
            alarms={
                "a1": _make_alarm("a1"),
                "a2": _make_alarm("a2"),
                "a3": _make_alarm("a3"),
                "a4": _make_alarm("a4"),
                "a5": _make_alarm("a5"),
            },
            runtime_states={
                "a1": _make_runtime("a1", AlarmState.ACTIVE_UNACKED),
                "a2": _make_runtime("a2", AlarmState.ACTIVE_ACKED),
                "a3": _make_runtime("a3", AlarmState.RTN_UNACKED),
                "a4": _make_runtime("a4", AlarmState.NORMAL),
                "a5": _make_runtime("a5", AlarmState.DISABLED),
            },
        )
        sensor = ScadaActiveCountSensor(manager, "test_entry")
        assert sensor.native_value == 3

    def test_device_info(self):
        """Test device info."""
        manager = _make_manager()
        sensor = ScadaActiveCountSensor(manager, "test_entry")
        device_info = sensor.device_info
        assert (DOMAIN, "test_entry") in device_info["identifiers"]


class TestUnackedCountSensor:
    """Test the unacknowledged count sensor."""

    def test_unique_id(self):
        """Test unique ID is correctly set."""
        manager = _make_manager()
        sensor = ScadaUnackedCountSensor(manager, "test_entry")
        assert sensor._attr_unique_id == f"{DOMAIN}_test_entry_unacked_count"

    def test_name(self):
        """Test sensor name."""
        manager = _make_manager()
        sensor = ScadaUnackedCountSensor(manager, "test_entry")
        assert sensor._attr_name == "Unacknowledged Alarm Count"

    def test_zero_unacked(self):
        """Test native_value with no unacknowledged alarms."""
        manager = _make_manager()
        sensor = ScadaUnackedCountSensor(manager, "test_entry")
        assert sensor.native_value == 0

    def test_counts_only_unacked(self):
        """Test native_value counts only ACTIVE_UNACKED and RTN_UNACKED."""
        manager = _make_manager(
            alarms={
                "a1": _make_alarm("a1"),
                "a2": _make_alarm("a2"),
                "a3": _make_alarm("a3"),
                "a4": _make_alarm("a4"),
            },
            runtime_states={
                "a1": _make_runtime("a1", AlarmState.ACTIVE_UNACKED),
                "a2": _make_runtime("a2", AlarmState.RTN_UNACKED),
                "a3": _make_runtime("a3", AlarmState.ACTIVE_ACKED),
                "a4": _make_runtime("a4", AlarmState.NORMAL),
            },
        )
        sensor = ScadaUnackedCountSensor(manager, "test_entry")
        assert sensor.native_value == 2

    def test_acked_not_counted(self):
        """Test that ACTIVE_ACKED is NOT counted as unacked."""
        manager = _make_manager(
            alarms={"a1": _make_alarm("a1")},
            runtime_states={"a1": _make_runtime("a1", AlarmState.ACTIVE_ACKED)},
        )
        sensor = ScadaUnackedCountSensor(manager, "test_entry")
        assert sensor.native_value == 0


class TestHighestSeveritySensor:
    """Test the highest severity sensor."""

    def test_unique_id(self):
        """Test unique ID is correctly set."""
        manager = _make_manager()
        sensor = ScadaHighestSeveritySensor(manager, "test_entry")
        assert sensor._attr_unique_id == f"{DOMAIN}_test_entry_highest_severity"

    def test_name(self):
        """Test sensor name."""
        manager = _make_manager()
        sensor = ScadaHighestSeveritySensor(manager, "test_entry")
        assert sensor._attr_name == "Highest Alarm Severity"

    def test_no_active_alarms(self):
        """Test native_value is 'none' when no active alarms."""
        manager = _make_manager()
        sensor = ScadaHighestSeveritySensor(manager, "test_entry")
        assert sensor.native_value == "none"

    def test_single_active_alarm(self):
        """Test native_value reflects single active alarm's priority."""
        manager = _make_manager(
            alarms={"a1": _make_alarm("a1", AlarmPriority.WARNING)},
            runtime_states={"a1": _make_runtime("a1", AlarmState.ACTIVE_UNACKED)},
        )
        sensor = ScadaHighestSeveritySensor(manager, "test_entry")
        assert sensor.native_value == "warning"

    def test_highest_among_multiple(self):
        """Test native_value returns highest severity among active alarms."""
        manager = _make_manager(
            alarms={
                "a1": _make_alarm("a1", AlarmPriority.INFO),
                "a2": _make_alarm("a2", AlarmPriority.WARNING),
                "a3": _make_alarm("a3", AlarmPriority.CRITICAL),
            },
            runtime_states={
                "a1": _make_runtime("a1", AlarmState.ACTIVE_UNACKED),
                "a2": _make_runtime("a2", AlarmState.ACTIVE_ACKED),
                "a3": _make_runtime("a3", AlarmState.ACTIVE_UNACKED),
            },
        )
        sensor = ScadaHighestSeveritySensor(manager, "test_entry")
        assert sensor.native_value == "critical"

    def test_ignores_inactive_alarms(self):
        """Test that only active alarms are considered."""
        manager = _make_manager(
            alarms={
                "a1": _make_alarm("a1", AlarmPriority.WARNING),
                "a2": _make_alarm("a2", AlarmPriority.CRITICAL),
            },
            runtime_states={
                "a1": _make_runtime("a1", AlarmState.ACTIVE_UNACKED),
                "a2": _make_runtime("a2", AlarmState.NORMAL),
            },
        )
        sensor = ScadaHighestSeveritySensor(manager, "test_entry")
        assert sensor.native_value == "warning"

    def test_icon_no_active(self):
        """Test icon is check-circle when no active alarms."""
        manager = _make_manager()
        sensor = ScadaHighestSeveritySensor(manager, "test_entry")
        assert sensor.icon == "mdi:check-circle"

    def test_icon_info(self):
        """Test icon for INFO severity."""
        manager = _make_manager(
            alarms={"a1": _make_alarm("a1", AlarmPriority.INFO)},
            runtime_states={"a1": _make_runtime("a1", AlarmState.ACTIVE_UNACKED)},
        )
        sensor = ScadaHighestSeveritySensor(manager, "test_entry")
        assert sensor.icon == "mdi:information"

    def test_icon_warning(self):
        """Test icon for WARNING severity."""
        manager = _make_manager(
            alarms={"a1": _make_alarm("a1", AlarmPriority.WARNING)},
            runtime_states={"a1": _make_runtime("a1", AlarmState.ACTIVE_UNACKED)},
        )
        sensor = ScadaHighestSeveritySensor(manager, "test_entry")
        assert sensor.icon == "mdi:alert"

    def test_icon_high(self):
        """Test icon for HIGH severity."""
        manager = _make_manager(
            alarms={"a1": _make_alarm("a1", AlarmPriority.HIGH)},
            runtime_states={"a1": _make_runtime("a1", AlarmState.ACTIVE_UNACKED)},
        )
        sensor = ScadaHighestSeveritySensor(manager, "test_entry")
        assert sensor.icon == "mdi:alert-circle"

    def test_icon_critical(self):
        """Test icon for CRITICAL severity."""
        manager = _make_manager(
            alarms={"a1": _make_alarm("a1", AlarmPriority.CRITICAL)},
            runtime_states={"a1": _make_runtime("a1", AlarmState.ACTIVE_UNACKED)},
        )
        sensor = ScadaHighestSeveritySensor(manager, "test_entry")
        assert sensor.icon == "mdi:alert-octagon"


class TestSensorLifecycle:
    """Test sensor entity lifecycle callbacks."""

    async def test_added_to_hass_registers_callback(self):
        """Test that async_added_to_hass registers the update callback."""
        manager = _make_manager()
        sensor = ScadaActiveCountSensor(manager, "test_entry")
        sensor.hass = MagicMock()

        await sensor.async_added_to_hass()

        manager.register_entity_update_callback.assert_called_once_with(
            sensor._handle_update
        )

    async def test_will_remove_unregisters_callback(self):
        """Test that async_will_remove_from_hass unregisters the callback."""
        manager = _make_manager()
        sensor = ScadaActiveCountSensor(manager, "test_entry")
        sensor.hass = MagicMock()

        await sensor.async_will_remove_from_hass()

        manager.unregister_entity_update_callback.assert_called_once_with(
            sensor._handle_update
        )

    def test_handle_update_writes_state(self):
        """Test that _handle_update calls async_write_ha_state."""
        manager = _make_manager()
        sensor = ScadaActiveCountSensor(manager, "test_entry")
        sensor.async_write_ha_state = MagicMock()

        sensor._handle_update()

        sensor.async_write_ha_state.assert_called_once()
