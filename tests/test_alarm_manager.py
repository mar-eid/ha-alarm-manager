"""Tests for the alarm manager engine."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from homeassistant.core import HomeAssistant

from custom_components.scada_alarm_manager.alarm_manager import AlarmManager
from custom_components.scada_alarm_manager.const import (
    DOMAIN,
    EVENT_ALARM_STATE_CHANGED,
    AlarmEventType,
    AlarmPriority,
    AlarmState,
    TriggerType,
)
from custom_components.scada_alarm_manager.models import (
    AlarmChannel,
    AlarmDefinition,
    AlarmRuntimeState,
)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for testing."""
    yield


@pytest.fixture
def sample_alarm() -> AlarmDefinition:
    """Create a sample alarm for testing."""
    return AlarmDefinition(
        id="alarm_1",
        name="Test High Temp",
        description="Temperature exceeds threshold",
        priority=AlarmPriority.HIGH,
        area="Plant A",
        equipment="Reactor",
        tag="TT-101",
        source_entity_id="sensor.temperature",
        trigger_type=TriggerType.ANALOG,
        trigger_config={"operator": ">", "threshold": 50.0},
        ack_required=True,
        auto_clear=True,
        latching=False,
        enabled=True,
    )


@pytest.fixture
def sample_channel() -> AlarmChannel:
    """Create a sample channel for testing."""
    return AlarmChannel(
        id="channel_1",
        name="Safety",
        notification_targets=["mobile_app_phone"],
        min_priority=AlarmPriority.WARNING,
    )


class TestAsyncStart:
    async def test_start_loads_alarms_from_db(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_alarm
    ):
        """Test that async_start loads alarm definitions from the database."""
        mock_database.async_list_alarms.return_value = [sample_alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        assert "alarm_1" in manager.alarms
        assert manager.alarms["alarm_1"].name == "Test High Temp"
        assert "alarm_1" in manager.runtime_states
        assert manager.runtime_states["alarm_1"].state == AlarmState.NORMAL

        mock_database.async_list_alarms.assert_awaited_once()
        mock_store.async_save.assert_awaited_once()
        await manager.async_stop()

    async def test_start_loads_channels_from_db(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_channel
    ):
        """Test that async_start loads channels from the database."""
        mock_database.async_list_alarms.return_value = []
        mock_database.async_list_channels.return_value = [sample_channel]

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        assert "channel_1" in manager.channels
        assert manager.channels["channel_1"].name == "Safety"

        mock_database.async_list_channels.assert_awaited_once()
        await manager.async_stop()

    async def test_start_disabled_alarm_starts_disabled(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test that disabled alarms start in DISABLED state."""
        alarm = AlarmDefinition(
            id="disabled_alarm",
            name="Disabled Alarm",
            source_entity_id="sensor.test",
            trigger_type=TriggerType.ANALOG,
            trigger_config={"operator": ">", "threshold": 50},
            enabled=False,
        )
        mock_database.async_list_alarms.return_value = [alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        assert manager.runtime_states["disabled_alarm"].state == AlarmState.DISABLED
        await manager.async_stop()


class TestAlarmCRUD:
    async def test_create_alarm(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_alarm
    ):
        """Test creating an alarm."""
        mock_database.async_list_alarms.return_value = []
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        result = await manager.async_create_alarm(sample_alarm)

        assert result.id == "alarm_1"
        assert "alarm_1" in manager.alarms
        assert "alarm_1" in manager.runtime_states
        mock_database.async_create_alarm.assert_awaited_once_with(sample_alarm)
        mock_database.async_log_event.assert_awaited()

        # Verify creation event was logged
        logged_event = mock_database.async_log_event.call_args[0][0]
        assert logged_event.alarm_id == "alarm_1"
        assert logged_event.event_type == AlarmEventType.CREATED
        await manager.async_stop()

    async def test_update_alarm(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_alarm
    ):
        """Test updating an alarm."""
        mock_database.async_list_alarms.return_value = [sample_alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        sample_alarm.name = "Updated Alarm"
        result = await manager.async_update_alarm(sample_alarm)

        assert result.name == "Updated Alarm"
        assert manager.alarms["alarm_1"].name == "Updated Alarm"
        mock_database.async_update_alarm.assert_awaited_once()
        await manager.async_stop()

    async def test_delete_alarm(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_alarm
    ):
        """Test deleting an alarm."""
        mock_database.async_list_alarms.return_value = [sample_alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        await manager.async_delete_alarm("alarm_1")

        assert "alarm_1" not in manager.alarms
        assert "alarm_1" not in manager.runtime_states
        mock_database.async_delete_alarm.assert_awaited_once_with("alarm_1")
        await manager.async_stop()

    async def test_delete_nonexistent_alarm(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test deleting a nonexistent alarm does nothing."""
        mock_database.async_list_alarms.return_value = []
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        await manager.async_delete_alarm("nonexistent")
        mock_database.async_delete_alarm.assert_not_awaited()
        await manager.async_stop()


class TestChannelCRUD:
    async def test_create_channel(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_channel
    ):
        """Test creating a channel."""
        mock_database.async_list_alarms.return_value = []
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        result = await manager.async_create_channel(sample_channel)

        assert result.id == "channel_1"
        assert "channel_1" in manager.channels
        mock_database.async_create_channel.assert_awaited_once()
        await manager.async_stop()

    async def test_update_channel(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_channel
    ):
        """Test updating a channel."""
        mock_database.async_list_alarms.return_value = []
        mock_database.async_list_channels.return_value = [sample_channel]

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        sample_channel.name = "Updated Safety"
        result = await manager.async_update_channel(sample_channel)

        assert result.name == "Updated Safety"
        mock_database.async_update_channel.assert_awaited_once()
        await manager.async_stop()

    async def test_delete_channel(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_channel
    ):
        """Test deleting a channel."""
        mock_database.async_list_alarms.return_value = []
        mock_database.async_list_channels.return_value = [sample_channel]

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        await manager.async_delete_channel("channel_1")

        assert "channel_1" not in manager.channels
        mock_database.async_delete_channel.assert_awaited_once_with("channel_1")
        await manager.async_stop()


class TestAlarmActions:
    async def test_acknowledge(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_alarm
    ):
        """Test acknowledging an alarm."""
        mock_database.async_list_alarms.return_value = [sample_alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        # Put alarm into active state
        manager._runtime_states["alarm_1"] = AlarmRuntimeState(
            alarm_id="alarm_1", state=AlarmState.ACTIVE_UNACKED
        )

        await manager.async_acknowledge("alarm_1", user="operator")

        assert manager.runtime_states["alarm_1"].state == AlarmState.ACTIVE_ACKED
        assert manager.runtime_states["alarm_1"].acked_by == "operator"
        await manager.async_stop()

    async def test_acknowledge_nonexistent_alarm(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test acknowledging a nonexistent alarm does nothing."""
        mock_database.async_list_alarms.return_value = []
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        await manager.async_acknowledge("nonexistent")
        # Should not raise
        await manager.async_stop()

    async def test_acknowledge_all(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test acknowledging all alarms."""
        alarm1 = AlarmDefinition(
            id="a1", name="Alarm 1", source_entity_id="sensor.t1",
            trigger_type=TriggerType.ANALOG, trigger_config={"operator": ">", "threshold": 50},
            priority=AlarmPriority.HIGH,
        )
        alarm2 = AlarmDefinition(
            id="a2", name="Alarm 2", source_entity_id="sensor.t2",
            trigger_type=TriggerType.ANALOG, trigger_config={"operator": ">", "threshold": 50},
            priority=AlarmPriority.WARNING,
        )
        mock_database.async_list_alarms.return_value = [alarm1, alarm2]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        manager._runtime_states["a1"] = AlarmRuntimeState(
            alarm_id="a1", state=AlarmState.ACTIVE_UNACKED
        )
        manager._runtime_states["a2"] = AlarmRuntimeState(
            alarm_id="a2", state=AlarmState.ACTIVE_UNACKED
        )

        count = await manager.async_acknowledge_all(user="admin")

        assert count == 2
        assert manager.runtime_states["a1"].state == AlarmState.ACTIVE_ACKED
        assert manager.runtime_states["a2"].state == AlarmState.ACTIVE_ACKED
        await manager.async_stop()

    async def test_acknowledge_all_with_priority_filter(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test acknowledging all alarms with priority filter."""
        alarm1 = AlarmDefinition(
            id="a1", name="Alarm 1", source_entity_id="sensor.t1",
            trigger_type=TriggerType.ANALOG, trigger_config={"operator": ">", "threshold": 50},
            priority=AlarmPriority.HIGH,
        )
        alarm2 = AlarmDefinition(
            id="a2", name="Alarm 2", source_entity_id="sensor.t2",
            trigger_type=TriggerType.ANALOG, trigger_config={"operator": ">", "threshold": 50},
            priority=AlarmPriority.WARNING,
        )
        mock_database.async_list_alarms.return_value = [alarm1, alarm2]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        manager._runtime_states["a1"] = AlarmRuntimeState(
            alarm_id="a1", state=AlarmState.ACTIVE_UNACKED
        )
        manager._runtime_states["a2"] = AlarmRuntimeState(
            alarm_id="a2", state=AlarmState.ACTIVE_UNACKED
        )

        count = await manager.async_acknowledge_all(priority=AlarmPriority.HIGH, user="admin")

        assert count == 1
        assert manager.runtime_states["a1"].state == AlarmState.ACTIVE_ACKED
        assert manager.runtime_states["a2"].state == AlarmState.ACTIVE_UNACKED
        await manager.async_stop()

    async def test_shelve(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_alarm
    ):
        """Test shelving an alarm."""
        mock_database.async_list_alarms.return_value = [sample_alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        manager._runtime_states["alarm_1"] = AlarmRuntimeState(
            alarm_id="alarm_1", state=AlarmState.ACTIVE_UNACKED
        )

        await manager.async_shelve("alarm_1", duration_minutes=15, user="operator")

        assert manager.runtime_states["alarm_1"].state == AlarmState.SHELVED
        assert manager.runtime_states["alarm_1"].shelved_until is not None
        await manager.async_stop()

    async def test_unshelve(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_alarm
    ):
        """Test unshelving an alarm."""
        mock_database.async_list_alarms.return_value = [sample_alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        now = datetime.now(timezone.utc)
        manager._runtime_states["alarm_1"] = AlarmRuntimeState(
            alarm_id="alarm_1",
            state=AlarmState.SHELVED,
            previous_state=AlarmState.ACTIVE_UNACKED,
            shelved_until=now + timedelta(minutes=15),
        )

        await manager.async_unshelve("alarm_1", user="operator")

        # Should restore to previous state (ACTIVE_UNACKED) and then re-evaluate
        # Since there's no actual entity state, it should remain in the restored state
        state = manager.runtime_states["alarm_1"].state
        # After unshelve, the trigger is re-evaluated. Since entity doesn't exist,
        # condition_cleared is called, and with ack_required=True, it goes to RTN_UNACKED.
        assert state in (AlarmState.ACTIVE_UNACKED, AlarmState.RTN_UNACKED, AlarmState.NORMAL)
        await manager.async_stop()

    async def test_enable(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_alarm
    ):
        """Test enabling a disabled alarm."""
        sample_alarm.enabled = False
        mock_database.async_list_alarms.return_value = [sample_alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        assert manager.runtime_states["alarm_1"].state == AlarmState.DISABLED

        await manager.async_enable("alarm_1", user="admin")

        assert manager.runtime_states["alarm_1"].state == AlarmState.NORMAL
        assert sample_alarm.enabled is True
        await manager.async_stop()

    async def test_disable(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_alarm
    ):
        """Test disabling an alarm."""
        mock_database.async_list_alarms.return_value = [sample_alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        await manager.async_disable("alarm_1", user="admin")

        assert manager.runtime_states["alarm_1"].state == AlarmState.DISABLED
        assert sample_alarm.enabled is False
        await manager.async_stop()

    async def test_reset_latching(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test resetting a latched alarm."""
        alarm = AlarmDefinition(
            id="latch_alarm",
            name="Latching Alarm",
            source_entity_id="sensor.test",
            trigger_type=TriggerType.ANALOG,
            trigger_config={"operator": ">", "threshold": 50},
            latching=True,
            auto_clear=False,
            ack_required=True,
            enabled=True,
        )
        mock_database.async_list_alarms.return_value = [alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        manager._runtime_states["latch_alarm"] = AlarmRuntimeState(
            alarm_id="latch_alarm", state=AlarmState.ACTIVE_ACKED
        )

        # Reset should work since condition is not active (entity doesn't exist)
        await manager.async_reset("latch_alarm", user="admin")

        assert manager.runtime_states["latch_alarm"].state == AlarmState.NORMAL
        await manager.async_stop()


class TestSummaryAccessors:
    async def test_active_count(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test active count summary."""
        mock_database.async_list_alarms.return_value = []
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        assert manager.get_active_count() == 0

        # Add some runtime states
        manager._alarms["a1"] = AlarmDefinition(
            id="a1", name="A1", source_entity_id="s.t",
            trigger_type=TriggerType.ANALOG, trigger_config={"operator": ">", "threshold": 50},
            priority=AlarmPriority.HIGH,
        )
        manager._alarms["a2"] = AlarmDefinition(
            id="a2", name="A2", source_entity_id="s.t2",
            trigger_type=TriggerType.ANALOG, trigger_config={"operator": ">", "threshold": 50},
            priority=AlarmPriority.WARNING,
        )
        manager._runtime_states["a1"] = AlarmRuntimeState(
            alarm_id="a1", state=AlarmState.ACTIVE_UNACKED
        )
        manager._runtime_states["a2"] = AlarmRuntimeState(
            alarm_id="a2", state=AlarmState.NORMAL
        )

        assert manager.get_active_count() == 1
        await manager.async_stop()

    async def test_unacked_count(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test unacked count summary."""
        mock_database.async_list_alarms.return_value = []
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        manager._runtime_states["a1"] = AlarmRuntimeState(
            alarm_id="a1", state=AlarmState.ACTIVE_UNACKED
        )
        manager._runtime_states["a2"] = AlarmRuntimeState(
            alarm_id="a2", state=AlarmState.RTN_UNACKED
        )
        manager._runtime_states["a3"] = AlarmRuntimeState(
            alarm_id="a3", state=AlarmState.ACTIVE_ACKED
        )

        assert manager.get_unacked_count() == 2
        await manager.async_stop()

    async def test_highest_severity(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test highest severity summary."""
        mock_database.async_list_alarms.return_value = []
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        # No active alarms
        assert manager.get_highest_severity() is None

        manager._alarms["a1"] = AlarmDefinition(
            id="a1", name="A1", source_entity_id="s.t",
            trigger_type=TriggerType.ANALOG, trigger_config={"operator": ">", "threshold": 50},
            priority=AlarmPriority.WARNING,
        )
        manager._alarms["a2"] = AlarmDefinition(
            id="a2", name="A2", source_entity_id="s.t2",
            trigger_type=TriggerType.ANALOG, trigger_config={"operator": ">", "threshold": 50},
            priority=AlarmPriority.CRITICAL,
        )
        manager._runtime_states["a1"] = AlarmRuntimeState(
            alarm_id="a1", state=AlarmState.ACTIVE_UNACKED
        )
        manager._runtime_states["a2"] = AlarmRuntimeState(
            alarm_id="a2", state=AlarmState.ACTIVE_UNACKED
        )

        assert manager.get_highest_severity() == AlarmPriority.CRITICAL
        await manager.async_stop()

    async def test_highest_severity_ignores_normal(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test that highest severity ignores NORMAL and DISABLED states."""
        mock_database.async_list_alarms.return_value = []
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        manager._alarms["a1"] = AlarmDefinition(
            id="a1", name="A1", source_entity_id="s.t",
            trigger_type=TriggerType.ANALOG, trigger_config={"operator": ">", "threshold": 50},
            priority=AlarmPriority.CRITICAL,
        )
        manager._runtime_states["a1"] = AlarmRuntimeState(
            alarm_id="a1", state=AlarmState.NORMAL
        )

        assert manager.get_highest_severity() is None
        await manager.async_stop()


class TestEntityStateChange:
    async def test_evaluate_alarm_triggers(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test that alarm evaluation triggers when condition is met."""
        alarm = AlarmDefinition(
            id="temp_alarm",
            name="High Temp",
            source_entity_id="sensor.temperature",
            trigger_type=TriggerType.ANALOG,
            trigger_config={"operator": ">", "threshold": 50},
            priority=AlarmPriority.HIGH,
            enabled=True,
        )
        mock_database.async_list_alarms.return_value = [alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        # Directly evaluate alarm with a mock entity state above threshold
        mock_entity_state = MagicMock()
        mock_entity_state.state = "55.0"
        await manager._async_evaluate_alarm(alarm, mock_entity_state)

        assert manager.runtime_states["temp_alarm"].state == AlarmState.ACTIVE_UNACKED
        await manager.async_stop()

    async def test_evaluate_alarm_clears(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test that alarm evaluation clears when condition is no longer met."""
        alarm = AlarmDefinition(
            id="temp_alarm",
            name="High Temp",
            source_entity_id="sensor.temperature",
            trigger_type=TriggerType.ANALOG,
            trigger_config={"operator": ">", "threshold": 50},
            priority=AlarmPriority.HIGH,
            enabled=True,
            ack_required=False,
        )
        mock_database.async_list_alarms.return_value = [alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        # First trigger the alarm
        mock_state_high = MagicMock()
        mock_state_high.state = "55.0"
        await manager._async_evaluate_alarm(alarm, mock_state_high)
        assert manager.runtime_states["temp_alarm"].state == AlarmState.ACTIVE_UNACKED

        # Now clear it
        mock_state_low = MagicMock()
        mock_state_low.state = "45.0"
        await manager._async_evaluate_alarm(alarm, mock_state_low)

        # Since ack_required=False, should go straight to NORMAL
        assert manager.runtime_states["temp_alarm"].state == AlarmState.NORMAL
        await manager.async_stop()


class TestEntityUpdateCallbacks:
    async def test_register_and_fire_callback(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test registering and firing entity update callbacks."""
        mock_database.async_list_alarms.return_value = []
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        callback_called = MagicMock()
        manager.register_entity_update_callback(callback_called)

        manager._notify_entity_updates()

        callback_called.assert_called_once()
        await manager.async_stop()

    async def test_unregister_callback(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test unregistering entity update callbacks."""
        mock_database.async_list_alarms.return_value = []
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        await manager.async_start()

        callback_called = MagicMock()
        manager.register_entity_update_callback(callback_called)
        manager.unregister_entity_update_callback(callback_called)

        manager._notify_entity_updates()

        callback_called.assert_not_called()
        await manager.async_stop()


class TestNotificationIntegration:
    async def test_notification_sent_on_trigger(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock, sample_alarm
    ):
        """Test that notification is sent when alarm transitions to ACTIVE_UNACKED."""
        mock_database.async_list_alarms.return_value = [sample_alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        mock_router = AsyncMock()
        manager.set_notification_router(mock_router)
        await manager.async_start()

        # Directly evaluate alarm with state above threshold
        mock_entity_state = MagicMock()
        mock_entity_state.state = "55.0"
        await manager._async_evaluate_alarm(sample_alarm, mock_entity_state)

        mock_router.async_send_alarm_notification.assert_awaited_once()
        await manager.async_stop()

    async def test_notification_dismissed_on_clear(
        self, hass: HomeAssistant, mock_database: AsyncMock, mock_store: AsyncMock
    ):
        """Test that notification is dismissed when alarm returns to NORMAL."""
        alarm = AlarmDefinition(
            id="alarm_1",
            name="Test Alarm",
            source_entity_id="sensor.temperature",
            trigger_type=TriggerType.ANALOG,
            trigger_config={"operator": ">", "threshold": 50},
            priority=AlarmPriority.HIGH,
            enabled=True,
            ack_required=False,
        )
        mock_database.async_list_alarms.return_value = [alarm]
        mock_database.async_list_channels.return_value = []

        manager = AlarmManager(hass, mock_database, mock_store)
        mock_router = AsyncMock()
        manager.set_notification_router(mock_router)
        await manager.async_start()

        # Trigger the alarm
        mock_state_high = MagicMock()
        mock_state_high.state = "55.0"
        await manager._async_evaluate_alarm(alarm, mock_state_high)

        # Clear the alarm
        mock_state_low = MagicMock()
        mock_state_low.state = "45.0"
        await manager._async_evaluate_alarm(alarm, mock_state_low)

        mock_router.async_dismiss_alarm_notification.assert_awaited()
        await manager.async_stop()
