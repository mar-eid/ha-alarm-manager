"""SQLite database layer for SCADA Alarm Manager."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import aiosqlite

from .const import AlarmEventType, AlarmPriority, AlarmState, TriggerType
from .models import AlarmChannel, AlarmDefinition, AlarmEvent

_LOGGER = logging.getLogger(__name__)

SCHEMA_VERSION = 3

CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS alarm_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    priority INTEGER NOT NULL DEFAULT 1,
    area TEXT NOT NULL DEFAULT '',
    equipment TEXT NOT NULL DEFAULT '',
    tag TEXT NOT NULL DEFAULT '',
    channel_id TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    latching INTEGER NOT NULL DEFAULT 0,
    ack_required INTEGER NOT NULL DEFAULT 1,
    auto_clear INTEGER NOT NULL DEFAULT 1,
    condition_template TEXT,
    repeat_interval INTEGER,
    escalation_delay INTEGER,
    source_entity_id TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    trigger_config TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alarm_channels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    notification_targets TEXT NOT NULL DEFAULT '[]',
    min_priority INTEGER NOT NULL DEFAULT 0,
    persistent_notification INTEGER NOT NULL DEFAULT 1,
    mobile_push INTEGER NOT NULL DEFAULT 1,
    critical_notification INTEGER NOT NULL DEFAULT 0,
    repeat_cadence INTEGER,
    escalation_target TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alarm_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alarm_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    event_type TEXT NOT NULL,
    old_state TEXT,
    new_state TEXT,
    user TEXT,
    details TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_events_alarm_id ON alarm_events(alarm_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON alarm_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON alarm_events(event_type);

CREATE TABLE IF NOT EXISTS alarm_runtime_states (
    alarm_id TEXT PRIMARY KEY,
    state TEXT NOT NULL DEFAULT 'normal',
    triggered_at TEXT,
    acked_at TEXT,
    acked_by TEXT,
    shelved_until TEXT,
    previous_state TEXT,
    last_notification_at TEXT,
    last_value TEXT
);
"""


class AlarmDatabase:
    """Async SQLite database for alarm data."""

    def __init__(self, db_path: str | Path) -> None:
        self._db_path = Path(db_path)
        self._db: aiosqlite.Connection | None = None

    async def async_init(self) -> None:
        """Initialize database connection and schema."""
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._db = await aiosqlite.connect(str(self._db_path))
        self._db.row_factory = aiosqlite.Row

        # Enable WAL mode for concurrent read safety
        await self._db.execute("PRAGMA journal_mode=WAL")
        await self._db.execute("PRAGMA foreign_keys=ON")

        await self._db.executescript(CREATE_TABLES_SQL)

        # Check and set schema version
        async with self._db.execute("SELECT COUNT(*) FROM schema_version") as cursor:
            row = await cursor.fetchone()
            if row[0] == 0:
                await self._db.execute(
                    "INSERT INTO schema_version (version) VALUES (?)",
                    (SCHEMA_VERSION,),
                )

        # Run migrations
        await self._async_migrate()

        await self._db.commit()
        _LOGGER.debug("Database initialized at %s", self._db_path)

    async def _async_migrate(self) -> None:
        """Run database migrations."""
        async with self._db.execute("SELECT version FROM schema_version") as cursor:
            row = await cursor.fetchone()
            current = row[0] if row else 1

        if current < 2:
            # v2: add condition_template column
            try:
                await self._db.execute(
                    "ALTER TABLE alarm_definitions ADD COLUMN condition_template TEXT"
                )
                _LOGGER.info("Migrated database to schema v2: added condition_template")
            except Exception:
                pass  # Column already exists (fresh install)
            await self._db.execute(
                "UPDATE schema_version SET version = ?", (2,)
            )
            current = 2

        if current < 3:
            # v3: alarm_runtime_states table (persists across restarts)
            await self._db.execute("""
                CREATE TABLE IF NOT EXISTS alarm_runtime_states (
                    alarm_id TEXT PRIMARY KEY,
                    state TEXT NOT NULL DEFAULT 'normal',
                    triggered_at TEXT,
                    acked_at TEXT,
                    acked_by TEXT,
                    shelved_until TEXT,
                    previous_state TEXT,
                    last_notification_at TEXT,
                    last_value TEXT
                )
            """)
            await self._db.execute(
                "UPDATE schema_version SET version = ?", (3,)
            )
            _LOGGER.info("Migrated database to schema v3: added alarm_runtime_states table")

    async def async_close(self) -> None:
        """Close database connection."""
        if self._db:
            await self._db.close()
            self._db = None

    @property
    def _conn(self) -> aiosqlite.Connection:
        if self._db is None:
            raise RuntimeError("Database not initialized")
        return self._db

    # --- Alarm Definition CRUD ---

    async def async_create_alarm(self, alarm: AlarmDefinition) -> None:
        """Insert a new alarm definition."""
        await self._conn.execute(
            """INSERT INTO alarm_definitions
            (id, name, description, priority, area, equipment, tag, channel_id,
             enabled, latching, ack_required, auto_clear, condition_template,
             repeat_interval, escalation_delay, source_entity_id, trigger_type,
             trigger_config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                alarm.id,
                alarm.name,
                alarm.description,
                alarm.priority.value,
                alarm.area,
                alarm.equipment,
                alarm.tag,
                alarm.channel_id,
                int(alarm.enabled),
                int(alarm.latching),
                int(alarm.ack_required),
                int(alarm.auto_clear),
                alarm.condition_template,
                alarm.repeat_interval,
                alarm.escalation_delay,
                alarm.source_entity_id,
                alarm.trigger_type.value,
                json.dumps(alarm.trigger_config),
                alarm.created_at.isoformat(),
                alarm.updated_at.isoformat(),
            ),
        )
        await self._conn.commit()

    async def async_update_alarm(self, alarm: AlarmDefinition) -> None:
        """Update an existing alarm definition."""
        alarm.updated_at = datetime.now(timezone.utc)
        await self._conn.execute(
            """UPDATE alarm_definitions SET
            name=?, description=?, priority=?, area=?, equipment=?, tag=?,
            channel_id=?, enabled=?, latching=?, ack_required=?, auto_clear=?,
            condition_template=?, repeat_interval=?, escalation_delay=?,
            source_entity_id=?, trigger_type=?, trigger_config=?, updated_at=?
            WHERE id=?""",
            (
                alarm.name,
                alarm.description,
                alarm.priority.value,
                alarm.area,
                alarm.equipment,
                alarm.tag,
                alarm.channel_id,
                int(alarm.enabled),
                int(alarm.latching),
                int(alarm.ack_required),
                int(alarm.auto_clear),
                alarm.condition_template,
                alarm.repeat_interval,
                alarm.escalation_delay,
                alarm.source_entity_id,
                alarm.trigger_type.value,
                json.dumps(alarm.trigger_config),
                alarm.updated_at.isoformat(),
                alarm.id,
            ),
        )
        await self._conn.commit()

    async def async_delete_alarm(self, alarm_id: str) -> None:
        """Delete an alarm definition."""
        await self._conn.execute("DELETE FROM alarm_definitions WHERE id=?", (alarm_id,))
        await self._conn.commit()

    async def async_get_alarm(self, alarm_id: str) -> AlarmDefinition | None:
        """Get a single alarm definition by ID."""
        async with self._conn.execute(
            "SELECT * FROM alarm_definitions WHERE id=?", (alarm_id,)
        ) as cursor:
            row = await cursor.fetchone()
            if row is None:
                return None
            return self._row_to_alarm(row)

    async def async_list_alarms(self) -> list[AlarmDefinition]:
        """List all alarm definitions."""
        async with self._conn.execute(
            "SELECT * FROM alarm_definitions ORDER BY name"
        ) as cursor:
            rows = await cursor.fetchall()
            return [self._row_to_alarm(row) for row in rows]

    def _row_to_alarm(self, row: aiosqlite.Row) -> AlarmDefinition:
        """Convert a database row to AlarmDefinition."""
        return AlarmDefinition(
            id=row["id"],
            name=row["name"],
            description=row["description"],
            priority=AlarmPriority(row["priority"]),
            area=row["area"],
            equipment=row["equipment"],
            tag=row["tag"],
            channel_id=row["channel_id"],
            enabled=bool(row["enabled"]),
            latching=bool(row["latching"]),
            ack_required=bool(row["ack_required"]),
            auto_clear=bool(row["auto_clear"]),
            condition_template=row["condition_template"],
            repeat_interval=row["repeat_interval"],
            escalation_delay=row["escalation_delay"],
            source_entity_id=row["source_entity_id"],
            trigger_type=TriggerType(row["trigger_type"]),
            trigger_config=json.loads(row["trigger_config"]),
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
        )

    # --- Alarm Channel CRUD ---

    async def async_create_channel(self, channel: AlarmChannel) -> None:
        """Insert a new alarm channel."""
        await self._conn.execute(
            """INSERT INTO alarm_channels
            (id, name, notification_targets, min_priority, persistent_notification,
             mobile_push, critical_notification, repeat_cadence, escalation_target,
             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                channel.id,
                channel.name,
                json.dumps(channel.notification_targets),
                channel.min_priority.value,
                int(channel.persistent_notification),
                int(channel.mobile_push),
                int(channel.critical_notification),
                channel.repeat_cadence,
                channel.escalation_target,
                channel.created_at.isoformat(),
                channel.updated_at.isoformat(),
            ),
        )
        await self._conn.commit()

    async def async_update_channel(self, channel: AlarmChannel) -> None:
        """Update an existing alarm channel."""
        channel.updated_at = datetime.now(timezone.utc)
        await self._conn.execute(
            """UPDATE alarm_channels SET
            name=?, notification_targets=?, min_priority=?, persistent_notification=?,
            mobile_push=?, critical_notification=?, repeat_cadence=?,
            escalation_target=?, updated_at=?
            WHERE id=?""",
            (
                channel.name,
                json.dumps(channel.notification_targets),
                channel.min_priority.value,
                int(channel.persistent_notification),
                int(channel.mobile_push),
                int(channel.critical_notification),
                channel.repeat_cadence,
                channel.escalation_target,
                channel.updated_at.isoformat(),
                channel.id,
            ),
        )
        await self._conn.commit()

    async def async_delete_channel(self, channel_id: str) -> None:
        """Delete an alarm channel."""
        await self._conn.execute("DELETE FROM alarm_channels WHERE id=?", (channel_id,))
        await self._conn.commit()

    async def async_get_channel(self, channel_id: str) -> AlarmChannel | None:
        """Get a single alarm channel by ID."""
        async with self._conn.execute(
            "SELECT * FROM alarm_channels WHERE id=?", (channel_id,)
        ) as cursor:
            row = await cursor.fetchone()
            if row is None:
                return None
            return self._row_to_channel(row)

    async def async_list_channels(self) -> list[AlarmChannel]:
        """List all alarm channels."""
        async with self._conn.execute(
            "SELECT * FROM alarm_channels ORDER BY name"
        ) as cursor:
            rows = await cursor.fetchall()
            return [self._row_to_channel(row) for row in rows]

    def _row_to_channel(self, row: aiosqlite.Row) -> AlarmChannel:
        """Convert a database row to AlarmChannel."""
        return AlarmChannel(
            id=row["id"],
            name=row["name"],
            notification_targets=json.loads(row["notification_targets"]),
            min_priority=AlarmPriority(row["min_priority"]),
            persistent_notification=bool(row["persistent_notification"]),
            mobile_push=bool(row["mobile_push"]),
            critical_notification=bool(row["critical_notification"]),
            repeat_cadence=row["repeat_cadence"],
            escalation_target=row["escalation_target"],
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
        )

    # --- Alarm Events ---

    async def async_log_event(self, event: AlarmEvent) -> None:
        """Insert an alarm event."""
        await self._conn.execute(
            """INSERT INTO alarm_events
            (alarm_id, timestamp, event_type, old_state, new_state, user, details)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                event.alarm_id,
                event.timestamp.isoformat(),
                event.event_type.value,
                event.old_state.value if event.old_state else None,
                event.new_state.value if event.new_state else None,
                event.user,
                json.dumps(event.details),
            ),
        )
        await self._conn.commit()

    async def async_get_events(
        self,
        alarm_id: str | None = None,
        event_type: AlarmEventType | None = None,
        start: datetime | None = None,
        end: datetime | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[AlarmEvent]:
        """Query alarm events with optional filters."""
        conditions: list[str] = []
        params: list[Any] = []

        if alarm_id is not None:
            conditions.append("alarm_id = ?")
            params.append(alarm_id)
        if event_type is not None:
            conditions.append("event_type = ?")
            params.append(event_type.value)
        if start is not None:
            conditions.append("timestamp >= ?")
            params.append(start.isoformat())
        if end is not None:
            conditions.append("timestamp <= ?")
            params.append(end.isoformat())

        where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        query = f"SELECT * FROM alarm_events {where} ORDER BY timestamp DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        async with self._conn.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            return [self._row_to_event(row) for row in rows]

    async def async_get_event_count(
        self,
        alarm_id: str | None = None,
        event_type: AlarmEventType | None = None,
    ) -> int:
        """Get count of events matching filters."""
        conditions: list[str] = []
        params: list[Any] = []

        if alarm_id is not None:
            conditions.append("alarm_id = ?")
            params.append(alarm_id)
        if event_type is not None:
            conditions.append("event_type = ?")
            params.append(event_type.value)

        where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        query = f"SELECT COUNT(*) FROM alarm_events {where}"

        async with self._conn.execute(query, params) as cursor:
            row = await cursor.fetchone()
            return row[0] if row else 0

    async def async_purge_events(self, before: datetime) -> int:
        """Delete events older than the given timestamp. Returns count deleted."""
        cursor = await self._conn.execute(
            "DELETE FROM alarm_events WHERE timestamp < ?",
            (before.isoformat(),),
        )
        await self._conn.commit()
        return cursor.rowcount

    def _row_to_event(self, row: aiosqlite.Row) -> AlarmEvent:
        """Convert a database row to AlarmEvent."""
        return AlarmEvent(
            id=row["id"],
            alarm_id=row["alarm_id"],
            event_type=AlarmEventType(row["event_type"]),
            timestamp=datetime.fromisoformat(row["timestamp"]),
            old_state=AlarmState(row["old_state"]) if row["old_state"] else None,
            new_state=AlarmState(row["new_state"]) if row["new_state"] else None,
            user=row["user"],
            details=json.loads(row["details"]),
        )

    # --- Runtime State Persistence ---

    async def async_save_runtime_state(self, runtime: "AlarmRuntimeState") -> None:
        """Save or update a single alarm's runtime state."""
        from .models import AlarmRuntimeState as _ARS  # noqa: F841

        await self._conn.execute(
            """INSERT OR REPLACE INTO alarm_runtime_states
            (alarm_id, state, triggered_at, acked_at, acked_by,
             shelved_until, previous_state, last_notification_at, last_value)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                runtime.alarm_id,
                runtime.state.value,
                runtime.triggered_at.isoformat() if runtime.triggered_at else None,
                runtime.acked_at.isoformat() if runtime.acked_at else None,
                runtime.acked_by,
                runtime.shelved_until.isoformat() if runtime.shelved_until else None,
                runtime.previous_state.value if runtime.previous_state else None,
                runtime.last_notification_at.isoformat() if runtime.last_notification_at else None,
                runtime.last_value,
            ),
        )
        await self._conn.commit()

    async def async_load_runtime_states(self) -> dict[str, "AlarmRuntimeState"]:
        """Load all persisted runtime states."""
        from .models import AlarmRuntimeState

        result: dict[str, AlarmRuntimeState] = {}
        async with self._conn.execute("SELECT * FROM alarm_runtime_states") as cursor:
            rows = await cursor.fetchall()
            for row in rows:
                result[row["alarm_id"]] = AlarmRuntimeState(
                    alarm_id=row["alarm_id"],
                    state=AlarmState(row["state"]),
                    triggered_at=datetime.fromisoformat(row["triggered_at"]) if row["triggered_at"] else None,
                    acked_at=datetime.fromisoformat(row["acked_at"]) if row["acked_at"] else None,
                    acked_by=row["acked_by"],
                    shelved_until=datetime.fromisoformat(row["shelved_until"]) if row["shelved_until"] else None,
                    previous_state=AlarmState(row["previous_state"]) if row["previous_state"] else None,
                    last_notification_at=datetime.fromisoformat(row["last_notification_at"]) if row["last_notification_at"] else None,
                    last_value=row["last_value"],
                )
        return result

    async def async_delete_runtime_state(self, alarm_id: str) -> None:
        """Delete runtime state for an alarm."""
        await self._conn.execute(
            "DELETE FROM alarm_runtime_states WHERE alarm_id=?", (alarm_id,)
        )
        await self._conn.commit()
