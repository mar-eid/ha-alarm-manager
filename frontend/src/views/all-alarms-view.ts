import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, getStateColor } from "../styles/shared-styles";
import { fetchAlarms, fetchChannels, deleteAlarm, shelveAlarm, unshelveAlarm, acknowledgeAlarm } from "../data/websocket";
import { STATE_LABELS, PRIORITY_LABELS, type HomeAssistant, type AlarmWithState, type AlarmChannel } from "../types";
import "../components/severity-badge";
import "../components/alarm-detail-dialog";
import "../components/shelve-dialog";

@customElement("all-alarms-view")
export class AllAlarmsView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property() priorityFilter = "";
  @state() private _alarms: AlarmWithState[] = [];
  @state() private _channels: AlarmChannel[] = [];
  @state() private _loading = true;
  @state() private _detailAlarm?: AlarmWithState;
  @state() private _shelveTarget?: AlarmWithState;

  // Column filters
  @state() private _filterPriority = "";
  @state() private _filterName = "";
  @state() private _filterState = "";
  @state() private _filterEntity = "";
  @state() private _filterTrigger = "";
  @state() private _filterChannel = "";
  @state() private _filterTag = "";
  @state() private _filterEnabled = "";

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; }
      .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .filter-row input, .filter-row select {
        width: 100%; padding: 4px 6px; font-size: 0.8em;
        border: 1px solid var(--divider-color, #ccc); border-radius: 4px;
        background: var(--card-background-color, white);
        color: var(--primary-text-color, #333);
      }
      .test-ok { color: var(--alarm-normal, #4CAF50); font-size: 0.8em; }
      tbody tr { cursor: pointer; }
      .overlay {
        position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,.45); padding: 20px;
      }
      .confirm-dialog {
        background: var(--card-background-color, #fff); border-radius: 12px; padding: 24px;
        box-shadow: 0 16px 48px rgba(0,0,0,.3); max-width: 400px; width: 100%;
      }
      .confirm-dialog h3 { margin: 0 0 8px; font-size: 1.1em; }
      .confirm-dialog p { margin: 0 0 20px; font-size: 0.9em; color: var(--primary-text-color); line-height: 1.5; }
      .confirm-actions { display: flex; gap: 8px; justify-content: flex-end; }
      .toast {
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 999;
        padding: 10px 20px; border-radius: 9999px; font-size: 13px; font-weight: 500;
        background: var(--primary-text-color, #333); color: var(--card-background-color, #fff);
        box-shadow: 0 4px 16px rgba(0,0,0,.2); animation: toast-in .25s ease;
      }
      @keyframes toast-in { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  private async _load() {
    if (!this.hass) return;
    try {
      const [alarms, channels] = await Promise.all([
        fetchAlarms(this.hass),
        fetchChannels(this.hass),
      ]);
      this._alarms = alarms;
      this._channels = channels;
    } finally {
      this._loading = false;
    }
  }

  private _getChannelName(channelId: string | null): string {
    if (!channelId) return "-";
    const ch = this._channels.find((c) => c.id === channelId);
    return ch ? ch.name : channelId;
  }

  private get _filtered(): AlarmWithState[] {
    return this._alarms.filter((a) => {
      const pf = this.priorityFilter || this._filterPriority;
      if (pf && String(a.priority) !== pf) return false;
      if (this._filterName && !a.name.toLowerCase().includes(this._filterName.toLowerCase())) return false;
      if (this._filterState && a.runtime.state !== this._filterState) return false;
      if (this._filterEntity && !a.source_entity_id.toLowerCase().includes(this._filterEntity.toLowerCase())) return false;
      if (this._filterTrigger && a.trigger_type !== this._filterTrigger) return false;
      if (this._filterChannel && a.channel_id !== this._filterChannel) return false;
      if (this._filterTag && !(a.tag ?? "").toLowerCase().includes(this._filterTag.toLowerCase())) return false;
      if (this._filterEnabled === "yes" && !a.enabled) return false;
      if (this._filterEnabled === "no" && a.enabled) return false;
      return true;
    });
  }

  @state() private _deleteTarget?: AlarmWithState;
  @state() private _toast = "";

  private _showToast(msg: string) {
    this._toast = msg;
    setTimeout(() => (this._toast = ""), 2600);
  }

  private _confirmDelete(alarm: AlarmWithState) {
    this._deleteTarget = alarm;
  }

  private async _doDelete() {
    if (!this.hass || !this._deleteTarget) return;
    const name = this._deleteTarget.name;
    await deleteAlarm(this.hass, this._deleteTarget.id);
    this._deleteTarget = undefined;
    this._showToast(`Deleted: ${name}`);
    this._load();
  }

  private _edit(alarmId: string) {
    this.dispatchEvent(
      new CustomEvent("navigate", { detail: { view: "create-edit", alarmId }, bubbles: true, composed: true })
    );
  }

  private async _testNotification(alarm: AlarmWithState) {
    if (!this.hass || !alarm.channel_id) return;
    await this.hass.callService("scada_alarm_manager", "test_notification", {
      channel_id: alarm.channel_id,
    });
  }

  private _shelve(alarm: AlarmWithState) {
    this._shelveTarget = alarm;
  }

  private async _ack(alarmId: string) {
    if (!this.hass) return;
    await acknowledgeAlarm(this.hass, alarmId);
    this._showToast("Alarm acknowledged");
    this._load();
  }

  private async _unshelve(alarmId: string) {
    if (!this.hass) return;
    await unshelveAlarm(this.hass, alarmId);
    this._load();
  }

  render() {
    if (this._loading) return html`<div class="empty-state">Loading...</div>`;
    const filtered = this._filtered;

    return html`
      <div class="toolbar">
        <span>${filtered.length} of ${this._alarms.length} alarm${this._alarms.length !== 1 ? "s" : ""}</span>
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
            <th>Tag</th>
            <th>Enabled</th>
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
                ${Object.entries(STATE_LABELS).map(([k, v]) => html`<option value=${k}>${v}</option>`)}
              </select>
            </th>
            <th><input type="text" placeholder="Filter..." .value=${this._filterEntity} @input=${(e: Event) => this._filterEntity = (e.target as HTMLInputElement).value} /></th>
            <th>
              <select @change=${(e: Event) => this._filterTrigger = (e.target as HTMLSelectElement).value}>
                <option value="">All</option>
                <option value="analog">Analog</option>
                <option value="digital">Digital</option>
                <option value="custom_state">Custom</option>
              </select>
            </th>
            <th>
              <select @change=${(e: Event) => this._filterChannel = (e.target as HTMLSelectElement).value}>
                <option value="">All</option>
                ${this._channels.map((ch) => html`<option value=${ch.id}>${ch.name}</option>`)}
              </select>
            </th>
            <th><input type="text" placeholder="Filter..." .value=${this._filterTag} @input=${(e: Event) => this._filterTag = (e.target as HTMLInputElement).value} /></th>
            <th>
              <select @change=${(e: Event) => this._filterEnabled = (e.target as HTMLSelectElement).value}>
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(
            (alarm) => html`
              <tr @click=${() => this._detailAlarm = alarm}>
                <td><severity-badge .priority=${alarm.priority}></severity-badge></td>
                <td>
                  <strong>${alarm.name}</strong>
                  ${alarm.runtime.state === "shelved" && alarm.runtime.shelved_until
                    ? html`<br><span style="font-size: 0.75em; color: var(--secondary-text-color);">Until ${new Date(alarm.runtime.shelved_until).toLocaleString()}</span>`
                    : ""}
                </td>
                <td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${getStateColor(alarm.runtime.state)}" title="${STATE_LABELS[alarm.runtime.state] ?? alarm.runtime.state}"></span></td>
                <td>${alarm.source_entity_id}</td>
                <td>${alarm.trigger_type}</td>
                <td>${this._getChannelName(alarm.channel_id)}</td>
                <td>${alarm.tag || "-"}</td>
                <td>${alarm.enabled ? "Yes" : "No"}</td>
                <td class="actions">
                  ${alarm.runtime.state === "shelved"
                    ? html`<button class="btn btn-small" style="background: var(--alarm-shelved); color: white;" title="Remove shelve and restore alarm" @click=${(e: Event) => { e.stopPropagation(); this._unshelve(alarm.id); }}>Unshelve</button>`
                    : alarm.runtime.state !== "disabled"
                      ? html`<button class="btn btn-small" style="background: var(--alarm-shelved); color: white;" title="Temporarily suppress this alarm" @click=${(e: Event) => { e.stopPropagation(); this._shelve(alarm); }}>Shelve</button>`
                      : ""}
                  ${alarm.channel_id ? html`<button class="btn btn-small" style="background: #607D8B; color: white;" title="Send a test notification through this alarm's channel" @click=${(e: Event) => { e.stopPropagation(); this._testNotification(alarm); }}>Test</button>` : ""}
                  <button class="btn btn-small btn-primary" title="Edit alarm definition" @click=${(e: Event) => { e.stopPropagation(); this._edit(alarm.id); }}>Edit</button>
                  <button class="btn btn-small btn-danger" title="Permanently delete this alarm" @click=${(e: Event) => { e.stopPropagation(); this._confirmDelete(alarm); }}>Delete</button>
                </td>
              </tr>
            `
          )}
        </tbody>
      </table>
      <alarm-detail-dialog
        .alarm=${this._detailAlarm}
        .open=${!!this._detailAlarm}
        @close=${() => this._detailAlarm = undefined}
        @edit-alarm=${(e: CustomEvent) => this._edit(e.detail.id)}
        @ack-alarm=${(e: CustomEvent) => this._ack(e.detail.id)}
        @shelve-alarm=${(e: CustomEvent) => this._shelve(e.detail.alarm)}
      ></alarm-detail-dialog>

      <shelve-dialog
        .open=${!!this._shelveTarget}
        .alarmId=${this._shelveTarget?.id ?? ""}
        .alarmName=${this._shelveTarget?.name ?? ""}
        @dialog-closed=${() => (this._shelveTarget = undefined)}
        @shelve-confirm=${async (e: CustomEvent) => {
          await shelveAlarm(this.hass!, e.detail.alarmId, e.detail.minutes);
          this._shelveTarget = undefined;
          this._showToast("Alarm shelved");
          this._load();
        }}
      ></shelve-dialog>

      ${this._deleteTarget ? html`
        <div class="overlay" @click=${() => (this._deleteTarget = undefined)}>
          <div class="confirm-dialog" @click=${(e: Event) => e.stopPropagation()}>
            <h3>Delete alarm</h3>
            <p>Permanently delete <strong>${this._deleteTarget.name}</strong>?</p>
            <div class="confirm-actions">
              <button class="btn" style="background: var(--secondary-background-color)" @click=${() => (this._deleteTarget = undefined)}>Cancel</button>
              <button class="btn btn-danger" @click=${this._doDelete}>Delete</button>
            </div>
          </div>
        </div>
      ` : ""}

      ${this._toast ? html`<div class="toast">${this._toast}</div>` : ""}
    `;
  }
}
