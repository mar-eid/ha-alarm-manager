import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, getPriorityColor, getStateColor } from "../styles/shared-styles";
import { fetchAlarms, acknowledgeAlarm, shelveAlarm, subscribeAlarmChanges } from "../data/websocket";
import { STATE_LABELS, PRIORITY_LABELS, type HomeAssistant, type AlarmWithState } from "../types";
import "../components/severity-badge";
import "../components/alarm-detail-dialog";
import "../components/shelve-dialog";

@customElement("active-alarms-view")
export class ActiveAlarmsView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property() priorityFilter = "";
  @state() private _alarms: AlarmWithState[] = [];
  @state() private _loading = true;
  private _unsub?: () => void;

  @state() private _detailAlarm?: AlarmWithState;
  @state() private _shelveTarget?: AlarmWithState;

  // Column filters
  @state() private _filterPriority = "";
  @state() private _filterName = "";
  @state() private _filterState = "";
  @state() private _filterSource = "";

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
      tbody tr { cursor: pointer; }
      .time-ago { font-size: 0.8em; color: var(--secondary-text-color); }
      .filter-row input, .filter-row select {
        width: 100%; padding: 4px 6px; font-size: 0.8em;
        border: 1px solid var(--divider-color, #ccc); border-radius: 4px;
        background: var(--card-background-color, white);
        color: var(--primary-text-color, #333);
      }
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

  private get _filtered(): AlarmWithState[] {
    const pf = this.priorityFilter || this._filterPriority;
    return this._alarms
      .filter((a) => {
        if (pf && String(a.priority) !== pf) return false;
        if (this._filterName && !a.name.toLowerCase().includes(this._filterName.toLowerCase())) return false;
        if (this._filterState && a.runtime.state !== this._filterState) return false;
        if (this._filterSource && !a.source_entity_id.toLowerCase().includes(this._filterSource.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.priority - a.priority);
  }

  private async _ack(alarmId: string) {
    if (!this.hass) return;
    await acknowledgeAlarm(this.hass, alarmId);
    this._loadAlarms();
  }

  private _shelve(alarm: AlarmWithState) {
    this._shelveTarget = alarm;
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

    const filtered = this._filtered;
    const activeStates = ["active_unacknowledged", "active_acknowledged", "returned_to_normal_unacknowledged"] as const;

    return html`
      <div class="header-actions">
        <span class="count-badge" style="background: ${getPriorityColor(3)}22; color: ${getPriorityColor(3)}">
          ${this._alarms.length} active
        </span>
        ${filtered.length !== this._alarms.length ? html`<span style="font-size: 0.85em; color: var(--secondary-text-color);">(showing ${filtered.length})</span>` : ""}
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
          <tr class="filter-row">
            <th>
              <select @change=${(e: Event) => this._filterPriority = (e.target as HTMLSelectElement).value}>
                <option value="">All</option>
                ${([0, 1, 2, 3] as const).map((p) => html`<option value=${p}>${PRIORITY_LABELS[p]}</option>`)}
              </select>
            </th>
            <th><input type="text" placeholder="Filter..." .value=${this._filterName} @input=${(e: Event) => this._filterName = (e.target as HTMLInputElement).value} /></th>
            <th>
              <select @change=${(e: Event) => this._filterState = (e.target as HTMLSelectElement).value}>
                <option value="">All</option>
                ${activeStates.map((s) => html`<option value=${s}>${STATE_LABELS[s]}</option>`)}
              </select>
            </th>
            <th><input type="text" placeholder="Filter..." .value=${this._filterSource} @input=${(e: Event) => this._filterSource = (e.target as HTMLInputElement).value} /></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map((alarm) => {
            const rowClass = alarm.priority >= 3 ? "alarm-row-critical" : alarm.priority >= 2 ? "alarm-row-high" : "";
            const isUnacked = alarm.runtime.state === "active_unacknowledged" || alarm.runtime.state === "returned_to_normal_unacknowledged";
            return html`
              <tr class="${rowClass} ${alarm.priority >= 3 && isUnacked ? "flashing" : ""}" @click=${() => this._detailAlarm = alarm}>
                <td><severity-badge .priority=${alarm.priority}></severity-badge></td>
                <td><strong>${alarm.name}</strong>${alarm.area ? html`<br><span class="time-ago">${alarm.area}</span>` : ""}</td>
                <td><span class="badge" style="background: ${getStateColor(alarm.runtime.state)}">${STATE_LABELS[alarm.runtime.state] ?? alarm.runtime.state}</span></td>
                <td>${alarm.source_entity_id}</td>
                <td>${alarm.runtime.last_value ?? "-"}</td>
                <td class="time-ago">${alarm.runtime.triggered_at ? new Date(alarm.runtime.triggered_at).toLocaleString() : "-"}</td>
                <td class="actions">
                  ${isUnacked ? html`<button class="btn btn-primary btn-small" @click=${(e: Event) => { e.stopPropagation(); this._ack(alarm.id); }}>ACK</button>` : ""}
                  <button class="btn btn-small" style="background: var(--alarm-shelved); color: white;" @click=${(e: Event) => { e.stopPropagation(); this._shelve(alarm); }}>Shelve</button>
                </td>
              </tr>
            `;
          })}
        </tbody>
      </table>
      <alarm-detail-dialog
        .alarm=${this._detailAlarm}
        .open=${!!this._detailAlarm}
        @close=${() => this._detailAlarm = undefined}
      ></alarm-detail-dialog>
      <shelve-dialog
        .open=${!!this._shelveTarget}
        .alarmId=${this._shelveTarget?.id ?? ""}
        .alarmName=${this._shelveTarget?.name ?? ""}
        @dialog-closed=${() => this._shelveTarget = undefined}
        @shelve-confirm=${async (e: CustomEvent) => {
          await shelveAlarm(this.hass!, e.detail.alarmId, e.detail.minutes);
          this._shelveTarget = undefined;
          this._loadAlarms();
        }}
      ></shelve-dialog>
    `;
  }
}
