"""Tests for the trigger evaluator."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from custom_components.scada_alarm_manager.const import AlarmPriority, TriggerType
from custom_components.scada_alarm_manager.models import AlarmDefinition
from custom_components.scada_alarm_manager.trigger_evaluator import TriggerEvaluator


def _make_state(state_value: str) -> MagicMock:
    """Create a mock HA State object."""
    mock = MagicMock()
    mock.state = state_value
    return mock


def _make_alarm(trigger_type: TriggerType, config: dict) -> AlarmDefinition:
    """Create an alarm definition with given trigger config."""
    return AlarmDefinition(
        id="test",
        name="Test",
        source_entity_id="sensor.test",
        trigger_type=trigger_type,
        trigger_config=config,
    )


class TestAnalogTrigger:
    def setup_method(self):
        self.evaluator = TriggerEvaluator()

    def test_greater_than_true(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": ">", "threshold": 50})
        assert self.evaluator.evaluate(alarm, _make_state("55.0")) is True

    def test_greater_than_false(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": ">", "threshold": 50})
        assert self.evaluator.evaluate(alarm, _make_state("45.0")) is False

    def test_greater_than_equal(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": ">", "threshold": 50})
        assert self.evaluator.evaluate(alarm, _make_state("50.0")) is False

    def test_greater_equal_boundary(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": ">=", "threshold": 50})
        assert self.evaluator.evaluate(alarm, _make_state("50.0")) is True

    def test_less_than(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": "<", "threshold": 15})
        assert self.evaluator.evaluate(alarm, _make_state("10.0")) is True

    def test_less_than_false(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": "<", "threshold": 15})
        assert self.evaluator.evaluate(alarm, _make_state("20.0")) is False

    def test_less_equal(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": "<=", "threshold": 15})
        assert self.evaluator.evaluate(alarm, _make_state("15.0")) is True

    def test_equal(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": "==", "threshold": 100})
        assert self.evaluator.evaluate(alarm, _make_state("100.0")) is True

    def test_not_equal(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": "!=", "threshold": 0})
        assert self.evaluator.evaluate(alarm, _make_state("5.0")) is True

    def test_unavailable_state(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": ">", "threshold": 50})
        assert self.evaluator.evaluate(alarm, _make_state("unavailable")) is False

    def test_unknown_state(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": ">", "threshold": 50})
        assert self.evaluator.evaluate(alarm, _make_state("unknown")) is False

    def test_non_numeric_state(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": ">", "threshold": 50})
        assert self.evaluator.evaluate(alarm, _make_state("not_a_number")) is False

    def test_none_entity_state(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": ">", "threshold": 50})
        assert self.evaluator.evaluate(alarm, None) is False

    def test_no_threshold(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": ">"})
        assert self.evaluator.evaluate(alarm, _make_state("55")) is False

    def test_negative_threshold(self):
        alarm = _make_alarm(TriggerType.ANALOG, {"operator": "<", "threshold": -10})
        assert self.evaluator.evaluate(alarm, _make_state("-15.5")) is True


class TestDigitalTrigger:
    def setup_method(self):
        self.evaluator = TriggerEvaluator()

    def test_state_matches(self):
        alarm = _make_alarm(TriggerType.DIGITAL, {"target_state": "on"})
        assert self.evaluator.evaluate(alarm, _make_state("on")) is True

    def test_state_does_not_match(self):
        alarm = _make_alarm(TriggerType.DIGITAL, {"target_state": "on"})
        assert self.evaluator.evaluate(alarm, _make_state("off")) is False

    def test_unavailable_target(self):
        alarm = _make_alarm(TriggerType.DIGITAL, {"target_state": "unavailable"})
        assert self.evaluator.evaluate(alarm, _make_state("unavailable")) is True

    def test_case_sensitive(self):
        alarm = _make_alarm(TriggerType.DIGITAL, {"target_state": "On"})
        assert self.evaluator.evaluate(alarm, _make_state("on")) is False

    def test_none_entity(self):
        alarm = _make_alarm(TriggerType.DIGITAL, {"target_state": "on"})
        assert self.evaluator.evaluate(alarm, None) is False


class TestCustomStateTrigger:
    def setup_method(self):
        self.evaluator = TriggerEvaluator()

    def test_match_values_hit(self):
        alarm = _make_alarm(TriggerType.CUSTOM_STATE, {"match_values": ["error", "fault"]})
        assert self.evaluator.evaluate(alarm, _make_state("error")) is True

    def test_match_values_miss(self):
        alarm = _make_alarm(TriggerType.CUSTOM_STATE, {"match_values": ["error", "fault"]})
        assert self.evaluator.evaluate(alarm, _make_state("ok")) is False

    def test_no_config(self):
        alarm = _make_alarm(TriggerType.CUSTOM_STATE, {})
        assert self.evaluator.evaluate(alarm, _make_state("error")) is False

    def test_template_result_true(self):
        alarm = _make_alarm(TriggerType.CUSTOM_STATE, {"template": "{{ true }}"})
        assert self.evaluator.evaluate_template(alarm, "true") is True

    def test_template_result_false(self):
        alarm = _make_alarm(TriggerType.CUSTOM_STATE, {"template": "{{ false }}"})
        assert self.evaluator.evaluate_template(alarm, "false") is False

    def test_template_result_yes(self):
        alarm = _make_alarm(TriggerType.CUSTOM_STATE, {"template": "{{ true }}"})
        assert self.evaluator.evaluate_template(alarm, "yes") is True
