"""Constants for SCADA Alarm Manager."""

from __future__ import annotations

from enum import IntEnum, StrEnum

DOMAIN = "scada_alarm_manager"

PLATFORMS = ["binary_sensor", "sensor"]


class AlarmPriority(IntEnum):
    """Alarm priority levels, ordered by severity."""

    INFO = 0
    WARNING = 1
    HIGH = 2
    CRITICAL = 3


class AlarmState(StrEnum):
    """SCADA alarm lifecycle states."""

    NORMAL = "normal"
    ACTIVE_UNACKED = "active_unacknowledged"
    ACTIVE_ACKED = "active_acknowledged"
    RTN_UNACKED = "returned_to_normal_unacknowledged"
    SHELVED = "shelved"
    DISABLED = "disabled"


class TriggerType(StrEnum):
    """Alarm trigger types."""

    ANALOG = "analog"
    DIGITAL = "digital"
    CUSTOM_STATE = "custom_state"


class AlarmEventType(StrEnum):
    """Alarm event types for history logging."""

    TRIGGERED = "triggered"
    CLEARED = "cleared"
    ACKNOWLEDGED = "acknowledged"
    SHELVED = "shelved"
    UNSHELVED = "unshelved"
    ENABLED = "enabled"
    DISABLED = "disabled"
    RESET = "reset"
    CREATED = "created"
    UPDATED = "updated"
    DELETED = "deleted"


# Default configuration values
DEFAULT_REPEAT_INTERVAL = 300  # 5 minutes
DEFAULT_ESCALATION_DELAY = 900  # 15 minutes
DEFAULT_HISTORY_RETENTION_DAYS = 90
DEFAULT_SHELVE_DURATION = 15  # minutes
DEFAULT_SCAN_INTERVAL = 30  # seconds for periodic checks

# Event names
EVENT_ALARM_STATE_CHANGED = f"{DOMAIN}_state_changed"
EVENT_ALARM_CREATED = f"{DOMAIN}_alarm_created"
EVENT_ALARM_DELETED = f"{DOMAIN}_alarm_deleted"

# Notification action prefixes
NOTIFICATION_ACTION_ACK = "SCADA_ACK_"
NOTIFICATION_ACTION_SHELVE = "SCADA_SHELVE_"
NOTIFICATION_ACTION_OPEN = "SCADA_OPEN_"
