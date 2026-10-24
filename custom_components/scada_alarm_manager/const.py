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
    EXTERNAL = "external"


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
    SUPPRESSED = "suppressed"
    AUTO_ACKNOWLEDGED = "auto_acknowledged"


# Default configuration values
DEFAULT_REPEAT_INTERVAL = 300  # 5 minutes
DEFAULT_ESCALATION_DELAY = 900  # 15 minutes
DEFAULT_HISTORY_RETENTION_DAYS = 90
DEFAULT_SHELVE_DURATION = 15  # minutes
DEFAULT_SCAN_INTERVAL = 30  # seconds for periodic checks

# Alarm noise analysis thresholds (ISA-18.2 / EEMUA 191 defaults)
NOISE_DEFAULT_HOURS = 168  # report period: 7 days
NOISE_TOP_COUNT = 10  # size of the "most frequent" list
NOISE_CHATTER_COUNT = 3  # activations ...
NOISE_CHATTER_WINDOW = 60  # ... within this many seconds = chattering
NOISE_FLEETING_SECONDS = 10  # active for less than this = fleeting
NOISE_STALE_HOURS = 24  # active for longer than this = stale (standing)
NOISE_FLOOD_COUNT = 10  # more than this many activations ...
NOISE_FLOOD_WINDOW = 600  # ... within this many seconds = alarm flood
NOISE_NEVER_DAYS = 90  # no activation for this many days = never triggered
# Recommended share of alarms per priority band (EEMUA 191): low / medium / high
NOISE_PRIORITY_TARGETS = {"low": 80, "medium": 15, "high": 5}

# Event names
EVENT_ALARM_STATE_CHANGED = f"{DOMAIN}_state_changed"
EVENT_ALARM_CREATED = f"{DOMAIN}_alarm_created"
EVENT_ALARM_DELETED = f"{DOMAIN}_alarm_deleted"

# Notification action prefixes
NOTIFICATION_ACTION_ACK = "SCADA_ACK_"
NOTIFICATION_ACTION_SHELVE = "SCADA_SHELVE_"
NOTIFICATION_ACTION_OPEN = "SCADA_OPEN_"
NOTIFICATION_ACTION_CUSTOM = "SCADA_CUSTOM_"
