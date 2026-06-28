"""Tests for F9 (notification action button) and F10 (notification page link)."""

from __future__ import annotations

import tempfile
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from homeassistant.core import HomeAssistant

from custom_components.scada_alarm_manager.alarm_manager import AlarmManager
from custom_components.scada_alarm_manager.const import AlarmPriority, AlarmState, TriggerType
from custom_components.scada_alarm_manager.database import AlarmDatabase
from custom_components.scada_alarm_manager.models import (
    AlarmChannel,
    AlarmDefinition,
    AlarmRuntimeState,
)
from custom_components.scada_alarm_manager.notification_router import NotificationRouter


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _alarm(**kwargs) -> AlarmDefinition:
    base = dict(
        id="a1",
        name="Door",
        priority=AlarmPriority.HIGH,
        source_entity_id="binary_sensor.door",
        trigger_type=TriggerType.DIGITAL,
        trigger_config={"target_state": "on"},
        channel_id="ch1",
    )
    base.update(kwargs)
    return AlarmDefinition(**base)


def _channel() -> AlarmChannel:
    return AlarmChannel(
        id="ch1",
        name="Security",
        notification_targets=["mobile_app_phone"],
        min_priority=AlarmPriority.INFO,
        persistent_notification=True,
        mobile_push=True,
    )


def _router_with(alarm):
    manager = MagicMock()
    manager.channels = {"ch1": _channel()}
    return manager


async def _capture_send(hass, router, alarm):
    runtime = AlarmRuntimeState(alarm_id=alarm.id, state=AlarmState.ACTIVE_UNACKED, last_value="on")
    calls: list = []

    async def fake_call(domain, service, data=None, **kwargs):
        calls.append((domain, service, data))

    with patch.object(hass.services, "async_call", side_effect=fake_call):
        await router.async_send_alarm_notification(alarm, runtime)
    return calls


class TestF9NotificationAction:
    async def test_custom_action_present_when_configured(self, hass: HomeAssistant):
        alarm = _alarm(action_label="Open", action_service="lock.unlock", action_entity="lock.front")
        router = NotificationRouter(hass, _router_with(alarm))
        calls = await _capture_send(hass, router, alarm)

        notify = [c for c in calls if c[0] == "notify"]
        assert notify, "no mobile push sent"
        actions = notify[0][2]["data"]["actions"]
        custom = [a for a in actions if a["action"].startswith("SCADA_CUSTOM_")]
        assert custom and custom[0]["title"] == "Open"

    async def test_no_custom_action_when_unconfigured(self, hass: HomeAssistant):
        alarm = _alarm()  # no action fields
        router = NotificationRouter(hass, _router_with(alarm))
        calls = await _capture_send(hass, router, alarm)

        notify = [c for c in calls if c[0] == "notify"]
        actions = notify[0][2]["data"]["actions"]
        assert not any(a["action"].startswith("SCADA_CUSTOM_") for a in actions)
        # ACK + SHELVE still present
        assert len(actions) == 2

    async def test_manager_runs_custom_action(self, hass: HomeAssistant, mock_database, mock_store):
        manager = AlarmManager(hass, mock_database, mock_store)
        manager._alarms["a1"] = _alarm(action_service="lock.unlock", action_entity="lock.front")
        calls: list = []

        async def fake_call(domain, service, data=None, **kwargs):
            calls.append((domain, service, data))

        with patch.object(hass.services, "async_call", side_effect=fake_call):
            await manager.async_trigger_custom_action("a1")

        assert ("lock", "unlock", {"entity_id": "lock.front"}) in calls

    async def test_manager_custom_action_noop_when_unconfigured(
        self, hass: HomeAssistant, mock_database, mock_store
    ):
        manager = AlarmManager(hass, mock_database, mock_store)
        manager._alarms["a1"] = _alarm()  # no action_service
        called = False

        async def fake_call(domain, service, data=None, **kwargs):
            nonlocal called
            called = True

        with patch.object(hass.services, "async_call", side_effect=fake_call):
            await manager.async_trigger_custom_action("a1")
            await manager.async_trigger_custom_action("missing")

        assert called is False


class TestF10PageLink:
    async def test_persistent_message_links_to_configured_page(self, hass: HomeAssistant):
        alarm = _alarm(link_page_path="lovelace-alarms")
        router = NotificationRouter(hass, _router_with(alarm))
        calls = await _capture_send(hass, router, alarm)

        persistent = [c for c in calls if c[0] == "persistent_notification" and c[1] == "create"]
        assert persistent
        assert "[Open](/lovelace-alarms)" in persistent[0][2]["message"]

    async def test_persistent_message_defaults_to_panel(self, hass: HomeAssistant):
        alarm = _alarm()  # no link_page_path
        router = NotificationRouter(hass, _router_with(alarm))
        calls = await _capture_send(hass, router, alarm)

        persistent = [c for c in calls if c[0] == "persistent_notification" and c[1] == "create"]
        assert "[Open](/scada-alarm-manager)" in persistent[0][2]["message"]

    async def test_push_url_points_to_configured_page(self, hass: HomeAssistant):
        alarm = _alarm(link_page_path="/lovelace-alarms")  # leading slash normalised
        router = NotificationRouter(hass, _router_with(alarm))
        calls = await _capture_send(hass, router, alarm)

        notify = [c for c in calls if c[0] == "notify"]
        assert notify[0][2]["data"]["url"] == "/lovelace-alarms"


class TestNewFieldsPersist:
    async def test_roundtrip_action_and_link_fields(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db = AlarmDatabase(Path(tmpdir) / "t.db")
            await db.async_init()
            await db.async_create_alarm(
                _alarm(
                    action_label="Open",
                    action_service="lock.unlock",
                    action_entity="lock.front",
                    link_page_path="lovelace-alarms",
                )
            )
            got = await db.async_get_alarm("a1")
            assert got is not None
            assert got.action_label == "Open"
            assert got.action_service == "lock.unlock"
            assert got.action_entity == "lock.front"
            assert got.link_page_path == "lovelace-alarms"
            await db.async_close()
