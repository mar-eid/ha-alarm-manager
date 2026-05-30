"""Notification router for SCADA Alarm Manager.

Routes alarm notifications through channels to the correct targets.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from homeassistant.core import HomeAssistant

from .const import (
    DOMAIN,
    NOTIFICATION_ACTION_ACK,
    NOTIFICATION_ACTION_SHELVE,
    AlarmPriority,
)
from .models import AlarmChannel, AlarmDefinition, AlarmRuntimeState

_LOGGER = logging.getLogger(__name__)


class NotificationRouter:
    """Routes alarm notifications through channels."""

    def __init__(self, hass: HomeAssistant, manager: Any) -> None:
        self._hass = hass
        self._manager = manager

    async def async_send_alarm_notification(
        self,
        alarm: AlarmDefinition,
        runtime: AlarmRuntimeState,
    ) -> None:
        """Send notifications for an alarm activation."""
        channel = self._get_channel(alarm)

        # Check priority filter
        if channel and alarm.priority < channel.min_priority:
            _LOGGER.debug(
                "Alarm %s priority %s below channel minimum %s, skipping",
                alarm.name,
                alarm.priority.name,
                channel.min_priority.name,
            )
            return

        priority_label = alarm.priority.name.capitalize()
        title = f"[{priority_label}] {alarm.name}"
        message = self._build_message(alarm, runtime)

        # Persistent notification
        if channel is None or channel.persistent_notification:
            await self._async_send_persistent(alarm, title, message)

        # Mobile push notifications
        if channel and channel.mobile_push and channel.notification_targets:
            await self._async_send_mobile(alarm, channel, title, message)

        # Update last notification timestamp
        runtime.last_notification_at = datetime.now(timezone.utc)

    async def async_dismiss_alarm_notification(
        self, alarm: AlarmDefinition
    ) -> None:
        """Dismiss notifications for a cleared alarm."""
        notification_id = f"scada_alarm_{alarm.id}"
        await self._hass.services.async_call(
            "persistent_notification",
            "dismiss",
            {"notification_id": notification_id},
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
            for target in channel.notification_targets:
                try:
                    await self._hass.services.async_call(
                        "notify",
                        target,
                        {"title": title, "message": message},
                    )
                except Exception:
                    _LOGGER.warning("Failed to send test to target: %s", target)

    def _get_channel(self, alarm: AlarmDefinition) -> AlarmChannel | None:
        """Get the alarm's channel."""
        if alarm.channel_id is None:
            return None
        return self._manager.channels.get(alarm.channel_id)

    def _build_message(
        self, alarm: AlarmDefinition, runtime: AlarmRuntimeState
    ) -> str:
        """Build notification message body."""
        parts = []
        if alarm.description:
            parts.append(alarm.description)

        parts.append(f"Source: {alarm.source_entity_id}")

        if runtime.last_value is not None:
            parts.append(f"Value: {runtime.last_value}")

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
        action_data: dict[str, Any] = {
            "actions": [
                {
                    "action": f"{NOTIFICATION_ACTION_ACK}{alarm.id}",
                    "title": "Acknowledge",
                },
                {
                    "action": f"{NOTIFICATION_ACTION_SHELVE}{alarm.id}",
                    "title": "Shelve 15m",
                },
            ],
            "url": "/scada-alarm-manager",
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

        for target in channel.notification_targets:
            try:
                await self._hass.services.async_call(
                    "notify",
                    target,
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
