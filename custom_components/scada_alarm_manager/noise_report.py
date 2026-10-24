"""Alarm noise analysis — pure functions, no I/O.

Builds the "bad actor" report (ISA-18.2 / EEMUA 191 style) shown on the Noise tab from
lightweight event rows, alarm definitions and live runtime states.
"""

from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Any

from .const import (
    NOISE_CHATTER_COUNT,
    NOISE_CHATTER_WINDOW,
    NOISE_FLEETING_SECONDS,
    NOISE_FLOOD_COUNT,
    NOISE_FLOOD_WINDOW,
    NOISE_NEVER_DAYS,
    NOISE_PRIORITY_TARGETS,
    NOISE_STALE_HOURS,
    NOISE_TOP_COUNT,
    AlarmEventType,
    AlarmPriority,
    AlarmState,
)

if TYPE_CHECKING:
    from .models import AlarmDefinition, AlarmRuntimeState

# One event row: (alarm_id, timestamp, event_type, old_state, new_state)
NoiseRow = tuple[str, datetime, str, str | None, str | None]

ACTIVE_STATES = {AlarmState.ACTIVE_UNACKED.value, AlarmState.ACTIVE_ACKED.value}
DELETED_NAME = "Deleted alarm"

# Priority -> EEMUA band. Info and Warning are "low", High is "medium", Critical is "high".
PRIORITY_BANDS = {
    AlarmPriority.INFO: "low",
    AlarmPriority.WARNING: "low",
    AlarmPriority.HIGH: "medium",
    AlarmPriority.CRITICAL: "high",
}


@dataclass
class ActivePeriod:
    """One continuous active period of an alarm, clipped to the report window."""

    begin: datetime
    end: datetime
    clipped: bool  # began before the window start
    ongoing: bool  # still active at the window end

    @property
    def seconds(self) -> float:
        """Length of the period in seconds."""
        return (self.end - self.begin).total_seconds()


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


def _active_periods(
    rows: list[NoiseRow],
    runtime: AlarmRuntimeState | None,
    start: datetime,
    now: datetime,
) -> list[ActivePeriod]:
    """Return the active periods of one alarm within [start, now].

    A period starts at the first event whose new state is active (normally TRIGGERED) and
    ends at the next event whose new state is not active (cleared, suppressed, shelved,
    disabled, reset). Acknowledging keeps it active. A period that was already running
    at ``start`` (first event leaves an active state) is clipped to ``start``; one still
    running at the end is closed at ``now`` if the live runtime state agrees.
    """
    # Only state changes matter; created/updated/deleted events carry no state.
    rows = [r for r in rows if r[4] is not None]
    periods: list[ActivePeriod] = []
    began: datetime | None = None
    clipped = False
    for i, (_alarm_id, ts, _event_type, old_state, new_state) in enumerate(rows):
        if i == 0 and old_state in ACTIVE_STATES:
            began, clipped = start, True
        if new_state in ACTIVE_STATES:
            if began is None:
                began, clipped = ts, False
        elif new_state is not None and began is not None:
            periods.append(ActivePeriod(began, ts, clipped, False))
            began = None

    live_active = runtime is not None and runtime.state.value in ACTIVE_STATES
    if began is not None and live_active:
        periods.append(ActivePeriod(began, now, clipped, True))
    elif not rows and live_active and runtime is not None and runtime.triggered_at is not None:
        # Active for the whole window without any event in it.
        began = max(runtime.triggered_at, start)
        periods.append(ActivePeriod(began, now, runtime.triggered_at < start, True))
    return periods


def _floods(
    triggers: list[tuple[datetime, str]], count: int, window: float
) -> list[tuple[datetime, datetime, list[str]]]:
    """Find alarm floods in a time-sorted list of (timestamp, alarm_id) activations.

    A flood is the union of every ``window``-second span holding more than ``count``
    activations. Returns (first activation, last activation, alarm ids in order) per flood.
    """
    floods: list[tuple[datetime, datetime, list[str]]] = []
    span = timedelta(seconds=window)
    cur_start: int | None = None
    cur_end = -1
    right = 0
    for left in range(len(triggers)):
        right = max(right, left)
        while right + 1 < len(triggers) and triggers[right + 1][0] - triggers[left][0] <= span:
            right += 1
        if right - left + 1 > count:
            if cur_start is not None and left <= cur_end:
                cur_end = max(cur_end, right)
            else:
                if cur_start is not None:
                    floods.append(_flood_entry(triggers, cur_start, cur_end))
                cur_start, cur_end = left, right
    if cur_start is not None:
        floods.append(_flood_entry(triggers, cur_start, cur_end))
    return floods


def _flood_entry(triggers: list[tuple[datetime, str]], first: int, last: int) -> tuple[datetime, datetime, list[str]]:
    """Build one flood tuple from an index range of the activation list."""
    return triggers[first][0], triggers[last][0], [a for _ts, a in triggers[first : last + 1]]


def _band_split(counts: Counter[str]) -> dict[str, Any]:
    """Turn per-band counts into counts and percentages for low/medium/high."""
    total = sum(counts.values())
    return {
        "total": total,
        "bands": {
            band: {
                "count": counts.get(band, 0),
                "share": round(100 * counts.get(band, 0) / total, 1) if total else 0.0,
                "target": target,
            }
            for band, target in NOISE_PRIORITY_TARGETS.items()
        },
    }


def compute_noise_report(
    rows: list[NoiseRow],
    alarms: dict[str, AlarmDefinition],
    runtime_states: dict[str, AlarmRuntimeState],
    disabled_since: dict[str, datetime],
    shelved_since: dict[str, datetime],
    now: datetime,
    hours: int,
    last_triggered: dict[str, datetime] | None = None,
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
        last_triggered: Latest TRIGGERED event time per alarm (any age).

    Returns:
        A JSON-serialisable dict with KPIs and the lists shown on the Noise tab.
    """
    last_triggered = last_triggered or {}
    start = now - timedelta(hours=hours)
    period_seconds = hours * 3600
    by_alarm: dict[str, list[NoiseRow]] = defaultdict(list)
    for row in rows:
        if row[1] >= start:
            by_alarm[row[0]].append(row)

    triggered: dict[str, list[datetime]] = {}
    suppressed: dict[str, int] = {}
    for alarm_id, alarm_rows in by_alarm.items():
        times = [r[1] for r in alarm_rows if r[2] == AlarmEventType.TRIGGERED.value]
        if times:
            triggered[alarm_id] = times
        n_suppressed = sum(1 for r in alarm_rows if r[2] == AlarmEventType.SUPPRESSED.value)
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

    # 4. Fleeting + time in alarm (both from active periods)
    fleeting = []
    time_in_alarm = []
    for alarm_id in set(by_alarm) | set(runtime_states):
        periods = _active_periods(by_alarm.get(alarm_id, []), runtime_states.get(alarm_id), start, now)
        if not periods:
            continue
        complete = [p.seconds for p in periods if not p.clipped and not p.ongoing]
        short = [d for d in complete if d < NOISE_FLEETING_SECONDS]
        if short:
            fleeting.append(
                {
                    **_alarm_info(alarm_id, alarms),
                    "fleeting": len(short),
                    "activations": len(complete),
                    "shortest": round(min(short), 1),
                }
            )
        seconds = sum(p.seconds for p in periods)
        if seconds > 0:
            time_in_alarm.append(
                {
                    **_alarm_info(alarm_id, alarms),
                    "seconds": int(seconds),
                    "share": round(100 * seconds / period_seconds, 1),
                    "periods": len(periods),
                    "ongoing": periods[-1].ongoing,
                }
            )
    fleeting.sort(key=lambda r: (-r["fleeting"], r["alarm_id"]))
    time_in_alarm.sort(key=lambda r: (-r["seconds"], r["alarm_id"]))
    time_in_alarm = time_in_alarm[:NOISE_TOP_COUNT]

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

    # 6. Never triggered (enabled alarms older than the limit, independent of the period)
    never_cutoff = now - timedelta(days=NOISE_NEVER_DAYS)
    never = []
    for alarm_id, alarm in alarms.items():
        runtime = runtime_states.get(alarm_id)
        if not alarm.enabled or (runtime is not None and runtime.state == AlarmState.DISABLED):
            continue
        created = alarm.created_at if alarm.created_at.tzinfo else alarm.created_at.replace(tzinfo=UTC)
        if created > never_cutoff:
            continue
        last = last_triggered.get(alarm_id)
        if last is not None and last >= never_cutoff:
            continue
        never.append(
            {
                **_alarm_info(alarm_id, alarms),
                "last_triggered": last.isoformat() if last else None,
                "created_at": alarm.created_at.isoformat(),
            }
        )
    # Never-ever first, then oldest last activation
    never.sort(key=lambda r: (r["last_triggered"] is not None, r["last_triggered"] or "", r["name"]))

    # 7. Alarm floods (all alarms together)
    all_triggers = sorted((ts, alarm_id) for alarm_id, times in triggered.items() for ts in times)
    floods = []
    flood_seconds = 0.0
    for first, last, ids in _floods(all_triggers, NOISE_FLOOD_COUNT, NOISE_FLOOD_WINDOW):
        flood_seconds += (last - first).total_seconds()
        contributors = Counter(ids).most_common(3)
        floods.append(
            {
                "start": first.isoformat(),
                "end": last.isoformat(),
                "duration": int((last - first).total_seconds()),
                "count": len(ids),
                "alarms": len(set(ids)),
                "initiator": _alarm_info(ids[0], alarms),
                "top": [{**_alarm_info(a, alarms), "count": n} for a, n in contributors],
            }
        )
    floods.sort(key=lambda r: r["start"], reverse=True)

    # 8. Priority distribution (configured enabled alarms, and activations in the period)
    configured = Counter(PRIORITY_BANDS[alarm.priority] for alarm in alarms.values() if alarm.enabled)
    activated: Counter[str] = Counter()
    for alarm_id, times in triggered.items():
        if alarm_id in alarms:
            activated[PRIORITY_BANDS[alarms[alarm_id].priority]] += len(times)
    priority = {
        "configured": _band_split(configured),
        "activations": _band_split(activated),
        "by_priority": {
            int(p): sum(1 for a in alarms.values() if a.enabled and a.priority == p) for p in AlarmPriority
        },
    }

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
            "flood_count": NOISE_FLOOD_COUNT,
            "flood_window": NOISE_FLOOD_WINDOW,
            "never_days": NOISE_NEVER_DAYS,
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
            "floods": len(floods),
            "flood_share": round(100 * flood_seconds / period_seconds, 1),
            "never": len(never),
        },
        "top": top,
        "time_in_alarm": time_in_alarm,
        "standing": standing,
        "chattering": chattering,
        "fleeting": fleeting,
        "floods": floods,
        "priority": priority,
        "never": never,
        "hidden": hidden,
    }
