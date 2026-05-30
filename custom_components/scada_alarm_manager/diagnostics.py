"""Diagnostics support for SCADA Alarm Manager."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .alarm_manager import AlarmManager
from .const import DOMAIN


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    entry_data = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if entry_data is None:
        return {"error": "Integration not loaded"}

    manager: AlarmManager = entry_data["manager"]

    return {
        "alarm_count": len(manager.alarms),
        "channel_count": len(manager.channels),
        "active_count": manager.get_active_count(),
        "unacked_count": manager.get_unacked_count(),
        "alarms": {
            alarm_id: {
                "name": alarm.name,
                "priority": alarm.priority.name,
                "enabled": alarm.enabled,
                "source_entity": alarm.source_entity_id,
                "trigger_type": alarm.trigger_type.value,
                "state": manager.runtime_states[alarm_id].state.value
                if alarm_id in manager.runtime_states
                else "unknown",
            }
            for alarm_id, alarm in manager.alarms.items()
        },
        "channels": {
            ch_id: {
                "name": ch.name,
                "target_count": len(ch.notification_targets),
                "min_priority": ch.min_priority.name,
            }
            for ch_id, ch in manager.channels.items()
        },
    }
