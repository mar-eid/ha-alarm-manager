import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles/shared-styles";
import { fetchAlarm, fetchChannels, createAlarm, updateAlarm, fetchDashboardConfig } from "../data/websocket";
import type { HomeAssistant, AlarmChannel, AlarmPriority, TriggerType } from "../types";
import { durationToSeconds, errorMessage, notify, secondsToDuration, type DurationValue } from "../utils/format";
import { renderLoading } from "../utils/render";
import { ensureHaComponents, whenDefined } from "../utils/ha-load";

// HA native components - available globally in HA frontend
declare global {
  interface HTMLElementTagNameMap {
    "ha-form": any;
    "ha-selector": any;
  }
}

/** Sentinels for "nothing selected" in select dropdowns. */
const NO_CHANNEL = "__none__";
const DEFAULT_PAGE = "__default__";
const WHOLE_DASHBOARD = "__dashboard__";

type ConditionMode = "none" | "simple" | "template";

/** Everything the form edits, in ha-form's flat data shape. */
interface FormData {
  name: string;
  description: string;
  priority: string;
  channel_id: string;
  source_entity_id: string;
  trigger_type: TriggerType;
  operator: string;
  threshold?: number;
  hysteresis?: number;
  target_state: string;
  match_values: string[];
  trigger_delay?: DurationValue;
  clear_delay?: DurationValue;
  area: string;
  equipment: string;
  tag: string;
  enabled: boolean;
  latching: boolean;
  ack_required: boolean;
  auto_clear: boolean;
  suppress_milder: boolean;
  repeat_interval?: DurationValue;
  auto_ack_delay?: DurationValue;
  condition_mode: ConditionMode;
  condition_entity: string;
  condition_state: string;
  condition_template: string;
  notification_title_template: string;
  notification_text_template: string;
  link_page_path: string;
  link_view_path: string;
  action_label: string;
  action_service: string;
  action_target?: Record<string, unknown>;
}

const emptyForm = (): FormData => ({
  name: "",
  description: "",
  priority: "1",
  channel_id: NO_CHANNEL,
  source_entity_id: "",
  trigger_type: "digital",
  operator: ">",
  threshold: 0,
  hysteresis: undefined,
  target_state: "on",
  match_values: [],
  trigger_delay: undefined,
  clear_delay: undefined,
  area: "",
  equipment: "",
  tag: "",
  enabled: true,
  latching: false,
  ack_required: true,
  auto_clear: true,
  suppress_milder: true,
  repeat_interval: undefined,
  auto_ack_delay: undefined,
  condition_mode: "none",
  condition_entity: "",
  condition_state: "",
  condition_template: "",
  notification_title_template: "",
  notification_text_template: "",
  link_page_path: DEFAULT_PAGE,
  link_view_path: WHOLE_DASHBOARD,
  action_label: "",
  action_service: "",
  action_target: undefined,
});

const LABELS: Record<string, string> = {
  name: "Alarm name",
  description: "Description",
  priority: "Priority",
  channel_id: "Channel",
  source_entity_id: "Source entity",
  trigger_type: "Trigger type",
  operator: "Operator",
  threshold: "Threshold",
  hysteresis: "Hysteresis (deadband)",
  target_state: "Target state",
  match_values: "Match values",
  trigger_delay: "On-delay",
  clear_delay: "Clear delay",
  area: "Area",
  equipment: "Equipment",
  tag: "Tag",
  enabled: "Enabled",
  latching: "Latching",
  ack_required: "Acknowledge required",
  auto_clear: "Auto clear",
  suppress_milder: "Suppress milder alarms",
  repeat_interval: "Reminder interval",
  auto_ack_delay: "Auto-acknowledge after return to normal",
  condition_mode: "Condition",
  condition_entity: "Condition entity",
  condition_state: "Expected state",
  condition_template: "Condition template",
  notification_title_template: "Title template",
  notification_text_template: "Message template",
  link_page_path: "Link to dashboard",
  link_view_path: "View",
  action_label: "Action button label",
  action_service: "Action",
  action_target: "Action target",
};

const HELPERS: Record<string, string> = {
  source_entity_id: "The entity whose state this alarm monitors.",
  channel_id: "Channels define where notifications go. Create one in the Channels tab.",
  hysteresis: "Prevents rapid on/off: the alarm clears only when the value moves past the threshold by this much.",
  match_values: "The alarm is active while the entity has any of these states.",
  trigger_delay: "The condition must hold this long before the alarm activates. Empty = no delay.",
  clear_delay: "The condition must stay cleared this long before the alarm returns to normal. Empty = no delay.",
  enabled: "When off, the alarm is not evaluated.",
  latching: "Stays active until manually reset, even if the condition clears.",
  ack_required: "The alarm must be acknowledged before it can return to normal.",
  auto_clear: "Clear automatically when the trigger condition is no longer met.",
  suppress_milder:
    "While active, milder alarms on the same sensor in the same direction are suppressed (e.g. Very Low suppresses Low).",
  repeat_interval:
    "Re-send the notification this often while the alarm is active and unacknowledged. Empty = no reminders.",
  auto_ack_delay:
    "Acknowledge automatically once the alarm has been back to normal this long. Empty = manual acknowledge. Good for event-type alarms.",
  condition_template: "Jinja2 template that must render true, e.g. {{ is_state('device_tracker.car', 'home') }}",
  notification_title_template: "Default: [Priority] Alarm name",
  link_page_path: "Where the alarm's notifications link to.",
  action_label: "Optional button on the push notification and in the alarm list. Needs a label, an action and a target.",
  action_target: "Entity, device or area the action runs against.",
};

const PRIORITY_OPTIONS = [
  { value: "0", label: "Info — panel only, no notifications" },
  { value: "1", label: "Warning — persistent notification" },
  { value: "2", label: "High — persistent + mobile push" },
  { value: "3", label: "Critical — mobile push, bypasses Do Not Disturb" },
];

const OPERATOR_OPTIONS = [
  { value: ">", label: "Greater than (>)" },
  { value: ">=", label: "Greater or equal (>=)" },
  { value: "<", label: "Less than (<)" },
  { value: "<=", label: "Less or equal (<=)" },
  { value: "==", label: "Equal (==)" },
  { value: "!=", label: "Not equal (!=)" },
];

const DURATION = { duration: { enable_second: true } };
const DURATION_DAYS = { duration: { enable_day: true, enable_second: true } };

@customElement("create-edit-view")
export class CreateEditView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property() alarmId?: string;

  @state() private _channels: AlarmChannel[] = [];
  @state() private _loading = true;
  @state() private _saving = false;
  @state() private _formAvailable = true;
  @state() private _data: FormData = emptyForm();
  @state() private _views: { path: string; title: string }[] = [];
  @state() private _error = "";

  /** Not editable in the UI; kept so saving doesn't drop it. */
  private _actionEntity = "";
  /** Trigger config of external alarms is owned by the automation; preserved as-is. */
  private _externalTriggerConfig: Record<string, unknown> = {};

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; max-width: 840px; margin: 0 auto; }
      h2 { margin: 0 0 16px; font-size: 1.5em; font-weight: 400; }
      .section {
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: var(--ha-card-border-radius, 12px);
        margin-bottom: 16px;
      }
      .section-header {
        padding: 16px 16px 0;
        font-size: 1.1em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .section-header .sub {
        display: block;
        margin-top: 2px;
        font-size: 0.8em;
        font-weight: 400;
        color: var(--secondary-text-color);
      }
      .section-body { padding: 16px; }
      .vars {
        margin-top: 8px;
        font-size: 0.8em;
        line-height: 1.6;
        color: var(--secondary-text-color);
      }
      .vars code { font-family: var(--ha-font-family-code, monospace); }
      .error {
        margin-bottom: 16px;
        padding: 12px 16px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--error-color, #db4437) 12%, transparent);
        color: color-mix(in srgb, var(--error-color, #db4437) 75%, var(--primary-text-color, #212121));
      }
      .footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 8px 0 24px;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has("alarmId")) {
      this._load();
    }
  }

  /**
   * Ensure HA's form components (ha-form + selectors, ha-entity-picker, ha-area-picker)
   * are registered.
   *
   * These are loaded automatically inside HA's card-editor dialog, but the Alarm Center
   * panel does not run in that context, so the form can render blank. Forcing the
   * built-in `entities` card's config element to load pulls in those components.
   * Waits at most a few seconds for ha-form; if it never shows up the view says so
   * instead of hanging.
   */
  private async _ensureHaPickersLoaded() {
    await ensureHaComponents();
    this._formAvailable = await whenDefined("ha-form", 3000);
  }

  private async _load() {
    if (!this.hass) return;
    this._loading = true;
    this._error = "";
    try {
      await this._ensureHaPickersLoaded();
      this._channels = await fetchChannels(this.hass);
      if (this.alarmId) {
        const alarm = await fetchAlarm(this.hass, this.alarmId);
        const cfg = alarm.trigger_config ?? {};
        // Parse simple condition: {{ is_state('entity', 'state') }}
        const simpleMatch = (alarm.condition_template || "").match(
          /\{\{\s*is_state\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*\}\}/
        );
        const conditionMode: ConditionMode = simpleMatch ? "simple" : alarm.condition_template ? "template" : "none";
        this._actionEntity = alarm.action_entity || "";
        this._externalTriggerConfig = alarm.trigger_type === "external" ? { ...cfg } : {};
        this._data = {
          ...emptyForm(),
          name: alarm.name,
          description: alarm.description,
          priority: String(alarm.priority),
          channel_id: alarm.channel_id ?? NO_CHANNEL,
          source_entity_id: alarm.source_entity_id,
          trigger_type: alarm.trigger_type,
          operator: alarm.trigger_type === "analog" ? cfg.operator ?? ">" : ">",
          threshold: alarm.trigger_type === "analog" ? Number(cfg.threshold ?? 0) : 0,
          hysteresis: alarm.hysteresis ?? undefined,
          target_state: alarm.trigger_type === "digital" ? cfg.target_state ?? "on" : "on",
          match_values: alarm.trigger_type === "custom_state" ? [...(cfg.match_values ?? [])] : [],
          // All durations are stored in seconds.
          trigger_delay: secondsToDuration(alarm.trigger_delay),
          clear_delay: secondsToDuration(alarm.clear_delay),
          area: alarm.area,
          equipment: alarm.equipment,
          tag: alarm.tag,
          enabled: alarm.enabled,
          latching: alarm.latching,
          ack_required: alarm.ack_required,
          auto_clear: alarm.auto_clear,
          suppress_milder: alarm.suppress_milder ?? true,
          repeat_interval: secondsToDuration(alarm.repeat_interval),
          auto_ack_delay: secondsToDuration(alarm.auto_ack_delay),
          condition_mode: conditionMode,
          condition_entity: simpleMatch ? simpleMatch[1] : "",
          condition_state: simpleMatch ? simpleMatch[2] : "",
          condition_template: alarm.condition_template || "",
          notification_title_template: alarm.notification_title_template || "",
          notification_text_template: alarm.notification_text_template || "",
          link_page_path: alarm.link_page_path || DEFAULT_PAGE,
          link_view_path: alarm.link_view_path || WHOLE_DASHBOARD,
          action_label: alarm.action_label || "",
          action_service: alarm.action_service || "",
          // Seed the target picker from action_target, falling back to the legacy single entity.
          action_target: alarm.action_target
            ? { ...alarm.action_target }
            : alarm.action_entity
            ? { entity_id: [alarm.action_entity] }
            : undefined,
        };
        await this._loadViews(alarm.link_page_path || "");
      } else {
        this._resetForm();
      }
    } catch (err) {
      this._error = `Could not load the alarm: ${errorMessage(err)}`;
    } finally {
      this._loading = false;
    }
  }

  private _resetForm() {
    this._data = emptyForm();
    this._views = [];
    this._actionEntity = "";
    this._externalTriggerConfig = {};
  }

  private get _dashboards(): { url_path: string; title?: string }[] {
    const panels = this.hass?.panels ?? {};
    return Object.values(panels)
      .filter((p) => p.component_name === "lovelace")
      .sort((a, b) => (a.title || a.url_path).localeCompare(b.title || b.url_path));
  }

  private async _loadViews(urlPath: string) {
    this._views = [];
    if (!this.hass || !urlPath) return;
    try {
      const config = await fetchDashboardConfig(this.hass, urlPath);
      this._views = (config?.views ?? [])
        .filter((v: any) => v.path)
        .map((v: any) => ({ path: v.path, title: v.title || v.path }));
    } catch (_e) {
      // Dashboard config not fetchable (e.g. YAML-mode) — leave views empty.
    }
  }

  private get _serviceOptions(): string[] {
    const services = this.hass?.services ?? {};
    const out: string[] = [];
    for (const domain of Object.keys(services)) {
      for (const svc of Object.keys(services[domain] ?? {})) out.push(`${domain}.${svc}`);
    }
    return out.sort();
  }

  private _onFormChange(e: CustomEvent) {
    e.stopPropagation();
    const next = { ...this._data, ...(e.detail.value as Partial<FormData>) };
    if (next.link_page_path !== this._data.link_page_path) {
      next.link_view_path = WHOLE_DASHBOARD;
      this._loadViews(next.link_page_path === DEFAULT_PAGE ? "" : next.link_page_path);
    }
    this._data = next;
  }

  // --- Schemas, one per section. Built in JS (not ha-form `visible`) for older HA builds. ---

  private get _generalSchema() {
    return [
      { name: "name", required: true, selector: { text: {} } },
      { name: "description", selector: { text: { multiline: true } } },
      {
        name: "",
        type: "grid",
        schema: [
          { name: "priority", required: true, selector: { select: { mode: "dropdown", options: PRIORITY_OPTIONS } } },
          {
            name: "channel_id",
            required: true,
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: NO_CHANNEL, label: "No channel" },
                  ...this._channels.map((ch) => ({ value: ch.id, label: ch.name })),
                ],
              },
            },
          },
        ],
      },
    ];
  }

  private get _triggerSchema() {
    const d = this._data;
    const unit: string | undefined = this.hass?.states?.[d.source_entity_id]?.attributes?.unit_of_measurement;
    const numberSel = { number: { mode: "box", step: "any", ...(unit ? { unit_of_measurement: unit } : {}) } };
    const typeOptions = [
      { value: "analog", label: "Analog — numeric threshold" },
      { value: "digital", label: "Digital — state match" },
      { value: "custom_state", label: "Custom state — list of values" },
      ...(d.trigger_type === "external" ? [{ value: "external", label: "External — set by automation" }] : []),
    ];
    const stateSel = d.source_entity_id ? { state: { entity_id: d.source_entity_id } } : { text: {} };
    const schema: any[] = [
      { name: "source_entity_id", required: true, selector: { entity: {} } },
      { name: "trigger_type", required: true, selector: { select: { mode: "dropdown", options: typeOptions } } },
    ];
    if (d.trigger_type === "analog") {
      schema.push({
        name: "",
        type: "grid",
        schema: [
          { name: "operator", required: true, selector: { select: { mode: "dropdown", options: OPERATOR_OPTIONS } } },
          { name: "threshold", required: true, selector: numberSel },
          { name: "hysteresis", selector: numberSel },
        ],
      });
    } else if (d.trigger_type === "digital") {
      schema.push({ name: "target_state", required: true, selector: stateSel });
    } else if (d.trigger_type === "custom_state") {
      schema.push({
        name: "match_values",
        required: true,
        selector: { select: { multiple: true, custom_value: true, options: this._entityStates(d.source_entity_id) } },
      });
    }
    schema.push({
      name: "",
      type: "grid",
      schema: [
        { name: "trigger_delay", selector: DURATION },
        { name: "clear_delay", selector: DURATION },
      ],
    });
    return schema;
  }

  /** Known states of an entity (for the match-values picker); custom values are allowed too. */
  private _entityStates(entityId: string): string[] {
    const st = this.hass?.states?.[entityId];
    const known = new Set<string>(this._data.match_values);
    if (st) known.add(st.state);
    for (const opt of (st?.attributes?.options as string[] | undefined) ?? []) known.add(opt);
    return [...known];
  }

  private get _locationSchema() {
    return [
      {
        name: "",
        type: "grid",
        schema: [
          { name: "area", selector: { area: {} } },
          { name: "equipment", selector: { text: {} } },
          { name: "tag", selector: { text: {} } },
        ],
      },
    ];
  }

  private get _behaviorSchema() {
    const flags: any[] = [
      { name: "enabled", selector: { boolean: {} } },
      { name: "latching", selector: { boolean: {} } },
      { name: "ack_required", selector: { boolean: {} } },
      { name: "auto_clear", selector: { boolean: {} } },
    ];
    if (this._data.trigger_type === "analog") flags.push({ name: "suppress_milder", selector: { boolean: {} } });
    return [
      { name: "", type: "grid", schema: flags },
      {
        name: "",
        type: "grid",
        schema: [
          { name: "repeat_interval", selector: DURATION },
          { name: "auto_ack_delay", selector: DURATION_DAYS },
        ],
      },
    ];
  }

  private get _conditionSchema() {
    const d = this._data;
    const schema: any[] = [
      {
        name: "condition_mode",
        selector: {
          select: {
            mode: "list",
            options: [
              { value: "none", label: "None — alarm triggers whenever the trigger is met" },
              { value: "simple", label: "Entity state — e.g. the car must be home" },
              { value: "template", label: "Template — advanced Jinja2 condition" },
            ],
          },
        },
      },
    ];
    if (d.condition_mode === "simple") {
      schema.push({
        name: "",
        type: "grid",
        schema: [
          { name: "condition_entity", required: true, selector: { entity: {} } },
          {
            name: "condition_state",
            required: true,
            selector: d.condition_entity ? { state: { entity_id: d.condition_entity } } : { text: {} },
          },
        ],
      });
    } else if (d.condition_mode === "template") {
      schema.push({ name: "condition_template", required: true, selector: { template: {} } });
    }
    return schema;
  }

  private get _notificationSchema() {
    return [
      { name: "notification_title_template", selector: { template: {} } },
      { name: "notification_text_template", selector: { template: {} } },
    ];
  }

  private get _linkActionSchema() {
    const linkRow: any[] = [
      {
        name: "link_page_path",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: DEFAULT_PAGE, label: "Alarm Center (default)" },
              ...this._dashboards.map((p) => ({ value: p.url_path, label: p.title || p.url_path })),
            ],
          },
        },
      },
    ];
    if (this._data.link_page_path !== DEFAULT_PAGE && this._views.length) {
      linkRow.push({
        name: "link_view_path",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: WHOLE_DASHBOARD, label: "Entire dashboard" },
              ...this._views.map((v) => ({ value: v.path, label: v.title })),
            ],
          },
        },
      });
    }
    return [
      { name: "", type: "grid", schema: linkRow },
      {
        name: "",
        type: "grid",
        schema: [
          { name: "action_label", selector: { text: {} } },
          {
            name: "action_service",
            selector: { select: { mode: "dropdown", custom_value: true, options: this._serviceOptions } },
          },
        ],
      },
      { name: "action_target", selector: { target: {} } },
    ];
  }

  private _computeLabel = (s: { name: string; required?: boolean }) => LABELS[s.name] ?? s.name;
  private _computeHelper = (s: { name: string }) => HELPERS[s.name] ?? "";

  // --- Save ---

  private _buildTriggerConfig(): Record<string, unknown> {
    const d = this._data;
    switch (d.trigger_type) {
      case "analog":
        return { operator: d.operator, threshold: Number(d.threshold ?? 0) };
      case "digital":
        return { target_state: d.target_state };
      case "custom_state":
        return { match_values: (d.match_values ?? []).map((v) => String(v).trim()).filter(Boolean) };
      default:
        // "external" triggers are managed outside the form; keep their config untouched.
        return { ...this._externalTriggerConfig };
    }
  }

  private _validate(): string {
    const d = this._data;
    if (!d.name.trim()) return "Enter an alarm name.";
    if (!d.source_entity_id.trim()) return "Choose a source entity.";
    if (d.trigger_type === "analog" && (d.threshold === undefined || isNaN(Number(d.threshold)))) {
      return "Enter a numeric threshold.";
    }
    if (d.trigger_type === "custom_state" && !(d.match_values ?? []).some((v) => String(v).trim())) {
      return "Add at least one match value.";
    }
    if (d.condition_mode === "simple" && d.condition_entity && !d.condition_state) {
      return "Enter the expected state for the condition entity.";
    }
    return "";
  }

  private async _save() {
    if (!this.hass) return;
    const invalid = this._validate();
    if (invalid) {
      this._error = invalid;
      notify(this, invalid);
      return;
    }
    this._error = "";
    const d = this._data;
    const hysteresis = typeof d.hysteresis === "number" && !isNaN(d.hysteresis) ? d.hysteresis : null;
    this._saving = true;
    try {
      const data = {
        name: d.name.trim(),
        description: d.description ?? "",
        source_entity_id: d.source_entity_id.trim(),
        trigger_type: d.trigger_type,
        trigger_config: this._buildTriggerConfig(),
        priority: Number(d.priority) as AlarmPriority,
        area: d.area ?? "",
        equipment: d.equipment ?? "",
        tag: d.tag ?? "",
        channel_id: d.channel_id && d.channel_id !== NO_CHANNEL ? d.channel_id : null,
        enabled: d.enabled,
        latching: d.latching,
        ack_required: d.ack_required,
        auto_clear: d.auto_clear,
        suppress_milder: d.suppress_milder,
        condition_template:
          d.condition_mode === "simple" && d.condition_entity
            ? `{{ is_state('${d.condition_entity}', '${d.condition_state}') }}`
            : d.condition_mode === "template"
            ? d.condition_template || null
            : null,
        notification_title_template: d.notification_title_template || null,
        notification_text_template: d.notification_text_template || null,
        hysteresis,
        // All four durations are persisted in whole seconds; empty/zero = off (null).
        repeat_interval: durationToSeconds(d.repeat_interval),
        auto_ack_delay: durationToSeconds(d.auto_ack_delay),
        trigger_delay: durationToSeconds(d.trigger_delay),
        clear_delay: durationToSeconds(d.clear_delay),
        action_label: (d.action_label ?? "").trim() || null,
        action_service: (d.action_service ?? "").trim() || null,
        action_entity: this._actionEntity.trim() || null,
        action_target: d.action_target && Object.keys(d.action_target).length > 0 ? d.action_target : null,
        link_page_path: d.link_page_path && d.link_page_path !== DEFAULT_PAGE ? d.link_page_path : null,
        link_view_path:
          d.link_page_path !== DEFAULT_PAGE && d.link_view_path && d.link_view_path !== WHOLE_DASHBOARD
            ? d.link_view_path
            : null,
      };

      if (this.alarmId) {
        await updateAlarm(this.hass, this.alarmId, data);
        notify(this, `Saved: ${data.name}`);
      } else {
        await createAlarm(this.hass, data);
        notify(this, `Created: ${data.name}`);
        this._resetForm();
      }

      this._navigateBack();
    } catch (err) {
      this._error = `Saving failed: ${errorMessage(err)}`;
      notify(this, this._error);
    } finally {
      this._saving = false;
    }
  }

  private _navigateBack() {
    this.dispatchEvent(new CustomEvent("navigate", { detail: { view: "all" }, bubbles: true, composed: true }));
  }

  // --- Render ---

  private _section(title: string, sub: string | undefined, schema: unknown[], extra: unknown = nothing) {
    return html`
      <section class="section">
        <div class="section-header">${title}${sub ? html`<span class="sub">${sub}</span>` : nothing}</div>
        <div class="section-body">
          <ha-form
            .hass=${this.hass}
            .data=${this._data}
            .schema=${schema}
            .computeLabel=${this._computeLabel}
            .computeHelper=${this._computeHelper}
            @value-changed=${this._onFormChange}
          ></ha-form>
          ${extra}
        </div>
      </section>
    `;
  }

  render() {
    if (this._loading) return renderLoading();

    if (!this._formAvailable) {
      return html`<div class="error">
        Home Assistant's form components could not be loaded. Reload the page (Ctrl+Shift+R) and try again.
      </div>`;
    }

    const external = this._data.trigger_type === "external";
    return html`
      <h2>${this.alarmId ? "Edit alarm" : "Create alarm"}</h2>
      ${this._error ? html`<div class="error" role="alert">${this._error}</div>` : nothing}

      ${this._section("General", undefined, this._generalSchema)}
      ${this._section(
        "Trigger",
        external ? "This alarm is raised and cleared by an automation or blueprint." : "When the alarm becomes active.",
        this._triggerSchema
      )}
      ${this._section("Location", "Used for grouping and filtering.", this._locationSchema)}
      ${this._section("Behavior", undefined, this._behaviorSchema)}
      ${this._section(
        "Condition",
        "Optional gate: the alarm only fires while the condition is true, e.g. low battery only when the device is home.",
        this._conditionSchema
      )}
      ${this._section(
        "Notification text",
        "Optional Jinja2 templates that override the default notification.",
        this._notificationSchema,
        html`<div class="vars">
          Variables:
          ${["name", "value", "unit", "area", "equipment", "friendly_name", "threshold", "operator", "priority"].map(
            (v, i) => html`${i ? ", " : ""}<code>{{ ${v} }}</code>`
          )}
        </div>`
      )}
      ${this._section("Link and action", "Optional.", this._linkActionSchema)}

      <div class="footer">
        <button class="btn btn-plain" @click=${this._navigateBack}>Cancel</button>
        <button class="btn btn-primary" ?disabled=${this._saving} @click=${this._save}>
          ${this._saving ? "Saving…" : this.alarmId ? "Save" : "Create"}
        </button>
      </div>
    `;
  }
}
