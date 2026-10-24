# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.28.0] - 2026-10-24

### Changed

- **Channel editor follows Home Assistant's design.** Frontend only; the saved channel format is unchanged.
  - The New/Edit channel form is now built on HA's own `ha-form`, like the alarm editor, in sections: **General** (name, minimum priority as a dropdown), **Notification targets** (the existing target picker with per-target minimum priority) and **Delivery** (persistent notifications, mobile push and critical alerts as switches with help text).
  - The form opens as its own page in the Channels tab instead of above the channel table, and saving without a name now says so instead of doing nothing. If HA's form components cannot be loaded, the form says so and asks for a reload.

## [0.27.1] - 2026-10-24

### Fixed

- **`services.yaml` is valid YAML again.** The `action_target` description of `create_alarm` contained an unquoted `{entity_id: ...}` example, so the file failed to parse and hassfest rejected it. The description is now quoted; the text is unchanged.
- **CI is green for lint.** Fixed all ruff findings in the integration (type-only imports moved under `TYPE_CHECKING`, `datetime.UTC`, collapsed nested `if`s, `contextlib.suppress` in database migrations, unused imports) and applied `ruff format`. No behaviour change.

### Changed

- **Ruff is pinned to 0.15.15** in CI and the `dev` extras, so a new ruff release can no longer break CI. The old `pip install ruff>=0.8.0` line was also unquoted, which the shell read as a redirect and installed the latest ruff. The rule set now uses `TC` (the current name of `TCH`).

## [0.27.0] - 2026-10-24

Includes the Home Assistant design update (released as part of this version; it was merged as 0.26.0 but never tagged).

### Changed

- **Alarm Center follows Home Assistant's design.** Frontend only; no backend or storage changes.
  - **Theme colors:** all colors now come from HA theme variables (`--error-color`, `--warning-color`, `--success-color`, `--info-color`, `--deep-orange-color`, `--purple-color`, …), so the panel follows light/dark mode and custom themes. High (deep orange) and Critical (red) are clearly apart, and Critical uses a solid badge. State badges are toned chips with readable text instead of white text on orange.
  - **Alarm editor** rebuilt on HA's own `ha-form` with selectors, grouped in sections (General, Trigger, Location, Behavior, Condition, Notification text, Link and action): switches for flags, numbers with the sensor's unit, duration pickers for on-delay, clear delay, reminder and auto-acknowledge (all stored in seconds as before), template editors for the condition and notification templates, a state picker for target/expected states and chips for match values. The saved format is unchanged.
  - **Dialogs** (alarm details, shelve, quick start guide, delete confirmations) use HA's `ha-dialog` when available and a native modal dialog otherwise. They close with Escape, keep focus inside and go full screen on phones. Deleting a channel now asks in a dialog instead of the browser's `confirm()`.
  - **All Alarms:** row actions are in a three-dot menu instead of up to five colored buttons; click a column header to sort; **Group by area** with collapsible groups; tables scroll sideways on narrow screens.
  - **Values** show with unit and HA's own state formatting (`hass.formatEntityState`), falling back to the last recorded value. Long external alarm messages are clamped to two lines with the full text as tooltip.
  - **Times** are relative ("5 minutes ago") with the exact time as tooltip, in the user's HA language and time format, everywhere (including the new Noise tab).
  - **Feedback:** loading shows HA's spinner, confirmations and errors use HA's own toast (`hass-notification`), and "No active alarms" has an icon.
  - **Alarm details** show the channel name and a readable trigger sentence (e.g. "Below 20%, hysteresis 3%") instead of raw JSON, plus delays, reminder and auto-acknowledge.
  - **KPI strip:** the priority filter is one shared filter with the Priority column filter on the Active and All tabs, shows as a removable chip, and no longer jumps to the Active tab.
  - The **Settings** tab is renamed **Statistics** (it only showed statistics). `default_tab: settings` still works.
  - **Accessibility:** rows, cards and menus work with the keyboard; the search clear control is a real button; tabs and toggles expose their state.

### Fixed

- Saving an alarm now checks required fields and shows an error when saving fails, instead of failing silently (#6).
- The alarm action picker used a `service` selector that current Home Assistant no longer has (it rendered blank). It is now a searchable list of all actions that also accepts a typed value.
- Editing an external alarm no longer wipes its trigger configuration on save.

## [0.26.0] - 2026-10-24

### Added

- **F22 — more lists on the Noise tab.**
  - **Most time in alarm**: total active time per alarm in the period, as a share of the period. A period that started before the chosen period, or is still running, is counted only within the period.
  - **Alarm floods**: periods with more than 10 activations within 10 minutes. Shows which alarm started each flood (often the root cause) and which alarms activated most during it.
  - **Priority distribution**: enabled alarms and activations per band (Low = Info + Warning, Medium = High, High = Critical), compared with the recommended 80 / 15 / 5 %. Bands more than 10 points off target are highlighted.
  - **Not triggered in 90 days**: enabled alarms older than 90 days that have not activated in that time. Flags alarms whose source entity no longer exists.
  - New key figures for floods (and the share of time spent in floods) and for alarms that have not triggered.
  - Thresholds are defined in `const.py` (`NOISE_FLOOD_COUNT`, `NOISE_FLOOD_WINDOW`, `NOISE_NEVER_DAYS`, `NOISE_PRIORITY_TARGETS`).

## [0.25.0] - 2026-10-24

### Added

- **F21 — alarm noise analysis (Noise tab).** A new **Noise** tab in the Alarm Center helps you find and clean up alarm noise, following the ISA-18.2 / EEMUA 191 "bad actor" practice. Choose a period of 24 h, 7 days or 30 days. The tab shows:
  - **Key figures**: activations in the period, average per day, share from the top 10, standing/stale, chattering, fleeting, and shelved/disabled.
  - **Top 10 most frequent**: activation count, share of the total, and suppressed count. Suppressed activations are not counted as noise.
  - **Standing alarms**: alarms active right now, longest first. More than 24 h counts as stale.
  - **Chattering alarms**: 3 or more activations within 60 s.
  - **Fleeting alarms**: activations that ended within 10 s.
  - **Shelved and disabled**: alarms that are hidden right now, and for how long.
  - Each row has a suggested action (for example, add hysteresis or a trigger delay) and an **Edit** button.
  - Thresholds are defaults from the standards and are defined in `const.py`.
- New WebSocket command `scada_alarm_manager/noise_report` (`hours`, 1–8760, default 168). It reads the full event log, without the 500-row limit of `event/list`.
- The `default_tab: noise` option for the Alarm Center card.

## [0.24.0] - 2026-10-24

### Added

- **F20 — auto-acknowledge after return to normal.** New per-alarm setting **Auto-acknowledge after return to normal** (`auto_ack_delay`, seconds; the editor takes minutes). An alarm that has been back to normal but unacknowledged (RTN) for that long is acknowledged automatically. Its notification is dismissed and a new `auto_acknowledged` history event is logged with user `auto`.
  - Intended for event-type alarms such as the doorbell or "washing machine done", which otherwise sit in RTN for hours or days waiting for someone to acknowledge them.
  - Never applies to an alarm that is still active: only `returned_to_normal_unacknowledged` qualifies. A re-trigger restarts the clock.
  - Off by default (empty). Existing alarms are unchanged.

### Database

- Schema migrated to **v10**: adds `auto_ack_delay` to `alarm_definitions` and `returned_at` to `alarm_runtime_states`. Alarms already in RTN when you upgrade measure from `triggered_at` until they next return to normal.

## [0.23.0] - 2026-10-24

### Added

- **F19 — escalation suppression (Low / Very Low, High / Very High).** While a stricter alarm on the same sensor is active, milder alarms in the same direction are suppressed: they go straight to Normal with no acknowledgement owed and their notification is dismissed. Example: battery `< 10` (Very Low) suppresses battery `< 20` (Low). When the stricter alarm clears and the value is still in the milder band, the milder alarm comes back on and notifies again, so you can see the de-escalation.
  - New per-alarm setting **Suppress Milder Alarms** (`suppress_milder`), **on by default**. Turn it off on an alarm to let both levels alarm side by side.
  - Applies only to analog threshold alarms on the same `source_entity_id` with the same direction (`<`/`<=` or `>`/`>=`) and a strictly more extreme threshold. Digital, custom and external alarms never take part, and neither do equal thresholds.
  - Only an *active* stricter alarm (unacked or acked) suppresses. A shelved, disabled or returned-to-normal one does not.
  - A new `suppressed` history event records which alarm took over. The alarm list and detail dialog show "Suppressed by …".

### Database

- Schema migrated to **v9**: adds `suppress_milder` (default on) to `alarm_definitions`. Existing alarms get the setting turned on.

### Notes

- Suppression overrides latching, acknowledge-required and clear-delay on the milder alarm. The escalated alarm carries the information.

## [0.22.0] - 2026-06-29

### Added

- **F13 — link to a dashboard view.** The notification link picker can now target a specific **view** within a dashboard (new optional `link_view_path`); the notification opens `/{dashboard}/{view}`.
- **F14 — service picker.** The action service is now chosen with HA's service selector instead of free text.
- **F15 — target picker.** The action can target an entity, **device, or area** (new `action_target`); the action service is called with that target. The legacy single `action_entity` still works.
- **F17 — trigger the action from the UI.** The custom action button now appears in the alarm list row and the detail modal (new `scada_alarm_manager/alarm/trigger_action` WS command), not just on the push.
- **F18 — Test sends the real notification.** The per-alarm **Test** button now sends that alarm's actual rendered notification (title/body/actions/link) via a new `test_alarm_notification` service, instead of a generic test message.

### Database

- Schema migrated to **v8**: adds nullable `action_target` and `link_view_path` columns (existing rows preserved).

### Notes

- A test notification (F18) uses the same notification id/tag as a real alarm, so for a currently-active alarm it re-renders the live notification; for an INFO-priority alarm (panel-only) it sends nothing by design.

## [0.21.0] - 2026-06-28

### Added

- **F11 — more shelve durations.** The shelve dialog now offers 1d, 2d, 5d, 14d, and 30d presets in addition to the existing minute/hour options.
- **F12 — unshelve from the detail modal.** A shelved alarm's detail modal now shows an **Unshelve** button (wired in both the Active and All Alarms views).

### Fixed

- **B9 — condition-gated alarms now clear when the gate closes.** An acknowledged/active alarm whose `condition_template` gate becomes false now returns to normal, even when its source entity is unavailable (the "offline"-type alarm case). The integration now watches the entities referenced by each `condition_template` (so toggling a gate re-evaluates the alarm), and the unavailable-source guard no longer blocks a deliberate gate close. Guard against regressions: a gate that references the source entity does **not** clear on a transient source dropout.

## [0.20.0] - 2026-06-28

### Added

- **F8 — version in the Help modal.** The Help dialog now shows the installed integration version (fetched via a new `scada_alarm_manager/version` WebSocket command), so it's easy to confirm whether the latest UI actually loaded after an update.
- **F9 — optional actionable notification button.** An alarm can define a button label + an HA service + a target entity; the Companion push then shows that button and tapping it runs the service (e.g. "Open" → `lock.unlock` → `lock.front_door`). Alarms without an action are unchanged. Configurable in the editor and via the create/update services.
- **F10 — link to a dashboard from notifications.** An alarm can be linked to a chosen dashboard (picked from a dropdown in the editor). The mobile push opens that page on tap and the persistent notification gets an "Open" link; defaults to the Alarm Center when unset.

### Database

- Schema migrated to **v7**: adds nullable `action_label`, `action_service`, `action_entity`, and `link_page_path` columns to `alarm_definitions` (existing rows preserved; all default to NULL).

## [0.19.1] - 2026-06-28

### Fixed

- Hardened the Lovelace card-resource registration: the integration version (used as the `?v=` cache-buster on the card JS URLs) is now read via Home Assistant's non-blocking loader instead of a blocking file `open()` in the event loop. Cache-busting itself was already in place — the card is registered as `…/alarm-overview.js?v=<version>` and stale/unversioned entries are pruned on startup. Note: stale UI after an update is usually Home Assistant's frontend service worker; a one-time hard refresh (Ctrl+Shift+R) clears it.

## [0.19.0] - 2026-06-28

### Changed

- **Acknowledging an alarm now clears its notifications** (F7). Any ack path — the panel, the `acknowledge`/`acknowledge_all` services, the WebSocket API, or the Companion App **Acknowledge** action button — both acknowledges the alarm and dismisses its persistent notification *and* clears its mobile push (via the Companion `clear_notification` command matched by tag). Previously notifications were only cleared when an alarm returned fully to normal, so acknowledged-but-still-active alarms left their notifications behind.

### Known limitation

- Swiping/dismissing a push or persistent notification does **not** acknowledge the alarm — Home Assistant fires no event for a plain dismissal. Use the notification's **Acknowledge** action button (which acks and clears) instead.

## [0.18.0] - 2026-06-28

### Added

- **Trigger on-delay and clear-delay (debounce)** for all trigger types. Two new optional per-alarm fields (seconds): `trigger_delay` — the condition must hold continuously for N seconds before the alarm activates; and `clear_delay` — the condition must stay cleared for N seconds before the alarm returns to normal. Suppresses transient spikes and flapping. Editable in the alarm create/edit form and via the `create_alarm`/`update_alarm` services; included in export/import. Pending timers are cancelled cleanly on acknowledge-path changes, shelve, disable, alarm update/delete, and shutdown.

### Changed

- The alarm **Edit** button is now disabled (with an explanatory tooltip) for **external**-trigger alarms in both the detail modal and the All Alarms row — these are managed by automations/blueprints and can't be represented by the edit form. The All Alarms trigger-type filter gains an **External** option.

### Database

- Schema migrated to **v6**: adds nullable `trigger_delay` and `clear_delay` columns to `alarm_definitions` (existing rows are preserved; both default to NULL).

## [0.17.1] - 2026-06-28

### Changed

- Internal/dev only (no shipped-code change): added a CLAUDE.md instruction to groom the backlog after every task — closed items are moved out of the active sections into the Closed items archive.

## [0.17.0] - 2026-06-28

### Added

- **Tag and channel filters** on the Active Alarms and All Alarms views. Active Alarms gains a tag dropdown and a channel dropdown in the toolbar (applies to both table and card layouts); All Alarms gains a tag column filter, and its channel filter is now a dropdown instead of a free-text box.

### Fixed

- **Edit / Acknowledge / Shelve from the alarm detail modal did nothing.** The modal emitted `edit-alarm`/`ack-alarm`/`shelve-alarm` events that no component listened for, so only the per-row Edit button on the All Alarms table worked. Both views now handle these events on the dialog: Edit opens the populated Create/Edit form, Acknowledge acknowledges the alarm, and Shelve opens the shelve dialog.
- **Entity picker could render blank in the Create/Edit form.** `ha-entity-picker`/`ha-area-picker` are auto-loaded inside HA's card-editor dialog but not inside the Alarm Center panel; the form now force-loads HA's form components before rendering so the source-entity and condition-entity pickers always appear.

## [0.16.0] - 2026-06-22

### Added

- Per-alarm **remind interval**: an unacknowledged alarm now re-sends its notification at a configurable interval until it is acknowledged or returns to normal. Editable (in minutes) in the alarm create/edit form; takes precedence over the channel's repeat cadence when set. Reminder notifications are prefixed with a 🔁 marker so they read differently from the initial alarm. This wires up the previously unused `repeat_interval` field end-to-end.

### Fixed

- The reminder clock (`last_notification_at`) is now persisted after each repeat, so reminders survive a restart instead of stalling; it also falls back to the alarm's trigger time as a baseline when no notification timestamp is stored yet.

## [0.15.3] - 2026-06-07

### Fixed

- Mobile push notifications were silently dropped. The notify-target picker stores ids as `notify.<service>`, but the router passed that full string as the service name to `hass.services.async_call("notify", ...)`, invoking the non-existent `notify.notify.<service>`. The router now splits the target into domain + service. The channel "Test" button had the same bug plus did not handle the per-target `{target, min_priority}` dict form — both fixed.
- Removed invalid `homeassistant` key from `manifest.json` — hassfest rejects it for custom integrations (extra keys not allowed), which was failing CI validation.

## [0.15.0] - 2026-06-03

### Added

- Clicking the source entity ID in the alarm detail modal now opens the Home Assistant entity info dialog
- Notification titles now use priority emoji icons instead of `[Priority]` text prefix
- Quick Start Guide dialog accessible via help button in the tab bar
- Inline help hints on non-obvious form fields (source entity, channel, hysteresis, conditions) in alarm and channel editors

### Fixed

- Test helper referenced non-existent `_build_message` method (now uses `_render_message`)

## [0.13.4] - 2026-06-03

### Fixed

- Channel update schema rejected object-typed notification targets (e.g. `{target, min_priority}`). The UPDATE endpoint used `[str]` while CREATE correctly used `list`. Now both accept any list items.
- GitHub release notes showed auto-generated commit lists instead of curated CHANGELOG.md content. Release workflow now extracts the relevant version section from CHANGELOG.md.

## [0.13.3] - 2026-06-02

### Added

- `export_alarms`, `import_alarms`, `maintenance_mode` services now described in `services.yaml` (were registered but undocumented)
- `external` trigger type added to `create_alarm` / `update_alarm` service selectors
- Handler execution tests for all CRUD services (list/get/create/update/delete for alarms, channels, events)
- Datetime range filter tests for `async_get_events` (start/end)

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
