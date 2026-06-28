import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  mdiMagnify,
  mdiCheckAll,
  mdiClose,
  mdiViewList,
  mdiViewGrid,
} from "@mdi/js";
import { sharedStyles, getPriorityColor, getStateColor } from "../styles/shared-styles";
import { fetchAlarms, fetchChannels, acknowledgeAlarm, acknowledgeAllAlarms, shelveAlarm, subscribeAlarmChanges } from "../data/websocket";
import { STATE_LABELS, PRIORITY_LABELS, type HomeAssistant, type AlarmWithState, type AlarmChannel } from "../types";
import "../components/severity-badge";
import "../components/alarm-detail-dialog";
import "../components/shelve-dialog";
import "../components/alarm-tile-card";

const UNACKED = ["active_unacknowledged", "returned_to_normal_unacknowledged"];

@customElement("active-alarms-view")
export class ActiveAlarmsView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property() priorityFilter = "";
  @state() private _alarms: AlarmWithState[] = [];
  @state() private _loading = true;
  private _unsub?: () => void;

  @state() private _detailAlarm?: AlarmWithState;
  @state() private _shelveTarget?: AlarmWithState;
  @state() private _layout: "table" | "cards" = "table";
  @state() private _search = "";
  @state() private _toast = "";

  // Column filters
  @state() private _filterPriority = "";
  @state() private _filterState = "";
  @state() private _filterTag = "";
  @state() private _filterChannel = "";
  @state() private _channels: AlarmChannel[] = [];

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; }
      .toolbar {
        display: flex; gap: 8px; margin-bottom: 14px; align-items: center; flex-wrap: wrap;
      }
      .count-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 12px; border-radius: 16px; font-size: 0.85em; font-weight: 600;
      }
      .search-box {
        display: flex; align-items: center; gap: 6px; flex: 1; min-width: 180px; max-width: 320px;
        height: 34px; padding: 0 10px; border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 9999px; background: var(--card-background-color, #fff);
        --mdc-icon-size: 18px; color: var(--secondary-text-color);
      }
      .search-box input {
        border: none; background: transparent; outline: none; font: inherit; font-size: 13px;
        color: var(--primary-text-color); flex: 1; min-width: 0;
      }
      .toolbar-filter {
        height: 34px; padding: 0 8px; border-radius: 8px; font: inherit; font-size: 13px;
        border: 1px solid var(--divider-color, #e0e0e0);
        background: var(--card-background-color, #fff); color: var(--primary-text-color);
      }
      .search-box .clear {
        cursor: pointer; --mdc-icon-size: 16px; display: flex; align-items: center;
      }
      .ack-all {
        display: inline-flex; align-items: center; gap: 5px; height: 34px; padding: 0 14px;
        border: none; border-radius: 9999px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 600;
        background: var(--primary-color, #03a9f4); color: #fff; --mdc-icon-size: 17px;
        transition: opacity .15s;
      }
      .ack-all:hover { opacity: 0.85; }
      .ack-all:disabled { opacity: 0.4; cursor: default; }
      .layout-toggle {
        display: flex; gap: 2px; margin-left: auto; --mdc-icon-size: 18px;
      }
      .layout-toggle button {
        width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
        border: 1px solid var(--divider-color, #e0e0e0); background: transparent; cursor: pointer;
        color: var(--secondary-text-color); border-radius: 6px;
      }
      .layout-toggle button.active {
        background: var(--primary-color); color: #fff; border-color: var(--primary-color);
      }
      .flashing { animation: flash 1s infinite alternate; }
      @keyframes flash { from { opacity: 1; } to { opacity: 0.5; } }
      @media (prefers-reduced-motion: reduce) { .flashing { animation: none; } }
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
      .cards-grid {
        display: grid; gap: 14px;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
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
    this._loadAlarms();
    this._loadChannels();
    this._subscribe();
  }

  private async _loadChannels() {
    if (!this.hass) return;
    this._channels = await fetchChannels(this.hass);
  }

  private get _tags(): string[] {
    return [...new Set(this._alarms.map((a) => a.tag).filter(Boolean))].sort();
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
    this._unsub = await subscribeAlarmChanges(this.hass, () => this._loadAlarms());
  }

  private get _filtered(): AlarmWithState[] {
    return this._alarms
      .filter((a) => {
        const pf = this.priorityFilter || this._filterPriority;
        if (pf && String(a.priority) !== pf) return false;
        if (this._filterState && a.runtime.state !== this._filterState) return false;
        if (this._filterTag && a.tag !== this._filterTag) return false;
        if (this._filterChannel && a.channel_id !== this._filterChannel) return false;
        if (this._search) {
          const q = this._search.toLowerCase();
          if (!a.name.toLowerCase().includes(q) &&
              !a.area.toLowerCase().includes(q) &&
              !a.source_entity_id.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.priority - a.priority);
  }

  private _showToast(msg: string) {
    this._toast = msg;
    setTimeout(() => (this._toast = ""), 2600);
  }

  private async _ack(alarmId: string) {
    if (!this.hass) return;
    await acknowledgeAlarm(this.hass, alarmId);
    this._showToast("Alarm acknowledged");
    this._loadAlarms();
  }

  private async _ackAll() {
    if (!this.hass) return;
    const result = await acknowledgeAllAlarms(this.hass);
    this._showToast(`Acknowledged ${result.acknowledged} alarms`);
    this._loadAlarms();
  }

  private _shelve(alarm: AlarmWithState) {
    this._shelveTarget = alarm;
  }

  private _edit(alarmId: string) {
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { view: "create-edit", alarmId },
        bubbles: true,
        composed: true,
      })
    );
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
    const unackedCount = this._alarms.filter((a) => UNACKED.includes(a.runtime.state)).length;
    const activeStates = ["active_unacknowledged", "active_acknowledged", "returned_to_normal_unacknowledged"] as const;

    return html`
      <div class="toolbar">
        <span class="count-badge" style="background: ${getPriorityColor(3)}22; color: ${getPriorityColor(3)}">
          ${this._alarms.length} active
        </span>
        ${filtered.length !== this._alarms.length
          ? html`<span style="font-size: 0.85em; color: var(--secondary-text-color);">(${filtered.length} shown)</span>`
          : ""}

        <div class="search-box">
          <ha-svg-icon .path=${mdiMagnify}></ha-svg-icon>
          <input type="text" placeholder="Search alarms..."
            .value=${this._search}
            @input=${(e: Event) => (this._search = (e.target as HTMLInputElement).value)} />
          ${this._search
            ? html`<span class="clear" @click=${() => (this._search = "")}><ha-svg-icon .path=${mdiClose}></ha-svg-icon></span>`
            : nothing}
        </div>

        <select class="toolbar-filter" title="Filter by tag"
          .value=${this._filterTag}
          @change=${(e: Event) => (this._filterTag = (e.target as HTMLSelectElement).value)}>
          <option value="">All tags</option>
          ${this._tags.map((t) => html`<option value=${t}>${t}</option>`)}
        </select>

        <select class="toolbar-filter" title="Filter by channel"
          .value=${this._filterChannel}
          @change=${(e: Event) => (this._filterChannel = (e.target as HTMLSelectElement).value)}>
          <option value="">All channels</option>
          ${this._channels.map((ch) => html`<option value=${ch.id}>${ch.name}</option>`)}
        </select>

        <button class="ack-all" ?disabled=${unackedCount === 0} @click=${this._ackAll} title="Acknowledge all unacknowledged alarms">
          <ha-svg-icon .path=${mdiCheckAll}></ha-svg-icon>
          ACK All${unackedCount > 0 ? ` (${unackedCount})` : ""}
        </button>

        <div class="layout-toggle">
          <button class="${this._layout === "table" ? "active" : ""}" @click=${() => (this._layout = "table")} title="Table view">
            <ha-svg-icon .path=${mdiViewList}></ha-svg-icon>
          </button>
          <button class="${this._layout === "cards" ? "active" : ""}" @click=${() => (this._layout = "cards")} title="Cards view">
            <ha-svg-icon .path=${mdiViewGrid}></ha-svg-icon>
          </button>
        </div>
      </div>

      ${this._layout === "cards" ? html`
        <div class="cards-grid">
          ${filtered.map((a) => html`
            <alarm-tile-card
              .alarm=${a}
              @ack-alarm=${(e: CustomEvent) => this._ack(e.detail.id)}
              @shelve-alarm=${(e: CustomEvent) => this._shelve(e.detail.alarm)}
              @open-alarm=${(e: CustomEvent) => (this._detailAlarm = e.detail.alarm)}>
            </alarm-tile-card>`)}
        </div>
      ` : html`
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>State</th>
              <th>Source</th>
              <th>Value</th>
              <th>Triggered</th>
              <th>Actions</th>
            </tr>
            <tr class="filter-row">
              <th>
                <select @change=${(e: Event) => (this._filterPriority = (e.target as HTMLSelectElement).value)}>
                  <option value="">All</option>
                  ${([0, 1, 2, 3] as const).map((p) => html`<option value=${p}>${PRIORITY_LABELS[p]}</option>`)}
                </select>
              </th>
              <th></th>
              <th>
                <select @change=${(e: Event) => (this._filterState = (e.target as HTMLSelectElement).value)}>
                  <option value="">All</option>
                  ${activeStates.map((s) => html`<option value=${s}>${STATE_LABELS[s]}</option>`)}
                </select>
              </th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((alarm) => {
              const rowClass = alarm.priority >= 3 ? "alarm-row-critical" : alarm.priority >= 2 ? "alarm-row-high" : "";
              const isUnacked = UNACKED.includes(alarm.runtime.state);
              return html`
                <tr class="${rowClass} ${alarm.priority >= 3 && isUnacked ? "flashing" : ""}" @click=${() => (this._detailAlarm = alarm)}>
                  <td><severity-badge .priority=${alarm.priority}></severity-badge></td>
                  <td><strong>${alarm.name}</strong>${alarm.area ? html`<br><span class="time-ago">${alarm.area}</span>` : ""}</td>
                  <td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${getStateColor(alarm.runtime.state)}" title="${STATE_LABELS[alarm.runtime.state] ?? alarm.runtime.state}"></span></td>
                  <td style="font-size:0.85em">${alarm.source_entity_id}</td>
                  <td>${alarm.runtime.last_value ?? "-"}</td>
                  <td class="time-ago">${alarm.runtime.triggered_at ? new Date(alarm.runtime.triggered_at).toLocaleString() : "-"}</td>
                  <td class="actions">
                    ${isUnacked ? html`<button class="btn btn-primary btn-small" title="Acknowledge this alarm" @click=${(e: Event) => { e.stopPropagation(); this._ack(alarm.id); }}>ACK</button>` : ""}
                    <button class="btn btn-small" style="background: var(--alarm-shelved); color: white;" title="Temporarily suppress this alarm" @click=${(e: Event) => { e.stopPropagation(); this._shelve(alarm); }}>Shelve</button>
                  </td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      `}

      <alarm-detail-dialog
        .alarm=${this._detailAlarm}
        .open=${!!this._detailAlarm}
        @close=${() => (this._detailAlarm = undefined)}
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
          this._loadAlarms();
        }}
      ></shelve-dialog>

      ${this._toast ? html`<div class="toast">${this._toast}</div>` : nothing}
    `;
  }
}
