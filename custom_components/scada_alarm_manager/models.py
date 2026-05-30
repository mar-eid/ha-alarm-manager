"""Data models for SCADA Alarm Manager."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from .const import AlarmEventType, AlarmPriority, AlarmState, TriggerType


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _new_id() -> str:
    return uuid4().hex


@dataclass
class AlarmDefinition:
    """Definition of an alarm rule."""

    name: str
    source_entity_id: str
    trigger_type: TriggerType
    trigger_config: dict[str, Any]
    priority: AlarmPriority = AlarmPriority.WARNING
    description: str = ""
    area: str = ""
    equipment: str = ""
    tag: str = ""
    channel_id: str | None = None
    enabled: bool = True
    latching: bool = False
    ack_required: bool = True
    auto_clear: bool = True
    repeat_interval: int | None = None
    escalation_delay: int | None = None
    id: str = field(default_factory=_new_id)
    created_at: datetime = field(default_factory=_now)
    updated_at: datetime = field(default_factory=_now)

    def to_dict(self) -> dict[str, Any]:
        """Serialize to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "priority": self.priority.value,
            "area": self.area,
            "equipment": self.equipment,
            "tag": self.tag,
            "channel_id": self.channel_id,
            "enabled": self.enabled,
            "latching": self.latching,
            "ack_required": self.ack_required,
            "auto_clear": self.auto_clear,
            "repeat_interval": self.repeat_interval,
            "escalation_delay": self.escalation_delay,
            "source_entity_id": self.source_entity_id,
            "trigger_type": self.trigger_type.value,
            "trigger_config": self.trigger_config,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> AlarmDefinition:
        """Deserialize from dictionary."""
        return cls(
            id=data["id"],
            name=data["name"],
            description=data.get("description", ""),
            priority=AlarmPriority(data["priority"]),
            area=data.get("area", ""),
            equipment=data.get("equipment", ""),
            tag=data.get("tag", ""),
            channel_id=data.get("channel_id"),
            enabled=data.get("enabled", True),
            latching=data.get("latching", False),
            ack_required=data.get("ack_required", True),
            auto_clear=data.get("auto_clear", True),
            repeat_interval=data.get("repeat_interval"),
            escalation_delay=data.get("escalation_delay"),
            source_entity_id=data["source_entity_id"],
            trigger_type=TriggerType(data["trigger_type"]),
            trigger_config=data["trigger_config"],
            created_at=datetime.fromisoformat(data["created_at"]) if isinstance(data.get("created_at"), str) else data.get("created_at", _now()),
            updated_at=datetime.fromisoformat(data["updated_at"]) if isinstance(data.get("updated_at"), str) else data.get("updated_at", _now()),
        )


@dataclass
class AlarmChannel:
    """Alarm notification channel definition."""

    name: str
    notification_targets: list[str] = field(default_factory=list)
    min_priority: AlarmPriority = AlarmPriority.INFO
    persistent_notification: bool = True
    mobile_push: bool = True
    critical_notification: bool = False
    repeat_cadence: int | None = None
    escalation_target: str | None = None
    id: str = field(default_factory=_new_id)
    created_at: datetime = field(default_factory=_now)
    updated_at: datetime = field(default_factory=_now)

    def to_dict(self) -> dict[str, Any]:
        """Serialize to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "notification_targets": self.notification_targets,
            "min_priority": self.min_priority.value,
            "persistent_notification": self.persistent_notification,
            "mobile_push": self.mobile_push,
            "critical_notification": self.critical_notification,
            "repeat_cadence": self.repeat_cadence,
            "escalation_target": self.escalation_target,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> AlarmChannel:
        """Deserialize from dictionary."""
        return cls(
            id=data["id"],
            name=data["name"],
            notification_targets=data.get("notification_targets", []),
            min_priority=AlarmPriority(data.get("min_priority", 0)),
            persistent_notification=data.get("persistent_notification", True),
            mobile_push=data.get("mobile_push", True),
            critical_notification=data.get("critical_notification", False),
            repeat_cadence=data.get("repeat_cadence"),
            escalation_target=data.get("escalation_target"),
            created_at=datetime.fromisoformat(data["created_at"]) if isinstance(data.get("created_at"), str) else data.get("created_at", _now()),
            updated_at=datetime.fromisoformat(data["updated_at"]) if isinstance(data.get("updated_at"), str) else data.get("updated_at", _now()),
        )


@dataclass
class AlarmRuntimeState:
    """Runtime state of an alarm instance."""

    alarm_id: str
    state: AlarmState = AlarmState.NORMAL
    triggered_at: datetime | None = None
    acked_at: datetime | None = None
    acked_by: str | None = None
    shelved_until: datetime | None = None
    previous_state: AlarmState | None = None
    last_notification_at: datetime | None = None
    last_value: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Serialize to dictionary."""
        return {
            "alarm_id": self.alarm_id,
            "state": self.state.value,
            "triggered_at": self.triggered_at.isoformat() if self.triggered_at else None,
            "acked_at": self.acked_at.isoformat() if self.acked_at else None,
            "acked_by": self.acked_by,
            "shelved_until": self.shelved_until.isoformat() if self.shelved_until else None,
            "previous_state": self.previous_state.value if self.previous_state else None,
            "last_notification_at": self.last_notification_at.isoformat() if self.last_notification_at else None,
            "last_value": self.last_value,
        }


@dataclass
class AlarmEvent:
    """A recorded alarm event for history."""

    alarm_id: str
    event_type: AlarmEventType
    timestamp: datetime = field(default_factory=_now)
    old_state: AlarmState | None = None
    new_state: AlarmState | None = None
    user: str | None = None
    details: dict[str, Any] = field(default_factory=dict)
    id: int | None = None

    def to_dict(self) -> dict[str, Any]:
        """Serialize to dictionary."""
        return {
            "id": self.id,
            "alarm_id": self.alarm_id,
            "event_type": self.event_type.value,
            "timestamp": self.timestamp.isoformat(),
            "old_state": self.old_state.value if self.old_state else None,
            "new_state": self.new_state.value if self.new_state else None,
            "user": self.user,
            "details": self.details,
        }
