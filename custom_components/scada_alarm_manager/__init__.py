"""SCADA Alarm Manager integration for Home Assistant."""

from __future__ import annotations

import logging

from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace.resources import ResourceStorageCollection
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

CARD_URL = f"/{DOMAIN}/frontend/alarm-card.js"
CENTER_CARD_URL = f"/{DOMAIN}/frontend/alarm-center-card.js"


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

    # Register frontend static paths
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                f"/{DOMAIN}/frontend",
                hass.config.path(
                    "custom_components", DOMAIN, "frontend"
                ),
                cache_headers=False,
            )
        ]
    )

    # Auto-register Lovelace card resource (idempotent)
    await _async_register_card_resource(hass)

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


async def _async_register_card_resource(hass: HomeAssistant) -> None:
    """Register alarm card JS files as Lovelace resources.

    On every startup: removes stale versioned entries and re-adds with
    the current version as cache buster. This ensures browser cache is
    busted on every update and resources survive HACS wipes.
    """
    try:
        lovelace_data = hass.data.get("lovelace")
        if not lovelace_data:
            _LOGGER.warning("Lovelace data not available, skipping card registration")
            return

        if "resources" not in lovelace_data:
            _LOGGER.warning(
                "Lovelace resources not available (YAML mode?). "
                "Add card resources manually: %s and %s",
                CARD_URL,
                CENTER_CARD_URL,
            )
            return

        # Read version from manifest for cache busting
        import json
        manifest_path = hass.config.path("custom_components", DOMAIN, "manifest.json")
        with open(manifest_path) as f:
            version = json.load(f).get("version", "0")

        resources: ResourceStorageCollection = lovelace_data["resources"]
        if not resources.loaded:
            await resources.async_load()

        for base_url in (CARD_URL, CENTER_CARD_URL):
            versioned_url = f"{base_url}?v={version}"

            # Remove any existing entry for this base URL (stale versions)
            for item in list(resources.async_items()):
                item_url = item.get("url", "")
                if item_url.split("?")[0] == base_url and item_url != versioned_url:
                    await resources.async_delete_item(item["id"])
                    _LOGGER.info("Removed stale resource: %s", item_url)

            # Check if current version is already registered
            existing = any(
                item.get("url", "") == versioned_url
                for item in resources.async_items()
            )
            if not existing:
                await resources.async_create_item({"res_type": "module", "url": versioned_url})
                _LOGGER.info("Registered Lovelace resource: %s", versioned_url)
    except Exception:
        _LOGGER.exception("Could not auto-register card resources")


async def _async_remove_card_resource(hass: HomeAssistant) -> None:
    """Remove the alarm card Lovelace resource."""
    try:
        lovelace_data = hass.data.get("lovelace")
        if not lovelace_data or "resources" not in lovelace_data:
            return

        resources: ResourceStorageCollection = lovelace_data["resources"]
        if not resources.loaded:
            await resources.async_load()

        for item in resources.async_items():
            if item.get("url", "").startswith(CARD_URL):
                await resources.async_delete_item(item["id"])
                _LOGGER.info("Removed Lovelace resource: %s", CARD_URL)
                return
    except Exception:
        _LOGGER.warning("Could not remove card resource")


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

        # Remove card resources
        await _async_remove_card_resource(hass)

        # Clean up
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
