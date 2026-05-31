<p align="center">
  <img src="https://raw.githubusercontent.com/mar-eid/ha-alarm-manager/master/images/logo.svg" alt="SCADA Alarm Manager" width="160">
</p>

<h1 align="center">SCADA Alarm Manager</h1>

<p align="center">
  Industrial-style alarm management for Home Assistant
  <br>
  <strong>v0.8.1</strong>
</p>

<p align="center">
  <a href="#installation">Installation</a> &middot;
  <a href="#quick-start">Quick Start</a> &middot;
  <a href="#features">Features</a> &middot;
  <a href="#services">Services</a> &middot;
  <a href="#cards">Cards</a>
</p>

---

## What is this?

A SCADA-inspired alarm system for Home Assistant. Define alarm rules on any entity, group them into channels, and get notified through persistent notifications and mobile push -- with industrial-grade acknowledgement workflows.

**Key concepts:**
- **Alarms** monitor HA entities and trigger on thresholds, state changes, or custom conditions
- **Channels** route notifications to the right people based on category and priority
- **State machine** tracks each alarm through a SCADA lifecycle: Normal, Active, Acknowledged, Shelved, Disabled
- **Priority-aware routing**: Info = panel only, Warning+ = persistent, High+ = mobile, Critical = bypasses DND

## Features

| Feature | Description |
|---------|-------------|
| **Four trigger types** | Analog thresholds, digital state match, custom state/template, external (service-triggered) |
| **SCADA state machine** | 6-state lifecycle with acknowledge, shelve, reset workflows |
| **Alarm Center panel** | Redesigned sidebar panel with MDI icons, status pill, KPI strip with severity breakdown |
| **Alarm Center card** | Same full panel as a Lovelace card -- use in panel mode for fullscreen |
| **KPI strip** | Clickable severity tiles, severity bar, unacked/shelved counts with priority filtering |
| **Alarm tile cards** | Visual card layout with severity accent, live value, time-ago, inline ACK/shelve |
| **Monitoring card** | Compact card with severity bar, counts, ACK/shelve buttons |
| **Shelve dialog** | Modal with preset durations (15m/30m/1h/4h/8h) and fine slider -- replaces prompt |
| **Notification targets** | Chip-based multi-select picker with dropdown for channel targets |
| **HA-native selectors** | Entity picker, area picker in create/edit forms |
| **Column filtering** | Filter tables by priority, name, state, entity, channel |
| **Alarm detail dialog** | Click any alarm row for full details |
| **External triggers** | `trigger` and `clear` services for hybrid automation/blueprint integration |
| **Priority notifications** | Persistent, mobile push, and critical alerts based on priority level |
| **Actionable notifications** | ACK or shelve directly from Companion App push notifications |
| **Full REST API** | 21 HA services (10 actions + 11 CRUD with response data) for automations and MCP |
| **Binary sensors** | Each alarm is an entity with Recorder/History/Logbook support |
| **Summary sensors** | Active count, unacked count, highest severity |
| **SQLite history** | Full event log with filtering, pagination, and configurable retention |

## Installation

### HACS (Recommended)

1. Open **HACS** in Home Assistant
2. Three dots menu > **Custom repositories**
3. Add this repository URL, category **Integration**
4. Search for **"SCADA Alarm Manager"** and install
5. **Restart Home Assistant**
6. Go to **Settings > Integrations > Add Integration > SCADA Alarm Manager**

### Manual

1. Copy `custom_components/scada_alarm_manager/` to your HA `custom_components/` directory
2. Restart Home Assistant
3. Add the integration via Settings > Integrations

## Quick Start

1. The **Alarm Center** appears in the sidebar after setup
2. Go to **Channels** tab -- create channels (e.g., "Safety", "HVAC") with notification targets
3. Go to **Create/Edit** tab -- create alarms with the entity picker, set trigger, priority, and channel
4. Alarms evaluate automatically and transition through the state machine
5. Use **Test** button on the All Alarms tab to verify notifications
6. Add the **SCADA Alarm Center** card to a dashboard for embedded monitoring

## Cards

### SCADA Alarm Overview

Full Alarm Center with 6 tabs, KPI strip, and alarm management. Best used in a **panel mode** dashboard for a fullscreen experience.

```yaml
type: custom:scada-alarm-overview
title: Alarm Center
default_tab: active
```

**Card options:** `title`, `default_tab` (active, all, history, channels, create-edit, settings)

### SCADA Alarm Banner

Compact monitoring card with severity bar, area filter, active alarm list, and inline ACK/Shelve.

```yaml
type: custom:scada-alarm-banner
title: Alarm Center
max_items: 6
selectable_area: true
show_ack_button: true
show_shelve_button: true
default_shelve_minutes: 15
```

**Card options:** `title`, `max_items`, `filter_area`, `filter_priority`, `filter_channel`, `selectable_area`, `show_ack_button`, `show_shelve_button`, `default_shelve_minutes`

## Alarm Priorities

| Priority | Notification Behavior |
|----------|----------------------|
| **Critical** | Persistent + mobile push with critical alert (bypasses DND) |
| **High** | Persistent notification + mobile push |
| **Warning** | Persistent notification only |
| **Info** | Panel and history only (no notifications) |

Channel configuration can further restrict notifications via `min_priority`.

## Services

### Action Services

| Service | Description |
|---------|-------------|
| `scada_alarm_manager.acknowledge` | Acknowledge a single alarm |
| `scada_alarm_manager.acknowledge_all` | Acknowledge all active alarms (with optional filters) |
| `scada_alarm_manager.shelve` | Temporarily suppress an alarm |
| `scada_alarm_manager.unshelve` | Remove shelve from an alarm |
| `scada_alarm_manager.enable` | Enable a disabled alarm |
| `scada_alarm_manager.disable` | Disable an alarm |
| `scada_alarm_manager.reset` | Reset a latched alarm |
| `scada_alarm_manager.test_notification` | Send a test notification through a channel |

### CRUD Services (with response data)

These services return data via HA's `response_data`, making them accessible via the REST API for automations, scripts, MCP servers, and external integrations.

| Service | Description |
|---------|-------------|
| `scada_alarm_manager.list_alarms` | List all alarm definitions with runtime state |
| `scada_alarm_manager.get_alarm` | Get a single alarm by ID |
| `scada_alarm_manager.create_alarm` | Create a new alarm definition |
| `scada_alarm_manager.update_alarm` | Update an existing alarm definition |
| `scada_alarm_manager.delete_alarm` | Delete an alarm definition |
| `scada_alarm_manager.list_channels` | List all alarm channels |
| `scada_alarm_manager.get_channel` | Get a single channel by ID |
| `scada_alarm_manager.create_channel` | Create a new alarm channel |
| `scada_alarm_manager.update_channel` | Update an existing alarm channel |
| `scada_alarm_manager.delete_channel` | Delete an alarm channel |
| `scada_alarm_manager.list_events` | Query alarm event history with filters |

## Configuration

After installation, configure defaults via **Settings > Integrations > SCADA Alarm Manager > Configure**:

| Option | Default | Description |
|--------|---------|-------------|
| Default shelve duration | 15 min | Default duration when shelving alarms |
| History retention | 90 days | How long alarm events are kept |
| Scan interval | 30 sec | How often entity states are checked |

## State Machine

```
NORMAL ──> ACTIVE (Unacked) ──> ACTIVE (Acked) ──> NORMAL
                │                      │
                └──> RTN (Unacked) ────┘
                
Any state ──> SHELVED ──> (restored on timer/unshelve)
Any state ──> DISABLED ──> NORMAL (on enable)
```

## Requirements

- Home Assistant **2026.1.0** or newer
- HACS (for HACS installation method)

## License

MIT License -- see [LICENSE](LICENSE) for details.
