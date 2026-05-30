import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, getStateColor } from "../styles/shared-styles";
import { fetchAlarms, deleteAlarm } from "../data/websocket";
import { STATE_LABELS, type HomeAssistant, type AlarmWithState } from "../types";
import "../components/severity-badge";

@customElement("all-alarms-view")
export class AllAlarmsView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _alarms: AlarmWithState[] = [];
  @state() private _loading = true;

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; }
      .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .toggle { cursor: pointer; }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._loadAlarms();
  }

  private async _loadAlarms() {
    if (!this.hass) return;
    try {
      this._alarms = await fetchAlarms(this.hass);
    } finally {
      this._loading = false;
    }
  }

  private async _delete(alarmId: string) {
    if (!this.hass || !confirm("Delete this alarm?")) return;
    await deleteAlarm(this.hass, alarmId);
    this._loadAlarms();
  }

  private _edit(alarmId: string) {
    this.dispatchEvent(
      new CustomEvent("navigate", { detail: { view: "create-edit", alarmId }, bubbles: true, composed: true })
    );
  }

  render() {
    if (this._loading) return html`<div class="empty-state">Loading...</div>`;

    return html`
      <div class="toolbar">
        <span>${this._alarms.length} alarm${this._alarms.length !== 1 ? "s" : ""} configured</span>
        <button class="btn btn-primary" @click=${() => this._edit("")}>+ New Alarm</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Name</th>
            <th>State</th>
            <th>Source Entity</th>
            <th>Trigger</th>
            <th>Channel</th>
            <th>Enabled</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this._alarms.map(
            (alarm) => html`
              <tr>
                <td><severity-badge .priority=${alarm.priority}></severity-badge></td>
                <td><strong>${alarm.name}</strong></td>
                <td><span class="badge" style="background: ${getStateColor(alarm.runtime.state)}">${STATE_LABELS[alarm.runtime.state] ?? alarm.runtime.state}</span></td>
                <td>${alarm.source_entity_id}</td>
                <td>${alarm.trigger_type}</td>
                <td>${alarm.channel_id ?? "-"}</td>
                <td>${alarm.enabled ? "Yes" : "No"}</td>
                <td class="actions">
                  <button class="btn btn-small btn-primary" @click=${() => this._edit(alarm.id)}>Edit</button>
                  <button class="btn btn-small btn-danger" @click=${() => this._delete(alarm.id)}>Delete</button>
                </td>
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }
}
