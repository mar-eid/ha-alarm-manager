"""Tests for the SCADA alarm state machine."""

from __future__ import annotations

from datetime import datetime, timezone

import pytest

from custom_components.scada_alarm_manager.const import (
    AlarmEventType,
    AlarmPriority,
    AlarmState,
    TriggerType,
)
from custom_components.scada_alarm_manager.models import (
    AlarmDefinition,
    AlarmRuntimeState,
)
from custom_components.scada_alarm_manager.state_machine import (
    acknowledge,
    condition_cleared,
    condition_met,
    disable,
    enable,
    reset,
    shelve,
    unshelve,
)


@pytest.fixture
def alarm_def() -> AlarmDefinition:
    return AlarmDefinition(
        id="test1",
        name="Test Alarm",
        source_entity_id="sensor.test",
        trigger_type=TriggerType.ANALOG,
        trigger_config={"operator": ">", "threshold": 50},
        ack_required=True,
        auto_clear=True,
        latching=False,
    )


@pytest.fixture
def runtime() -> AlarmRuntimeState:
    return AlarmRuntimeState(alarm_id="test1")


class TestConditionMet:
    def test_normal_to_active_unacked(self, runtime, alarm_def):
        new, events = condition_met(runtime, alarm_def, "55.0")
        assert new.state == AlarmState.ACTIVE_UNACKED
        assert new.triggered_at is not None
        assert new.last_value == "55.0"
        assert len(events) == 1
        assert events[0].event_type == AlarmEventType.TRIGGERED

    def test_already_active_stays(self, runtime, alarm_def):
        runtime.state = AlarmState.ACTIVE_UNACKED
        new, events = condition_met(runtime, alarm_def, "60.0")
        assert new.state == AlarmState.ACTIVE_UNACKED
        assert new.last_value == "60.0"
        assert len(events) == 0

    def test_disabled_no_change(self, runtime, alarm_def):
        runtime.state = AlarmState.DISABLED
        new, events = condition_met(runtime, alarm_def)
        assert new.state == AlarmState.DISABLED
        assert len(events) == 0

    def test_shelved_no_change(self, runtime, alarm_def):
        runtime.state = AlarmState.SHELVED
        new, events = condition_met(runtime, alarm_def, "55.0")
        assert new.state == AlarmState.SHELVED
        assert new.last_value == "55.0"
        assert len(events) == 0

    def test_rtn_to_active(self, runtime, alarm_def):
        runtime.state = AlarmState.RTN_UNACKED
        new, events = condition_met(runtime, alarm_def, "55.0")
        assert new.state == AlarmState.ACTIVE_UNACKED
        assert len(events) == 1


class TestConditionCleared:
    def test_active_unacked_to_rtn_when_ack_required(self, runtime, alarm_def):
        runtime.state = AlarmState.ACTIVE_UNACKED
        new, events = condition_cleared(runtime, alarm_def)
        assert new.state == AlarmState.RTN_UNACKED
        assert len(events) == 1
        assert events[0].event_type == AlarmEventType.CLEARED

    def test_active_unacked_to_normal_when_no_ack(self, runtime, alarm_def):
        alarm_def.ack_required = False
        runtime.state = AlarmState.ACTIVE_UNACKED
        new, events = condition_cleared(runtime, alarm_def)
        assert new.state == AlarmState.NORMAL
        assert len(events) == 1

    def test_active_acked_to_normal(self, runtime, alarm_def):
        runtime.state = AlarmState.ACTIVE_ACKED
        new, events = condition_cleared(runtime, alarm_def)
        assert new.state == AlarmState.NORMAL
        assert len(events) == 1

    def test_latching_stays_active_acked(self, runtime, alarm_def):
        alarm_def.latching = True
        alarm_def.auto_clear = False
        runtime.state = AlarmState.ACTIVE_ACKED
        new, events = condition_cleared(runtime, alarm_def)
        assert new.state == AlarmState.ACTIVE_ACKED
        assert len(events) == 0

    def test_normal_no_change(self, runtime, alarm_def):
        new, events = condition_cleared(runtime, alarm_def)
        assert new.state == AlarmState.NORMAL
        assert len(events) == 0


class TestAcknowledge:
    def test_active_unacked_to_acked(self, runtime):
        runtime.state = AlarmState.ACTIVE_UNACKED
        new, events = acknowledge(runtime, user="admin")
        assert new.state == AlarmState.ACTIVE_ACKED
        assert new.acked_by == "admin"
        assert new.acked_at is not None
        assert len(events) == 1
        assert events[0].event_type == AlarmEventType.ACKNOWLEDGED

    def test_rtn_unacked_to_normal(self, runtime):
        runtime.state = AlarmState.RTN_UNACKED
        new, events = acknowledge(runtime, user="admin")
        assert new.state == AlarmState.NORMAL
        assert len(events) == 1

    def test_normal_no_change(self, runtime):
        new, events = acknowledge(runtime)
        assert new.state == AlarmState.NORMAL
        assert len(events) == 0

    def test_disabled_no_change(self, runtime):
        runtime.state = AlarmState.DISABLED
        new, events = acknowledge(runtime)
        assert new.state == AlarmState.DISABLED
        assert len(events) == 0


class TestShelve:
    def test_shelve_from_active(self, runtime):
        runtime.state = AlarmState.ACTIVE_UNACKED
        new, events = shelve(runtime, duration_minutes=15, user="operator")
        assert new.state == AlarmState.SHELVED
        assert new.previous_state == AlarmState.ACTIVE_UNACKED
        assert new.shelved_until is not None
        assert len(events) == 1
        assert events[0].event_type == AlarmEventType.SHELVED
        assert events[0].details["duration_minutes"] == 15

    def test_shelve_from_normal(self, runtime):
        new, events = shelve(runtime, duration_minutes=30)
        assert new.state == AlarmState.SHELVED
        assert new.previous_state == AlarmState.NORMAL
        assert len(events) == 1

    def test_shelve_from_disabled_no_change(self, runtime):
        runtime.state = AlarmState.DISABLED
        new, events = shelve(runtime, duration_minutes=15)
        assert new.state == AlarmState.DISABLED
        assert len(events) == 0

    def test_already_shelved_no_change(self, runtime):
        runtime.state = AlarmState.SHELVED
        new, events = shelve(runtime, duration_minutes=15)
        assert new.state == AlarmState.SHELVED
        assert len(events) == 0


class TestUnshelve:
    def test_unshelve_restores_previous(self, runtime):
        runtime.state = AlarmState.SHELVED
        runtime.previous_state = AlarmState.ACTIVE_UNACKED
        new, events = unshelve(runtime, user="operator")
        assert new.state == AlarmState.ACTIVE_UNACKED
        assert new.previous_state is None
        assert new.shelved_until is None
        assert len(events) == 1
        assert events[0].event_type == AlarmEventType.UNSHELVED

    def test_unshelve_defaults_to_normal(self, runtime):
        runtime.state = AlarmState.SHELVED
        runtime.previous_state = None
        new, events = unshelve(runtime)
        assert new.state == AlarmState.NORMAL
        assert len(events) == 1

    def test_unshelve_not_shelved_no_change(self, runtime):
        new, events = unshelve(runtime)
        assert new.state == AlarmState.NORMAL
        assert len(events) == 0


class TestDisable:
    def test_disable_from_normal(self, runtime):
        new, events = disable(runtime, user="admin")
        assert new.state == AlarmState.DISABLED
        assert len(events) == 1
        assert events[0].event_type == AlarmEventType.DISABLED

    def test_disable_from_active(self, runtime):
        runtime.state = AlarmState.ACTIVE_UNACKED
        new, events = disable(runtime)
        assert new.state == AlarmState.DISABLED
        assert new.triggered_at is None
        assert len(events) == 1

    def test_already_disabled_no_change(self, runtime):
        runtime.state = AlarmState.DISABLED
        new, events = disable(runtime)
        assert new.state == AlarmState.DISABLED
        assert len(events) == 0


class TestEnable:
    def test_enable_from_disabled(self, runtime):
        runtime.state = AlarmState.DISABLED
        new, events = enable(runtime, user="admin")
        assert new.state == AlarmState.NORMAL
        assert len(events) == 1
        assert events[0].event_type == AlarmEventType.ENABLED

    def test_enable_not_disabled_no_change(self, runtime):
        new, events = enable(runtime)
        assert new.state == AlarmState.NORMAL
        assert len(events) == 0


class TestReset:
    def test_reset_latching_condition_cleared(self, runtime, alarm_def):
        alarm_def.latching = True
        runtime.state = AlarmState.ACTIVE_ACKED
        new, events = reset(runtime, alarm_def, condition_active=False, user="admin")
        assert new.state == AlarmState.NORMAL
        assert len(events) == 1
        assert events[0].event_type == AlarmEventType.RESET

    def test_reset_condition_still_active(self, runtime, alarm_def):
        alarm_def.latching = True
        runtime.state = AlarmState.ACTIVE_ACKED
        new, events = reset(runtime, alarm_def, condition_active=True)
        assert new.state == AlarmState.ACTIVE_ACKED
        assert len(events) == 0

    def test_reset_non_latching_no_change(self, runtime, alarm_def):
        alarm_def.latching = False
        runtime.state = AlarmState.ACTIVE_ACKED
        new, events = reset(runtime, alarm_def, condition_active=False)
        assert new.state == AlarmState.ACTIVE_ACKED
        assert len(events) == 0

    def test_reset_from_normal_no_change(self, runtime, alarm_def):
        alarm_def.latching = True
        new, events = reset(runtime, alarm_def, condition_active=False)
        assert new.state == AlarmState.NORMAL
        assert len(events) == 0


class TestFullLifecycle:
    def test_normal_trigger_ack_clear(self, runtime, alarm_def):
        """Full lifecycle: Normal -> Active Unacked -> Active Acked -> Normal."""
        # Trigger
        runtime, events = condition_met(runtime, alarm_def, "55")
        assert runtime.state == AlarmState.ACTIVE_UNACKED

        # Acknowledge
        runtime, events = acknowledge(runtime, user="operator")
        assert runtime.state == AlarmState.ACTIVE_ACKED

        # Clear
        runtime, events = condition_cleared(runtime, alarm_def, "45")
        assert runtime.state == AlarmState.NORMAL

    def test_normal_trigger_clear_ack(self, runtime, alarm_def):
        """Lifecycle with clear before ack: Normal -> Active -> RTN -> Normal."""
        # Trigger
        runtime, events = condition_met(runtime, alarm_def, "55")
        assert runtime.state == AlarmState.ACTIVE_UNACKED

        # Clear before ack
        runtime, events = condition_cleared(runtime, alarm_def, "45")
        assert runtime.state == AlarmState.RTN_UNACKED

        # Acknowledge
        runtime, events = acknowledge(runtime, user="operator")
        assert runtime.state == AlarmState.NORMAL

    def test_latching_lifecycle(self, runtime, alarm_def):
        """Latching alarm requires manual reset."""
        alarm_def.latching = True
        alarm_def.auto_clear = False

        # Trigger
        runtime, events = condition_met(runtime, alarm_def, "55")
        assert runtime.state == AlarmState.ACTIVE_UNACKED

        # Acknowledge
        runtime, events = acknowledge(runtime, user="operator")
        assert runtime.state == AlarmState.ACTIVE_ACKED

        # Clear - should stay active (latching)
        runtime, events = condition_cleared(runtime, alarm_def, "45")
        assert runtime.state == AlarmState.ACTIVE_ACKED

        # Reset
        runtime, events = reset(runtime, alarm_def, condition_active=False, user="admin")
        assert runtime.state == AlarmState.NORMAL
