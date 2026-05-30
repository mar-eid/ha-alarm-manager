"""Config flow for SCADA Alarm Manager."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, OptionsFlow
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult

from .const import (
    DEFAULT_ESCALATION_DELAY,
    DEFAULT_HISTORY_RETENTION_DAYS,
    DEFAULT_REPEAT_INTERVAL,
    DOMAIN,
)


class ScadaAlarmManagerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle config flow for SCADA Alarm Manager."""

    VERSION = 1
    MINOR_VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
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
        self._config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        options = self._config_entry.options
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        "default_repeat_interval",
                        default=options.get(
                            "default_repeat_interval",
                            DEFAULT_REPEAT_INTERVAL // 60,
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=1440)),
                    vol.Optional(
                        "default_escalation_delay",
                        default=options.get(
                            "default_escalation_delay",
                            DEFAULT_ESCALATION_DELAY // 60,
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=1440)),
                    vol.Optional(
                        "history_retention_days",
                        default=options.get(
                            "history_retention_days",
                            DEFAULT_HISTORY_RETENTION_DAYS,
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=3650)),
                }
            ),
        )
