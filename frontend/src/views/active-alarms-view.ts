import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, getPriorityColor, getStateColor } from "../styles/shared-styles";
import { fetchAlarms, acknowledgeAlarm, shelveAlarm, subscribeAlarmChanges } from "../data/websocket";
import { STATE_LABELS, PRIORITY_LABELS, type HomeAssistant, type AlarmWithState } from "../types";
import "../components/severity-badge";

@customElement("active-alarms-view")
export class ActiveAlarmsView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _alarms: AlarmWithState[] = [];
  @state() private _loading = true;
  private _unsub?: () => void;

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; }
      .header-actions { display: flex; gap: 8px; margin-bottom: 16px; align-items: center; }
      .count-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 12px; border-radius: 16px; font-size: 0.85em; font-weight: 600;
      }
      .flashing { animation: flash 1s infinite alternate; }
      @keyframes flash { from { opacity: 1; } to { opacity: 0.5; } }
      .alarm-row-critical { border-left: 3px solid var(--alarm-critical); }
      .alarm-row-high { border-left: 3px solid var(--alarm-high); }
      .time-ago { font-size: 0.8em; color: var(--secondary-text-color); }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._loadAlarms();
    this._subscribe();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
  }

  private async _loadAlarms() {
    if (!this.hass) return;
    try {
      const all = await fetchAlarms(this.hass);
      this._alarms = all.filter(
        (a) =>
          a.runtime.state === "active_unacknowledged" ||
          a.runtime.state === "active_acknowledged" ||
          a.runtime.state === "returned_to_normal_unacknowledged"
      );
    } finally {
      this._loading = false;
    }
  }

  private async _subscribe() {
    if (!this.hass) return;
    this._unsub = await subscribeAlarmChanges(this.hass, () => {
      this._loadAlarms();
    });
  }

  private async _ack(alarmId: string) {
    if (!this.hass) return;
    await acknowledgeAlarm(this.hass, alarmId);
    this._loadAlarms();
  }

  private async _shelve(alarmId: string) {
    if (!this.hass) return;
    await shelveAlarm(this.hass, alarmId, 15);
    this._loadAlarms();
  }

  render() {
    if (this._loading) return html`<div class="empty-state">Loading...</div>`;

    if (this._alarms.length === 0) {
      return html`
        <div class="empty-state">
          <div class="icon">&#x2714;</div>
          <div>No active alarms</div>
        </div>
      `;
    }

    return html`
      <div class="header-actions">
        <span class="count-badge" style="background: ${getPriorityColor(3)}22; color: ${getPriorityColor(3)}">
          ${this._alarms.length} active
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Name</th>
            <th>State</th>
            <th>Source</th>
            <th>Value</th>
            <th>Triggered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this._alarms
            .sort((a, b) => b.priority - a.priority)
            .map((alarm) => {
              const rowClass = alarm.priority >= 3 ? "alarm-row-critical" : alarm.priority >= 2 ? "alarm-row-high" : "";
              const isUnacked = alarm.runtime.state === "active_unacknowledged" || alarm.runtime.state === "returned_to_normal_unacknowledged";
              return html`
                <tr class="${rowClass} ${alarm.priority >= 3 && isUnacked ? "flashing" : ""}">
                  <td><severity-badge .priority=${alarm.priority}></severity-badge></td>
                  <td><strong>${alarm.name}</strong>${alarm.area ? html`<br><span class="time-ago">${alarm.area}</span>` : ""}</td>
                  <td><span class="badge" style="background: ${getStateColor(alarm.runtime.state)}">${STATE_LABELS[alarm.runtime.state] ?? alarm.runtime.state}</span></td>
                  <td>${alarm.source_entity_id}</td>
                  <td>${alarm.runtime.last_value ?? "-"}</td>
                  <td class="time-ago">${alarm.runtime.triggered_at ? new Date(alarm.runtime.triggered_at).toLocaleString() : "-"}</td>
                  <td class="actions">
                    ${isUnacked ? html`<button class="btn btn-primary btn-small" @click=${() => this._ack(alarm.id)}>ACK</button>` : ""}
                    <button class="btn btn-small" style="background: var(--alarm-shelved); color: white;" @click=${() => this._shelve(alarm.id)}>Shelve</button>
                  </td>
                </tr>
              `;
            })}
        </tbody>
      </table>
    `;
  }
}
