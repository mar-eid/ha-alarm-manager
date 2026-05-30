"""Tests for the binary sensor platform."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.scada_alarm_manager.binary_sensor import ScadaAlarmBinarySensor
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


def _make_alarm(alarm_id: str = "alarm1", name: str = "Test Alarm") -> AlarmDefinition:
    """Create a sample alarm."""
    return AlarmDefinition(
        id=alarm_id,
        name=name,
        description="Test description",
        priority=AlarmPriority.HIGH,
        area="Plant A",
        equipment="Reactor",
        tag="TT-101",
        source_entity_id="sensor.test",
        trigger_type=TriggerType.ANALOG,
        trigger_config={"operator": ">", "threshold": 50},
        channel_id="ch1",
        latching=False,
        ack_required=True,
    )


def _make_runtime(
    alarm_id: str = "alarm1",
    state: AlarmState = AlarmState.NORMAL,
) -> AlarmRuntimeState:
    """Create a sample runtime state."""
    return AlarmRuntimeState(alarm_id=alarm_id, state=state)


def _make_manager(
    alarms: dict | None = None,
    runtime_states: dict | None = None,
) -> MagicMock:
    """Create a mock alarm manager."""
    manager = MagicMock()
    manager.alarms = alarms or {}
    manager.runtime_states = runtime_states or {}
    manager.register_entity_update_callback = MagicMock()
    manager.unregister_entity_update_callback = MagicMock()
    return manager


class TestScadaAlarmBinarySensor:
    """Test the binary sensor entity."""

    def test_entity_creation(self):
        """Test creating a binary sensor entity."""
        alarm = _make_alarm()
        manager = _make_manager(
            alarms={"alarm1": alarm},
            runtime_states={"alarm1": _make_runtime()},
        )

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")

        assert entity._attr_name == "Test Alarm"
        assert entity._attr_unique_id == f"{DOMAIN}_alarm1"
        assert entity.alarm_id == "alarm1"

    def test_is_on_normal_state(self):
        """Test is_on returns False for NORMAL state."""
        alarm = _make_alarm()
        runtime = _make_runtime(state=AlarmState.NORMAL)
        manager = _make_manager(
            alarms={"alarm1": alarm},
            runtime_states={"alarm1": runtime},
        )

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        assert entity.is_on is False

    def test_is_on_active_unacked(self):
        """Test is_on returns True for ACTIVE_UNACKED state."""
        alarm = _make_alarm()
        runtime = _make_runtime(state=AlarmState.ACTIVE_UNACKED)
        manager = _make_manager(
            alarms={"alarm1": alarm},
            runtime_states={"alarm1": runtime},
        )

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        assert entity.is_on is True

    def test_is_on_active_acked(self):
        """Test is_on returns True for ACTIVE_ACKED state."""
        alarm = _make_alarm()
        runtime = _make_runtime(state=AlarmState.ACTIVE_ACKED)
        manager = _make_manager(
            alarms={"alarm1": alarm},
            runtime_states={"alarm1": runtime},
        )

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        assert entity.is_on is True

    def test_is_on_rtn_unacked(self):
        """Test is_on returns True for RTN_UNACKED state."""
        alarm = _make_alarm()
        runtime = _make_runtime(state=AlarmState.RTN_UNACKED)
        manager = _make_manager(
            alarms={"alarm1": alarm},
            runtime_states={"alarm1": runtime},
        )

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        assert entity.is_on is True

    def test_is_on_shelved(self):
        """Test is_on returns False for SHELVED state."""
        alarm = _make_alarm()
        runtime = _make_runtime(state=AlarmState.SHELVED)
        manager = _make_manager(
            alarms={"alarm1": alarm},
            runtime_states={"alarm1": runtime},
        )

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        assert entity.is_on is False

    def test_is_on_disabled(self):
        """Test is_on returns False for DISABLED state."""
        alarm = _make_alarm()
        runtime = _make_runtime(state=AlarmState.DISABLED)
        manager = _make_manager(
            alarms={"alarm1": alarm},
            runtime_states={"alarm1": runtime},
        )

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        assert entity.is_on is False

    def test_is_on_missing_runtime(self):
        """Test is_on returns False when runtime state is missing."""
        alarm = _make_alarm()
        manager = _make_manager(alarms={"alarm1": alarm})

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        assert entity.is_on is False

    def test_available_true(self):
        """Test available returns True when alarm exists."""
        alarm = _make_alarm()
        manager = _make_manager(alarms={"alarm1": alarm})

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        assert entity.available is True

    def test_available_false(self):
        """Test available returns False when alarm doesn't exist."""
        manager = _make_manager()

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        assert entity.available is False

    def test_device_info(self):
        """Test device info returns correct identifiers."""
        alarm = _make_alarm()
        manager = _make_manager(alarms={"alarm1": alarm})

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        device_info = entity.device_info

        assert device_info is not None
        assert (DOMAIN, "test_entry") in device_info["identifiers"]
        assert device_info["name"] == "SCADA Alarm Manager"


class TestExtraStateAttributes:
    """Test extra state attributes of binary sensor."""

    def test_attributes_normal_state(self):
        """Test attributes for a normal alarm."""
        alarm = _make_alarm()
        runtime = _make_runtime(state=AlarmState.NORMAL)
        manager = _make_manager(
            alarms={"alarm1": alarm},
            runtime_states={"alarm1": runtime},
        )

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        attrs = entity.extra_state_attributes

        assert attrs["alarm_state"] == "normal"
        assert attrs["priority"] == "high"
        assert attrs["priority_level"] == 2
        assert attrs["area"] == "Plant A"
        assert attrs["equipment"] == "Reactor"
        assert attrs["tag"] == "TT-101"
        assert attrs["source_entity"] == "sensor.test"
        assert attrs["channel_id"] == "ch1"
        assert attrs["latching"] is False
        assert attrs["ack_required"] is True

    def test_attributes_active_state_with_timestamps(self):
        """Test attributes include timestamps when in active state."""
        from datetime import datetime, timezone

        alarm = _make_alarm()
        now = datetime.now(timezone.utc)
        runtime = AlarmRuntimeState(
            alarm_id="alarm1",
            state=AlarmState.ACTIVE_ACKED,
            triggered_at=now,
            acked_at=now,
            acked_by="admin",
            last_value="55.0",
        )
        manager = _make_manager(
            alarms={"alarm1": alarm},
            runtime_states={"alarm1": runtime},
        )

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        attrs = entity.extra_state_attributes

        assert "triggered_at" in attrs
        assert "acked_at" in attrs
        assert attrs["acked_by"] == "admin"
        assert attrs["last_value"] == "55.0"

    def test_attributes_shelved_state(self):
        """Test attributes include shelved_until when shelved."""
        from datetime import datetime, timedelta, timezone

        alarm = _make_alarm()
        shelved_until = datetime.now(timezone.utc) + timedelta(minutes=15)
        runtime = AlarmRuntimeState(
            alarm_id="alarm1",
            state=AlarmState.SHELVED,
            shelved_until=shelved_until,
        )
        manager = _make_manager(
            alarms={"alarm1": alarm},
            runtime_states={"alarm1": runtime},
        )

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        attrs = entity.extra_state_attributes

        assert "shelved_until" in attrs

    def test_attributes_empty_when_missing(self):
        """Test attributes return empty dict when alarm or runtime is missing."""
        manager = _make_manager()

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        attrs = entity.extra_state_attributes

        assert attrs == {}

    def test_attributes_missing_runtime(self):
        """Test attributes return empty dict when only runtime is missing."""
        alarm = _make_alarm()
        manager = _make_manager(alarms={"alarm1": alarm})

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        attrs = entity.extra_state_attributes

        assert attrs == {}


class TestEntityLifecycle:
    """Test entity lifecycle callbacks."""

    async def test_added_to_hass_registers_callback(self):
        """Test that async_added_to_hass registers the update callback."""
        alarm = _make_alarm()
        manager = _make_manager(alarms={"alarm1": alarm})

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        entity.hass = MagicMock()

        await entity.async_added_to_hass()

        manager.register_entity_update_callback.assert_called_once_with(
            entity._handle_update
        )

    async def test_will_remove_unregisters_callback(self):
        """Test that async_will_remove_from_hass unregisters the callback."""
        alarm = _make_alarm()
        manager = _make_manager(alarms={"alarm1": alarm})

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        entity.hass = MagicMock()

        await entity.async_will_remove_from_hass()

        manager.unregister_entity_update_callback.assert_called_once_with(
            entity._handle_update
        )

    def test_handle_update_writes_state(self):
        """Test that _handle_update calls async_write_ha_state."""
        alarm = _make_alarm()
        manager = _make_manager(alarms={"alarm1": alarm})

        entity = ScadaAlarmBinarySensor(manager, "alarm1", "test_entry")
        entity.async_write_ha_state = MagicMock()

        entity._handle_update()

        entity.async_write_ha_state.assert_called_once()
