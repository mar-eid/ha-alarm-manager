# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.13.2] - 2026-06-01

### Fixed

- Channel save failing: schema validation rejected the new per-target priority objects. Updated websocket and service schemas to accept both plain strings and `{target, min_priority}` objects.

## [0.13.1] - 2026-05-31

### Fixed

- **Alarm states now truly persist across restarts**: Fixed bug where acknowledged/shelved alarms were cleared during startup because entities weren't loaded yet. The evaluator now skips evaluation for alarms with persisted active states when the entity is unavailable/unknown/None — preserving acknowledged, shelved, and RTN states until the entity actually reports a valid value.

## [0.13.0] - 2026-05-31

### Added

- **Per-subscriber severity filter**: Each notification target in a channel can now have its own minimum priority. For example, Marius gets Warning+ while Anna only gets Critical. Shown as a dropdown next to each target chip in the channel editor.
- Backward compatible — existing plain string targets continue to work (inherit channel's min_priority)

## [0.12.3] - 2026-05-31

### Fixed

- Mobile push now controlled by channel's `mobile_push` flag instead of hardcoded priority >= High. Any alarm reaching a channel with `mobile_push: true` and notification targets will push to mobile.
- All channels updated to `mobile_push: true`

## [0.12.2] - 2026-05-31

### Changed

- Banner editor: area filter now uses HA native area picker (`ha-area-picker`) instead of text input
- Banner editor: new state filter with multi-select checkboxes — choose which alarm states to show (Active Unacked, Active Acked, RTN, Shelved, Normal, Disabled)
- Banner card respects `filter_states` config — defaults to active states only, configurable from the editor

## [0.12.1] - 2026-05-31

### Changed

- Added tooltips to all buttons, checkboxes, and dropdowns across the UI:
  - Create/Edit: priority levels explain notification behavior, behavior checkboxes describe their effect, condition modes have descriptions, hysteresis explains deadband, trigger type describes evaluation method
  - Channels: min priority, persistent/mobile/critical checkboxes explain routing behavior
  - Active view: ACK and Shelve buttons have tooltips
  - All Alarms: Shelve/Unshelve/Test/Edit/Delete buttons all have descriptive tooltips

## [0.12.0] - 2026-05-31

### Added

- **Visual card editors**: Both banner and overview cards now have GUI editors in the HA card config dialog (no more YAML-only config)
  - Banner editor: title, max items, area/priority/channel filters, area dropdown toggle, ACK/shelve buttons, header visibility, shelve duration
  - Overview editor: title, default tab, max width, header visibility
- **Notify target picker from HA services**: Channel notification targets now auto-discover from actual `notify.*` services registered in HA (no more hardcoded list)

## [0.11.0] - 2026-05-31

### Added

- **Hysteresis/deadband**: Optional `hysteresis` field on analog triggers prevents alarm chattering. Alarm triggers at threshold but doesn't clear until value passes threshold +/- hysteresis.
- **Import/export services**: `export_alarms` returns all alarm and channel definitions as JSON. `import_alarms` bulk-creates alarms from a JSON array.
- **Maintenance mode**: `maintenance_mode` service suppresses all notifications when enabled. Alarms still trigger and track state, but no persistent/mobile notifications are sent.
- **Alarm analytics**: Settings tab now shows active/shelved/disabled counts, average ACK time, and top 10 most frequently triggered alarms with visual bar chart.
- DB schema v5 migration for hysteresis column

## [0.10.0] - 2026-05-31

### Added

- **Notification text templates**: Per-alarm Jinja2 templates for notification title and message body
  - `notification_title_template`: custom title (default: `[Priority] Alarm Name`)
  - `notification_text_template`: custom message (default: description + source + value + area)
  - Template variables: `{{ name }}`, `{{ value }}`, `{{ unit }}`, `{{ area }}`, `{{ equipment }}`, `{{ friendly_name }}`, `{{ threshold }}`, `{{ operator }}`, `{{ priority }}`
  - Example: `{{ name }} har lite batteri, kun {{ value }}{{ unit }} igjen`
- Default notification message now includes unit of measurement from source entity
- DB schema v4 migration for notification template columns
- Notification template fields in create/edit form with variable reference

## [0.9.1] - 2026-05-31

### Changed

- Card headers hidden by default on both overview and banner cards (opt-in via `show_header: true`)
- Configurable overview card width via `max_width` config (e.g., `max_width: "1200px"`)
- Condition picker UI: toggle between None / Entity state (simple) / Template (advanced)
  - Simple mode: pick entity + expected state, auto-generates Jinja2 template
  - Template mode: raw Jinja2 textarea
  - Parses existing `is_state()` templates back into simple mode when editing

## [0.9.0] - 2026-05-31

### Added

- **Runtime state persistence**: Alarm states (acknowledged, shelved, triggered_at, last_notification_at) are now saved to the database and restored across HA restarts. No more lost acknowledgments or notification spam on reboot.
- DB schema v3: new `alarm_runtime_states` table

### Fixed

- Suppress notifications during initial evaluation on startup — alarms that were already active before restart don't re-notify
- Clean up runtime state when alarms are deleted

## [0.8.1] - 2026-05-31

### Added

- Search bar on Active view: filters by name, area, and entity ID
- Ack All button: bulk acknowledge all unacked alarms with count badge
- Toast notifications: brief popup feedback after ACK, shelve, delete actions
- Alarm detail dialog: ACK, Shelve, and Edit action buttons in footer
- Confirm dialog: proper modal for alarm deletion (replaces browser confirm())
- Layout toggle icons (list/grid) instead of text buttons

## [0.8.0] - 2026-05-31

### Added

- Condition template: optional Jinja2 template on alarm definitions that must evaluate to true for the trigger to fire (e.g. `{{ is_state('device_tracker.car', 'home') }}`)
- Condition template field in create/edit alarm form
- Database schema v2 migration for condition_template column

### Changed

- Priority badges: icon + color circle with tooltip instead of text labels (saves table space)
- State badges: colored dot with tooltip instead of text labels
- Shelve button available for all alarm states except disabled and already-shelved (was active-only)

## [0.7.2] - 2026-05-31

### Fixed

- Make alarm-overview a proper Lovelace card with `setConfig`/`getCardSize`/`getStubConfig` and `window.customCards` registration so it appears in the card picker
- Add `title` and `default_tab` config options to the overview card

## [0.7.1] - 2026-05-31

### Added

- Brand icon (icon.png, dark_icon.png, @2x variants) for HA Settings > Integrations display
- Auto-cleanup of legacy Lovelace resources from pre-v0.7.0 (alarm-card.js, alarm-center-card.js, etc.)

### Changed

- Simplified logo SVG (removed status dots, signal waves — just bell + lightning on dark circle)
- Updated README card examples to use new `scada-alarm-banner` type
- Updated CLAUDE.md frontend entry point references

## [0.7.0] - 2026-05-31

### Changed

- Redesigned Alarm Center panel (`scada-alarm-overview`) with MDI tab icons, status pill header, and KPI strip
- Redesigned Lovelace card (`scada-alarm-banner`) with severity bar, area filter, inline ACK/Shelve
- Shelve dialog replaces browser `prompt()` with preset durations and fine slider
- Notification target picker with chip-based multi-select replaces comma-separated text input
- Alarm tile cards as visual alternative to table rows (Table/Cards toggle)
- KPI strip priority tiles filter the active alarms table
- Views accept external `priorityFilter` from the KPI strip

### Breaking

- Card type renamed: `custom:scada-alarm-card` -> `custom:scada-alarm-banner`
- Panel element renamed: `scada-alarm-center-panel` -> `scada-alarm-overview`
- Old Lovelace resource URLs removed; new ones auto-registered on restart

## [0.6.3] - 2026-05-31

### Fixed

- Remove frontend build step from release workflow (no frontend to build)
- Add empty frontend directory placeholder for HACS compatibility
- Update README version badge to match release

## [0.6.1] - 2026-05-31

### Removed

- Frontend cards and panel (temporarily stripped for GUI troubleshooting)
- Lovelace resource auto-registration and static path serving
- `http` and `lovelace` integration dependencies

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
