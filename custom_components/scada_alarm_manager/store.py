"""HA .storage backup for alarm definitions and channels."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN
from .models import AlarmChannel, AlarmDefinition

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
STORAGE_KEY = DOMAIN


class AlarmStore:
    """Manages .storage backup of alarm definitions and channels."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, STORAGE_KEY
        )

    async def async_load(
        self,
    ) -> tuple[list[AlarmDefinition], list[AlarmChannel]]:
        """Load alarm definitions and channels from storage."""
        data = await self._store.async_load()
        if data is None:
            return [], []

        alarms = [
            AlarmDefinition.from_dict(a) for a in data.get("alarms", [])
        ]
        channels = [
            AlarmChannel.from_dict(c) for c in data.get("channels", [])
        ]
        return alarms, channels

    async def async_save(
        self,
        alarms: list[AlarmDefinition],
        channels: list[AlarmChannel],
    ) -> None:
        """Save alarm definitions and channels to storage."""
        data = {
            "alarms": [a.to_dict() for a in alarms],
            "channels": [c.to_dict() for c in channels],
        }
        await self._store.async_save(data)

    async def async_remove(self) -> None:
        """Remove stored data."""
        await self._store.async_remove()
