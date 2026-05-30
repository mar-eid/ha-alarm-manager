"""Tests for the SQLite database layer."""

from __future__ import annotations

import tempfile
from datetime import datetime, timezone
from pathlib import Path

import pytest

from custom_components.scada_alarm_manager.const import (
    AlarmEventType,
    AlarmPriority,
    AlarmState,
    TriggerType,
)
from custom_components.scada_alarm_manager.database import AlarmDatabase
from custom_components.scada_alarm_manager.models import (
    AlarmChannel,
    AlarmDefinition,
    AlarmEvent,
)


@pytest.fixture
async def db():
    """Create a temporary database for testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        database = AlarmDatabase(db_path)
        await database.async_init()
        yield database
        await database.async_close()


@pytest.fixture
def sample_alarm() -> AlarmDefinition:
    return AlarmDefinition(
        id="alarm1",
        name="Test Alarm",
        description="A test alarm",
        priority=AlarmPriority.HIGH,
        area="Kitchen",
        source_entity_id="sensor.temp",
        trigger_type=TriggerType.ANALOG,
        trigger_config={"operator": ">", "threshold": 50},
    )


@pytest.fixture
def sample_channel() -> AlarmChannel:
    return AlarmChannel(
        id="channel1",
        name="Safety",
        notification_targets=["mobile_app_phone"],
        min_priority=AlarmPriority.WARNING,
    )


class TestAlarmCRUD:
    @pytest.mark.asyncio
    async def test_create_and_get(self, db, sample_alarm):
        await db.async_create_alarm(sample_alarm)
        result = await db.async_get_alarm("alarm1")
        assert result is not None
        assert result.name == "Test Alarm"
        assert result.priority == AlarmPriority.HIGH
        assert result.trigger_config["threshold"] == 50

    @pytest.mark.asyncio
    async def test_list_alarms(self, db, sample_alarm):
        await db.async_create_alarm(sample_alarm)
        alarms = await db.async_list_alarms()
        assert len(alarms) == 1
        assert alarms[0].id == "alarm1"

    @pytest.mark.asyncio
    async def test_update_alarm(self, db, sample_alarm):
        await db.async_create_alarm(sample_alarm)
        sample_alarm.name = "Updated Alarm"
        sample_alarm.priority = AlarmPriority.CRITICAL
        await db.async_update_alarm(sample_alarm)
        result = await db.async_get_alarm("alarm1")
        assert result is not None
        assert result.name == "Updated Alarm"
        assert result.priority == AlarmPriority.CRITICAL

    @pytest.mark.asyncio
    async def test_delete_alarm(self, db, sample_alarm):
        await db.async_create_alarm(sample_alarm)
        await db.async_delete_alarm("alarm1")
        result = await db.async_get_alarm("alarm1")
        assert result is None

    @pytest.mark.asyncio
    async def test_get_nonexistent(self, db):
        result = await db.async_get_alarm("nonexistent")
        assert result is None


class TestChannelCRUD:
    @pytest.mark.asyncio
    async def test_create_and_get(self, db, sample_channel):
        await db.async_create_channel(sample_channel)
        result = await db.async_get_channel("channel1")
        assert result is not None
        assert result.name == "Safety"
        assert result.notification_targets == ["mobile_app_phone"]

    @pytest.mark.asyncio
    async def test_list_channels(self, db, sample_channel):
        await db.async_create_channel(sample_channel)
        channels = await db.async_list_channels()
        assert len(channels) == 1

    @pytest.mark.asyncio
    async def test_update_channel(self, db, sample_channel):
        await db.async_create_channel(sample_channel)
        sample_channel.name = "Updated Safety"
        await db.async_update_channel(sample_channel)
        result = await db.async_get_channel("channel1")
        assert result is not None
        assert result.name == "Updated Safety"

    @pytest.mark.asyncio
    async def test_delete_channel(self, db, sample_channel):
        await db.async_create_channel(sample_channel)
        await db.async_delete_channel("channel1")
        result = await db.async_get_channel("channel1")
        assert result is None


class TestAlarmEvents:
    @pytest.mark.asyncio
    async def test_log_and_get_events(self, db):
        event = AlarmEvent(
            alarm_id="alarm1",
            event_type=AlarmEventType.TRIGGERED,
            old_state=AlarmState.NORMAL,
            new_state=AlarmState.ACTIVE_UNACKED,
        )
        await db.async_log_event(event)
        events = await db.async_get_events()
        assert len(events) == 1
        assert events[0].event_type == AlarmEventType.TRIGGERED
        assert events[0].old_state == AlarmState.NORMAL
        assert events[0].new_state == AlarmState.ACTIVE_UNACKED

    @pytest.mark.asyncio
    async def test_filter_by_alarm_id(self, db):
        await db.async_log_event(AlarmEvent(alarm_id="a1", event_type=AlarmEventType.TRIGGERED))
        await db.async_log_event(AlarmEvent(alarm_id="a2", event_type=AlarmEventType.TRIGGERED))
        events = await db.async_get_events(alarm_id="a1")
        assert len(events) == 1
        assert events[0].alarm_id == "a1"

    @pytest.mark.asyncio
    async def test_filter_by_event_type(self, db):
        await db.async_log_event(AlarmEvent(alarm_id="a1", event_type=AlarmEventType.TRIGGERED))
        await db.async_log_event(AlarmEvent(alarm_id="a1", event_type=AlarmEventType.ACKNOWLEDGED))
        events = await db.async_get_events(event_type=AlarmEventType.ACKNOWLEDGED)
        assert len(events) == 1
        assert events[0].event_type == AlarmEventType.ACKNOWLEDGED

    @pytest.mark.asyncio
    async def test_pagination(self, db):
        for i in range(10):
            await db.async_log_event(AlarmEvent(alarm_id=f"a{i}", event_type=AlarmEventType.TRIGGERED))
        events = await db.async_get_events(limit=3, offset=0)
        assert len(events) == 3
        events2 = await db.async_get_events(limit=3, offset=3)
        assert len(events2) == 3

    @pytest.mark.asyncio
    async def test_event_count(self, db):
        for i in range(5):
            await db.async_log_event(AlarmEvent(alarm_id="a1", event_type=AlarmEventType.TRIGGERED))
        count = await db.async_get_event_count(alarm_id="a1")
        assert count == 5

    @pytest.mark.asyncio
    async def test_purge_events(self, db):
        old_event = AlarmEvent(
            alarm_id="a1",
            event_type=AlarmEventType.TRIGGERED,
            timestamp=datetime(2020, 1, 1, tzinfo=timezone.utc),
        )
        await db.async_log_event(old_event)
        await db.async_log_event(AlarmEvent(alarm_id="a2", event_type=AlarmEventType.TRIGGERED))

        deleted = await db.async_purge_events(datetime(2025, 1, 1, tzinfo=timezone.utc))
        assert deleted == 1
        events = await db.async_get_events()
        assert len(events) == 1
