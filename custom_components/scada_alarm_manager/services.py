"""HA service registration for SCADA Alarm Manager."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .alarm_manager import AlarmManager
from .const import DOMAIN, AlarmPriority

_LOGGER = logging.getLogger(__name__)

SERVICE_ACKNOWLEDGE = "acknowledge"
SERVICE_ACKNOWLEDGE_ALL = "acknowledge_all"
SERVICE_SHELVE = "shelve"
SERVICE_UNSHELVE = "unshelve"
SERVICE_ENABLE = "enable"
SERVICE_DISABLE = "disable"
SERVICE_RESET = "reset"
SERVICE_TEST_NOTIFICATION = "test_notification"

SCHEMA_ACKNOWLEDGE = vol.Schema(
    {vol.Required("alarm_id"): cv.string}
)

SCHEMA_ACKNOWLEDGE_ALL = vol.Schema(
    {
        vol.Optional("channel"): cv.string,
        vol.Optional("priority"): vol.In([0, 1, 2, 3]),
    }
)

SCHEMA_SHELVE = vol.Schema(
    {
        vol.Required("alarm_id"): cv.string,
        vol.Required("duration"): vol.All(vol.Coerce(int), vol.Range(min=1, max=10080)),
    }
)

SCHEMA_UNSHELVE = vol.Schema(
    {vol.Required("alarm_id"): cv.string}
)

SCHEMA_ENABLE = vol.Schema(
    {vol.Required("alarm_id"): cv.string}
)

SCHEMA_DISABLE = vol.Schema(
    {vol.Required("alarm_id"): cv.string}
)

SCHEMA_RESET = vol.Schema(
    {vol.Required("alarm_id"): cv.string}
)

SCHEMA_TEST_NOTIFICATION = vol.Schema(
    {vol.Required("channel_id"): cv.string}
)


def _get_manager(hass: HomeAssistant) -> AlarmManager:
    """Get the alarm manager from hass data."""
    for entry_data in hass.data.get(DOMAIN, {}).values():
        if isinstance(entry_data, dict) and "manager" in entry_data:
            return entry_data["manager"]
    raise ValueError("SCADA Alarm Manager not initialized")


async def async_register_services(hass: HomeAssistant) -> None:
    """Register all SCADA Alarm Manager services."""

    async def handle_acknowledge(call: ServiceCall) -> None:
        manager = _get_manager(hass)
        await manager.async_acknowledge(
            call.data["alarm_id"],
            user=call.context.user_id,
        )

    async def handle_acknowledge_all(call: ServiceCall) -> None:
        manager = _get_manager(hass)
        priority = None
        if "priority" in call.data:
            priority = AlarmPriority(call.data["priority"])
        await manager.async_acknowledge_all(
            channel_id=call.data.get("channel"),
            priority=priority,
            user=call.context.user_id,
        )

    async def handle_shelve(call: ServiceCall) -> None:
        manager = _get_manager(hass)
        await manager.async_shelve(
            call.data["alarm_id"],
            duration_minutes=call.data["duration"],
            user=call.context.user_id,
        )

    async def handle_unshelve(call: ServiceCall) -> None:
        manager = _get_manager(hass)
        await manager.async_unshelve(
            call.data["alarm_id"],
            user=call.context.user_id,
        )

    async def handle_enable(call: ServiceCall) -> None:
        manager = _get_manager(hass)
        await manager.async_enable(
            call.data["alarm_id"],
            user=call.context.user_id,
        )

    async def handle_disable(call: ServiceCall) -> None:
        manager = _get_manager(hass)
        await manager.async_disable(
            call.data["alarm_id"],
            user=call.context.user_id,
        )

    async def handle_reset(call: ServiceCall) -> None:
        manager = _get_manager(hass)
        await manager.async_reset(
            call.data["alarm_id"],
            user=call.context.user_id,
        )

    async def handle_test_notification(call: ServiceCall) -> None:
        manager = _get_manager(hass)
        channel = manager.channels.get(call.data["channel_id"])
        if channel and manager._notification_router:
            await manager._notification_router.async_send_test_notification(channel)

    hass.services.async_register(DOMAIN, SERVICE_ACKNOWLEDGE, handle_acknowledge, schema=SCHEMA_ACKNOWLEDGE)
    hass.services.async_register(DOMAIN, SERVICE_ACKNOWLEDGE_ALL, handle_acknowledge_all, schema=SCHEMA_ACKNOWLEDGE_ALL)
    hass.services.async_register(DOMAIN, SERVICE_SHELVE, handle_shelve, schema=SCHEMA_SHELVE)
    hass.services.async_register(DOMAIN, SERVICE_UNSHELVE, handle_unshelve, schema=SCHEMA_UNSHELVE)
    hass.services.async_register(DOMAIN, SERVICE_ENABLE, handle_enable, schema=SCHEMA_ENABLE)
    hass.services.async_register(DOMAIN, SERVICE_DISABLE, handle_disable, schema=SCHEMA_DISABLE)
    hass.services.async_register(DOMAIN, SERVICE_RESET, handle_reset, schema=SCHEMA_RESET)
    hass.services.async_register(DOMAIN, SERVICE_TEST_NOTIFICATION, handle_test_notification, schema=SCHEMA_TEST_NOTIFICATION)


async def async_unregister_services(hass: HomeAssistant) -> None:
    """Unregister all SCADA Alarm Manager services."""
    for service in (
        SERVICE_ACKNOWLEDGE,
        SERVICE_ACKNOWLEDGE_ALL,
        SERVICE_SHELVE,
        SERVICE_UNSHELVE,
        SERVICE_ENABLE,
        SERVICE_DISABLE,
        SERVICE_RESET,
        SERVICE_TEST_NOTIFICATION,
    ):
        hass.services.async_remove(DOMAIN, service)
