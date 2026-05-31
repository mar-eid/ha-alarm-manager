"""Trigger evaluator for alarm conditions."""

from __future__ import annotations

import logging
import operator
from typing import Any

from homeassistant.core import HomeAssistant, State
from homeassistant.helpers.template import Template

from .const import TriggerType
from .models import AlarmDefinition

_LOGGER = logging.getLogger(__name__)

_OPERATORS: dict[str, Any] = {
    ">": operator.gt,
    ">=": operator.ge,
    "<": operator.lt,
    "<=": operator.le,
    "==": operator.eq,
    "!=": operator.ne,
}


class TriggerEvaluator:
    """Evaluates alarm trigger conditions against entity state."""

    def evaluate(self, alarm_def: AlarmDefinition, entity_state: State | None) -> bool:
        """Evaluate whether the alarm condition is met.

        Returns True if the condition is active (alarm should trigger).
        """
        if entity_state is None:
            return False

        if alarm_def.trigger_type == TriggerType.EXTERNAL:
            return False  # External alarms are triggered via service calls, not entity evaluation

        if alarm_def.trigger_type == TriggerType.ANALOG:
            return self._evaluate_analog(alarm_def, entity_state)
        if alarm_def.trigger_type == TriggerType.DIGITAL:
            return self._evaluate_digital(alarm_def, entity_state)
        if alarm_def.trigger_type == TriggerType.CUSTOM_STATE:
            return self._evaluate_custom(alarm_def, entity_state)

        _LOGGER.warning("Unknown trigger type: %s", alarm_def.trigger_type)
        return False

    def _evaluate_analog(self, alarm_def: AlarmDefinition, entity_state: State) -> bool:
        """Evaluate analog threshold condition."""
        config = alarm_def.trigger_config
        op_str = config.get("operator", ">")
        threshold = config.get("threshold")

        if threshold is None:
            _LOGGER.warning("Alarm %s: no threshold configured", alarm_def.name)
            return False

        op_func = _OPERATORS.get(op_str)
        if op_func is None:
            _LOGGER.warning("Alarm %s: unknown operator '%s'", alarm_def.name, op_str)
            return False

        state_str = entity_state.state
        if state_str in ("unknown", "unavailable"):
            return False

        try:
            value = float(state_str)
        except (ValueError, TypeError):
            _LOGGER.warning(
                "Alarm %s: cannot parse '%s' as numeric",
                alarm_def.name,
                state_str,
            )
            return False

        return bool(op_func(value, float(threshold)))

    def _evaluate_digital(self, alarm_def: AlarmDefinition, entity_state: State) -> bool:
        """Evaluate digital state condition."""
        config = alarm_def.trigger_config
        target_state = config.get("target_state", "on")
        return entity_state.state == str(target_state)

    def _evaluate_custom(self, alarm_def: AlarmDefinition, entity_state: State) -> bool:
        """Evaluate custom state condition."""
        config = alarm_def.trigger_config

        match_values = config.get("match_values")
        if match_values is not None:
            return entity_state.state in match_values

        # Template evaluation is deferred to AlarmManager which has hass context
        template_str = config.get("template")
        if template_str is not None:
            _LOGGER.debug(
                "Alarm %s: template triggers require hass context, deferring",
                alarm_def.name,
            )
            return False

        _LOGGER.warning(
            "Alarm %s: custom trigger has no match_values or template",
            alarm_def.name,
        )
        return False

    def evaluate_template(
        self,
        alarm_def: AlarmDefinition,
        template_result: str,
    ) -> bool:
        """Evaluate a pre-rendered template result."""
        return template_result.lower() in ("true", "1", "yes", "on")

    def evaluate_condition_template(
        self,
        hass: HomeAssistant,
        alarm_def: AlarmDefinition,
    ) -> bool:
        """Evaluate an alarm's condition_template. Returns True if no template or template is truthy."""
        if not alarm_def.condition_template:
            return True

        try:
            tpl = Template(alarm_def.condition_template, hass)
            tpl.hass = hass
            result = tpl.async_render()
            return str(result).lower() in ("true", "1", "yes", "on")
        except Exception:
            _LOGGER.warning(
                "Alarm %s: condition_template evaluation failed: %s",
                alarm_def.name,
                alarm_def.condition_template,
            )
            return False
