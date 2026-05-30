"""Tests for the config flow."""

from __future__ import annotations

import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.scada_alarm_manager.const import (
    DEFAULT_HISTORY_RETENTION_DAYS,
    DOMAIN,
)

# These tests require the full HA test harness (real config entries flow).
# On Windows (no fcntl), they run with mocked internals at the unit level.
_HA_PLUGIN_AVAILABLE = "pytest_homeassistant_custom_component" in sys.modules


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for testing."""
    yield


class TestConfigFlowUnit:
    """Unit tests for the config flow class directly."""

    async def test_config_flow_step_user_shows_form(self):
        """Test that async_step_user shows form when no input."""
        from custom_components.scada_alarm_manager.config_flow import (
            ScadaAlarmManagerConfigFlow,
        )

        flow = ScadaAlarmManagerConfigFlow()
        flow.hass = MagicMock()
        flow.async_set_unique_id = AsyncMock()
        flow._abort_if_unique_id_configured = MagicMock()
        flow.async_show_form = MagicMock(return_value={"type": "form", "step_id": "user"})

        result = await flow.async_step_user(user_input=None)

        flow.async_set_unique_id.assert_awaited_once_with(DOMAIN)
        flow._abort_if_unique_id_configured.assert_called_once()
        assert result["type"] == "form"
        assert result["step_id"] == "user"

    async def test_config_flow_step_user_creates_entry(self):
        """Test that async_step_user creates entry with input."""
        from custom_components.scada_alarm_manager.config_flow import (
            ScadaAlarmManagerConfigFlow,
        )

        flow = ScadaAlarmManagerConfigFlow()
        flow.hass = MagicMock()
        flow.async_set_unique_id = AsyncMock()
        flow._abort_if_unique_id_configured = MagicMock()
        flow.async_create_entry = MagicMock(
            return_value={"type": "create_entry", "title": "SCADA Alarm Manager"}
        )

        result = await flow.async_step_user(user_input={})

        flow.async_create_entry.assert_called_once_with(
            title="SCADA Alarm Manager",
            data={},
        )
        assert result["type"] == "create_entry"

    async def test_options_flow_shows_form(self):
        """Test that options flow shows form with defaults."""
        from custom_components.scada_alarm_manager.config_flow import (
            ScadaAlarmManagerOptionsFlow,
        )

        config_entry = MagicMock()
        config_entry.options = {}

        flow = ScadaAlarmManagerOptionsFlow(config_entry)
        flow.async_show_form = MagicMock(return_value={"type": "form", "step_id": "init"})

        result = await flow.async_step_init(user_input=None)

        flow.async_show_form.assert_called_once()
        assert result["type"] == "form"

    async def test_options_flow_saves_options(self):
        """Test that options flow saves user input."""
        from custom_components.scada_alarm_manager.config_flow import (
            ScadaAlarmManagerOptionsFlow,
        )

        config_entry = MagicMock()
        config_entry.options = {}

        flow = ScadaAlarmManagerOptionsFlow(config_entry)
        flow.async_create_entry = MagicMock(
            return_value={"type": "create_entry", "data": {"history_retention_days": 30}}
        )

        result = await flow.async_step_init(
            user_input={"history_retention_days": 30}
        )

        flow.async_create_entry.assert_called_once_with(
            title="", data={"history_retention_days": 30}
        )

    def test_config_flow_has_version(self):
        """Test config flow has correct version."""
        from custom_components.scada_alarm_manager.config_flow import (
            ScadaAlarmManagerConfigFlow,
        )

        assert ScadaAlarmManagerConfigFlow.VERSION == 1
        assert ScadaAlarmManagerConfigFlow.MINOR_VERSION == 1

    def test_options_flow_factory(self):
        """Test async_get_options_flow returns options flow handler."""
        from custom_components.scada_alarm_manager.config_flow import (
            ScadaAlarmManagerConfigFlow,
            ScadaAlarmManagerOptionsFlow,
        )

        config_entry = MagicMock()
        result = ScadaAlarmManagerConfigFlow.async_get_options_flow(config_entry)

        assert isinstance(result, ScadaAlarmManagerOptionsFlow)


# Integration tests that require the full HA harness (skipped on Windows)
@pytest.mark.skipif(
    not _HA_PLUGIN_AVAILABLE,
    reason="Requires pytest-homeassistant-custom-component (not available on Windows)",
)
class TestConfigFlowIntegration:
    async def test_user_step_creates_entry(self, hass):
        """Test that the user step creates a config entry via HA flow."""
        from homeassistant import config_entries
        from homeassistant.data_entry_flow import FlowResultType

        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        assert result["type"] == FlowResultType.FORM

        with patch(
            "custom_components.scada_alarm_manager.async_setup_entry",
            return_value=True,
        ):
            result = await hass.config_entries.flow.async_configure(
                result["flow_id"], {}
            )

        assert result["type"] == FlowResultType.CREATE_ENTRY
        assert result["title"] == "SCADA Alarm Manager"

    async def test_singleton_enforcement(self, hass):
        """Test that only one config entry is allowed."""
        from homeassistant import config_entries
        from homeassistant.data_entry_flow import FlowResultType

        with patch(
            "custom_components.scada_alarm_manager.async_setup_entry",
            return_value=True,
        ):
            result = await hass.config_entries.flow.async_init(
                DOMAIN, context={"source": config_entries.SOURCE_USER}
            )
            result = await hass.config_entries.flow.async_configure(
                result["flow_id"], {}
            )
            assert result["type"] == FlowResultType.CREATE_ENTRY

        result2 = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        assert result2["type"] == FlowResultType.ABORT
        assert result2["reason"] == "already_configured"
