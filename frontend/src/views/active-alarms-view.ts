import { LitElement, html, css, nothing, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  mdiMagnify,
  mdiCheckAll,
  mdiClose,
  mdiViewList,
  mdiViewGrid,
} from "@mdi/js";
import { sharedStyles, getPriorityColor } from "../styles/shared-styles";
import { fetchAlarms, fetchChannels, acknowledgeAlarm, acknowledgeAllAlarms, shelveAlarm, unshelveAlarm, triggerAlarmAction, subscribeAlarmChanges } from "../data/websocket";
import { STATE_LABELS, PRIORITY_LABELS, type HomeAssistant, type AlarmWithState, type AlarmChannel, type AlarmPriority } from "../types";
import { areaName, errorMessage, notify } from "../utils/format";
import { onActivateKey, renderEmpty, renderLoading, renderStateChip, renderValue } from "../utils/render";
import "../components/rel-time";
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

  // Column filters (the priority filter is shared with the KPI strip via `priorityFilter`)
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
        display: flex; align-items: center; justify-content: center;
        width: 24px; height: 24px; padding: 0; border: none; border-radius: 50%;
        background: none; cursor: pointer; color: inherit; --mdc-icon-size: 16px;
      }
      .search-box .clear:hover { background: var(--scada-hover-color); }
      .search-box:focus-within { border-color: var(--primary-color, #03a9f4); }
      .layout-toggle {
        display: flex; gap: 2px; margin-left: auto; --mdc-icon-size: 18px;
      }
      .layout-toggle button {
        width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
        border: 1px solid var(--divider-color, #e0e0e0); background: transparent; cursor: pointer;
        color: var(--secondary-text-color); border-radius: 6px;
      }
      .layout-toggle button[aria-pressed="true"] {
        background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: var(--primary-color);
      }
      .flashing { animation: flash 1s infinite alternate; }
      @keyframes flash { from { opacity: 1; } to { opacity: 0.5; } }
      @media (prefers-reduced-motion: reduce) { .flashing { animation: none; } }
      .alarm-row-critical td:first-child { box-shadow: inset 3px 0 0 ${unsafeCSS(getPriorityColor(3))}; }
      .alarm-row-high td:first-child { box-shadow: inset 3px 0 0 ${unsafeCSS(getPriorityColor(2))}; }
      .row-actions { white-space: nowrap; }
      .cards-grid {
        display: grid; gap: 14px;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
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
        if (this.priorityFilter && String(a.priority) !== this.priorityFilter) return false;
        if (this._filterState && a.runtime.state !== this._filterState) return false;
        if (this._filterTag && a.tag !== this._filterTag) return false;
        if (this._filterChannel && a.channel_id !== this._filterChannel) return false;
        if (this._search) {
          const q = this._search.toLowerCase();
          if (!a.name.toLowerCase().includes(q) &&
              !areaName(this.hass, a.area).toLowerCase().includes(q) &&
              !a.source_entity_id.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.priority - a.priority);
  }

  private _showToast(msg: string) {
    notify(this, msg);
  }

  private async _run(action: () => Promise<unknown>, success?: string) {
    try {
      await action();
      if (success) this._showToast(success);
    } catch (err) {
      this._showToast(`Failed: ${errorMessage(err)}`);
    }
  }

  private _setPriorityFilter(priority: string) {
    this.dispatchEvent(new CustomEvent("priority-filter", { detail: { priority }, bubbles: true, composed: true }));
  }

  private async _ack(alarmId: string) {
    if (!this.hass) return;
    await this._run(() => acknowledgeAlarm(this.hass!, alarmId), "Alarm acknowledged");
    this._loadAlarms();
  }

  private async _ackAll() {
    if (!this.hass) return;
    await this._run(async () => {
      const result = await acknowledgeAllAlarms(this.hass!);
      this._showToast(`Acknowledged ${result.acknowledged} alarms`);
    });
    this._loadAlarms();
  }

  private _shelve(alarm: AlarmWithState) {
    this._shelveTarget = alarm;
  }

  private async _unshelve(alarmId: string) {
    if (!this.hass) return;
    await this._run(() => unshelveAlarm(this.hass!, alarmId), "Alarm unshelved");
    this._loadAlarms();
  }

  private async _triggerAction(alarmId: string) {
    if (!this.hass) return;
    await this._run(() => triggerAlarmAction(this.hass!, alarmId), "Action triggered");
  }

  private async _testAlarm(alarmId: string) {
    if (!this.hass) return;
    await this._run(
      () => this.hass!.callService("scada_alarm_manager", "test_alarm_notification", { alarm_id: alarmId }),
      "Test notification sent"
    );
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
    if (this._loading) return renderLoading();

    if (this._alarms.length === 0) return renderEmpty("No active alarms");

    const filtered = this._filtered;
    const unackedCount = this._alarms.filter((a) => UNACKED.includes(a.runtime.state)).length;
    const activeStates = ["active_unacknowledged", "active_acknowledged", "returned_to_normal_unacknowledged"] as const;

    return html`
      <div class="toolbar">
        <span class="status-chip" style=${`--c:${getPriorityColor(3)}`}>${this._alarms.length} active</span>
        ${filtered.length !== this._alarms.length
          ? html`<span style="font-size: 0.85em; color: var(--secondary-text-color);">(${filtered.length} shown)</span>`
          : ""}

        <div class="search-box">
          <ha-svg-icon .path=${mdiMagnify}></ha-svg-icon>
          <input type="text" placeholder="Search alarms..." aria-label="Search alarms"
            .value=${this._search}
            @input=${(e: Event) => (this._search = (e.target as HTMLInputElement).value)} />
          ${this._search
            ? html`<button class="clear" aria-label="Clear search" title="Clear search" @click=${() => (this._search = "")}>
                <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
              </button>`
            : nothing}
        </div>

        ${this.priorityFilter
          ? html`<button class="filter-chip" title="Clear priority filter" @click=${() => this._setPriorityFilter("")}>
              Priority: ${PRIORITY_LABELS[Number(this.priorityFilter) as AlarmPriority]}
              <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
            </button>`
          : nothing}

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

        <button class="btn btn-primary" ?disabled=${unackedCount === 0} @click=${this._ackAll} title="Acknowledge all unacknowledged alarms">
          <ha-svg-icon .path=${mdiCheckAll}></ha-svg-icon>
          ACK All${unackedCount > 0 ? ` (${unackedCount})` : ""}
        </button>

        <div class="layout-toggle">
          <button aria-pressed=${this._layout === "table" ? "true" : "false"} @click=${() => (this._layout = "table")} title="Table view" aria-label="Table view">
            <ha-svg-icon .path=${mdiViewList}></ha-svg-icon>
          </button>
          <button aria-pressed=${this._layout === "cards" ? "true" : "false"} @click=${() => (this._layout = "cards")} title="Cards view" aria-label="Cards view">
            <ha-svg-icon .path=${mdiViewGrid}></ha-svg-icon>
          </button>
        </div>
      </div>

      ${this._layout === "cards" ? html`
        <div class="cards-grid">
          ${filtered.map((a) => html`
            <alarm-tile-card
              .hass=${this.hass}
              .alarm=${a}
              @ack-alarm=${(e: CustomEvent) => this._ack(e.detail.id)}
              @shelve-alarm=${(e: CustomEvent) => this._shelve(e.detail.alarm)}
              @open-alarm=${(e: CustomEvent) => (this._detailAlarm = e.detail.alarm)}>
            </alarm-tile-card>`)}
        </div>
      ` : html`
        <div class="table-wrap">
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
                <select aria-label="Filter by priority" @change=${(e: Event) => this._setPriorityFilter((e.target as HTMLSelectElement).value)}>
                  <option value="" ?selected=${!this.priorityFilter}>All</option>
                  ${([3, 2, 1, 0] as const).map((p) => html`<option value=${p} ?selected=${this.priorityFilter === String(p)}>${PRIORITY_LABELS[p]}</option>`)}
                </select>
              </th>
              <th></th>
              <th>
                <select aria-label="Filter by state" @change=${(e: Event) => (this._filterState = (e.target as HTMLSelectElement).value)}>
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
              const open = () => (this._detailAlarm = alarm);
              const stop = (e: Event) => e.stopPropagation();
              return html`
                <tr class="clickable ${rowClass} ${alarm.priority >= 3 && isUnacked ? "flashing" : ""}" tabindex="0"
                  aria-label=${`${alarm.name}, ${STATE_LABELS[alarm.runtime.state] ?? alarm.runtime.state}`}
                  @click=${open} @keydown=${onActivateKey(open)}>
                  <td><severity-badge .priority=${alarm.priority}></severity-badge></td>
                  <td><strong>${alarm.name}</strong>${alarm.area ? html`<br><span class="muted">${areaName(this.hass, alarm.area)}</span>` : ""}</td>
                  <td>${renderStateChip(alarm.runtime.state)}</td>
                  <td class="mono">${alarm.source_entity_id}</td>
                  <td>${renderValue(this.hass, alarm)}</td>
                  <td class="muted"><rel-time .hass=${this.hass} .datetime=${alarm.runtime.triggered_at}></rel-time></td>
                  <td class="row-actions" @keydown=${stop}>
                    ${isUnacked ? html`<button class="btn btn-primary btn-small" title="Acknowledge this alarm" @click=${(e: Event) => { stop(e); this._ack(alarm.id); }}>ACK</button>` : ""}
                    <button class="btn btn-shelve btn-small" title="Temporarily suppress this alarm" @click=${(e: Event) => { stop(e); this._shelve(alarm); }}>Shelve</button>
                  </td>
                </tr>
              `;
            })}
          </tbody>
        </table>
        </div>
      `}

      <alarm-detail-dialog
        .hass=${this.hass}
        .channels=${this._channels}
        .alarm=${this._detailAlarm}
        .open=${!!this._detailAlarm}
        @close=${() => (this._detailAlarm = undefined)}
        @edit-alarm=${(e: CustomEvent) => this._edit(e.detail.id)}
        @ack-alarm=${(e: CustomEvent) => this._ack(e.detail.id)}
        @shelve-alarm=${(e: CustomEvent) => this._shelve(e.detail.alarm)}
        @unshelve-alarm=${(e: CustomEvent) => this._unshelve(e.detail.id)}
        @trigger-action=${(e: CustomEvent) => this._triggerAction(e.detail.id)}
        @test-alarm=${(e: CustomEvent) => this._testAlarm(e.detail.id)}
      ></alarm-detail-dialog>

      <shelve-dialog
        .open=${!!this._shelveTarget}
        .alarmId=${this._shelveTarget?.id ?? ""}
        .alarmName=${this._shelveTarget?.name ?? ""}
        @dialog-closed=${() => (this._shelveTarget = undefined)}
        @shelve-confirm=${async (e: CustomEvent) => {
          this._shelveTarget = undefined;
          await this._run(() => shelveAlarm(this.hass!, e.detail.alarmId, e.detail.minutes), "Alarm shelved");
          this._loadAlarms();
        }}
      ></shelve-dialog>

    `;
  }
}
