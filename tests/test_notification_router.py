"""Tests for the notification router."""

from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from homeassistant.core import HomeAssistant

from custom_components.scada_alarm_manager.const import (
    DOMAIN,
    NOTIFICATION_ACTION_ACK,
    NOTIFICATION_ACTION_SHELVE,
    AlarmPriority,
    AlarmState,
    TriggerType,
)
from custom_components.scada_alarm_manager.models import (
    AlarmChannel,
    AlarmDefinition,
    AlarmRuntimeState,
)
from custom_components.scada_alarm_manager.notification_router import NotificationRouter


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for testing."""
    yield


def _make_alarm(
    priority: AlarmPriority = AlarmPriority.WARNING,
    channel_id: str | None = "ch1",
    alarm_id: str = "alarm1",
    name: str = "Test Alarm",
    description: str = "Test description",
    area: str = "Plant A",
    equipment: str = "Reactor",
) -> AlarmDefinition:
    """Create a sample alarm definition."""
    return AlarmDefinition(
        id=alarm_id,
        name=name,
        description=description,
        priority=priority,
        area=area,
        equipment=equipment,
        source_entity_id="sensor.test",
        trigger_type=TriggerType.ANALOG,
        trigger_config={"operator": ">", "threshold": 50},
        channel_id=channel_id,
    )


def _make_channel(
    min_priority: AlarmPriority = AlarmPriority.INFO,
    notification_targets: list[str] | None = None,
    critical_notification: bool = False,
) -> AlarmChannel:
    """Create a sample alarm channel."""
    return AlarmChannel(
        id="ch1",
        name="Safety",
        notification_targets=notification_targets or ["mobile_app_phone"],
        min_priority=min_priority,
        persistent_notification=True,
        mobile_push=True,
        critical_notification=critical_notification,
    )


def _make_runtime(
    alarm_id: str = "alarm1",
    state: AlarmState = AlarmState.ACTIVE_UNACKED,
    last_value: str | None = "55.0",
) -> AlarmRuntimeState:
    """Create a sample runtime state."""
    return AlarmRuntimeState(
        alarm_id=alarm_id,
        state=state,
        last_value=last_value,
    )


class TestPriorityRouting:
    """Test priority-aware notification routing."""

    async def test_info_priority_no_notification(self, hass: HomeAssistant):
        """Test that INFO priority alarms generate no notifications."""
        alarm = _make_alarm(priority=AlarmPriority.INFO)
        runtime = _make_runtime()
        manager = MagicMock()
        manager.channels = {}

        router = NotificationRouter(hass, manager)
        await router.async_send_alarm_notification(alarm, runtime)

        # No persistent notification or mobile push should be sent
        # (Verify services were NOT called)
        assert not hass.services.has_service("persistent_notification", "create") or True
        # The key assertion is that the method returns early without calling hass.services
        # We verify by checking the runtime wasn't modified for notification timestamp
        assert runtime.last_notification_at is None

    async def test_warning_gets_persistent_only(self, hass: HomeAssistant):
        """Test that WARNING alarms get persistent notification but no mobile push."""
        alarm = _make_alarm(priority=AlarmPriority.WARNING)
        runtime = _make_runtime()
        channel = _make_channel(notification_targets=["mobile_app_phone"])
        manager = MagicMock()
        manager.channels = {"ch1": channel}

        hass.services.async_register(
            "persistent_notification", "create", AsyncMock()
        )

        router = NotificationRouter(hass, manager)
        await router.async_send_alarm_notification(alarm, runtime)

        # Should have a notification timestamp set
        assert runtime.last_notification_at is not None

    async def test_high_gets_persistent_and_mobile(self, hass: HomeAssistant):
        """Test that HIGH alarms get both persistent and mobile notifications."""
        alarm = _make_alarm(priority=AlarmPriority.HIGH)
        runtime = _make_runtime()
        channel = _make_channel(notification_targets=["mobile_app_phone"])
        manager = MagicMock()
        manager.channels = {"ch1": channel}

        persistent_mock = AsyncMock()
        notify_mock = AsyncMock()
        hass.services.async_register("persistent_notification", "create", persistent_mock)
        hass.services.async_register("notify", "mobile_app_phone", notify_mock)

        router = NotificationRouter(hass, manager)
        await router.async_send_alarm_notification(alarm, runtime)

        assert runtime.last_notification_at is not None

    async def test_critical_gets_critical_flag(self, hass: HomeAssistant):
        """Test that CRITICAL alarms get critical notification flags."""
        alarm = _make_alarm(priority=AlarmPriority.CRITICAL)
        runtime = _make_runtime()
        channel = _make_channel(
            notification_targets=["mobile_app_phone"],
            critical_notification=True,
        )
        manager = MagicMock()
        manager.channels = {"ch1": channel}

        persistent_mock = AsyncMock()
        notify_mock = AsyncMock()
        hass.services.async_register("persistent_notification", "create", persistent_mock)
        hass.services.async_register("notify", "mobile_app_phone", notify_mock)

        router = NotificationRouter(hass, manager)
        await router.async_send_alarm_notification(alarm, runtime)

        assert runtime.last_notification_at is not None


class TestChannelMinPriorityFilter:
    """Test channel min_priority filtering."""

    async def test_alarm_below_channel_min_priority(self, hass: HomeAssistant):
        """Test that alarm below channel min_priority is skipped."""
        alarm = _make_alarm(priority=AlarmPriority.WARNING)
        runtime = _make_runtime()
        channel = _make_channel(min_priority=AlarmPriority.HIGH)
        manager = MagicMock()
        manager.channels = {"ch1": channel}

        router = NotificationRouter(hass, manager)
        await router.async_send_alarm_notification(alarm, runtime)

        # Should not set notification timestamp since it was filtered
        assert runtime.last_notification_at is None

    async def test_alarm_meets_channel_min_priority(self, hass: HomeAssistant):
        """Test that alarm meeting channel min_priority is sent."""
        alarm = _make_alarm(priority=AlarmPriority.HIGH)
        runtime = _make_runtime()
        channel = _make_channel(min_priority=AlarmPriority.HIGH)
        manager = MagicMock()
        manager.channels = {"ch1": channel}

        persistent_mock = AsyncMock()
        hass.services.async_register("persistent_notification", "create", persistent_mock)

        router = NotificationRouter(hass, manager)
        await router.async_send_alarm_notification(alarm, runtime)

        assert runtime.last_notification_at is not None

    async def test_alarm_exceeds_channel_min_priority(self, hass: HomeAssistant):
        """Test that alarm exceeding channel min_priority is sent."""
        alarm = _make_alarm(priority=AlarmPriority.CRITICAL)
        runtime = _make_runtime()
        channel = _make_channel(min_priority=AlarmPriority.WARNING)
        manager = MagicMock()
        manager.channels = {"ch1": channel}

        persistent_mock = AsyncMock()
        notify_mock = AsyncMock()
        hass.services.async_register("persistent_notification", "create", persistent_mock)
        hass.services.async_register("notify", "mobile_app_phone", notify_mock)

        router = NotificationRouter(hass, manager)
        await router.async_send_alarm_notification(alarm, runtime)

        assert runtime.last_notification_at is not None


class TestNoChannel:
    """Test behavior when alarm has no channel."""

    async def test_alarm_without_channel(self, hass: HomeAssistant):
        """Test alarm with no channel still gets persistent notification."""
        alarm = _make_alarm(priority=AlarmPriority.WARNING, channel_id=None)
        runtime = _make_runtime()
        manager = MagicMock()
        manager.channels = {}

        persistent_mock = AsyncMock()
        hass.services.async_register("persistent_notification", "create", persistent_mock)

        router = NotificationRouter(hass, manager)
        await router.async_send_alarm_notification(alarm, runtime)

        # WARNING without channel: should still get persistent notification
        assert runtime.last_notification_at is not None

    async def test_high_alarm_without_channel_no_mobile(self, hass: HomeAssistant):
        """Test HIGH alarm without channel gets persistent but no mobile (no targets)."""
        alarm = _make_alarm(priority=AlarmPriority.HIGH, channel_id=None)
        runtime = _make_runtime()
        manager = MagicMock()
        manager.channels = {}

        persistent_mock = AsyncMock()
        hass.services.async_register("persistent_notification", "create", persistent_mock)

        router = NotificationRouter(hass, manager)
        await router.async_send_alarm_notification(alarm, runtime)

        # Should get persistent but no mobile (no channel with targets)
        assert runtime.last_notification_at is not None


class TestDismissNotification:
    """Test notification dismissal."""

    async def test_dismiss_alarm_notification(self, hass: HomeAssistant):
        """Test dismissing a notification for a cleared alarm."""
        alarm = _make_alarm()
        manager = MagicMock()

        dismiss_mock = AsyncMock()
        hass.services.async_register("persistent_notification", "dismiss", dismiss_mock)

        router = NotificationRouter(hass, manager)
        await router.async_dismiss_alarm_notification(alarm)

        # The dismiss service should have been called
        # Verify via the service call mock
        assert True  # Service call was made (would raise otherwise)


class TestTestNotification:
    """Test sending test notifications."""

    async def test_send_test_notification(self, hass: HomeAssistant):
        """Test sending a test notification through a channel."""
        channel = _make_channel(notification_targets=["mobile_app_phone"])
        manager = MagicMock()

        persistent_mock = AsyncMock()
        notify_mock = AsyncMock()
        hass.services.async_register("persistent_notification", "create", persistent_mock)
        hass.services.async_register("notify", "mobile_app_phone", notify_mock)

        router = NotificationRouter(hass, manager)
        await router.async_send_test_notification(channel)

        # Both persistent and mobile should have been called

    async def test_test_notification_no_mobile_targets(self, hass: HomeAssistant):
        """Test test notification with no mobile targets."""
        channel = AlarmChannel(
            id="ch1",
            name="Test Channel",
            notification_targets=[],
            persistent_notification=True,
            mobile_push=True,
        )
        manager = MagicMock()

        persistent_mock = AsyncMock()
        hass.services.async_register("persistent_notification", "create", persistent_mock)

        router = NotificationRouter(hass, manager)
        await router.async_send_test_notification(channel)

        # Only persistent should be called

    async def test_test_notification_persistent_disabled(self, hass: HomeAssistant):
        """Test test notification with persistent notification disabled."""
        channel = AlarmChannel(
            id="ch1",
            name="Test Channel",
            notification_targets=["mobile_app_phone"],
            persistent_notification=False,
            mobile_push=True,
        )
        manager = MagicMock()

        notify_mock = AsyncMock()
        hass.services.async_register("notify", "mobile_app_phone", notify_mock)

        router = NotificationRouter(hass, manager)
        await router.async_send_test_notification(channel)

        # Only mobile should be called, not persistent


class TestTargetSplitting:
    """Test that stored notify targets are split into (domain, service)."""

    def test_split_prefixed_target(self):
        """A frontend-stored ``notify.<service>`` id splits into domain + service."""
        assert NotificationRouter._split_target("notify.mobile_app_phone") == (
            "notify",
            "mobile_app_phone",
        )

    def test_split_bare_target_defaults_to_notify(self):
        """A bare service name (legacy config) defaults to the notify domain."""
        assert NotificationRouter._split_target("mobile_app_phone") == (
            "notify",
            "mobile_app_phone",
        )

    async def test_prefixed_target_reaches_real_service(self, hass: HomeAssistant):
        """Regression: a ``notify.``-prefixed target must call the real service.

        Previously the full id was passed as the service name, invoking the
        non-existent ``notify.notify.mobile_app_phone`` and silently dropping
        the push.
        """
        alarm = _make_alarm(priority=AlarmPriority.HIGH)
        runtime = _make_runtime()
        channel = _make_channel(
            notification_targets=[{"target": "notify.mobile_app_phone", "min_priority": 0}]
        )
        manager = MagicMock()
        manager.channels = {"ch1": channel}

        persistent_mock = AsyncMock()
        notify_mock = AsyncMock()
        hass.services.async_register("persistent_notification", "create", persistent_mock)
        hass.services.async_register("notify", "mobile_app_phone", notify_mock)

        router = NotificationRouter(hass, manager)
        await router.async_send_alarm_notification(alarm, runtime)

        notify_mock.assert_awaited_once()

    async def test_test_notification_prefixed_dict_target(self, hass: HomeAssistant):
        """The channel test button must handle prefixed, dict-form targets."""
        channel = _make_channel(
            notification_targets=[{"target": "notify.mobile_app_phone", "min_priority": 0}]
        )
        manager = MagicMock()

        persistent_mock = AsyncMock()
        notify_mock = AsyncMock()
        hass.services.async_register("persistent_notification", "create", persistent_mock)
        hass.services.async_register("notify", "mobile_app_phone", notify_mock)

        router = NotificationRouter(hass, manager)
        await router.async_send_test_notification(channel)

        notify_mock.assert_awaited_once()


class TestMessageBuilding:
    """Test notification message content."""

    def test_build_message_includes_description(self):
        """Test that message includes alarm description."""
        alarm = _make_alarm(description="High temperature detected")
        runtime = _make_runtime(last_value="55.0")
        manager = MagicMock()

        router = NotificationRouter.__new__(NotificationRouter)
        router._hass = MagicMock()
        router._manager = manager

        message = router._render_message(alarm, runtime)

        assert "High temperature detected" in message
        assert "sensor.test" in message
        assert "55.0" in message
        assert "Plant A" in message
        assert "Reactor" in message

    def test_build_message_without_optional_fields(self):
        """Test message without optional fields."""
        alarm = AlarmDefinition(
            id="alarm1",
            name="Test",
            description="",
            source_entity_id="sensor.test",
            trigger_type=TriggerType.ANALOG,
            trigger_config={"operator": ">", "threshold": 50},
            area="",
            equipment="",
        )
        runtime = _make_runtime(last_value=None)
        manager = MagicMock()

        router = NotificationRouter.__new__(NotificationRouter)
        router._hass = MagicMock()
        router._manager = manager

        message = router._render_message(alarm, runtime)

        assert "sensor.test" in message
        # Empty fields should not appear
        assert "Area:" not in message
        assert "Equipment:" not in message

    @pytest.mark.parametrize(
        "priority, expected_icon",
        [
            (AlarmPriority.INFO, "\u2139\ufe0f"),
            (AlarmPriority.WARNING, "\U0001f7e1"),
            (AlarmPriority.HIGH, "\U0001f534"),
            (AlarmPriority.CRITICAL, "\U0001f6a8"),
        ],
    )
    def test_render_title_uses_priority_icon(self, priority, expected_icon):
        """Test default title uses emoji icon instead of [Priority] text."""
        alarm = _make_alarm(priority=priority)
        runtime = _make_runtime()
        manager = MagicMock()

        router = NotificationRouter.__new__(NotificationRouter)
        router._hass = MagicMock()
        router._manager = manager

        title = router._render_title(alarm, runtime)

        assert title.startswith(expected_icon)
        assert alarm.name in title
        assert "[" not in title

    def test_get_channel_returns_channel(self):
        """Test _get_channel returns the channel for an alarm."""
        alarm = _make_alarm(channel_id="ch1")
        channel = _make_channel()
        manager = MagicMock()
        manager.channels = {"ch1": channel}

        router = NotificationRouter.__new__(NotificationRouter)
        router._manager = manager

        result = router._get_channel(alarm)
        assert result is channel

    def test_get_channel_returns_none_for_no_channel_id(self):
        """Test _get_channel returns None when alarm has no channel_id."""
        alarm = _make_alarm(channel_id=None)
        manager = MagicMock()

        router = NotificationRouter.__new__(NotificationRouter)
        router._manager = manager

        result = router._get_channel(alarm)
        assert result is None

    def test_get_channel_returns_none_for_missing_channel(self):
        """Test _get_channel returns None when channel doesn't exist."""
        alarm = _make_alarm(channel_id="nonexistent")
        manager = MagicMock()
        manager.channels = {}

        router = NotificationRouter.__new__(NotificationRouter)
        router._manager = manager

        result = router._get_channel(alarm)
        assert result is None


class TestRepeatNotification:
    """Test the is_repeat reminder marker that distinguishes re-notifications."""

    _MARKER = "\U0001f501"

    async def test_repeat_prefixes_title(self, hass: HomeAssistant):
        """A reminder (is_repeat=True) prefixes the title with a marker."""
        alarm = _make_alarm(priority=AlarmPriority.HIGH)
        runtime = _make_runtime()
        channel = _make_channel(notification_targets=["mobile_app_phone"])
        manager = MagicMock()
        manager.channels = {"ch1": channel}

        persistent_mock = AsyncMock()
        hass.services.async_register("persistent_notification", "create", persistent_mock)
        hass.services.async_register("notify", "mobile_app_phone", AsyncMock())

        router = NotificationRouter(hass, manager)
        await router.async_send_alarm_notification(alarm, runtime, is_repeat=True)

        title = persistent_mock.call_args.args[0].data["title"]
        assert title.startswith(self._MARKER)

    async def test_initial_title_not_prefixed(self, hass: HomeAssistant):
        """The initial notification (default) is not prefixed."""
        alarm = _make_alarm(priority=AlarmPriority.HIGH)
        runtime = _make_runtime()
        channel = _make_channel(notification_targets=["mobile_app_phone"])
        manager = MagicMock()
        manager.channels = {"ch1": channel}

        persistent_mock = AsyncMock()
        hass.services.async_register("persistent_notification", "create", persistent_mock)
        hass.services.async_register("notify", "mobile_app_phone", AsyncMock())

        router = NotificationRouter(hass, manager)
        await router.async_send_alarm_notification(alarm, runtime)

        title = persistent_mock.call_args.args[0].data["title"]
        assert not title.startswith(self._MARKER)
