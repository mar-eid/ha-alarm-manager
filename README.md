# SCADA Alarm Manager for Home Assistant

An industrial-style alarm management system for Home Assistant, with GUI-configurable alarm rules, alarm channels, SCADA-like acknowledgement workflows, dashboard monitoring, and actionable mobile response.

## Features

- **SCADA-style alarm lifecycle**: Normal, Active (Unacknowledged/Acknowledged), Returned to Normal, Shelved, Disabled
- **Three trigger types**: Analog thresholds, digital state changes, custom state/template conditions
- **Alarm channels**: Route notifications to the right people based on alarm category and priority
- **Alarm Center panel**: Full-screen sidebar panel for alarm management with 6 tabs
- **Lovelace card**: Compact dashboard card showing active alarms, counts, and quick actions
- **Actionable notifications**: Acknowledge, shelve, or open alarms directly from mobile push notifications
- **Alarm history**: Full event log with filtering and pagination via SQLite
- **HA integration**: Each alarm is a binary sensor entity with full Recorder/History support

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Click the three dots menu > Custom repositories
3. Add this repository URL and select "Integration" as the category
4. Search for "SCADA Alarm Manager" and install
5. Restart Home Assistant
6. Go to Settings > Integrations > Add Integration > SCADA Alarm Manager

### Manual

1. Copy `custom_components/scada_alarm_manager/` to your Home Assistant `custom_components/` directory
2. Restart Home Assistant
3. Go to Settings > Integrations > Add Integration > SCADA Alarm Manager

## Quick Start

1. After installation, the **Alarm Center** appears in the sidebar
2. Create alarm channels (e.g., "Safety", "HVAC", "Security") to define notification routing
3. Create alarms by selecting a source entity, trigger condition, priority, and channel
4. Alarms automatically evaluate and transition through the SCADA state machine
5. Use the Lovelace card on dashboards for at-a-glance monitoring

## Alarm Priorities

| Priority | Use Case |
|----------|----------|
| Critical | Safety-critical conditions requiring immediate action |
| High | Important conditions requiring prompt attention |
| Warning | Conditions that should be investigated |
| Info | Informational alerts for awareness |

## Services

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

## Requirements

- Home Assistant 2026.1.0 or newer
- HACS (for HACS installation)

## License

MIT License - see [LICENSE](LICENSE) for details.
