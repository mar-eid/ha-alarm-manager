import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sharedStyles } from "../styles/shared-styles";
import { PRIORITY_LABELS, type AlarmChannel, type AlarmWithState, type HomeAssistant } from "../types";
import { areaName, channelName, describeTrigger, formatDateTime, formatDuration } from "../utils/format";
import { renderStateChip, renderValue } from "../utils/render";
import "./scada-dialog";
import "./severity-badge";
import "./rel-time";

const TRIGGER_TYPE_LABELS: Record<string, string> = {
  analog: "Analog threshold",
  digital: "Digital (state match)",
  custom_state: "Custom state (value list)",
  external: "External",
};

@customElement("alarm-detail-dialog")
export class AlarmDetailDialog extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) alarm?: AlarmWithState;
  @property({ attribute: false }) channels: AlarmChannel[] = [];
  @property({ type: Boolean }) open = false;

  /** Last shown alarm, kept so the content doesn't vanish during the close animation. */
  private _shown?: AlarmWithState;

  static styles = [
    sharedStyles,
    css`
      .title-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }
      .title-row .meta {
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }
      .section {
        margin-bottom: 20px;
      }
      .section-title {
        font-size: 0.8em;
        font-weight: 500;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
        letter-spacing: 0.5px;
      }
      .field {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 16px;
        padding: 6px 0;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .field:last-child {
        border-bottom: none;
      }
      .field-label {
        flex: none;
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      .field-value {
        font-size: 0.9em;
        text-align: right;
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .field-value .value-text {
        max-width: none;
        -webkit-line-clamp: 6;
      }
      .entity-link {
        padding: 0;
        border: none;
        background: none;
        font: inherit;
        font-size: 0.9em;
        color: var(--primary-color);
        cursor: pointer;
        text-align: right;
        overflow-wrap: anywhere;
      }
      .entity-link:hover {
        text-decoration: underline;
      }
      .description {
        font-size: 0.9em;
        color: var(--primary-text-color);
        margin: 0 0 16px;
      }
      .flags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        padding: 6px 0;
      }
      .flag {
        padding: 2px 10px;
        border-radius: 8px;
        font-size: 0.8em;
        border: 1px solid var(--divider-color, #e0e0e0);
        color: var(--secondary-text-color);
      }
      .flag.on {
        border-color: transparent;
        background: color-mix(in srgb, var(--primary-color, #03a9f4) 14%, transparent);
        color: var(--primary-text-color);
      }
    `,
  ];

  willUpdate(changed: PropertyValues) {
    if (changed.has("alarm") && this.alarm) this._shown = this.alarm;
  }

  private _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close"));
  }

  private _emit(type: string, detail: Record<string, unknown> = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  private _act(type: string, detail: Record<string, unknown>) {
    this._emit(type, detail);
    this._close();
  }

  private _openEntityInfo() {
    this._emit("hass-more-info", { entityId: this._shown?.source_entity_id });
  }

  private _field(label: string, value: unknown) {
    return html`<div class="field"><span class="field-label">${label}</span><span class="field-value">${value}</span></div>`;
  }

  private _time(iso: string | null | undefined) {
    return iso ? html`<rel-time .hass=${this.hass} .datetime=${iso}></rel-time>` : "—";
  }

  private _renderBody(a: AlarmWithState) {
    const r = a.runtime;
    const hass = this.hass;
    return html`
      <div class="title-row">
        <severity-badge .priority=${a.priority}></severity-badge>
        ${renderStateChip(r.state)}
        <span class="meta">${PRIORITY_LABELS[a.priority]}</span>
      </div>
      ${a.description ? html`<p class="description">${a.description}</p>` : nothing}

      <div class="section">
        <div class="section-title">Status</div>
        ${this._field("Value", renderValue(hass, a))}
        ${this._field("Triggered", this._time(r.triggered_at))}
        ${r.returned_at ? this._field("Returned to normal", this._time(r.returned_at)) : nothing}
        ${r.acked_at ? this._field("Acknowledged", html`${this._time(r.acked_at)}${r.acked_by ? ` by ${r.acked_by}` : ""}`) : nothing}
        ${r.shelved_until ? this._field("Shelved until", formatDateTime(hass, r.shelved_until)) : nothing}
        ${a.suppressed_by ? this._field("Suppressed by", a.suppressed_by.name) : nothing}
      </div>

      <div class="section">
        <div class="section-title">Definition</div>
        <div class="field">
          <span class="field-label">Source entity</span>
          <button class="entity-link" @click=${this._openEntityInfo}>${a.source_entity_id}</button>
        </div>
        ${this._field("Trigger", html`${describeTrigger(hass, a)}<br /><span class="muted">${TRIGGER_TYPE_LABELS[a.trigger_type] ?? a.trigger_type}</span>`)}
        ${a.trigger_delay ? this._field("On-delay", formatDuration(a.trigger_delay)) : nothing}
        ${a.clear_delay ? this._field("Clear delay", formatDuration(a.clear_delay)) : nothing}
        ${this._field("Channel", a.channel_id ? channelName(this.channels, a.channel_id) : "No channel")}
        ${a.area ? this._field("Area", areaName(hass, a.area)) : nothing}
        ${a.equipment ? this._field("Equipment", a.equipment) : nothing}
        ${a.tag ? this._field("Tag", a.tag) : nothing}
      </div>

      <div class="section">
        <div class="section-title">Behavior</div>
        <div class="flags">
          <span class="flag ${a.enabled ? "on" : ""}">Enabled</span>
          <span class="flag ${a.latching ? "on" : ""}">Latching</span>
          <span class="flag ${a.ack_required ? "on" : ""}">Acknowledge required</span>
          <span class="flag ${a.auto_clear ? "on" : ""}">Auto clear</span>
          ${a.trigger_type === "analog" ? html`<span class="flag ${a.suppress_milder ? "on" : ""}">Suppress milder</span>` : nothing}
        </div>
        ${a.repeat_interval ? this._field("Reminder", `Every ${formatDuration(a.repeat_interval)}`) : nothing}
        ${a.auto_ack_delay ? this._field("Auto-acknowledge", `${formatDuration(a.auto_ack_delay)} after return to normal`) : nothing}
      </div>

      <div class="section">
        <div class="section-title">Metadata</div>
        ${this._field("Alarm ID", html`<span class="mono">${a.id}</span>`)}
        ${this._field("Created", formatDateTime(hass, a.created_at))}
        ${this._field("Updated", formatDateTime(hass, a.updated_at))}
      </div>
    `;
  }

  private _renderFooter(a: AlarmWithState) {
    const s = a.runtime.state;
    const unacked = s === "active_unacknowledged" || s === "returned_to_normal_unacknowledged";
    const external = a.trigger_type === "external";
    return html`
      ${external
        ? html`<button slot="footer" class="btn btn-plain" disabled title="External alarms are managed by automations/blueprints and can't be edited here">Edit</button>`
        : html`<button slot="footer" class="btn btn-plain" @click=${() => this._act("edit-alarm", { id: a.id })}>Edit</button>`}
      ${a.channel_id
        ? html`<button slot="footer" class="btn btn-plain" title="Send this alarm's real notification as a test" @click=${() => this._act("test-alarm", { id: a.id })}>Test notification</button>`
        : nothing}
      ${a.action_service
        ? html`<button slot="footer" class="btn" title="Run this alarm's configured action" @click=${() => this._act("trigger-action", { id: a.id })}>${a.action_label || "Action"}</button>`
        : nothing}
      ${s === "shelved"
        ? html`<button slot="footer" class="btn btn-shelve" @click=${() => this._act("unshelve-alarm", { id: a.id })}>Unshelve</button>`
        : s !== "disabled"
        ? html`<button slot="footer" class="btn btn-shelve" @click=${() => this._act("shelve-alarm", { alarm: a })}>Shelve</button>`
        : nothing}
      ${unacked
        ? html`<button slot="footer" class="btn btn-primary" @click=${() => this._act("ack-alarm", { id: a.id })}>Acknowledge</button>`
        : nothing}
    `;
  }

  render() {
    const a = this.alarm ?? this._shown;
    return html`
      <scada-dialog .open=${this.open && !!this.alarm} heading=${a?.name ?? ""} @dialog-closed=${this._close}>
        ${a ? this._renderBody(a) : nothing} ${a ? this._renderFooter(a) : nothing}
      </scada-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "alarm-detail-dialog": AlarmDetailDialog;
  }
}
