"""SCADA Alarm Manager integration for Home Assistant."""

from __future__ import annotations

import logging

from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.loader import async_get_integration

from .alarm_manager import AlarmManager
from .const import (
    DOMAIN,
    NOTIFICATION_ACTION_ACK,
    NOTIFICATION_ACTION_CUSTOM,
    NOTIFICATION_ACTION_SHELVE,
    PLATFORMS,
)
from .database import AlarmDatabase
from .notification_router import NotificationRouter
from .services import async_register_services, async_unregister_services
from .store import AlarmStore
from .websocket_api import async_register_websocket_commands

_LOGGER = logging.getLogger(__name__)

OVERVIEW_URL = f"/{DOMAIN}/frontend/alarm-overview.js"
BANNER_URL = f"/{DOMAIN}/frontend/alarm-banner.js"

# Old URLs from previous versions — cleaned up on startup
_LEGACY_URLS = [
    f"/{DOMAIN}/frontend/alarm-card.js",
    f"/{DOMAIN}/frontend/alarm-center-card.js",
    f"/{DOMAIN}/frontend/alarm-center-panel.js",
    f"/{DOMAIN}/frontend/alarm-dashboard.js",
]


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

    # Auto-register Lovelace card resources after HA is fully started
    async def _register_when_ready(_event: Event | None = None) -> None:
        await _async_register_card_resources(hass)

    if hass.is_running:
        await _async_register_card_resources(hass)
    else:
        hass.bus.async_listen_once("homeassistant_started", _register_when_ready)

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
        elif action.startswith(NOTIFICATION_ACTION_CUSTOM):
            alarm_id = action[len(NOTIFICATION_ACTION_CUSTOM):]
            hass.async_create_task(
                manager.async_trigger_custom_action(alarm_id)
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

        # Remove card resources
        await _async_remove_card_resources(hass)

        # Clean up
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


async def _async_register_card_resources(hass: HomeAssistant) -> None:
    """Register card JS files as Lovelace resources with cache busting."""
    try:
        lovelace_data = hass.data.get("lovelace")
        if not lovelace_data:
            _LOGGER.warning("Lovelace data not available, skipping card registration")
            return

        if "resources" not in lovelace_data:
            _LOGGER.warning(
                "Lovelace resources not available (YAML mode?). "
                "Add card resources manually: %s and %s",
                OVERVIEW_URL,
                BANNER_URL,
            )
            return

        # Read the integration version without blocking the event loop (the manifest
        # is already cached by HA's loader). The version is the cache-buster appended
        # to each resource URL so a release forces browsers to fetch the new bundle.
        integration = await async_get_integration(hass, DOMAIN)
        version = str(integration.version or "0")

        resources: ResourceStorageCollection = lovelace_data["resources"]
        if not resources.loaded:
            await resources.async_load()

        # Remove legacy resources from previous versions
        for item in list(resources.async_items()):
            item_base = item.get("url", "").split("?")[0]
            if item_base in _LEGACY_URLS:
                await resources.async_delete_item(item["id"])
                _LOGGER.info("Removed legacy resource: %s", item.get("url"))

        for base_url in (OVERVIEW_URL, BANNER_URL):
            versioned_url = f"{base_url}?v={version}"

            # Remove stale versioned entries
            for item in list(resources.async_items()):
                item_url = item.get("url", "")
                if item_url.split("?")[0] == base_url and item_url != versioned_url:
                    await resources.async_delete_item(item["id"])
                    _LOGGER.info("Removed stale resource: %s", item_url)

            existing = any(
                item.get("url", "") == versioned_url
                for item in resources.async_items()
            )
            if not existing:
                await resources.async_create_item(
                    {"res_type": "module", "url": versioned_url}
                )
                _LOGGER.info("Registered Lovelace resource: %s", versioned_url)
    except Exception:
        _LOGGER.exception("Could not auto-register card resources")


async def _async_remove_card_resources(hass: HomeAssistant) -> None:
    """Remove card Lovelace resources on unload."""
    try:
        lovelace_data = hass.data.get("lovelace")
        if not lovelace_data or "resources" not in lovelace_data:
            return

        resources: ResourceStorageCollection = lovelace_data["resources"]
        if not resources.loaded:
            await resources.async_load()

        for base_url in (OVERVIEW_URL, BANNER_URL):
            for item in list(resources.async_items()):
                if item.get("url", "").split("?")[0] == base_url:
                    await resources.async_delete_item(item["id"])
                    _LOGGER.info("Removed Lovelace resource: %s", item.get("url"))
    except Exception:
        _LOGGER.warning("Could not remove card resources")
