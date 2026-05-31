"""WebSocket API for SCADA Alarm Manager."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .alarm_manager import AlarmManager
from .const import DOMAIN, EVENT_ALARM_STATE_CHANGED, AlarmEventType, AlarmPriority, TriggerType
from .models import AlarmChannel, AlarmDefinition

_LOGGER = logging.getLogger(__name__)


def _get_manager(hass: HomeAssistant) -> AlarmManager:
    """Get the alarm manager instance."""
    for entry_data in hass.data.get(DOMAIN, {}).values():
        if isinstance(entry_data, dict) and "manager" in entry_data:
            return entry_data["manager"]
    raise ValueError("SCADA Alarm Manager not initialized")


def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register all WebSocket commands."""
    websocket_api.async_register_command(hass, ws_alarm_list)
    websocket_api.async_register_command(hass, ws_alarm_get)
    websocket_api.async_register_command(hass, ws_alarm_create)
    websocket_api.async_register_command(hass, ws_alarm_update)
    websocket_api.async_register_command(hass, ws_alarm_delete)
    websocket_api.async_register_command(hass, ws_alarm_acknowledge)
    websocket_api.async_register_command(hass, ws_alarm_acknowledge_all)
    websocket_api.async_register_command(hass, ws_alarm_shelve)
    websocket_api.async_register_command(hass, ws_alarm_unshelve)
    websocket_api.async_register_command(hass, ws_alarm_reset)
    websocket_api.async_register_command(hass, ws_alarm_trigger)
    websocket_api.async_register_command(hass, ws_alarm_clear)
    websocket_api.async_register_command(hass, ws_channel_list)
    websocket_api.async_register_command(hass, ws_channel_get)
    websocket_api.async_register_command(hass, ws_channel_create)
    websocket_api.async_register_command(hass, ws_channel_update)
    websocket_api.async_register_command(hass, ws_channel_delete)
    websocket_api.async_register_command(hass, ws_event_list)
    websocket_api.async_register_command(hass, ws_subscribe)


def _alarm_with_state(manager: AlarmManager, alarm_id: str) -> dict[str, Any] | None:
    """Build combined alarm definition + runtime state dict."""
    alarm = manager.alarms.get(alarm_id)
    runtime = manager.runtime_states.get(alarm_id)
    if alarm is None or runtime is None:
        return None
    result = alarm.to_dict()
    result["runtime"] = runtime.to_dict()
    return result


# --- Alarm CRUD ---


@websocket_api.websocket_command(
    {vol.Required("type"): "scada_alarm_manager/alarm/list"}
)
@websocket_api.async_response
async def ws_alarm_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all alarms with runtime state."""
    manager = _get_manager(hass)
    alarms = [
        _alarm_with_state(manager, alarm_id)
        for alarm_id in manager.alarms
    ]
    connection.send_result(msg["id"], {"alarms": [a for a in alarms if a]})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/alarm/get",
        vol.Required("alarm_id"): str,
    }
)
@websocket_api.async_response
async def ws_alarm_get(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get a single alarm by ID."""
    manager = _get_manager(hass)
    result = _alarm_with_state(manager, msg["alarm_id"])
    if result is None:
        connection.send_error(msg["id"], "not_found", "Alarm not found")
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/alarm/create",
        vol.Required("name"): str,
        vol.Required("source_entity_id"): str,
        vol.Required("trigger_type"): vol.In(["analog", "digital", "custom_state", "external"]),
        vol.Required("trigger_config"): dict,
        vol.Optional("description", default=""): str,
        vol.Optional("priority", default=1): vol.In([0, 1, 2, 3]),
        vol.Optional("area", default=""): str,
        vol.Optional("equipment", default=""): str,
        vol.Optional("tag", default=""): str,
        vol.Optional("channel_id"): vol.Any(str, None),
        vol.Optional("enabled", default=True): bool,
        vol.Optional("latching", default=False): bool,
        vol.Optional("ack_required", default=True): bool,
        vol.Optional("auto_clear", default=True): bool,
        vol.Optional("condition_template"): vol.Any(str, None),
        vol.Optional("repeat_interval"): vol.Any(int, None),
        vol.Optional("escalation_delay"): vol.Any(int, None),
    }
)
@websocket_api.async_response
async def ws_alarm_create(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a new alarm definition."""
    manager = _get_manager(hass)
    alarm = AlarmDefinition(
        name=msg["name"],
        source_entity_id=msg["source_entity_id"],
        trigger_type=TriggerType(msg["trigger_type"]),
        trigger_config=msg["trigger_config"],
        description=msg.get("description", ""),
        priority=AlarmPriority(msg.get("priority", 1)),
        area=msg.get("area", ""),
        equipment=msg.get("equipment", ""),
        tag=msg.get("tag", ""),
        channel_id=msg.get("channel_id"),
        enabled=msg.get("enabled", True),
        latching=msg.get("latching", False),
        ack_required=msg.get("ack_required", True),
        auto_clear=msg.get("auto_clear", True),
        condition_template=msg.get("condition_template"),
        repeat_interval=msg.get("repeat_interval"),
        escalation_delay=msg.get("escalation_delay"),
    )
    alarm = await manager.async_create_alarm(alarm)
    connection.send_result(msg["id"], _alarm_with_state(manager, alarm.id))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/alarm/update",
        vol.Required("alarm_id"): str,
        vol.Optional("name"): str,
        vol.Optional("description"): str,
        vol.Optional("source_entity_id"): str,
        vol.Optional("trigger_type"): vol.In(["analog", "digital", "custom_state", "external"]),
        vol.Optional("trigger_config"): dict,
        vol.Optional("priority"): vol.In([0, 1, 2, 3]),
        vol.Optional("area"): str,
        vol.Optional("equipment"): str,
        vol.Optional("tag"): str,
        vol.Optional("channel_id"): vol.Any(str, None),
        vol.Optional("enabled"): bool,
        vol.Optional("latching"): bool,
        vol.Optional("ack_required"): bool,
        vol.Optional("auto_clear"): bool,
        vol.Optional("condition_template"): vol.Any(str, None),
        vol.Optional("repeat_interval"): vol.Any(int, None),
        vol.Optional("escalation_delay"): vol.Any(int, None),
    }
)
@websocket_api.async_response
async def ws_alarm_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update an existing alarm definition."""
    manager = _get_manager(hass)
    alarm = manager.alarms.get(msg["alarm_id"])
    if alarm is None:
        connection.send_error(msg["id"], "not_found", "Alarm not found")
        return

    # Apply updates
    for field in (
        "name", "description", "source_entity_id", "area",
        "equipment", "tag", "channel_id", "enabled", "latching",
        "ack_required", "auto_clear", "condition_template",
        "repeat_interval", "escalation_delay",
    ):
        if field in msg:
            setattr(alarm, field, msg[field])

    if "trigger_type" in msg:
        alarm.trigger_type = TriggerType(msg["trigger_type"])
    if "trigger_config" in msg:
        alarm.trigger_config = msg["trigger_config"]
    if "priority" in msg:
        alarm.priority = AlarmPriority(msg["priority"])

    alarm = await manager.async_update_alarm(alarm)
    connection.send_result(msg["id"], _alarm_with_state(manager, alarm.id))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/alarm/delete",
        vol.Required("alarm_id"): str,
    }
)
@websocket_api.async_response
async def ws_alarm_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete an alarm definition."""
    manager = _get_manager(hass)
    await manager.async_delete_alarm(msg["alarm_id"])
    connection.send_result(msg["id"], {"success": True})


# --- Alarm Actions ---


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/alarm/acknowledge",
        vol.Required("alarm_id"): str,
    }
)
@websocket_api.async_response
async def ws_alarm_acknowledge(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Acknowledge an alarm."""
    manager = _get_manager(hass)
    await manager.async_acknowledge(msg["alarm_id"], user=connection.user.id if connection.user else None)
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/alarm/acknowledge_all",
        vol.Optional("channel_id"): str,
        vol.Optional("priority"): vol.In([0, 1, 2, 3]),
    }
)
@websocket_api.async_response
async def ws_alarm_acknowledge_all(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Acknowledge all matching alarms."""
    manager = _get_manager(hass)
    priority = AlarmPriority(msg["priority"]) if "priority" in msg else None
    count = await manager.async_acknowledge_all(
        channel_id=msg.get("channel_id"),
        priority=priority,
        user=connection.user.id if connection.user else None,
    )
    connection.send_result(msg["id"], {"acknowledged": count})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/alarm/shelve",
        vol.Required("alarm_id"): str,
        vol.Required("duration"): vol.All(vol.Coerce(int), vol.Range(min=1)),
    }
)
@websocket_api.async_response
async def ws_alarm_shelve(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Shelve an alarm."""
    manager = _get_manager(hass)
    await manager.async_shelve(
        msg["alarm_id"],
        duration_minutes=msg["duration"],
        user=connection.user.id if connection.user else None,
    )
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/alarm/unshelve",
        vol.Required("alarm_id"): str,
    }
)
@websocket_api.async_response
async def ws_alarm_unshelve(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Unshelve an alarm."""
    manager = _get_manager(hass)
    await manager.async_unshelve(
        msg["alarm_id"],
        user=connection.user.id if connection.user else None,
    )
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/alarm/reset",
        vol.Required("alarm_id"): str,
    }
)
@websocket_api.async_response
async def ws_alarm_reset(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Reset a latched alarm."""
    manager = _get_manager(hass)
    await manager.async_reset(
        msg["alarm_id"],
        user=connection.user.id if connection.user else None,
    )
    connection.send_result(msg["id"], {"success": True})


# --- External Trigger/Clear ---


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/alarm/trigger",
        vol.Required("alarm_id"): str,
        vol.Optional("message"): str,
    }
)
@websocket_api.async_response
async def ws_alarm_trigger(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Externally trigger an alarm."""
    manager = _get_manager(hass)
    await manager.async_trigger_external(
        msg["alarm_id"],
        message=msg.get("message"),
        user=connection.user.id if connection.user else None,
    )
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/alarm/clear",
        vol.Required("alarm_id"): str,
    }
)
@websocket_api.async_response
async def ws_alarm_clear(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Externally clear an alarm."""
    manager = _get_manager(hass)
    await manager.async_clear_external(
        msg["alarm_id"],
        user=connection.user.id if connection.user else None,
    )
    connection.send_result(msg["id"], {"success": True})


# --- Channel CRUD ---


@websocket_api.websocket_command(
    {vol.Required("type"): "scada_alarm_manager/channel/list"}
)
@websocket_api.async_response
async def ws_channel_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all channels."""
    manager = _get_manager(hass)
    channels = [c.to_dict() for c in manager.channels.values()]
    connection.send_result(msg["id"], {"channels": channels})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/channel/get",
        vol.Required("channel_id"): str,
    }
)
@websocket_api.async_response
async def ws_channel_get(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get a single channel by ID."""
    manager = _get_manager(hass)
    channel = manager.channels.get(msg["channel_id"])
    if channel is None:
        connection.send_error(msg["id"], "not_found", "Channel not found")
        return
    connection.send_result(msg["id"], channel.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/channel/create",
        vol.Required("name"): str,
        vol.Optional("notification_targets", default=[]): [str],
        vol.Optional("min_priority", default=0): vol.In([0, 1, 2, 3]),
        vol.Optional("persistent_notification", default=True): bool,
        vol.Optional("mobile_push", default=True): bool,
        vol.Optional("critical_notification", default=False): bool,
        vol.Optional("repeat_cadence"): vol.Any(int, None),
        vol.Optional("escalation_target"): vol.Any(str, None),
    }
)
@websocket_api.async_response
async def ws_channel_create(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a new channel."""
    manager = _get_manager(hass)
    channel = AlarmChannel(
        name=msg["name"],
        notification_targets=msg.get("notification_targets", []),
        min_priority=AlarmPriority(msg.get("min_priority", 0)),
        persistent_notification=msg.get("persistent_notification", True),
        mobile_push=msg.get("mobile_push", True),
        critical_notification=msg.get("critical_notification", False),
        repeat_cadence=msg.get("repeat_cadence"),
        escalation_target=msg.get("escalation_target"),
    )
    channel = await manager.async_create_channel(channel)
    connection.send_result(msg["id"], channel.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/channel/update",
        vol.Required("channel_id"): str,
        vol.Optional("name"): str,
        vol.Optional("notification_targets"): [str],
        vol.Optional("min_priority"): vol.In([0, 1, 2, 3]),
        vol.Optional("persistent_notification"): bool,
        vol.Optional("mobile_push"): bool,
        vol.Optional("critical_notification"): bool,
        vol.Optional("repeat_cadence"): vol.Any(int, None),
        vol.Optional("escalation_target"): vol.Any(str, None),
    }
)
@websocket_api.async_response
async def ws_channel_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update an existing channel."""
    manager = _get_manager(hass)
    channel = manager.channels.get(msg["channel_id"])
    if channel is None:
        connection.send_error(msg["id"], "not_found", "Channel not found")
        return

    for field in (
        "name", "notification_targets", "persistent_notification",
        "mobile_push", "critical_notification", "repeat_cadence",
        "escalation_target",
    ):
        if field in msg:
            setattr(channel, field, msg[field])

    if "min_priority" in msg:
        channel.min_priority = AlarmPriority(msg["min_priority"])

    channel = await manager.async_update_channel(channel)
    connection.send_result(msg["id"], channel.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/channel/delete",
        vol.Required("channel_id"): str,
    }
)
@websocket_api.async_response
async def ws_channel_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a channel."""
    manager = _get_manager(hass)
    await manager.async_delete_channel(msg["channel_id"])
    connection.send_result(msg["id"], {"success": True})


# --- Event History ---


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scada_alarm_manager/event/list",
        vol.Optional("alarm_id"): str,
        vol.Optional("event_type"): str,
        vol.Optional("start"): str,
        vol.Optional("end"): str,
        vol.Optional("limit", default=50): vol.All(vol.Coerce(int), vol.Range(min=1, max=500)),
        vol.Optional("offset", default=0): vol.All(vol.Coerce(int), vol.Range(min=0)),
    }
)
@websocket_api.async_response
async def ws_event_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Query alarm event history."""
    manager = _get_manager(hass)

    event_type = AlarmEventType(msg["event_type"]) if "event_type" in msg else None
    start = datetime.fromisoformat(msg["start"]) if "start" in msg else None
    end = datetime.fromisoformat(msg["end"]) if "end" in msg else None

    events = await manager._database.async_get_events(
        alarm_id=msg.get("alarm_id"),
        event_type=event_type,
        start=start,
        end=end,
        limit=msg.get("limit", 50),
        offset=msg.get("offset", 0),
    )

    # Enrich events with alarm names
    event_dicts = []
    for event in events:
        d = event.to_dict()
        alarm = manager.alarms.get(event.alarm_id)
        d["alarm_name"] = alarm.name if alarm else "Deleted alarm"
        event_dicts.append(d)

    connection.send_result(msg["id"], {"events": event_dicts})


# --- Subscription ---


@websocket_api.websocket_command(
    {vol.Required("type"): "scada_alarm_manager/subscribe"}
)
@websocket_api.async_response
async def ws_subscribe(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Subscribe to real-time alarm state changes."""

    @callback
    def forward_event(event: Any) -> None:
        """Forward alarm state change events to WS client."""
        connection.send_message(
            websocket_api.event_message(msg["id"], event.data)
        )

    unsub = hass.bus.async_listen(EVENT_ALARM_STATE_CHANGED, forward_event)
    connection.subscriptions[msg["id"]] = unsub
    connection.send_result(msg["id"])
