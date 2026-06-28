"""HA service registration for SCADA Alarm Manager."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import TYPE_CHECKING, Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, AlarmEventType, AlarmPriority, TriggerType
from .models import AlarmChannel, AlarmDefinition

if TYPE_CHECKING:
    from .alarm_manager import AlarmManager

_LOGGER = logging.getLogger(__name__)

SERVICE_ACKNOWLEDGE = "acknowledge"
SERVICE_ACKNOWLEDGE_ALL = "acknowledge_all"
SERVICE_SHELVE = "shelve"
SERVICE_UNSHELVE = "unshelve"
SERVICE_ENABLE = "enable"
SERVICE_DISABLE = "disable"
SERVICE_RESET = "reset"
SERVICE_TEST_NOTIFICATION = "test_notification"

# CRUD services (with response data)
SERVICE_LIST_ALARMS = "list_alarms"
SERVICE_GET_ALARM = "get_alarm"
SERVICE_CREATE_ALARM = "create_alarm"
SERVICE_UPDATE_ALARM = "update_alarm"
SERVICE_DELETE_ALARM = "delete_alarm"
SERVICE_LIST_CHANNELS = "list_channels"
SERVICE_GET_CHANNEL = "get_channel"
SERVICE_CREATE_CHANNEL = "create_channel"
SERVICE_UPDATE_CHANNEL = "update_channel"
SERVICE_DELETE_CHANNEL = "delete_channel"
SERVICE_LIST_EVENTS = "list_events"

# External trigger services
SERVICE_TRIGGER = "trigger"
SERVICE_CLEAR = "clear"

SCHEMA_ACKNOWLEDGE = vol.Schema({vol.Required("alarm_id"): cv.string})

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

SCHEMA_UNSHELVE = vol.Schema({vol.Required("alarm_id"): cv.string})

SCHEMA_ENABLE = vol.Schema({vol.Required("alarm_id"): cv.string})

SCHEMA_DISABLE = vol.Schema({vol.Required("alarm_id"): cv.string})

SCHEMA_RESET = vol.Schema({vol.Required("alarm_id"): cv.string})

SCHEMA_TEST_NOTIFICATION = vol.Schema({vol.Required("channel_id"): cv.string})

SCHEMA_TRIGGER = vol.Schema(
    {
        vol.Required("alarm_id"): cv.string,
        vol.Optional("message"): cv.string,
    }
)

SCHEMA_CLEAR = vol.Schema({vol.Required("alarm_id"): cv.string})

# Schemas for CRUD services
SCHEMA_LIST_ALARMS = vol.Schema({})

SCHEMA_GET_ALARM = vol.Schema({vol.Required("alarm_id"): cv.string})

SCHEMA_CREATE_ALARM = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Required("source_entity_id"): cv.string,
        vol.Required("trigger_type"): vol.In(["analog", "digital", "custom_state", "external"]),
        vol.Required("trigger_config"): dict,
        vol.Optional("description", default=""): cv.string,
        vol.Optional("priority", default=1): vol.In([0, 1, 2, 3]),
        vol.Optional("area", default=""): cv.string,
        vol.Optional("equipment", default=""): cv.string,
        vol.Optional("tag", default=""): cv.string,
        vol.Optional("channel_id"): vol.Any(cv.string, None),
        vol.Optional("enabled", default=True): cv.boolean,
        vol.Optional("latching", default=False): cv.boolean,
        vol.Optional("ack_required", default=True): cv.boolean,
        vol.Optional("auto_clear", default=True): cv.boolean,
        vol.Optional("condition_template"): vol.Any(str, None),
        vol.Optional("notification_title_template"): vol.Any(str, None),
        vol.Optional("notification_text_template"): vol.Any(str, None),
        vol.Optional("hysteresis"): vol.Any(vol.Coerce(float), None),
        vol.Optional("repeat_interval"): vol.Any(vol.Coerce(int), None),
        vol.Optional("escalation_delay"): vol.Any(vol.Coerce(int), None),
        vol.Optional("trigger_delay"): vol.Any(vol.Coerce(int), None),
        vol.Optional("clear_delay"): vol.Any(vol.Coerce(int), None),
    }
)

SCHEMA_UPDATE_ALARM = vol.Schema(
    {
        vol.Required("alarm_id"): cv.string,
        vol.Optional("name"): cv.string,
        vol.Optional("description"): cv.string,
        vol.Optional("source_entity_id"): cv.string,
        vol.Optional("trigger_type"): vol.In(["analog", "digital", "custom_state", "external"]),
        vol.Optional("trigger_config"): dict,
        vol.Optional("priority"): vol.In([0, 1, 2, 3]),
        vol.Optional("area"): cv.string,
        vol.Optional("equipment"): cv.string,
        vol.Optional("tag"): cv.string,
        vol.Optional("channel_id"): vol.Any(cv.string, None),
        vol.Optional("enabled"): cv.boolean,
        vol.Optional("latching"): cv.boolean,
        vol.Optional("ack_required"): cv.boolean,
        vol.Optional("auto_clear"): cv.boolean,
        vol.Optional("condition_template"): vol.Any(str, None),
        vol.Optional("notification_title_template"): vol.Any(str, None),
        vol.Optional("notification_text_template"): vol.Any(str, None),
        vol.Optional("hysteresis"): vol.Any(vol.Coerce(float), None),
        vol.Optional("repeat_interval"): vol.Any(vol.Coerce(int), None),
        vol.Optional("escalation_delay"): vol.Any(vol.Coerce(int), None),
        vol.Optional("trigger_delay"): vol.Any(vol.Coerce(int), None),
        vol.Optional("clear_delay"): vol.Any(vol.Coerce(int), None),
    }
)

SCHEMA_DELETE_ALARM = vol.Schema({vol.Required("alarm_id"): cv.string})

SCHEMA_LIST_CHANNELS = vol.Schema({})

SCHEMA_GET_CHANNEL = vol.Schema({vol.Required("channel_id"): cv.string})

SCHEMA_CREATE_CHANNEL = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Optional("notification_targets", default=[]): cv.ensure_list,
        vol.Optional("min_priority", default=0): vol.In([0, 1, 2, 3]),
        vol.Optional("persistent_notification", default=True): cv.boolean,
        vol.Optional("mobile_push", default=True): cv.boolean,
        vol.Optional("critical_notification", default=False): cv.boolean,
        vol.Optional("repeat_cadence"): vol.Any(vol.Coerce(int), None),
        vol.Optional("escalation_target"): vol.Any(cv.string, None),
    }
)

SCHEMA_UPDATE_CHANNEL = vol.Schema(
    {
        vol.Required("channel_id"): cv.string,
        vol.Optional("name"): cv.string,
        vol.Optional("notification_targets"): cv.ensure_list,
        vol.Optional("min_priority"): vol.In([0, 1, 2, 3]),
        vol.Optional("persistent_notification"): cv.boolean,
        vol.Optional("mobile_push"): cv.boolean,
        vol.Optional("critical_notification"): cv.boolean,
        vol.Optional("repeat_cadence"): vol.Any(vol.Coerce(int), None),
        vol.Optional("escalation_target"): vol.Any(cv.string, None),
    }
)

SCHEMA_DELETE_CHANNEL = vol.Schema({vol.Required("channel_id"): cv.string})

SCHEMA_LIST_EVENTS = vol.Schema(
    {
        vol.Optional("alarm_id"): cv.string,
        vol.Optional("event_type"): cv.string,
        vol.Optional("start"): cv.string,
        vol.Optional("end"): cv.string,
        vol.Optional("limit", default=50): vol.All(vol.Coerce(int), vol.Range(min=1, max=500)),
        vol.Optional("offset", default=0): vol.All(vol.Coerce(int), vol.Range(min=0)),
    }
)


def _alarm_with_state(manager: AlarmManager, alarm_id: str) -> dict[str, Any] | None:
    """Build combined alarm definition + runtime state dict."""
    alarm = manager.alarms.get(alarm_id)
    runtime = manager.runtime_states.get(alarm_id)
    if alarm is None or runtime is None:
        return None
    result = alarm.to_dict()
    result["runtime"] = runtime.to_dict()
    return result


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

    # --- CRUD handlers (with response data) ---

    async def handle_list_alarms(call: ServiceCall) -> ServiceResponse:
        """List all alarm definitions with runtime state."""
        manager = _get_manager(hass)
        alarms = [_alarm_with_state(manager, alarm_id) for alarm_id in manager.alarms]
        return {"alarms": [a for a in alarms if a]}

    async def handle_get_alarm(call: ServiceCall) -> ServiceResponse:
        """Get a single alarm by ID."""
        manager = _get_manager(hass)
        result = _alarm_with_state(manager, call.data["alarm_id"])
        if result is None:
            raise ValueError(f"Alarm not found: {call.data['alarm_id']}")
        return result

    async def handle_create_alarm(call: ServiceCall) -> ServiceResponse:
        """Create a new alarm definition."""
        manager = _get_manager(hass)
        alarm = AlarmDefinition(
            name=call.data["name"],
            source_entity_id=call.data["source_entity_id"],
            trigger_type=TriggerType(call.data["trigger_type"]),
            trigger_config=call.data["trigger_config"],
            description=call.data.get("description", ""),
            priority=AlarmPriority(call.data.get("priority", 1)),
            area=call.data.get("area", ""),
            equipment=call.data.get("equipment", ""),
            tag=call.data.get("tag", ""),
            channel_id=call.data.get("channel_id"),
            enabled=call.data.get("enabled", True),
            latching=call.data.get("latching", False),
            ack_required=call.data.get("ack_required", True),
            auto_clear=call.data.get("auto_clear", True),
            condition_template=call.data.get("condition_template"),
            notification_title_template=call.data.get("notification_title_template"),
            notification_text_template=call.data.get("notification_text_template"),
            hysteresis=call.data.get("hysteresis"),
            repeat_interval=call.data.get("repeat_interval"),
            escalation_delay=call.data.get("escalation_delay"),
            trigger_delay=call.data.get("trigger_delay"),
            clear_delay=call.data.get("clear_delay"),
        )
        alarm = await manager.async_create_alarm(alarm)
        return _alarm_with_state(manager, alarm.id)

    async def handle_update_alarm(call: ServiceCall) -> ServiceResponse:
        """Update an existing alarm definition."""
        manager = _get_manager(hass)
        alarm = manager.alarms.get(call.data["alarm_id"])
        if alarm is None:
            raise ValueError(f"Alarm not found: {call.data['alarm_id']}")

        for field in (
            "name",
            "description",
            "source_entity_id",
            "area",
            "equipment",
            "tag",
            "channel_id",
            "enabled",
            "latching",
            "ack_required",
            "auto_clear",
            "condition_template",
            "notification_title_template",
            "notification_text_template",
            "hysteresis",
            "repeat_interval",
            "escalation_delay",
            "trigger_delay",
            "clear_delay",
        ):
            if field in call.data:
                setattr(alarm, field, call.data[field])

        if "trigger_type" in call.data:
            alarm.trigger_type = TriggerType(call.data["trigger_type"])
        if "trigger_config" in call.data:
            alarm.trigger_config = call.data["trigger_config"]
        if "priority" in call.data:
            alarm.priority = AlarmPriority(call.data["priority"])

        alarm = await manager.async_update_alarm(alarm)
        return _alarm_with_state(manager, alarm.id)

    async def handle_delete_alarm(call: ServiceCall) -> ServiceResponse:
        """Delete an alarm definition."""
        manager = _get_manager(hass)
        await manager.async_delete_alarm(call.data["alarm_id"])
        return {"success": True}

    async def handle_list_channels(call: ServiceCall) -> ServiceResponse:
        """List all notification channels."""
        manager = _get_manager(hass)
        channels = [c.to_dict() for c in manager.channels.values()]
        return {"channels": channels}

    async def handle_get_channel(call: ServiceCall) -> ServiceResponse:
        """Get a single channel by ID."""
        manager = _get_manager(hass)
        channel = manager.channels.get(call.data["channel_id"])
        if channel is None:
            raise ValueError(f"Channel not found: {call.data['channel_id']}")
        return channel.to_dict()

    async def handle_create_channel(call: ServiceCall) -> ServiceResponse:
        """Create a new notification channel."""
        manager = _get_manager(hass)
        channel = AlarmChannel(
            name=call.data["name"],
            notification_targets=call.data.get("notification_targets", []),
            min_priority=AlarmPriority(call.data.get("min_priority", 0)),
            persistent_notification=call.data.get("persistent_notification", True),
            mobile_push=call.data.get("mobile_push", True),
            critical_notification=call.data.get("critical_notification", False),
            repeat_cadence=call.data.get("repeat_cadence"),
            escalation_target=call.data.get("escalation_target"),
        )
        channel = await manager.async_create_channel(channel)
        return channel.to_dict()

    async def handle_update_channel(call: ServiceCall) -> ServiceResponse:
        """Update an existing notification channel."""
        manager = _get_manager(hass)
        channel = manager.channels.get(call.data["channel_id"])
        if channel is None:
            raise ValueError(f"Channel not found: {call.data['channel_id']}")

        for field in (
            "name",
            "notification_targets",
            "persistent_notification",
            "mobile_push",
            "critical_notification",
            "repeat_cadence",
            "escalation_target",
        ):
            if field in call.data:
                setattr(channel, field, call.data[field])

        if "min_priority" in call.data:
            channel.min_priority = AlarmPriority(call.data["min_priority"])

        channel = await manager.async_update_channel(channel)
        return channel.to_dict()

    async def handle_delete_channel(call: ServiceCall) -> ServiceResponse:
        """Delete a notification channel."""
        manager = _get_manager(hass)
        await manager.async_delete_channel(call.data["channel_id"])
        return {"success": True}

    async def handle_list_events(call: ServiceCall) -> ServiceResponse:
        """Query alarm event history."""
        manager = _get_manager(hass)

        event_type = AlarmEventType(call.data["event_type"]) if "event_type" in call.data else None
        start = datetime.fromisoformat(call.data["start"]) if "start" in call.data else None
        end = datetime.fromisoformat(call.data["end"]) if "end" in call.data else None

        events = await manager._database.async_get_events(
            alarm_id=call.data.get("alarm_id"),
            event_type=event_type,
            start=start,
            end=end,
            limit=call.data.get("limit", 50),
            offset=call.data.get("offset", 0),
        )

        # Enrich events with alarm names
        event_dicts = []
        for event in events:
            d = event.to_dict()
            alarm = manager.alarms.get(event.alarm_id)
            d["alarm_name"] = alarm.name if alarm else "Deleted alarm"
            event_dicts.append(d)

        return {"events": event_dicts}

    async def handle_export_alarms(call: ServiceCall) -> ServiceResponse:
        """Export all alarm definitions as JSON."""
        manager = _get_manager(hass)
        alarms = [a.to_dict() for a in manager.alarms.values()]
        channels = [c.to_dict() for c in manager.channels.values()]
        return {"alarms": alarms, "channels": channels}

    async def handle_import_alarms(call: ServiceCall) -> ServiceResponse:
        """Bulk import alarm definitions from JSON array."""
        manager = _get_manager(hass)
        definitions = call.data.get("alarms", [])
        created = 0
        for d in definitions:
            alarm = AlarmDefinition(
                name=d["name"],
                source_entity_id=d["source_entity_id"],
                trigger_type=TriggerType(d["trigger_type"]),
                trigger_config=d.get("trigger_config", {}),
                priority=AlarmPriority(d.get("priority", 1)),
                description=d.get("description", ""),
                area=d.get("area", ""),
                equipment=d.get("equipment", ""),
                tag=d.get("tag", ""),
                channel_id=d.get("channel_id"),
                enabled=d.get("enabled", True),
                latching=d.get("latching", False),
                ack_required=d.get("ack_required", True),
                auto_clear=d.get("auto_clear", True),
                condition_template=d.get("condition_template"),
                notification_title_template=d.get("notification_title_template"),
                notification_text_template=d.get("notification_text_template"),
                hysteresis=d.get("hysteresis"),
                repeat_interval=d.get("repeat_interval"),
                escalation_delay=d.get("escalation_delay"),
                trigger_delay=d.get("trigger_delay"),
                clear_delay=d.get("clear_delay"),
            )
            await manager.async_create_alarm(alarm)
            created += 1
        return {"created": created}

    async def handle_maintenance_mode(call: ServiceCall) -> ServiceResponse:
        """Toggle maintenance mode (suppress all notifications)."""
        manager = _get_manager(hass)
        enabled = call.data.get("enabled", True)
        if manager._notification_router:
            manager._notification_router.maintenance_mode = enabled
        return {"maintenance_mode": enabled}

    async def handle_trigger(call: ServiceCall) -> None:
        manager = _get_manager(hass)
        await manager.async_trigger_external(
            call.data["alarm_id"],
            message=call.data.get("message"),
            user=call.context.user_id,
        )

    async def handle_clear(call: ServiceCall) -> None:
        manager = _get_manager(hass)
        await manager.async_clear_external(
            call.data["alarm_id"],
            user=call.context.user_id,
        )

    # --- Register action-only services ---
    hass.services.async_register(DOMAIN, SERVICE_TRIGGER, handle_trigger, schema=SCHEMA_TRIGGER)
    hass.services.async_register(DOMAIN, SERVICE_CLEAR, handle_clear, schema=SCHEMA_CLEAR)
    hass.services.async_register(DOMAIN, SERVICE_ACKNOWLEDGE, handle_acknowledge, schema=SCHEMA_ACKNOWLEDGE)
    hass.services.async_register(DOMAIN, SERVICE_ACKNOWLEDGE_ALL, handle_acknowledge_all, schema=SCHEMA_ACKNOWLEDGE_ALL)
    hass.services.async_register(DOMAIN, SERVICE_SHELVE, handle_shelve, schema=SCHEMA_SHELVE)
    hass.services.async_register(DOMAIN, SERVICE_UNSHELVE, handle_unshelve, schema=SCHEMA_UNSHELVE)
    hass.services.async_register(DOMAIN, SERVICE_ENABLE, handle_enable, schema=SCHEMA_ENABLE)
    hass.services.async_register(DOMAIN, SERVICE_DISABLE, handle_disable, schema=SCHEMA_DISABLE)
    hass.services.async_register(DOMAIN, SERVICE_RESET, handle_reset, schema=SCHEMA_RESET)
    hass.services.async_register(
        DOMAIN,
        SERVICE_TEST_NOTIFICATION,
        handle_test_notification,
        schema=SCHEMA_TEST_NOTIFICATION,
    )

    # --- Register CRUD services (with response data) ---
    hass.services.async_register(
        DOMAIN,
        SERVICE_LIST_ALARMS,
        handle_list_alarms,
        schema=SCHEMA_LIST_ALARMS,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_ALARM,
        handle_get_alarm,
        schema=SCHEMA_GET_ALARM,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_CREATE_ALARM,
        handle_create_alarm,
        schema=SCHEMA_CREATE_ALARM,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_UPDATE_ALARM,
        handle_update_alarm,
        schema=SCHEMA_UPDATE_ALARM,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_DELETE_ALARM,
        handle_delete_alarm,
        schema=SCHEMA_DELETE_ALARM,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_LIST_CHANNELS,
        handle_list_channels,
        schema=SCHEMA_LIST_CHANNELS,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_CHANNEL,
        handle_get_channel,
        schema=SCHEMA_GET_CHANNEL,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_CREATE_CHANNEL,
        handle_create_channel,
        schema=SCHEMA_CREATE_CHANNEL,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_UPDATE_CHANNEL,
        handle_update_channel,
        schema=SCHEMA_UPDATE_CHANNEL,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_DELETE_CHANNEL,
        handle_delete_channel,
        schema=SCHEMA_DELETE_CHANNEL,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_LIST_EVENTS,
        handle_list_events,
        schema=SCHEMA_LIST_EVENTS,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        "export_alarms",
        handle_export_alarms,
        schema=vol.Schema({}),
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        "import_alarms",
        handle_import_alarms,
        schema=vol.Schema({vol.Required("alarms"): list}),
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        "maintenance_mode",
        handle_maintenance_mode,
        schema=vol.Schema({vol.Required("enabled"): cv.boolean}),
        supports_response=SupportsResponse.OPTIONAL,
    )


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
        SERVICE_TRIGGER,
        SERVICE_CLEAR,
        SERVICE_LIST_ALARMS,
        SERVICE_GET_ALARM,
        SERVICE_CREATE_ALARM,
        SERVICE_UPDATE_ALARM,
        SERVICE_DELETE_ALARM,
        SERVICE_LIST_CHANNELS,
        SERVICE_GET_CHANNEL,
        SERVICE_CREATE_CHANNEL,
        SERVICE_UPDATE_CHANNEL,
        SERVICE_DELETE_CHANNEL,
        SERVICE_LIST_EVENTS,
        "export_alarms",
        "import_alarms",
        "maintenance_mode",
    ):
        hass.services.async_remove(DOMAIN, service)
