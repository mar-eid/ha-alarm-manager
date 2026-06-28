import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles/shared-styles";
import { fetchAlarm, fetchChannels, createAlarm, updateAlarm } from "../data/websocket";
import type { HomeAssistant, AlarmChannel, AlarmPriority, TriggerType } from "../types";

// HA native components - available globally in HA frontend
declare global {
  interface HTMLElementTagNameMap {
    "ha-entity-picker": any;
    "ha-area-picker": any;
  }
}

@customElement("create-edit-view")
export class CreateEditView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property() alarmId?: string;

  @state() private _channels: AlarmChannel[] = [];
  @state() private _loading = true;
  @state() private _saving = false;

  // Form fields
  @state() private _name = "";
  @state() private _description = "";
  @state() private _sourceEntityId = "";
  @state() private _triggerType: TriggerType = "digital";
  @state() private _priority: AlarmPriority = 1;
  @state() private _area = "";
  @state() private _equipment = "";
  @state() private _tag = "";
  @state() private _channelId: string | null = null;
  @state() private _enabled = true;
  @state() private _latching = false;
  @state() private _ackRequired = true;
  @state() private _autoClear = true;
  @state() private _conditionTemplate = "";
  @state() private _conditionMode: "none" | "simple" | "template" = "none";
  @state() private _conditionEntity = "";
  @state() private _notificationTitleTemplate = "";
  @state() private _notificationTextTemplate = "";
  @state() private _conditionState = "";
  @state() private _remindIntervalMin = "";

  // Trigger config
  @state() private _analogOperator = ">";
  @state() private _analogThreshold = "0";
  @state() private _hysteresis = "";
  @state() private _digitalTargetState = "on";
  @state() private _customMatchValues = "";

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; max-width: 800px; }
      .form-card {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px; padding: 24px;
      }
      h2 { margin-top: 0; }
      .section { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--divider-color); }
      .section h3 { margin-top: 0; font-size: 1em; color: var(--secondary-text-color); }
      .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
      .form-row > * { flex: 1; min-width: 200px; }
      .checkbox-group { display: flex; gap: 16px; align-items: center; margin: 12px 0; flex-wrap: wrap; }
      .checkbox-group label { display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 0.9em; }
      .success { color: var(--alarm-normal); margin-top: 8px; }
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
   * Ensure HA's form components (ha-entity-picker, ha-area-picker) are registered.
   *
   * These are loaded automatically inside HA's card-editor dialog, but the Alarm Center
   * panel does not run in that context, so the pickers can render blank. Forcing the
   * built-in `entities` card's config element to load pulls in those components.
   */
  private async _ensureHaPickersLoaded() {
    if (customElements.get("ha-entity-picker")) return;
    const helpers = await (window as any).loadCardHelpers?.();
    if (!helpers) return;
    const card = await helpers.createCardElement({ type: "entities", entities: [] });
    // Triggers HA's lazy import of the entities-card editor, which registers
    // ha-entity-picker / ha-area-picker. The pickers upgrade automatically once
    // defined, so there is no need to await their registration (awaiting could
    // hang the form indefinitely if a future HA build stops registering them here).
    await card?.constructor?.getConfigElement?.();
  }

  private async _load() {
    if (!this.hass) return;
    this._loading = true;
    try {
      await this._ensureHaPickersLoaded();
      this._channels = await fetchChannels(this.hass);
      if (this.alarmId) {
        const alarm = await fetchAlarm(this.hass, this.alarmId);
        this._name = alarm.name;
        this._description = alarm.description;
        this._sourceEntityId = alarm.source_entity_id;
        this._triggerType = alarm.trigger_type;
        this._priority = alarm.priority;
        this._area = alarm.area;
        this._equipment = alarm.equipment;
        this._tag = alarm.tag;
        this._channelId = alarm.channel_id;
        this._enabled = alarm.enabled;
        this._latching = alarm.latching;
        this._ackRequired = alarm.ack_required;
        this._autoClear = alarm.auto_clear;
        this._conditionTemplate = alarm.condition_template || "";
        // Parse simple condition: {{ is_state('entity', 'state') }}
        const simpleMatch = (alarm.condition_template || "").match(
          /\{\{\s*is_state\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*\}\}/
        );
        if (simpleMatch) {
          this._conditionMode = "simple";
          this._conditionEntity = simpleMatch[1];
          this._conditionState = simpleMatch[2];
        } else if (alarm.condition_template) {
          this._conditionMode = "template";
        } else {
          this._conditionMode = "none";
        }
        this._notificationTitleTemplate = alarm.notification_title_template || "";
        this._notificationTextTemplate = alarm.notification_text_template || "";
        // repeat_interval is stored in seconds; the form edits minutes.
        this._remindIntervalMin =
          alarm.repeat_interval != null ? String(alarm.repeat_interval / 60) : "";

        if (alarm.trigger_type === "analog") {
          this._analogOperator = alarm.trigger_config.operator ?? ">";
          this._analogThreshold = String(alarm.trigger_config.threshold ?? 0);
          this._hysteresis = alarm.hysteresis != null ? String(alarm.hysteresis) : "";
        } else if (alarm.trigger_type === "digital") {
          this._digitalTargetState = alarm.trigger_config.target_state ?? "on";
        } else if (alarm.trigger_type === "custom_state") {
          this._customMatchValues = (alarm.trigger_config.match_values ?? []).join(", ");
        }
      } else {
        this._resetForm();
      }
    } finally {
      this._loading = false;
    }
  }

  private _resetForm() {
    this._name = "";
    this._description = "";
    this._sourceEntityId = "";
    this._triggerType = "digital";
    this._priority = 1;
    this._area = "";
    this._equipment = "";
    this._tag = "";
    this._channelId = null;
    this._enabled = true;
    this._latching = false;
    this._ackRequired = true;
    this._autoClear = true;
    this._conditionTemplate = "";
    this._conditionMode = "none";
    this._conditionEntity = "";
    this._conditionState = "";
    this._notificationTitleTemplate = "";
    this._notificationTextTemplate = "";
    this._remindIntervalMin = "";
    this._analogOperator = ">"; this._hysteresis = "";
    this._analogThreshold = "0";
    this._digitalTargetState = "on";
    this._customMatchValues = "";
  }

  private _buildTriggerConfig(): Record<string, unknown> {
    switch (this._triggerType) {
      case "analog":
        return { operator: this._analogOperator, threshold: parseFloat(this._analogThreshold) };
      case "digital":
        return { target_state: this._digitalTargetState };
      case "custom_state":
        return { match_values: this._customMatchValues.split(",").map((v) => v.trim()).filter(Boolean) };
    }
  }

  private async _save() {
    if (!this.hass || !this._name.trim() || !this._sourceEntityId.trim()) return;
    this._saving = true;
    try {
      const data = {
        name: this._name.trim(),
        description: this._description,
        source_entity_id: this._sourceEntityId.trim(),
        trigger_type: this._triggerType,
        trigger_config: this._buildTriggerConfig(),
        priority: this._priority,
        area: this._area,
        equipment: this._equipment,
        tag: this._tag,
        channel_id: this._channelId,
        enabled: this._enabled,
        latching: this._latching,
        ack_required: this._ackRequired,
        auto_clear: this._autoClear,
        condition_template: this._conditionMode === "simple" && this._conditionEntity
          ? `{{ is_state('${this._conditionEntity}', '${this._conditionState}') }}`
          : this._conditionMode === "template" ? (this._conditionTemplate || null)
          : null,
        notification_title_template: this._notificationTitleTemplate || null,
        notification_text_template: this._notificationTextTemplate || null,
        hysteresis: this._hysteresis ? parseFloat(this._hysteresis) : null,
        // Form edits minutes; repeat_interval is persisted in seconds.
        repeat_interval: this._remindIntervalMin
          ? Math.round(parseFloat(this._remindIntervalMin) * 60)
          : null,
      };

      if (this.alarmId) {
        await updateAlarm(this.hass, this.alarmId, data);
      } else {
        await createAlarm(this.hass, data);
        this._resetForm();
      }

      this.dispatchEvent(
        new CustomEvent("navigate", { detail: { view: "all" }, bubbles: true, composed: true })
      );
    } finally {
      this._saving = false;
    }
  }

  render() {
    if (this._loading) return html`<div class="empty-state">Loading...</div>`;

    return html`
      <div class="form-card">
        <h2>${this.alarmId ? "Edit Alarm" : "Create New Alarm"}</h2>

        <div class="form-row">
          <div class="form-group">
            <label>Alarm Name *</label>
            <input type="text" .value=${this._name} @input=${(e: Event) => (this._name = (e.target as HTMLInputElement).value)} placeholder="e.g. Kitchen Temperature High" />
          </div>
          <div class="form-group">
            <label>Priority</label>
            <select title="Determines notification behavior and visual severity" .value=${String(this._priority)} @change=${(e: Event) => (this._priority = Number((e.target as HTMLSelectElement).value) as AlarmPriority)}>
              <option value="0">Info — panel only, no notifications</option>
              <option value="1">Warning — persistent notification</option>
              <option value="2">High — persistent + mobile push</option>
              <option value="3">Critical — mobile push, bypasses DND</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea rows="2" .value=${this._description} @input=${(e: Event) => (this._description = (e.target as HTMLTextAreaElement).value)}></textarea>
        </div>

        <div class="form-row">
          <div>
            <ha-entity-picker
              .hass=${this.hass}
              .value=${this._sourceEntityId}
              @value-changed=${(e: CustomEvent) => this._sourceEntityId = e.detail.value}
              allow-custom-entity
              .label=${"Source Entity *"}
            ></ha-entity-picker>
            <div class="hint">The entity whose state is monitored by this alarm.</div>
          </div>
          <div class="form-group">
            <label>Channel</label>
            <select title="Routes notifications to specific targets (mobile, persistent, etc.)" .value=${this._channelId ?? ""} @change=${(e: Event) => { const v = (e.target as HTMLSelectElement).value; this._channelId = v || null; }}>
              <option value="">No channel</option>
              ${this._channels.map((ch) => html`<option value=${ch.id}>${ch.name}</option>`)}
            </select>
            <div class="hint">Channels define where notifications are sent. Create one in the Channels tab.</div>
          </div>
        </div>

        <div class="section">
          <h3>Location / Equipment</h3>
          <div class="form-row">
            <ha-area-picker
              .hass=${this.hass}
              .value=${this._area}
              @value-changed=${(e: CustomEvent) => this._area = e.detail.value || ""}
              .label=${"Area"}
            ></ha-area-picker>
            <div class="form-group">
              <label>Equipment</label>
              <input type="text" .value=${this._equipment} @input=${(e: Event) => (this._equipment = (e.target as HTMLInputElement).value)} placeholder="Oven" />
            </div>
            <div class="form-group">
              <label>Tag</label>
              <input type="text" .value=${this._tag} @input=${(e: Event) => (this._tag = (e.target as HTMLInputElement).value)} placeholder="TT-101" />
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Trigger Configuration</h3>
          <div class="form-group">
            <label>Trigger Type</label>
            <select title="How the alarm evaluates the source entity" .value=${this._triggerType} @change=${(e: Event) => (this._triggerType = (e.target as HTMLSelectElement).value as TriggerType)}>
              <option value="analog">Analog — numeric threshold (>, <, etc.)</option>
              <option value="digital">Digital (state match)</option>
              <option value="custom_state">Custom State (value list)</option>
            </select>
          </div>

          ${this._triggerType === "analog" ? html`
            <div class="form-row">
              <div class="form-group">
                <label>Operator</label>
                <select .value=${this._analogOperator} @change=${(e: Event) => (this._analogOperator = (e.target as HTMLSelectElement).value)}>
                  <option value=">">Greater than (&gt;)</option>
                  <option value=">=">Greater or equal (&gt;=)</option>
                  <option value="<">Less than (&lt;)</option>
                  <option value="<=">Less or equal (&lt;=)</option>
                  <option value="==">Equal (==)</option>
                  <option value="!=">Not equal (!=)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Threshold</label>
                <input type="number" step="any" .value=${this._analogThreshold} @input=${(e: Event) => (this._analogThreshold = (e.target as HTMLInputElement).value)} />
              </div>
              <div class="form-group">
                <label>Hysteresis (deadband)</label>
                <input type="number" step="any" title="Prevents chattering: alarm triggers at threshold but won't clear until value passes threshold +/- this value" .value=${this._hysteresis} @input=${(e: Event) => (this._hysteresis = (e.target as HTMLInputElement).value)} placeholder="e.g. 2" />
                <div class="hint">Prevents rapid on/off. Alarm clears only when value moves past threshold +/- this value.</div>
              </div>
            </div>
          ` : ""}

          ${this._triggerType === "digital" ? html`
            <div class="form-group">
              <label>Target State</label>
              <input type="text" .value=${this._digitalTargetState} @input=${(e: Event) => (this._digitalTargetState = (e.target as HTMLInputElement).value)} placeholder="on" />
            </div>
          ` : ""}

          ${this._triggerType === "custom_state" ? html`
            <div class="form-group">
              <label>Match Values (comma-separated)</label>
              <input type="text" .value=${this._customMatchValues} @input=${(e: Event) => (this._customMatchValues = (e.target as HTMLInputElement).value)} placeholder="error, fault, offline" />
            </div>
          ` : ""}
        </div>

        <div class="section">
          <h3>Behavior</h3>
          <div class="checkbox-group">
            <label title="When disabled, the alarm won't evaluate or trigger"><input type="checkbox" .checked=${this._enabled} @change=${(e: Event) => (this._enabled = (e.target as HTMLInputElement).checked)} /> Enabled</label>
            <label title="Latching alarms stay active until manually reset, even if condition clears"><input type="checkbox" .checked=${this._latching} @change=${(e: Event) => (this._latching = (e.target as HTMLInputElement).checked)} /> Latching</label>
            <label title="Require user to acknowledge alarm before it can return to normal"><input type="checkbox" .checked=${this._ackRequired} @change=${(e: Event) => (this._ackRequired = (e.target as HTMLInputElement).checked)} /> Acknowledge Required</label>
            <label title="Automatically clear alarm when the trigger condition is no longer met"><input type="checkbox" .checked=${this._autoClear} @change=${(e: Event) => (this._autoClear = (e.target as HTMLInputElement).checked)} /> Auto Clear</label>
          </div>
          <div class="form-group">
            <label>Remind interval (minutes)</label>
            <input type="number" min="0" step="any"
              title="Re-send the notification this often while the alarm stays active and unacknowledged"
              .value=${this._remindIntervalMin}
              @input=${(e: Event) => (this._remindIntervalMin = (e.target as HTMLInputElement).value)}
              placeholder="e.g. 30" />
            <div class="hint">Leave empty for no reminders. Reminders repeat only while the alarm is active and unacknowledged, and stop on acknowledge or return to normal.</div>
          </div>
          <div class="form-group">
            <label>Condition (optional — alarm only fires when condition is true)</label>
            <div class="hint" style="margin-bottom:8px">Use a condition to gate the alarm. Example: only alert on low battery when the device is at home.</div>
            <div style="display:flex;gap:4px;margin-bottom:8px">
              <button class="btn btn-small" style=${this._conditionMode === "none" ? "background:var(--primary-color);color:#fff" : "background:var(--secondary-background-color)"}
                title="No additional condition — alarm triggers whenever the threshold is met"
                @click=${() => (this._conditionMode = "none")}>None</button>
              <button class="btn btn-small" style=${this._conditionMode === "simple" ? "background:var(--primary-color);color:#fff" : "background:var(--secondary-background-color)"}
                title="Simple condition: pick an entity and expected state (e.g. car must be home)"
                @click=${() => (this._conditionMode = "simple")}>Entity state</button>
              <button class="btn btn-small" style=${this._conditionMode === "template" ? "background:var(--primary-color);color:#fff" : "background:var(--secondary-background-color)"}
                title="Advanced Jinja2 template for complex conditions"
                @click=${() => (this._conditionMode = "template")}>Template</button>
            </div>
            ${this._conditionMode === "simple" ? html`
              <div class="form-row">
                <ha-entity-picker
                  .hass=${this.hass}
                  .value=${this._conditionEntity}
                  @value-changed=${(e: CustomEvent) => (this._conditionEntity = e.detail.value)}
                  allow-custom-entity
                  .label=${"Condition entity"}
                ></ha-entity-picker>
                <div class="form-group">
                  <label>Expected state</label>
                  <input type="text" .value=${this._conditionState} @input=${(e: Event) => (this._conditionState = (e.target as HTMLInputElement).value)} placeholder="home, on, true, etc." />
                </div>
              </div>
            ` : this._conditionMode === "template" ? html`
              <textarea rows="2" .value=${this._conditionTemplate} @input=${(e: Event) => (this._conditionTemplate = (e.target as HTMLTextAreaElement).value)} placeholder="e.g. {{ is_state('device_tracker.car', 'home') }}"></textarea>
            ` : ""}
          </div>
        </div>

        <div class="section">
          <h3>Notification Templates (optional Jinja2)</h3>
          <div class="form-group">
            <label>Title template</label>
            <input type="text" .value=${this._notificationTitleTemplate} @input=${(e: Event) => (this._notificationTitleTemplate = (e.target as HTMLInputElement).value)} placeholder="Default: [Priority] Alarm Name" />
          </div>
          <div class="form-group">
            <label>Message template</label>
            <textarea rows="2" .value=${this._notificationTextTemplate} @input=${(e: Event) => (this._notificationTextTemplate = (e.target as HTMLTextAreaElement).value)} placeholder="e.g. {{ name }} har lite batteri, kun {{ value }}{{ unit }} igjen"></textarea>
          </div>
          <div style="font-size: 0.8em; color: var(--secondary-text-color); margin-top: -8px;">
            Variables: {{ name }}, {{ value }}, {{ unit }}, {{ area }}, {{ equipment }}, {{ friendly_name }}, {{ threshold }}, {{ operator }}, {{ priority }}
          </div>
        </div>

        <div class="actions" style="margin-top: 24px;">
          <button class="btn btn-primary" ?disabled=${this._saving} @click=${this._save}>
            ${this._saving ? "Saving..." : this.alarmId ? "Update Alarm" : "Create Alarm"}
          </button>
          <button class="btn" style="background: var(--secondary-background-color)" @click=${() => this.dispatchEvent(new CustomEvent("navigate", { detail: { view: "all" }, bubbles: true, composed: true }))}>
            Cancel
          </button>
        </div>
      </div>
    `;
  }
}
