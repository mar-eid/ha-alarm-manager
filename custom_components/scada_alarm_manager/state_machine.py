"""SCADA alarm state machine.

Pure functions with no side effects. Given a current state, an action,
and alarm definition flags, returns the new state and a list of events.
"""

from __future__ import annotations

from dataclasses import replace
from datetime import datetime, timedelta, timezone

from .const import AlarmEventType, AlarmState
from .models import AlarmDefinition, AlarmEvent, AlarmRuntimeState


class InvalidTransitionError(Exception):
    """Raised when a state transition is not valid."""


def _now() -> datetime:
    return datetime.now(timezone.utc)


def condition_met(
    runtime: AlarmRuntimeState,
    alarm_def: AlarmDefinition,
    value: str | None = None,
    *,
    now: datetime | None = None,
) -> tuple[AlarmRuntimeState, list[AlarmEvent]]:
    """Handle alarm condition becoming true (trigger fired)."""
    ts = now or _now()
    events: list[AlarmEvent] = []

    if runtime.state == AlarmState.DISABLED:
        return runtime, events

    if runtime.state == AlarmState.SHELVED:
        return replace(runtime, last_value=value), events

    if runtime.state in (AlarmState.ACTIVE_UNACKED, AlarmState.ACTIVE_ACKED):
        return replace(runtime, last_value=value), events

    if runtime.state == AlarmState.RTN_UNACKED:
        new_runtime = replace(
            runtime,
            state=AlarmState.ACTIVE_UNACKED,
            triggered_at=ts,
            last_value=value,
        )
        events.append(
            AlarmEvent(
                alarm_id=runtime.alarm_id,
                event_type=AlarmEventType.TRIGGERED,
                timestamp=ts,
                old_state=AlarmState.RTN_UNACKED,
                new_state=AlarmState.ACTIVE_UNACKED,
            )
        )
        return new_runtime, events

    # NORMAL -> ACTIVE_UNACKED
    if runtime.state == AlarmState.NORMAL:
        new_runtime = replace(
            runtime,
            state=AlarmState.ACTIVE_UNACKED,
            triggered_at=ts,
            acked_at=None,
            acked_by=None,
            last_value=value,
        )
        events.append(
            AlarmEvent(
                alarm_id=runtime.alarm_id,
                event_type=AlarmEventType.TRIGGERED,
                timestamp=ts,
                old_state=AlarmState.NORMAL,
                new_state=AlarmState.ACTIVE_UNACKED,
            )
        )
        return new_runtime, events

    return runtime, events


def condition_cleared(
    runtime: AlarmRuntimeState,
    alarm_def: AlarmDefinition,
    value: str | None = None,
    *,
    now: datetime | None = None,
) -> tuple[AlarmRuntimeState, list[AlarmEvent]]:
    """Handle alarm condition becoming false (trigger cleared)."""
    ts = now or _now()
    events: list[AlarmEvent] = []

    if runtime.state in (AlarmState.NORMAL, AlarmState.DISABLED, AlarmState.SHELVED):
        return replace(runtime, last_value=value), events

    if runtime.state == AlarmState.RTN_UNACKED:
        return replace(runtime, last_value=value), events

    if runtime.state == AlarmState.ACTIVE_UNACKED:
        if alarm_def.ack_required:
            new_runtime = replace(
                runtime,
                state=AlarmState.RTN_UNACKED,
                last_value=value,
            )
            events.append(
                AlarmEvent(
                    alarm_id=runtime.alarm_id,
                    event_type=AlarmEventType.CLEARED,
                    timestamp=ts,
                    old_state=AlarmState.ACTIVE_UNACKED,
                    new_state=AlarmState.RTN_UNACKED,
                )
            )
        else:
            new_runtime = replace(
                runtime,
                state=AlarmState.NORMAL,
                triggered_at=None,
                last_value=value,
            )
            events.append(
                AlarmEvent(
                    alarm_id=runtime.alarm_id,
                    event_type=AlarmEventType.CLEARED,
                    timestamp=ts,
                    old_state=AlarmState.ACTIVE_UNACKED,
                    new_state=AlarmState.NORMAL,
                )
            )
        return new_runtime, events

    if runtime.state == AlarmState.ACTIVE_ACKED:
        if alarm_def.latching and not alarm_def.auto_clear:
            # Latching alarm stays active until manually reset
            return replace(runtime, last_value=value), events

        new_runtime = replace(
            runtime,
            state=AlarmState.NORMAL,
            triggered_at=None,
            acked_at=None,
            acked_by=None,
            last_value=value,
        )
        events.append(
            AlarmEvent(
                alarm_id=runtime.alarm_id,
                event_type=AlarmEventType.CLEARED,
                timestamp=ts,
                old_state=AlarmState.ACTIVE_ACKED,
                new_state=AlarmState.NORMAL,
            )
        )
        return new_runtime, events

    return runtime, events


def acknowledge(
    runtime: AlarmRuntimeState,
    user: str | None = None,
    *,
    now: datetime | None = None,
) -> tuple[AlarmRuntimeState, list[AlarmEvent]]:
    """Acknowledge an alarm."""
    ts = now or _now()
    events: list[AlarmEvent] = []

    if runtime.state == AlarmState.ACTIVE_UNACKED:
        new_runtime = replace(
            runtime,
            state=AlarmState.ACTIVE_ACKED,
            acked_at=ts,
            acked_by=user,
        )
        events.append(
            AlarmEvent(
                alarm_id=runtime.alarm_id,
                event_type=AlarmEventType.ACKNOWLEDGED,
                timestamp=ts,
                old_state=AlarmState.ACTIVE_UNACKED,
                new_state=AlarmState.ACTIVE_ACKED,
                user=user,
            )
        )
        return new_runtime, events

    if runtime.state == AlarmState.RTN_UNACKED:
        new_runtime = replace(
            runtime,
            state=AlarmState.NORMAL,
            triggered_at=None,
            acked_at=ts,
            acked_by=user,
        )
        events.append(
            AlarmEvent(
                alarm_id=runtime.alarm_id,
                event_type=AlarmEventType.ACKNOWLEDGED,
                timestamp=ts,
                old_state=AlarmState.RTN_UNACKED,
                new_state=AlarmState.NORMAL,
                user=user,
            )
        )
        return new_runtime, events

    return runtime, events


def shelve(
    runtime: AlarmRuntimeState,
    duration_minutes: int,
    user: str | None = None,
    *,
    now: datetime | None = None,
) -> tuple[AlarmRuntimeState, list[AlarmEvent]]:
    """Shelve an alarm for a specified duration."""
    ts = now or _now()
    events: list[AlarmEvent] = []

    if runtime.state in (AlarmState.DISABLED, AlarmState.SHELVED):
        return runtime, events

    new_runtime = replace(
        runtime,
        state=AlarmState.SHELVED,
        previous_state=runtime.state,
        shelved_until=ts + timedelta(minutes=duration_minutes),
    )
    events.append(
        AlarmEvent(
            alarm_id=runtime.alarm_id,
            event_type=AlarmEventType.SHELVED,
            timestamp=ts,
            old_state=runtime.state,
            new_state=AlarmState.SHELVED,
            user=user,
            details={"duration_minutes": duration_minutes},
        )
    )
    return new_runtime, events


def unshelve(
    runtime: AlarmRuntimeState,
    user: str | None = None,
    *,
    now: datetime | None = None,
) -> tuple[AlarmRuntimeState, list[AlarmEvent]]:
    """Remove shelve from an alarm."""
    ts = now or _now()
    events: list[AlarmEvent] = []

    if runtime.state != AlarmState.SHELVED:
        return runtime, events

    restore_state = runtime.previous_state or AlarmState.NORMAL
    new_runtime = replace(
        runtime,
        state=restore_state,
        previous_state=None,
        shelved_until=None,
    )
    events.append(
        AlarmEvent(
            alarm_id=runtime.alarm_id,
            event_type=AlarmEventType.UNSHELVED,
            timestamp=ts,
            old_state=AlarmState.SHELVED,
            new_state=restore_state,
            user=user,
        )
    )
    return new_runtime, events


def disable(
    runtime: AlarmRuntimeState,
    user: str | None = None,
    *,
    now: datetime | None = None,
) -> tuple[AlarmRuntimeState, list[AlarmEvent]]:
    """Disable an alarm."""
    ts = now or _now()
    events: list[AlarmEvent] = []

    if runtime.state == AlarmState.DISABLED:
        return runtime, events

    new_runtime = replace(
        runtime,
        state=AlarmState.DISABLED,
        previous_state=runtime.state,
        triggered_at=None,
        acked_at=None,
        acked_by=None,
        shelved_until=None,
    )
    events.append(
        AlarmEvent(
            alarm_id=runtime.alarm_id,
            event_type=AlarmEventType.DISABLED,
            timestamp=ts,
            old_state=runtime.state,
            new_state=AlarmState.DISABLED,
            user=user,
        )
    )
    return new_runtime, events


def enable(
    runtime: AlarmRuntimeState,
    user: str | None = None,
    *,
    now: datetime | None = None,
) -> tuple[AlarmRuntimeState, list[AlarmEvent]]:
    """Enable a disabled alarm. Caller should re-evaluate trigger after this."""
    ts = now or _now()
    events: list[AlarmEvent] = []

    if runtime.state != AlarmState.DISABLED:
        return runtime, events

    new_runtime = replace(
        runtime,
        state=AlarmState.NORMAL,
        previous_state=None,
    )
    events.append(
        AlarmEvent(
            alarm_id=runtime.alarm_id,
            event_type=AlarmEventType.ENABLED,
            timestamp=ts,
            old_state=AlarmState.DISABLED,
            new_state=AlarmState.NORMAL,
            user=user,
        )
    )
    return new_runtime, events


def reset(
    runtime: AlarmRuntimeState,
    alarm_def: AlarmDefinition,
    condition_active: bool,
    user: str | None = None,
    *,
    now: datetime | None = None,
) -> tuple[AlarmRuntimeState, list[AlarmEvent]]:
    """Reset a latched alarm. Only works if condition has cleared."""
    ts = now or _now()
    events: list[AlarmEvent] = []

    if condition_active:
        return runtime, events

    if runtime.state not in (AlarmState.ACTIVE_UNACKED, AlarmState.ACTIVE_ACKED):
        return runtime, events

    if not alarm_def.latching:
        return runtime, events

    new_runtime = replace(
        runtime,
        state=AlarmState.NORMAL,
        triggered_at=None,
        acked_at=None,
        acked_by=None,
    )
    events.append(
        AlarmEvent(
            alarm_id=runtime.alarm_id,
            event_type=AlarmEventType.RESET,
            timestamp=ts,
            old_state=runtime.state,
            new_state=AlarmState.NORMAL,
            user=user,
        )
    )
    return new_runtime, events
