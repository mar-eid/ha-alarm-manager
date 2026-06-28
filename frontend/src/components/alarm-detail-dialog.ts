import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sharedStyles, getPriorityColor, getStateColor } from "../styles/shared-styles";
import { PRIORITY_LABELS, STATE_LABELS, type AlarmWithState } from "../types";

@customElement("alarm-detail-dialog")
export class AlarmDetailDialog extends LitElement {
  @property({ attribute: false }) alarm?: AlarmWithState;
  @property({ type: Boolean }) open = false;

  static styles = [
    sharedStyles,
    css`
      .overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000;
      }
      .dialog {
        background: var(--card-background-color, white);
        border-radius: 12px;
        width: 90%; max-width: 600px; max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      .dialog-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .dialog-header h2 { margin: 0; font-size: 1.1em; }
      .close-btn {
        background: none; border: none; font-size: 1.4em;
        cursor: pointer; color: var(--secondary-text-color);
        padding: 4px 8px; border-radius: 4px;
      }
      .close-btn:hover { background: var(--secondary-background-color, #f5f5f5); }
      .dialog-body { padding: 20px; }
      .section { margin-bottom: 20px; }
      .section-title {
        font-size: 0.8em; font-weight: 600; text-transform: uppercase;
        color: var(--secondary-text-color); margin-bottom: 8px;
        letter-spacing: 0.5px;
      }
      .field { display: flex; justify-content: space-between; padding: 6px 0; }
      .field-label { color: var(--secondary-text-color); font-size: 0.9em; }
      .field-value { font-weight: 500; font-size: 0.9em; text-align: right; max-width: 60%; word-break: break-all; }
      .entity-link {
        color: var(--primary-color);
        cursor: pointer;
        font-weight: 500;
        font-size: 0.9em;
        text-align: right;
        max-width: 60%;
        word-break: break-all;
      }
      .entity-link:hover { text-decoration: underline; }
      .priority-dot {
        display: inline-block; width: 10px; height: 10px;
        border-radius: 50%; margin-right: 6px; vertical-align: middle;
      }
      .description { font-size: 0.9em; color: var(--primary-text-color); padding: 8px 0; }
      .flags { display: flex; gap: 8px; flex-wrap: wrap; }
      .flag {
        padding: 3px 10px; border-radius: 12px; font-size: 0.75em; font-weight: 600;
        background: var(--secondary-background-color, #f5f5f5);
        color: var(--primary-text-color);
      }
      .flag.active { background: var(--primary-color); color: white; }
      .dialog-footer {
        display: flex; gap: 8px; justify-content: flex-end; padding: 12px 20px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }
    `,
  ];

  private _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close"));
  }

  private _emit(type: string, detail: Record<string, unknown> = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  private _openEntityInfo() {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: this.alarm?.source_entity_id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    if (!this.open || !this.alarm) return html``;
    const a = this.alarm;
    const r = a.runtime;

    return html`
      <div class="overlay" @click=${this._close}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <h2>
              <span class="priority-dot" style="background: ${getPriorityColor(a.priority)}"></span>
              ${a.name}
            </h2>
            <button class="close-btn" @click=${this._close}>&times;</button>
          </div>
          <div class="dialog-body">
            ${a.description ? html`<div class="description">${a.description}</div>` : ""}

            <div class="section">
              <div class="section-title">State</div>
              <div class="field">
                <span class="field-label">Current State</span>
                <span class="field-value"><span class="badge" style="background: ${getStateColor(r.state)}">${STATE_LABELS[r.state] ?? r.state}</span></span>
              </div>
              <div class="field">
                <span class="field-label">Last Value</span>
                <span class="field-value">${r.last_value ?? "-"}</span>
              </div>
              <div class="field">
                <span class="field-label">Triggered At</span>
                <span class="field-value">${r.triggered_at ? new Date(r.triggered_at).toLocaleString() : "-"}</span>
              </div>
              ${r.acked_at ? html`
                <div class="field">
                  <span class="field-label">Acknowledged At</span>
                  <span class="field-value">${new Date(r.acked_at).toLocaleString()}</span>
                </div>
                <div class="field">
                  <span class="field-label">Acknowledged By</span>
                  <span class="field-value">${r.acked_by ?? "-"}</span>
                </div>
              ` : ""}
              ${r.shelved_until ? html`
                <div class="field">
                  <span class="field-label">Shelved Until</span>
                  <span class="field-value">${new Date(r.shelved_until).toLocaleString()}</span>
                </div>
              ` : ""}
            </div>

            <div class="section">
              <div class="section-title">Definition</div>
              <div class="field">
                <span class="field-label">Priority</span>
                <span class="field-value">${PRIORITY_LABELS[a.priority]}</span>
              </div>
              <div class="field">
                <span class="field-label">Source Entity</span>
                <span class="entity-link" @click=${this._openEntityInfo}>${a.source_entity_id}</span>
              </div>
              <div class="field">
                <span class="field-label">Trigger Type</span>
                <span class="field-value">${a.trigger_type}</span>
              </div>
              <div class="field">
                <span class="field-label">Trigger Config</span>
                <span class="field-value">${JSON.stringify(a.trigger_config)}</span>
              </div>
              ${a.area ? html`<div class="field"><span class="field-label">Area</span><span class="field-value">${a.area}</span></div>` : ""}
              ${a.equipment ? html`<div class="field"><span class="field-label">Equipment</span><span class="field-value">${a.equipment}</span></div>` : ""}
              ${a.tag ? html`<div class="field"><span class="field-label">Tag</span><span class="field-value">${a.tag}</span></div>` : ""}
              ${a.channel_id ? html`<div class="field"><span class="field-label">Channel ID</span><span class="field-value">${a.channel_id}</span></div>` : ""}
            </div>

            <div class="section">
              <div class="section-title">Behavior</div>
              <div class="flags">
                <span class="flag ${a.enabled ? "active" : ""}">Enabled</span>
                <span class="flag ${a.latching ? "active" : ""}">Latching</span>
                <span class="flag ${a.ack_required ? "active" : ""}">ACK Required</span>
                <span class="flag ${a.auto_clear ? "active" : ""}">Auto Clear</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Metadata</div>
              <div class="field">
                <span class="field-label">Alarm ID</span>
                <span class="field-value">${a.id}</span>
              </div>
              <div class="field">
                <span class="field-label">Created</span>
                <span class="field-value">${new Date(a.created_at).toLocaleString()}</span>
              </div>
              <div class="field">
                <span class="field-label">Updated</span>
                <span class="field-value">${new Date(a.updated_at).toLocaleString()}</span>
              </div>
            </div>
            <div class="dialog-footer">
              ${r.state === "active_unacknowledged" || r.state === "returned_to_normal_unacknowledged"
                ? html`<button class="btn btn-primary" @click=${() => { this._emit("ack-alarm", { id: a.id }); this._close(); }}>Acknowledge</button>`
                : ""}
              ${r.state !== "shelved" && r.state !== "disabled"
                ? html`<button class="btn" style="background: var(--alarm-shelved, #9c27b0); color: white;" @click=${() => { this._emit("shelve-alarm", { alarm: a }); this._close(); }}>Shelve</button>`
                : ""}
              ${a.trigger_type === "external"
                ? html`<button class="btn" style="background: var(--secondary-background-color, #f5f5f5); opacity: 0.5; cursor: not-allowed;" disabled title="External alarms are managed by automations/blueprints and can't be edited here">Edit</button>`
                : html`<button class="btn" style="background: var(--secondary-background-color, #f5f5f5);" @click=${() => { this._emit("edit-alarm", { id: a.id }); this._close(); }}>Edit</button>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "alarm-detail-dialog": AlarmDetailDialog;
  }
}
