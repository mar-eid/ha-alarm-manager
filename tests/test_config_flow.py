"""Tests for the config flow."""

from __future__ import annotations

from unittest.mock import patch

import pytest

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.scada_alarm_manager.const import DOMAIN


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for testing."""
    yield


class TestConfigFlow:
    @pytest.mark.asyncio
    async def test_user_step_creates_entry(self, hass: HomeAssistant):
        """Test that the user step creates a config entry."""
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        assert result["type"] == FlowResultType.FORM
        assert result["step_id"] == "user"

        with patch(
            "custom_components.scada_alarm_manager.async_setup_entry",
            return_value=True,
        ):
            result = await hass.config_entries.flow.async_configure(
                result["flow_id"], {}
            )

        assert result["type"] == FlowResultType.CREATE_ENTRY
        assert result["title"] == "SCADA Alarm Manager"

    @pytest.mark.asyncio
    async def test_singleton_enforcement(self, hass: HomeAssistant):
        """Test that only one config entry is allowed."""
        # Create first entry
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

        # Try creating second entry - should abort
        result2 = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        assert result2["type"] == FlowResultType.ABORT
        assert result2["reason"] == "already_configured"
