"""Tests for the alarm noise analysis (F21)."""

from __future__ import annotations

import tempfile
from datetime import UTC, datetime, timedelta
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest
import voluptuous as vol

from custom_components.scada_alarm_manager.const import (
    DOMAIN,
    AlarmEventType,
    AlarmPriority,
    AlarmState,
    TriggerType,
)
from custom_components.scada_alarm_manager.database import AlarmDatabase
from custom_components.scada_alarm_manager.models import (
    AlarmDefinition,
    AlarmEvent,
    AlarmRuntimeState,
)
from custom_components.scada_alarm_manager.noise_report import (
    _chatter_bursts,
    compute_noise_report,
)
from custom_components.scada_alarm_manager.websocket_api import ws_noise_report

NOW = datetime(2026, 10, 24, 12, 0, tzinfo=UTC)
T = AlarmEventType.TRIGGERED.value
C = AlarmEventType.CLEARED.value
A = AlarmEventType.ACKNOWLEDGED.value
S = AlarmEventType.SUPPRESSED.value
ACTIVE = AlarmState.ACTIVE_UNACKED.value
ACKED = AlarmState.ACTIVE_ACKED.value
RTN = AlarmState.RTN_UNACKED.value
NORMAL = AlarmState.NORMAL.value


def _alarm(alarm_id: str, **kwargs) -> AlarmDefinition:
    return AlarmDefinition(
        id=alarm_id,
        name=f"Alarm {alarm_id}",
        source_entity_id=f"sensor.{alarm_id}",
        trigger_type=TriggerType.ANALOG,
        trigger_config={"operator": ">", "threshold": 50},
        priority=AlarmPriority.WARNING,
        **kwargs,
    )


def _ago(**kwargs) -> datetime:
    return NOW - timedelta(**kwargs)


def _report(rows, alarms, runtimes=None, disabled=None, shelved=None, hours=168):
    return compute_noise_report(rows, alarms, runtimes or {}, disabled or {}, shelved or {}, NOW, hours)


def _scenario():
    """Rows and alarms covering every list once."""
    alarms = {aid: _alarm(aid) for aid in ("chatty", "fleet", "stand", "supp", "quiet")}
    rows = []
    # chatty: 5 triggers within 40 s, each cleared after 9.5 s (so also fleeting)
    base = _ago(hours=2)
    for i in range(5):
        rows.append(("chatty", base + timedelta(seconds=i * 10), T, ACTIVE))
        rows.append(("chatty", base + timedelta(seconds=i * 10 + 9.5), C, RTN))
    # fleet: one 3 s activation, one 5 min activation (acknowledge in between keeps it active)
    rows.append(("fleet", _ago(hours=5), T, ACTIVE))
    rows.append(("fleet", _ago(hours=5) + timedelta(seconds=3), C, RTN))
    rows.append(("fleet", _ago(hours=4), T, ACTIVE))
    rows.append(("fleet", _ago(hours=4) + timedelta(seconds=2), A, ACKED))
    rows.append(("fleet", _ago(hours=4) + timedelta(minutes=5), C, NORMAL))
    # supp: suppressed 10 times, never triggered
    rows.extend(("supp", _ago(hours=3, minutes=i), S, NORMAL) for i in range(10))
    # deleted alarm triggered twice
    rows.append(("gone", _ago(hours=1), T, ACTIVE))
    rows.append(("gone", _ago(minutes=30), T, ACTIVE))
    rows.sort(key=lambda r: (r[0], r[1]))
    runtimes = {
        "stand": AlarmRuntimeState(alarm_id="stand", state=AlarmState.ACTIVE_ACKED, triggered_at=_ago(hours=30)),
        "quiet": AlarmRuntimeState(alarm_id="quiet", state=AlarmState.NORMAL),
    }
    return rows, alarms, runtimes


class TestComputeNoiseReport:
    """Pure-function tests for compute_noise_report."""

    def test_top_counts_only_triggered(self):
        rows, alarms, runtimes = _scenario()
        report = _report(rows, alarms, runtimes)

        counts = {r["alarm_id"]: r["count"] for r in report["top"]}
        assert counts == {"chatty": 5, "fleet": 2, "gone": 2}
        assert "supp" not in counts
        assert report["kpis"]["activations"] == 9
        assert report["kpis"]["suppressed"] == 10
        assert report["top"][0]["alarm_id"] == "chatty"
        assert report["top"][0]["share"] == pytest.approx(55.6)
        assert report["kpis"]["top_share"] == 100.0

    def test_deleted_alarm_is_labelled(self):
        rows, alarms, runtimes = _scenario()
        report = _report(rows, alarms, runtimes)

        gone = next(r for r in report["top"] if r["alarm_id"] == "gone")
        assert gone["name"] == "Deleted alarm"
        assert gone["deleted"] is True
        assert "priority" not in gone

    def test_chattering(self):
        rows, alarms, runtimes = _scenario()
        report = _report(rows, alarms, runtimes)

        assert [r["alarm_id"] for r in report["chattering"]] == ["chatty"]
        assert report["chattering"][0]["bursts"] == 1
        assert report["chattering"][0]["max_burst"] == 5

    def test_fleeting(self):
        rows, alarms, runtimes = _scenario()
        report = _report(rows, alarms, runtimes)

        assert [r["alarm_id"] for r in report["fleeting"]] == ["chatty", "fleet"]
        fleet = next(r for r in report["fleeting"] if r["alarm_id"] == "fleet")
        assert fleet["fleeting"] == 1
        assert fleet["activations"] == 2
        assert fleet["shortest"] == 3.0

    def test_fleeting_ends_on_suppression(self):
        rows = [("x", _ago(hours=1), T, ACTIVE), ("x", _ago(hours=1) + timedelta(seconds=2), S, NORMAL)]
        report = _report(rows, {"x": _alarm("x")})
        assert report["fleeting"][0]["alarm_id"] == "x"

    def test_standing_and_stale(self):
        rows, alarms, runtimes = _scenario()
        runtimes["new"] = AlarmRuntimeState(alarm_id="new", state=AlarmState.ACTIVE_UNACKED, triggered_at=_ago(hours=1))
        report = _report(rows, alarms, runtimes)

        assert [r["alarm_id"] for r in report["standing"]] == ["stand", "new"]
        assert report["standing"][0]["stale"] is True
        assert report["standing"][0]["duration"] == 30 * 3600
        assert report["standing"][1]["stale"] is False
        assert report["kpis"]["stale"] == 1

    def test_hidden(self):
        alarms = {"sh": _alarm("sh"), "dis": _alarm("dis", enabled=False), "ok": _alarm("ok")}
        runtimes = {
            "sh": AlarmRuntimeState(alarm_id="sh", state=AlarmState.SHELVED, shelved_until=NOW + timedelta(hours=1)),
            "dis": AlarmRuntimeState(alarm_id="dis", state=AlarmState.DISABLED),
        }
        report = _report([], alarms, runtimes, disabled={"dis": _ago(days=40)}, shelved={"sh": _ago(minutes=5)})

        assert [(r["alarm_id"], r["kind"]) for r in report["hidden"]] == [("dis", "disabled"), ("sh", "shelved")]
        assert report["hidden"][1]["until"] == (NOW + timedelta(hours=1)).isoformat()

    def test_rows_before_period_are_ignored(self):
        rows = [("old", _ago(hours=30), T, ACTIVE), ("new", _ago(hours=2), T, ACTIVE)]
        report = _report(rows, {}, hours=24)
        assert [r["alarm_id"] for r in report["top"]] == ["new"]
        assert report["kpis"]["per_day"] == 1.0

    def test_empty(self):
        report = _report([], {})
        assert report["kpis"]["activations"] == 0
        assert report["kpis"]["top_share"] == 0.0
        assert report["top"] == []

    def test_top_limited_to_ten(self):
        rows = [(f"a{i:02d}", _ago(hours=1), T, ACTIVE) for i in range(15)]
        assert len(_report(rows, {})["top"]) == 10


class TestChatterBursts:
    """Tests for the sliding-window chatter detection."""

    def test_separate_bursts(self):
        times = [_ago(hours=2) + timedelta(seconds=s) for s in (0, 10, 20)]
        times += [_ago(hours=1) + timedelta(seconds=s) for s in (0, 5, 10, 15)]
        assert _chatter_bursts(times, 3, 60) == (2, 4)

    def test_spread_out_is_not_chatter(self):
        times = [_ago(hours=1) + timedelta(seconds=s) for s in (0, 61, 122, 183)]
        assert _chatter_bursts(times, 3, 60) == (0, 1)


class TestNoiseDatabase:
    """Tests for the noise queries in AlarmDatabase."""

    @pytest.fixture
    async def db(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            database = AlarmDatabase(Path(tmpdir) / "test.db")
            await database.async_init()
            yield database
            await database.async_close()

    async def test_noise_rows_unlimited_and_ordered(self, db):
        for i in range(600):
            await db.async_log_event(
                AlarmEvent(alarm_id="b" if i % 2 else "a", event_type=AlarmEventType.TRIGGERED, timestamp=_ago(seconds=i))
            )
        await db.async_log_event(AlarmEvent(alarm_id="a", event_type=AlarmEventType.TRIGGERED, timestamp=_ago(days=10)))

        rows = await db.async_get_noise_rows(_ago(days=1))

        assert len(rows) == 600
        assert rows[0][0] == "a"
        assert rows[0][1] < rows[1][1]
        assert rows[-1][0] == "b"

    async def test_latest_event_times(self, db):
        for days in (5, 2):
            await db.async_log_event(
                AlarmEvent(alarm_id="a", event_type=AlarmEventType.DISABLED, timestamp=_ago(days=days))
            )
        await db.async_log_event(AlarmEvent(alarm_id="b", event_type=AlarmEventType.SHELVED, timestamp=_ago(days=1)))

        disabled = await db.async_get_latest_event_times(AlarmEventType.DISABLED)

        assert disabled == {"a": _ago(days=2)}


class TestNoiseReportWS:
    """Tests for the scada_alarm_manager/noise_report WS command."""

    async def test_returns_report(self):
        manager = MagicMock()
        manager.alarms = {"x": _alarm("x")}
        manager.runtime_states = {}
        manager._database = AsyncMock()
        manager._database.async_get_noise_rows = AsyncMock(
            return_value=[("x", datetime.now(UTC) - timedelta(hours=1), T, ACTIVE)]
        )
        manager._database.async_get_latest_event_times = AsyncMock(return_value={})
        hass = MagicMock()
        hass.data = {DOMAIN: {"entry": {"manager": manager}}}
        conn = MagicMock()

        handler = getattr(ws_noise_report, "__wrapped__", ws_noise_report)
        await handler(hass, conn, {"id": 7, "type": "scada_alarm_manager/noise_report", "hours": 24})

        msg_id, report = conn.send_result.call_args[0]
        assert msg_id == 7
        assert report["hours"] == 24
        assert report["top"][0]["alarm_id"] == "x"
        start = manager._database.async_get_noise_rows.call_args[0][0]
        assert timedelta(hours=23.9) < datetime.now(UTC) - start < timedelta(hours=24.1)

    def test_schema_validates_hours(self):
        schema = ws_noise_report._ws_schema
        base = {"id": 1, "type": "scada_alarm_manager/noise_report"}
        assert schema(base)["hours"] == 168
        with pytest.raises(vol.Invalid):
            schema({**base, "hours": 0})
        with pytest.raises(vol.Invalid):
            schema({**base, "hours": 9000})
