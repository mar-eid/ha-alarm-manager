"""Alarm noise analysis — pure functions, no I/O.

Builds the "bad actor" report (ISA-18.2 / EEMUA 191 style) shown on the Noise tab from
lightweight event rows, alarm definitions and live runtime states.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any

from .const import (
    NOISE_CHATTER_COUNT,
    NOISE_CHATTER_WINDOW,
    NOISE_FLEETING_SECONDS,
    NOISE_STALE_HOURS,
    NOISE_TOP_COUNT,
    AlarmEventType,
    AlarmState,
)

if TYPE_CHECKING:
    from .models import AlarmDefinition, AlarmRuntimeState

# One event row: (alarm_id, timestamp, event_type, new_state)
NoiseRow = tuple[str, datetime, str, str | None]

ACTIVE_STATES = {AlarmState.ACTIVE_UNACKED.value, AlarmState.ACTIVE_ACKED.value}
DELETED_NAME = "Deleted alarm"


def _alarm_info(alarm_id: str, alarms: dict[str, AlarmDefinition]) -> dict[str, Any]:
    """Return the definition fields the frontend needs to label a row and suggest a fix."""
    alarm = alarms.get(alarm_id)
    if alarm is None:
        return {"alarm_id": alarm_id, "name": DELETED_NAME, "deleted": True}
    return {
        "alarm_id": alarm_id,
        "name": alarm.name,
        "deleted": False,
        "priority": int(alarm.priority),
        "area": alarm.area,
        "tag": alarm.tag,
        "source_entity_id": alarm.source_entity_id,
        "trigger_type": alarm.trigger_type.value,
        "hysteresis": alarm.hysteresis,
        "trigger_delay": alarm.trigger_delay,
        "clear_delay": alarm.clear_delay,
    }


def _chatter_bursts(times: list[datetime], count: int, window: float) -> tuple[int, int]:
    """Count chatter bursts and the largest burst in a sorted list of activation times.

    A burst is a run of activations where at least ``count`` fall within ``window`` seconds.
    Returns (number of bursts, largest number of activations within one window).
    """
    bursts = 0
    max_in_window = 0
    in_burst = False
    left = 0
    for right, ts in enumerate(times):
        while (ts - times[left]).total_seconds() > window:
            left += 1
        in_window = right - left + 1
        max_in_window = max(max_in_window, in_window)
        if in_window >= count:
            if not in_burst:
                bursts += 1
                in_burst = True
        elif in_window == 1:
            in_burst = False
    return bursts, max_in_window


def _active_durations(rows: list[NoiseRow]) -> list[float]:
    """Return the length in seconds of every completed active period for one alarm.

    A period starts at a TRIGGERED event and ends at the next event whose new state is
    not active (cleared, suppressed, shelved, disabled, reset). Acknowledging keeps it active.
    """
    durations: list[float] = []
    started: datetime | None = None
    for _alarm_id, ts, event_type, new_state in rows:
        if event_type == AlarmEventType.TRIGGERED.value:
            if started is None:
                started = ts
        elif started is not None and new_state is not None and new_state not in ACTIVE_STATES:
            durations.append((ts - started).total_seconds())
            started = None
    return durations


def compute_noise_report(
    rows: list[NoiseRow],
    alarms: dict[str, AlarmDefinition],
    runtime_states: dict[str, AlarmRuntimeState],
    disabled_since: dict[str, datetime],
    shelved_since: dict[str, datetime],
    now: datetime,
    hours: int,
) -> dict[str, Any]:
    """Build the noise report.

    Args:
        rows: Event rows since the period start, ordered by alarm, then time.
        alarms: Current alarm definitions by id.
        runtime_states: Live runtime states by id.
        disabled_since: Latest DISABLED event time per alarm (any age).
        shelved_since: Latest SHELVED event time per alarm (any age).
        now: Current time (timezone-aware UTC).
        hours: Length of the report period in hours.

    Returns:
        A JSON-serialisable dict with KPIs and the lists shown on the Noise tab.
    """
    start = now - timedelta(hours=hours)
    by_alarm: dict[str, list[NoiseRow]] = defaultdict(list)
    for row in rows:
        if row[1] >= start:
            by_alarm[row[0]].append(row)

    triggered: dict[str, list[datetime]] = {}
    suppressed: dict[str, int] = {}
    for alarm_id, alarm_rows in by_alarm.items():
        times = [ts for _a, ts, et, _n in alarm_rows if et == AlarmEventType.TRIGGERED.value]
        if times:
            triggered[alarm_id] = times
        n_suppressed = sum(1 for _a, _t, et, _n in alarm_rows if et == AlarmEventType.SUPPRESSED.value)
        if n_suppressed:
            suppressed[alarm_id] = n_suppressed

    total = sum(len(t) for t in triggered.values())

    # 1. Most frequent
    ranked = sorted(triggered.items(), key=lambda item: (-len(item[1]), item[0]))
    top = [
        {
            **_alarm_info(alarm_id, alarms),
            "count": len(times),
            "share": round(100 * len(times) / total, 1) if total else 0.0,
            "suppressed": suppressed.get(alarm_id, 0),
            "last": times[-1].isoformat(),
        }
        for alarm_id, times in ranked[:NOISE_TOP_COUNT]
    ]
    top_share = round(sum(r["count"] for r in top) * 100 / total, 1) if total else 0.0

    # 2. Standing (live, independent of the period)
    stale_seconds = NOISE_STALE_HOURS * 3600
    standing = []
    for alarm_id, runtime in runtime_states.items():
        if runtime.state.value not in ACTIVE_STATES or runtime.triggered_at is None:
            continue
        age = (now - runtime.triggered_at).total_seconds()
        standing.append(
            {
                **_alarm_info(alarm_id, alarms),
                "state": runtime.state.value,
                "since": runtime.triggered_at.isoformat(),
                "duration": int(age),
                "stale": age > stale_seconds,
            }
        )
    standing.sort(key=lambda r: -r["duration"])

    # 3. Chattering
    chattering = []
    for alarm_id, times in triggered.items():
        bursts, max_burst = _chatter_bursts(times, NOISE_CHATTER_COUNT, NOISE_CHATTER_WINDOW)
        if bursts:
            chattering.append(
                {**_alarm_info(alarm_id, alarms), "bursts": bursts, "max_burst": max_burst, "count": len(times)}
            )
    chattering.sort(key=lambda r: (-r["bursts"], -r["max_burst"], r["alarm_id"]))

    # 4. Fleeting
    fleeting = []
    for alarm_id, alarm_rows in by_alarm.items():
        durations = _active_durations(alarm_rows)
        short = [d for d in durations if d < NOISE_FLEETING_SECONDS]
        if short:
            fleeting.append(
                {
                    **_alarm_info(alarm_id, alarms),
                    "fleeting": len(short),
                    "activations": len(durations),
                    "shortest": round(min(short), 1),
                }
            )
    fleeting.sort(key=lambda r: (-r["fleeting"], r["alarm_id"]))

    # 5. Hidden (shelved or disabled now)
    hidden = []
    for alarm_id, alarm in alarms.items():
        runtime = runtime_states.get(alarm_id)
        if runtime is not None and runtime.state == AlarmState.SHELVED:
            since = shelved_since.get(alarm_id)
            hidden.append(
                {
                    **_alarm_info(alarm_id, alarms),
                    "kind": "shelved",
                    "since": since.isoformat() if since else None,
                    "until": runtime.shelved_until.isoformat() if runtime.shelved_until else None,
                }
            )
        elif not alarm.enabled or (runtime is not None and runtime.state == AlarmState.DISABLED):
            since = disabled_since.get(alarm_id)
            hidden.append(
                {
                    **_alarm_info(alarm_id, alarms),
                    "kind": "disabled",
                    "since": since.isoformat() if since else None,
                    "until": None,
                }
            )
    # Oldest first; unknown "since" last
    hidden.sort(key=lambda r: (r["since"] is None, r["since"] or "", r["alarm_id"]))

    return {
        "hours": hours,
        "start": start.isoformat(),
        "end": now.isoformat(),
        "thresholds": {
            "top_count": NOISE_TOP_COUNT,
            "chatter_count": NOISE_CHATTER_COUNT,
            "chatter_window": NOISE_CHATTER_WINDOW,
            "fleeting_seconds": NOISE_FLEETING_SECONDS,
            "stale_hours": NOISE_STALE_HOURS,
        },
        "kpis": {
            "activations": total,
            "per_day": round(total * 24 / hours, 1),
            "alarms_with_activations": len(triggered),
            "top_share": top_share,
            "suppressed": sum(suppressed.values()),
            "standing": len(standing),
            "stale": sum(1 for r in standing if r["stale"]),
            "chattering": len(chattering),
            "fleeting": len(fleeting),
            "hidden": len(hidden),
        },
        "top": top,
        "standing": standing,
        "chattering": chattering,
        "fleeting": fleeting,
        "hidden": hidden,
    }
