"""Binary sensor platform for SCADA Alarm Manager.

One binary sensor entity per alarm definition.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import slugify

from .alarm_manager import AlarmManager
from .const import DOMAIN, AlarmState

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up binary sensor entities from a config entry."""
    manager: AlarmManager = hass.data[DOMAIN][entry.entry_id]["manager"]

    entities: list[ScadaAlarmBinarySensor] = []
    for alarm_id, alarm_def in manager.alarms.items():
        entities.append(ScadaAlarmBinarySensor(manager, alarm_id, entry.entry_id))

    async_add_entities(entities)

    # Track new alarms being added
    @callback
    def _async_alarm_added() -> None:
        """Handle new alarms being added."""
        existing_ids = {e.alarm_id for e in entities}
        new_entities: list[ScadaAlarmBinarySensor] = []
        for alarm_id in manager.alarms:
            if alarm_id not in existing_ids:
                entity = ScadaAlarmBinarySensor(manager, alarm_id, entry.entry_id)
                new_entities.append(entity)
                entities.append(entity)
        if new_entities:
            async_add_entities(new_entities)

    manager.register_entity_update_callback(_async_alarm_added)


class ScadaAlarmBinarySensor(BinarySensorEntity):
    """Binary sensor representing a single SCADA alarm."""

    _attr_has_entity_name = True
    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    def __init__(
        self,
        manager: AlarmManager,
        alarm_id: str,
        entry_id: str,
    ) -> None:
        self._manager = manager
        self._alarm_id = alarm_id
        self._entry_id = entry_id

        alarm = manager.alarms.get(alarm_id)
        name = alarm.name if alarm else alarm_id
        self._attr_name = name
        self._attr_unique_id = f"{DOMAIN}_{alarm_id}"

    @property
    def alarm_id(self) -> str:
        """Return the alarm ID."""
        return self._alarm_id

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info."""
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry_id)},
            name="SCADA Alarm Manager",
            manufacturer="SCADA Alarm Manager",
            model="Alarm System",
        )

    @property
    def is_on(self) -> bool:
        """Return True if alarm is in an active state."""
        runtime = self._manager.runtime_states.get(self._alarm_id)
        if runtime is None:
            return False
        return runtime.state in (
            AlarmState.ACTIVE_UNACKED,
            AlarmState.ACTIVE_ACKED,
            AlarmState.RTN_UNACKED,
        )

    @property
    def available(self) -> bool:
        """Return True if the alarm exists."""
        return self._alarm_id in self._manager.alarms

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        alarm = self._manager.alarms.get(self._alarm_id)
        runtime = self._manager.runtime_states.get(self._alarm_id)

        if alarm is None or runtime is None:
            return {}

        attrs: dict[str, Any] = {
            "alarm_state": runtime.state.value,
            "priority": alarm.priority.name.lower(),
            "priority_level": alarm.priority.value,
            "area": alarm.area,
            "equipment": alarm.equipment,
            "tag": alarm.tag,
            "source_entity": alarm.source_entity_id,
            "channel_id": alarm.channel_id,
            "latching": alarm.latching,
            "ack_required": alarm.ack_required,
        }

        if runtime.triggered_at:
            attrs["triggered_at"] = runtime.triggered_at.isoformat()
        if runtime.acked_at:
            attrs["acked_at"] = runtime.acked_at.isoformat()
        if runtime.acked_by:
            attrs["acked_by"] = runtime.acked_by
        if runtime.shelved_until:
            attrs["shelved_until"] = runtime.shelved_until.isoformat()
        if runtime.last_value is not None:
            attrs["last_value"] = runtime.last_value

        return attrs

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
