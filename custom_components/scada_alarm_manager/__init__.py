"""SCADA Alarm Manager integration for Home Assistant."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback

from .alarm_manager import AlarmManager
from .const import (
    DOMAIN,
    NOTIFICATION_ACTION_ACK,
    NOTIFICATION_ACTION_SHELVE,
    PLATFORMS,
)
from .database import AlarmDatabase
from .notification_router import NotificationRouter
from .services import async_register_services, async_unregister_services
from .store import AlarmStore
from .websocket_api import async_register_websocket_commands

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up SCADA Alarm Manager from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Initialize database
    db_path = hass.config.path("scada_alarm_manager", "scada_alarm_manager.db")
    database = AlarmDatabase(db_path)
    await database.async_init()

    # Initialize store backup
    store = AlarmStore(hass)

    # Create alarm manager
    manager = AlarmManager(hass, database, store)

    # Create notification router
    notification_router = NotificationRouter(hass, manager)
    manager.set_notification_router(notification_router)

    # Store references
    hass.data[DOMAIN][entry.entry_id] = {
        "manager": manager,
        "database": database,
        "store": store,
        "notification_router": notification_router,
    }

    # Start alarm manager
    await manager.async_start()

    # Register WebSocket commands
    async_register_websocket_commands(hass)

    # Register services
    await async_register_services(hass)

    # Listen for mobile notification actions
    @callback
    def _handle_notification_action(event: Event) -> None:
        """Handle actionable notification responses."""
        action = event.data.get("action", "")

        if action.startswith(NOTIFICATION_ACTION_ACK):
            alarm_id = action[len(NOTIFICATION_ACTION_ACK):]
            hass.async_create_task(
                manager.async_acknowledge(alarm_id, user="mobile")
            )
        elif action.startswith(NOTIFICATION_ACTION_SHELVE):
            alarm_id = action[len(NOTIFICATION_ACTION_SHELVE):]
            hass.async_create_task(
                manager.async_shelve(alarm_id, duration_minutes=15, user="mobile")
            )

    hass.bus.async_listen(
        "mobile_app_notification_action", _handle_notification_action
    )

    # Forward entry setup to entity platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    _LOGGER.info("SCADA Alarm Manager setup complete")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a SCADA Alarm Manager config entry."""
    entry_data = hass.data[DOMAIN].get(entry.entry_id)
    if entry_data is None:
        return True

    # Unload entity platforms
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        # Stop alarm manager
        manager: AlarmManager = entry_data["manager"]
        await manager.async_stop()

        # Close database
        database: AlarmDatabase = entry_data["database"]
        await database.async_close()

        # Unregister services
        await async_unregister_services(hass)

        # Clean up
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
