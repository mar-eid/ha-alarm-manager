# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Full REST/Service API: 11 new CRUD services with `response_data` for remote access (MCP servers, external tools)
  - Alarm CRUD: `list_alarms`, `get_alarm`, `create_alarm`, `update_alarm`, `delete_alarm`
  - Channel CRUD: `list_channels`, `get_channel`, `create_channel`, `update_channel`, `delete_channel`
  - Event history: `list_events` with filtering and pagination
- Redesigned Alarm Center panel with MDI tab icons, status pill header, and KPI strip
- KPI strip with severity breakdown tiles, severity bar, and clickable priority filtering
- Alarm tile cards as visual alternative to table rows (severity accent, live value, time ago)
- Shelve dialog with preset durations (15m, 30m, 1h, 4h, 8h) and fine slider (replaces prompt)
- Notification target picker with chip-based multi-select and dropdown
- External trigger type (`trigger_type: "external"`) for hybrid automation/blueprint integration
- `scada_alarm_manager.trigger` and `scada_alarm_manager.clear` services for external alarms
- HA-native entity picker (`ha-entity-picker`) and area picker (`ha-area-picker`) in alarm create/edit form
- Column filtering on all table views (Active Alarms, All Alarms, History, Channels)
- Test notification button on All Alarms table for alarms with assigned channels
- Priority-aware notification routing: Info=panel only, Warning+=persistent, High+=mobile, Critical=critical alert
- Auto-register Lovelace card resource so `scada-alarm-card` appears in the card picker without manual setup
- Clean up card resource on integration unload
- Initial project scaffolding
- SCADA alarm state machine (Normal, Active Unacked, Active Acked, RTN Unacked, Shelved, Disabled)
- Alarm definitions with analog, digital, and custom state triggers
- Alarm channels for notification routing
- SQLite database for alarm definitions, channels, and event history
- Config flow for integration setup
- HA services: acknowledge, acknowledge_all, shelve, unshelve, enable, disable, reset, test_notification
- WebSocket API for frontend communication (CRUD, actions, real-time subscription)
- Notification system: persistent notifications, mobile push, actionable Companion App notifications, critical alerts
- Alarm Center sidebar panel with 6 tabs (Active, All, History, Channels, Create/Edit, Settings)
- Lovelace alarm card with counts, severity indicator, and quick actions
- Binary sensor entity per alarm (integrates with HA Recorder/History)
- Summary sensors: active count, unacknowledged count, highest severity
- HACS distribution support

### Fixed

- Fix import of `StaticPathConfig` from correct module (`homeassistant.components.http`)
