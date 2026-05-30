"""Config flow for SCADA Alarm Manager."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, OptionsFlow
from homeassistant.core import callback

from .const import (
    DEFAULT_HISTORY_RETENTION_DAYS,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_SHELVE_DURATION,
    DOMAIN,
)

if TYPE_CHECKING:
    from homeassistant.data_entry_flow import FlowResult


class ScadaAlarmManagerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle config flow for SCADA Alarm Manager."""

    VERSION = 1
    MINOR_VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Handle the initial step."""
        # Singleton: only one instance allowed
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(
                title="SCADA Alarm Manager",
                data={},
            )

        return self.async_show_form(step_id="user")

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Return options flow handler."""
        return ScadaAlarmManagerOptionsFlow(config_entry)


class ScadaAlarmManagerOptionsFlow(OptionsFlow):
    """Handle options flow for SCADA Alarm Manager."""

    def __init__(self, config_entry: ConfigEntry) -> None:
        """Initialize options flow."""
        self._config_entry = config_entry

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Manage options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        options = self._config_entry.options
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        "default_shelve_duration",
                        default=options.get(
                            "default_shelve_duration",
                            DEFAULT_SHELVE_DURATION,
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=10080)),
                    vol.Optional(
                        "history_retention_days",
                        default=options.get(
                            "history_retention_days",
                            DEFAULT_HISTORY_RETENTION_DAYS,
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=365)),
                    vol.Optional(
                        "scan_interval",
                        default=options.get(
                            "scan_interval",
                            DEFAULT_SCAN_INTERVAL,
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=10, max=300)),
                }
            ),
        )
