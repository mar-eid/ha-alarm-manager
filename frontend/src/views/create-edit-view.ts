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

  // Trigger config
  @state() private _analogOperator = ">";
  @state() private _analogThreshold = "0";
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

  private async _load() {
    if (!this.hass) return;
    this._loading = true;
    try {
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

        if (alarm.trigger_type === "analog") {
          this._analogOperator = alarm.trigger_config.operator ?? ">";
          this._analogThreshold = String(alarm.trigger_config.threshold ?? 0);
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
    this._analogOperator = ">";
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
            <select .value=${String(this._priority)} @change=${(e: Event) => (this._priority = Number((e.target as HTMLSelectElement).value) as AlarmPriority)}>
              <option value="0">Info</option>
              <option value="1">Warning</option>
              <option value="2">High</option>
              <option value="3">Critical</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea rows="2" .value=${this._description} @input=${(e: Event) => (this._description = (e.target as HTMLTextAreaElement).value)}></textarea>
        </div>

        <div class="form-row">
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._sourceEntityId}
            @value-changed=${(e: CustomEvent) => this._sourceEntityId = e.detail.value}
            allow-custom-entity
            .label=${"Source Entity *"}
          ></ha-entity-picker>
          <div class="form-group">
            <label>Channel</label>
            <select .value=${this._channelId ?? ""} @change=${(e: Event) => { const v = (e.target as HTMLSelectElement).value; this._channelId = v || null; }}>
              <option value="">No channel</option>
              ${this._channels.map((ch) => html`<option value=${ch.id}>${ch.name}</option>`)}
            </select>
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
            <select .value=${this._triggerType} @change=${(e: Event) => (this._triggerType = (e.target as HTMLSelectElement).value as TriggerType)}>
              <option value="analog">Analog (threshold)</option>
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
            <label><input type="checkbox" .checked=${this._enabled} @change=${(e: Event) => (this._enabled = (e.target as HTMLInputElement).checked)} /> Enabled</label>
            <label><input type="checkbox" .checked=${this._latching} @change=${(e: Event) => (this._latching = (e.target as HTMLInputElement).checked)} /> Latching</label>
            <label><input type="checkbox" .checked=${this._ackRequired} @change=${(e: Event) => (this._ackRequired = (e.target as HTMLInputElement).checked)} /> Acknowledge Required</label>
            <label><input type="checkbox" .checked=${this._autoClear} @change=${(e: Event) => (this._autoClear = (e.target as HTMLInputElement).checked)} /> Auto Clear</label>
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
