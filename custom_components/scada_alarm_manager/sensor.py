"""Sensor platform for SCADA Alarm Manager.

Summary sensors: active count, unacked count, highest severity.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .alarm_manager import AlarmManager
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensor entities from a config entry."""
    manager: AlarmManager = hass.data[DOMAIN][entry.entry_id]["manager"]

    async_add_entities([
        ScadaActiveCountSensor(manager, entry.entry_id),
        ScadaUnackedCountSensor(manager, entry.entry_id),
        ScadaHighestSeveritySensor(manager, entry.entry_id),
    ])


class ScadaBaseSensor(SensorEntity):
    """Base class for SCADA summary sensors."""

    _attr_has_entity_name = True

    def __init__(self, manager: AlarmManager, entry_id: str) -> None:
        self._manager = manager
        self._entry_id = entry_id

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info."""
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry_id)},
            name="SCADA Alarm Manager",
            manufacturer="SCADA Alarm Manager",
            model="Alarm System",
        )

    @callback
    def _handle_update(self) -> None:
        """Handle alarm state update."""
        self.async_write_ha_state()

    async def async_added_to_hass(self) -> None:
        """Register update callback when added to hass."""
        self._manager.register_entity_update_callback(self._handle_update)

    async def async_will_remove_from_hass(self) -> None:
        """Unregister update callback when removed."""
        self._manager.unregister_entity_update_callback(self._handle_update)


class ScadaActiveCountSensor(ScadaBaseSensor):
    """Sensor showing count of active alarms."""

    _attr_name = "Active Alarm Count"
    _attr_icon = "mdi:alarm-light"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, manager: AlarmManager, entry_id: str) -> None:
        super().__init__(manager, entry_id)
        self._attr_unique_id = f"{DOMAIN}_{entry_id}_active_count"

    @property
    def native_value(self) -> int:
        """Return the number of active alarms."""
        return self._manager.get_active_count()


class ScadaUnackedCountSensor(ScadaBaseSensor):
    """Sensor showing count of unacknowledged alarms."""

    _attr_name = "Unacknowledged Alarm Count"
    _attr_icon = "mdi:alarm-bell"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, manager: AlarmManager, entry_id: str) -> None:
        super().__init__(manager, entry_id)
        self._attr_unique_id = f"{DOMAIN}_{entry_id}_unacked_count"

    @property
    def native_value(self) -> int:
        """Return the number of unacknowledged alarms."""
        return self._manager.get_unacked_count()


class ScadaHighestSeveritySensor(ScadaBaseSensor):
    """Sensor showing the highest severity among active alarms."""

    _attr_name = "Highest Alarm Severity"
    _attr_icon = "mdi:alert-decagram"

    def __init__(self, manager: AlarmManager, entry_id: str) -> None:
        super().__init__(manager, entry_id)
        self._attr_unique_id = f"{DOMAIN}_{entry_id}_highest_severity"

    @property
    def native_value(self) -> str:
        """Return the highest severity name."""
        severity = self._manager.get_highest_severity()
        return severity.name.lower() if severity is not None else "none"

    @property
    def icon(self) -> str:
        """Return icon based on severity."""
        severity = self._manager.get_highest_severity()
        if severity is None:
            return "mdi:check-circle"
        icons = {
            0: "mdi:information",
            1: "mdi:alert",
            2: "mdi:alert-circle",
            3: "mdi:alert-octagon",
        }
        return icons.get(severity.value, "mdi:alert-decagram")
