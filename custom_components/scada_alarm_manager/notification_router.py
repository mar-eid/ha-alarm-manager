"""Notification router for SCADA Alarm Manager.

Routes alarm notifications through channels to the correct targets.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.template import Template

from .const import (
    DOMAIN,
    NOTIFICATION_ACTION_ACK,
    NOTIFICATION_ACTION_CUSTOM,
    NOTIFICATION_ACTION_SHELVE,
    AlarmPriority,
)

DEFAULT_PAGE_URL = "/scada-alarm-manager"
from .models import AlarmChannel, AlarmDefinition, AlarmRuntimeState

_LOGGER = logging.getLogger(__name__)

_PRIORITY_ICONS: dict[AlarmPriority, str] = {
    AlarmPriority.INFO: "\u2139\ufe0f",
    AlarmPriority.WARNING: "\U0001f7e1",
    AlarmPriority.HIGH: "\U0001f534",
    AlarmPriority.CRITICAL: "\U0001f6a8",
}


class NotificationRouter:
    """Routes alarm notifications through channels."""

    def __init__(self, hass: HomeAssistant, manager: Any) -> None:
        self._hass = hass
        self._manager = manager
        self.maintenance_mode = False

    async def async_send_alarm_notification(
        self,
        alarm: AlarmDefinition,
        runtime: AlarmRuntimeState,
        is_repeat: bool = False,
    ) -> None:
        """Send notifications for an alarm activation.

        Priority-aware routing:
        - INFO: No notifications (panel + history only)
        - WARNING+: Persistent notification in HA UI
        - HIGH+: Persistent + mobile push (if channel has targets)
        - CRITICAL: Persistent + mobile push with critical alert (bypasses DND)

        Channel config can further restrict (via min_priority) but cannot
        lower the floor set by alarm priority.

        When ``is_repeat`` is True the notification is a reminder for an alarm
        still active and unacknowledged; the title is prefixed with a reminder
        marker so it is distinguishable from the initial notification.
        """
        # Maintenance mode — suppress all notifications
        if self.maintenance_mode:
            _LOGGER.debug("Maintenance mode active, suppressing notification for %s", alarm.name)
            return

        # Info alarms never generate notifications — panel and history only
        if alarm.priority == AlarmPriority.INFO:
            _LOGGER.debug("Info alarm %s — no notification (panel only)", alarm.name)
            return

        channel = self._get_channel(alarm)

        # Check channel priority filter
        if channel and alarm.priority < channel.min_priority:
            _LOGGER.debug(
                "Alarm %s priority %s below channel minimum %s, skipping",
                alarm.name,
                alarm.priority.name,
                channel.min_priority.name,
            )
            return

        title = self._render_title(alarm, runtime)
        if is_repeat:
            # Reminder marker (repeat emoji) so a re-notification reads
            # differently from the initial alarm, even with a custom template.
            title = f"\U0001f501 {title}"
        message = self._render_message(alarm, runtime)

        # Persistent notification: WARNING and above, or if channel opts in
        if alarm.priority >= AlarmPriority.WARNING or (channel and channel.persistent_notification):
            await self._async_send_persistent(alarm, title, message)

        # Mobile push: if channel has targets and mobile_push enabled
        if channel and channel.notification_targets and channel.mobile_push:
            await self._async_send_mobile(alarm, channel, title, message)

        # Update last notification timestamp
        runtime.last_notification_at = datetime.now(timezone.utc)

    async def async_dismiss_alarm_notification(
        self, alarm: AlarmDefinition
    ) -> None:
        """Dismiss all notifications for an alarm (persistent + mobile push).

        Called whenever an alarm is acknowledged or returns to normal, so any
        ack path clears every notification it raised. Clearing the mobile push
        uses the Companion App ``clear_notification`` command matched by the same
        ``tag`` the original push was sent with.
        """
        notification_id = f"scada_alarm_{alarm.id}"
        await self._hass.services.async_call(
            "persistent_notification",
            "dismiss",
            {"notification_id": notification_id},
        )

        # Clear the mobile push on each of the channel's targets, if any.
        channel = self._get_channel(alarm)
        if not channel or not channel.notification_targets:
            return
        tag = f"scada-alarm-{alarm.id}"
        for entry in channel.notification_targets:
            target = entry.get("target", "") if isinstance(entry, dict) else entry
            if not target:
                continue
            domain, service = self._split_target(target)
            try:
                await self._hass.services.async_call(
                    domain,
                    service,
                    {"message": "clear_notification", "data": {"tag": tag}},
                )
            except Exception:
                _LOGGER.warning(
                    "Failed to clear mobile notification on %s for alarm %s",
                    target,
                    alarm.name,
                )

    async def async_send_test_notification(
        self, channel: AlarmChannel
    ) -> None:
        """Send a test notification through a channel."""
        title = "[Test] SCADA Alarm Manager"
        message = f"Test notification through channel: {channel.name}"

        if channel.persistent_notification:
            await self._hass.services.async_call(
                "persistent_notification",
                "create",
                {
                    "notification_id": f"scada_test_{channel.id}",
                    "title": title,
                    "message": message,
                },
            )

        if channel.mobile_push and channel.notification_targets:
            for entry in channel.notification_targets:
                target = entry.get("target", "") if isinstance(entry, dict) else entry
                if not target:
                    continue
                domain, service = self._split_target(target)
                try:
                    await self._hass.services.async_call(
                        domain,
                        service,
                        {"title": title, "message": message},
                    )
                except Exception:
                    _LOGGER.warning("Failed to send test to target: %s", target)

    @staticmethod
    def _split_target(raw: str) -> tuple[str, str]:
        """Split a stored notify target into (domain, service).

        The frontend's notify picker stores ids like ``notify.mobile_app_phone``;
        older configs may store the bare service name ``mobile_app_phone``.
        ``hass.services.async_call`` needs the domain and service separately, so
        a prefixed id must not be passed through as the service name (doing so
        invokes the non-existent ``notify.notify.mobile_app_phone``).
        """
        if "." in raw:
            domain, service = raw.split(".", 1)
            return domain, service
        return "notify", raw

    def _get_channel(self, alarm: AlarmDefinition) -> AlarmChannel | None:
        """Get the alarm's channel."""
        if alarm.channel_id is None:
            return None
        return self._manager.channels.get(alarm.channel_id)

    def _page_url(self, alarm: AlarmDefinition) -> str:
        """Resolve the in-app link target for an alarm's notifications (F10).

        Returns the configured dashboard path (normalised to a leading slash) or
        the Alarm Center panel when none is set.
        """
        if alarm.link_page_path:
            base = "/" + alarm.link_page_path.lstrip("/")
            if alarm.link_view_path:
                return f"{base}/{alarm.link_view_path.lstrip('/')}"
            return base
        return DEFAULT_PAGE_URL

    def _get_template_context(
        self, alarm: AlarmDefinition, runtime: AlarmRuntimeState
    ) -> dict[str, Any]:
        """Build template context for Jinja2 rendering."""
        entity_state = self._hass.states.get(alarm.source_entity_id)
        return {
            "name": alarm.name,
            "description": alarm.description,
            "priority": alarm.priority.name.capitalize(),
            "area": alarm.area,
            "equipment": alarm.equipment,
            "tag": alarm.tag,
            "source_entity_id": alarm.source_entity_id,
            "value": runtime.last_value or "",
            "state_name": entity_state.state if entity_state else "",
            "unit": entity_state.attributes.get("unit_of_measurement", "") if entity_state else "",
            "friendly_name": entity_state.attributes.get("friendly_name", alarm.source_entity_id) if entity_state else alarm.source_entity_id,
            "trigger_type": alarm.trigger_type.value,
            "threshold": alarm.trigger_config.get("threshold", ""),
            "operator": alarm.trigger_config.get("operator", ""),
        }

    def _render_template(self, template_str: str, context: dict[str, Any]) -> str:
        """Render a Jinja2 template string with context."""
        try:
            tpl = Template(template_str, self._hass)
            tpl.hass = self._hass
            return tpl.async_render(context)
        except Exception:
            _LOGGER.warning("Failed to render template: %s", template_str)
            return template_str

    def _render_title(
        self, alarm: AlarmDefinition, runtime: AlarmRuntimeState
    ) -> str:
        """Render notification title."""
        if alarm.notification_title_template:
            ctx = self._get_template_context(alarm, runtime)
            return self._render_template(alarm.notification_title_template, ctx)
        icon = _PRIORITY_ICONS.get(alarm.priority, "")
        return f"{icon} {alarm.name}"

    def _render_message(
        self, alarm: AlarmDefinition, runtime: AlarmRuntimeState
    ) -> str:
        """Render notification message body."""
        if alarm.notification_text_template:
            ctx = self._get_template_context(alarm, runtime)
            return self._render_template(alarm.notification_text_template, ctx)
        # Default format
        parts = []
        if alarm.description:
            parts.append(alarm.description)
        parts.append(f"Source: {alarm.source_entity_id}")
        if runtime.last_value is not None:
            entity_state = self._hass.states.get(alarm.source_entity_id)
            unit = entity_state.attributes.get("unit_of_measurement", "") if entity_state else ""
            parts.append(f"Value: {runtime.last_value}{' ' + unit if unit else ''}")
        if alarm.area:
            parts.append(f"Area: {alarm.area}")
        if alarm.equipment:
            parts.append(f"Equipment: {alarm.equipment}")
        return "\n".join(parts)

    async def _async_send_persistent(
        self, alarm: AlarmDefinition, title: str, message: str
    ) -> None:
        """Send a persistent notification."""
        notification_id = f"scada_alarm_{alarm.id}"
        # Append an in-app link (F10); persistent notifications render markdown.
        message = f"{message}\n\n[Open]({self._page_url(alarm)})"
        await self._hass.services.async_call(
            "persistent_notification",
            "create",
            {
                "notification_id": notification_id,
                "title": title,
                "message": message,
            },
        )

    async def _async_send_mobile(
        self,
        alarm: AlarmDefinition,
        channel: AlarmChannel,
        title: str,
        message: str,
    ) -> None:
        """Send mobile push notifications with actionable buttons."""
        actions: list[dict[str, Any]] = [
            {
                "action": f"{NOTIFICATION_ACTION_ACK}{alarm.id}",
                "title": "Acknowledge",
            },
            {
                "action": f"{NOTIFICATION_ACTION_SHELVE}{alarm.id}",
                "title": "Shelve 15m",
            },
        ]
        # Optional per-alarm action button (F9): runs a configured HA service on tap.
        if alarm.action_label and alarm.action_service:
            actions.append(
                {
                    "action": f"{NOTIFICATION_ACTION_CUSTOM}{alarm.id}",
                    "title": alarm.action_label,
                }
            )

        action_data: dict[str, Any] = {
            "actions": actions,
            # Tapping the notification opens the configured page (F10), else the panel.
            "url": self._page_url(alarm),
            "group": "scada-alarms",
            "tag": f"scada-alarm-{alarm.id}",
        }

        # Critical notification handling
        if channel.critical_notification and alarm.priority == AlarmPriority.CRITICAL:
            # iOS critical notification
            action_data["push"] = {
                "sound": {"critical": 1, "volume": 1.0, "name": "default"}
            }
            # Android high priority
            action_data["priority"] = "high"
            action_data["ttl"] = 0
            action_data["channel"] = "alarm"

        for entry in channel.notification_targets:
            # Support both formats: plain string or {"target": str, "min_priority": int}
            if isinstance(entry, dict):
                target = entry.get("target", "")
                target_min = entry.get("min_priority", channel.min_priority.value)
                if alarm.priority.value < target_min:
                    continue
            else:
                target = entry

            if not target:
                continue

            domain, service = self._split_target(target)
            try:
                await self._hass.services.async_call(
                    domain,
                    service,
                    {
                        "title": title,
                        "message": message,
                        "data": action_data,
                    },
                )
            except Exception:
                _LOGGER.warning(
                    "Failed to send notification to %s for alarm %s",
                    target,
                    alarm.name,
                )
