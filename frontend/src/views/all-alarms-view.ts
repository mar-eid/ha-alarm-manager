import { LitElement, html, css, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  mdiArrowDown,
  mdiArrowUp,
  mdiBellCheck,
  mdiBellSleep,
  mdiBellRing,
  mdiChevronDown,
  mdiChevronRight,
  mdiClose,
  mdiDelete,
  mdiGestureTap,
  mdiGroup,
  mdiPencil,
  mdiSend,
} from "@mdi/js";
import { sharedStyles } from "../styles/shared-styles";
import { fetchAlarms, fetchChannels, deleteAlarm, shelveAlarm, unshelveAlarm, acknowledgeAlarm, triggerAlarmAction } from "../data/websocket";
import { STATE_LABELS, PRIORITY_LABELS, type HomeAssistant, type AlarmWithState, type AlarmChannel, type AlarmPriority } from "../types";
import { areaName, channelName, errorMessage, formatDateTime, notify } from "../utils/format";
import { onActivateKey, renderLoading, renderStateChip } from "../utils/render";
import type { RowMenuItem } from "../components/row-menu";
import "../components/severity-badge";
import "../components/alarm-detail-dialog";
import "../components/shelve-dialog";
import "../components/scada-dialog";
import "../components/row-menu";

type SortKey = "priority" | "name" | "state" | "entity" | "trigger" | "channel" | "tag" | "enabled";

const UNACKED = ["active_unacknowledged", "returned_to_normal_unacknowledged"];
/** Sort order for states: most urgent first when sorting descending. */
const STATE_RANK: Record<string, number> = {
  active_unacknowledged: 5,
  returned_to_normal_unacknowledged: 4,
  active_acknowledged: 3,
  shelved: 2,
  normal: 1,
  disabled: 0,
};
const COLUMN_COUNT = 9;
const NO_AREA = "No area";

@customElement("all-alarms-view")
export class AllAlarmsView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  /** Shared priority filter (KPI strip + column filter), owned by the overview. */
  @property() priorityFilter = "";
  @state() private _alarms: AlarmWithState[] = [];
  @state() private _channels: AlarmChannel[] = [];
  @state() private _loading = true;
  @state() private _detailAlarm?: AlarmWithState;
  @state() private _shelveTarget?: AlarmWithState;
  @state() private _deleteTarget?: AlarmWithState;

  // Column filters
  @state() private _filterName = "";
  @state() private _filterState = "";
  @state() private _filterEntity = "";
  @state() private _filterTrigger = "";
  @state() private _filterChannel = "";
  @state() private _filterTag = "";
  @state() private _filterEnabled = "";

  // Sorting and grouping
  @state() private _sortKey: SortKey = "priority";
  @state() private _sortDesc = true;
  @state() private _groupByArea = false;
  @state() private _collapsed = new Set<string>();

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; }
      .toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 16px; }
      .toolbar .count { margin-right: auto; }
      .toggle[aria-pressed="true"] {
        background: color-mix(in srgb, var(--primary-color, #03a9f4) 14%, transparent);
        color: var(--primary-color, #03a9f4);
      }
      .name-sub { font-size: 0.75em; color: var(--secondary-text-color); }
      td.menu-cell { width: 40px; padding: 0 4px; text-align: right; }
      .group-row td {
        padding: 0;
        background: var(--secondary-background-color, #f5f5f5);
      }
      .group-row:hover { background: none; }
      .group-btn {
        display: flex; align-items: center; gap: 8px; width: 100%;
        padding: 8px 12px; border: none; background: none; cursor: pointer;
        font: inherit; font-weight: 500; text-align: left; color: var(--primary-text-color);
        --mdc-icon-size: 20px;
      }
      .group-btn:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: -2px; }
      .group-btn .n { font-weight: 400; color: var(--secondary-text-color); }
      .confirm-text { margin: 0; line-height: 1.5; }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  private async _load() {
    if (!this.hass) return;
    try {
      const [alarms, channels] = await Promise.all([fetchAlarms(this.hass), fetchChannels(this.hass)]);
      this._alarms = alarms;
      this._channels = channels;
    } finally {
      this._loading = false;
    }
  }

  private get _filtered(): AlarmWithState[] {
    return this._alarms.filter((a) => {
      if (this.priorityFilter && String(a.priority) !== this.priorityFilter) return false;
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

  private _sortValue(a: AlarmWithState): string | number {
    switch (this._sortKey) {
      case "priority": return a.priority;
      case "name": return a.name.toLowerCase();
      case "state": return STATE_RANK[a.runtime.state] ?? -1;
      case "entity": return a.source_entity_id;
      case "trigger": return a.trigger_type;
      case "channel": return channelName(this._channels, a.channel_id).toLowerCase();
      case "tag": return (a.tag ?? "").toLowerCase();
      case "enabled": return a.enabled ? 1 : 0;
    }
  }

  private _sorted(list: AlarmWithState[]): AlarmWithState[] {
    const dir = this._sortDesc ? -1 : 1;
    return [...list].sort((x, y) => {
      const a = this._sortValue(x);
      const b = this._sortValue(y);
      const c = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));
      return c * dir || x.name.localeCompare(y.name);
    });
  }

  private _setSort(key: SortKey) {
    if (this._sortKey === key) {
      this._sortDesc = !this._sortDesc;
    } else {
      this._sortKey = key;
      // Priority/state/enabled read best most-important-first; text columns A→Z.
      this._sortDesc = key === "priority" || key === "state" || key === "enabled";
    }
  }

  private _setPriorityFilter(priority: string) {
    this.dispatchEvent(new CustomEvent("priority-filter", { detail: { priority }, bubbles: true, composed: true }));
  }

  private _toggleGroup(name: string) {
    const next = new Set(this._collapsed);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    this._collapsed = next;
  }

  private async _run(action: () => Promise<unknown>, success?: string) {
    try {
      await action();
      if (success) notify(this, success);
    } catch (err) {
      notify(this, `Failed: ${errorMessage(err)}`);
    }
  }

  private async _doDelete() {
    if (!this.hass || !this._deleteTarget) return;
    const { id, name } = this._deleteTarget;
    this._deleteTarget = undefined;
    await this._run(() => deleteAlarm(this.hass!, id), `Deleted: ${name}`);
    this._load();
  }

  private _edit(alarmId: string) {
    this.dispatchEvent(
      new CustomEvent("navigate", { detail: { view: "create-edit", alarmId }, bubbles: true, composed: true })
    );
  }

  private async _testNotification(alarm: AlarmWithState) {
    if (!this.hass) return;
    await this._run(
      () => this.hass!.callService("scada_alarm_manager", "test_alarm_notification", { alarm_id: alarm.id }),
      `Test notification sent: ${alarm.name}`
    );
  }

  private async _triggerAction(alarmId: string) {
    if (!this.hass) return;
    await this._run(() => triggerAlarmAction(this.hass!, alarmId), "Action triggered");
  }

  private async _ack(alarmId: string) {
    if (!this.hass) return;
    await this._run(() => acknowledgeAlarm(this.hass!, alarmId), "Alarm acknowledged");
    this._load();
  }

  private async _unshelve(alarmId: string) {
    if (!this.hass) return;
    await this._run(() => unshelveAlarm(this.hass!, alarmId), "Alarm unshelved");
    this._load();
  }

  private _menuItems(alarm: AlarmWithState): RowMenuItem[] {
    const s = alarm.runtime.state;
    const items: RowMenuItem[] = [];
    if (UNACKED.includes(s)) items.push({ action: "ack", label: "Acknowledge", icon: mdiBellCheck });
    if (s === "shelved") items.push({ action: "unshelve", label: "Unshelve", icon: mdiBellRing });
    else if (s !== "disabled") items.push({ action: "shelve", label: "Shelve", icon: mdiBellSleep });
    if (alarm.action_service) {
      items.push({ action: "action", label: alarm.action_label || "Run action", icon: mdiGestureTap });
    }
    if (alarm.channel_id) {
      items.push({ action: "test", label: "Send test notification", icon: mdiSend });
    }
    const external = alarm.trigger_type === "external";
    items.push({
      action: "edit",
      label: "Edit",
      icon: mdiPencil,
      disabled: external,
      title: external ? "External alarms are managed by automations/blueprints and can't be edited here" : undefined,
    });
    items.push({ action: "delete", label: "Delete", icon: mdiDelete, danger: true });
    return items;
  }

  private _onMenu(alarm: AlarmWithState, action: string) {
    switch (action) {
      case "ack": this._ack(alarm.id); break;
      case "shelve": this._shelveTarget = alarm; break;
      case "unshelve": this._unshelve(alarm.id); break;
      case "action": this._triggerAction(alarm.id); break;
      case "test": this._testNotification(alarm); break;
      case "edit": this._edit(alarm.id); break;
      case "delete": this._deleteTarget = alarm; break;
    }
  }

  private _th(key: SortKey, label: string) {
    const sorted = this._sortKey === key;
    return html`
      <th aria-sort=${sorted ? (this._sortDesc ? "descending" : "ascending") : "none"}>
        <button class="sort-btn ${sorted ? "sorted" : ""}" @click=${() => this._setSort(key)}>
          ${label}
          ${sorted ? html`<ha-svg-icon .path=${this._sortDesc ? mdiArrowDown : mdiArrowUp}></ha-svg-icon>` : nothing}
        </button>
      </th>
    `;
  }

  private _renderRow(alarm: AlarmWithState): TemplateResult {
    const open = () => (this._detailAlarm = alarm);
    return html`
      <tr class="clickable" tabindex="0" aria-label=${`${alarm.name}, open details`} @click=${open} @keydown=${onActivateKey(open)}>
        <td><severity-badge .priority=${alarm.priority}></severity-badge></td>
        <td>
          <strong>${alarm.name}</strong>
          ${alarm.runtime.state === "shelved" && alarm.runtime.shelved_until
            ? html`<br /><span class="name-sub">Until ${formatDateTime(this.hass, alarm.runtime.shelved_until)}</span>`
            : nothing}
          ${alarm.suppressed_by
            ? html`<br /><span class="name-sub" title="Escalated: a more severe alarm on the same sensor is active">↳ Suppressed by ${alarm.suppressed_by.name}</span>`
            : nothing}
        </td>
        <td>${renderStateChip(alarm.runtime.state)}</td>
        <td class="mono">${alarm.source_entity_id}</td>
        <td>${alarm.trigger_type}</td>
        <td>${channelName(this._channels, alarm.channel_id) || "—"}</td>
        <td>${alarm.tag || "—"}</td>
        <td>${alarm.enabled ? "Yes" : "No"}</td>
        <td class="menu-cell">
          <row-menu
            .items=${this._menuItems(alarm)}
            .label=${`Actions for ${alarm.name}`}
            @menu-select=${(e: CustomEvent) => this._onMenu(alarm, e.detail.action)}
          ></row-menu>
        </td>
      </tr>
    `;
  }

  private _renderBody(list: AlarmWithState[]) {
    if (!this._groupByArea) return this._sorted(list).map((a) => this._renderRow(a));
    const groups = new Map<string, AlarmWithState[]>();
    for (const a of list) {
      const name = areaName(this.hass, a.area) || NO_AREA;
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name)!.push(a);
    }
    const names = [...groups.keys()].sort((a, b) =>
      a === NO_AREA ? 1 : b === NO_AREA ? -1 : a.localeCompare(b)
    );
    return names.map((name) => {
      const rows = groups.get(name)!;
      const collapsed = this._collapsed.has(name);
      return html`
        <tr class="group-row">
          <td colspan=${COLUMN_COUNT}>
            <button class="group-btn" aria-expanded=${collapsed ? "false" : "true"} @click=${() => this._toggleGroup(name)}>
              <ha-svg-icon .path=${collapsed ? mdiChevronRight : mdiChevronDown}></ha-svg-icon>
              ${name} <span class="n">(${rows.length})</span>
            </button>
          </td>
        </tr>
        ${collapsed ? nothing : this._sorted(rows).map((a) => this._renderRow(a))}
      `;
    });
  }

  render() {
    if (this._loading) return renderLoading();
    const filtered = this._filtered;

    return html`
      <div class="toolbar">
        <span class="count">${filtered.length} of ${this._alarms.length} alarm${this._alarms.length !== 1 ? "s" : ""}</span>
        ${this.priorityFilter
          ? html`<button class="filter-chip" title="Clear priority filter" @click=${() => this._setPriorityFilter("")}>
              Priority: ${PRIORITY_LABELS[Number(this.priorityFilter) as AlarmPriority]}
              <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
            </button>`
          : nothing}
        <button
          class="btn toggle"
          aria-pressed=${this._groupByArea ? "true" : "false"}
          @click=${() => (this._groupByArea = !this._groupByArea)}
        >
          <ha-svg-icon .path=${mdiGroup}></ha-svg-icon>Group by area
        </button>
        <button class="btn btn-primary" @click=${() => this._edit("")}>+ New alarm</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              ${this._th("priority", "Priority")}
              ${this._th("name", "Name")}
              ${this._th("state", "State")}
              ${this._th("entity", "Source entity")}
              ${this._th("trigger", "Trigger")}
              ${this._th("channel", "Channel")}
              ${this._th("tag", "Tag")}
              ${this._th("enabled", "Enabled")}
              <th aria-label="Actions"></th>
            </tr>
            <tr class="filter-row">
              <th>
                <select aria-label="Filter by priority" @change=${(e: Event) => this._setPriorityFilter((e.target as HTMLSelectElement).value)}>
                  <option value="" ?selected=${!this.priorityFilter}>All</option>
                  ${([3, 2, 1, 0] as const).map((p) => html`<option value=${p} ?selected=${this.priorityFilter === String(p)}>${PRIORITY_LABELS[p]}</option>`)}
                </select>
              </th>
              <th><input type="text" placeholder="Filter..." aria-label="Filter by name" .value=${this._filterName} @input=${(e: Event) => (this._filterName = (e.target as HTMLInputElement).value)} /></th>
              <th>
                <select aria-label="Filter by state" @change=${(e: Event) => (this._filterState = (e.target as HTMLSelectElement).value)}>
                  <option value="">All</option>
                  ${Object.entries(STATE_LABELS).map(([k, v]) => html`<option value=${k}>${v}</option>`)}
                </select>
              </th>
              <th><input type="text" placeholder="Filter..." aria-label="Filter by source entity" .value=${this._filterEntity} @input=${(e: Event) => (this._filterEntity = (e.target as HTMLInputElement).value)} /></th>
              <th>
                <select aria-label="Filter by trigger type" @change=${(e: Event) => (this._filterTrigger = (e.target as HTMLSelectElement).value)}>
                  <option value="">All</option>
                  <option value="analog">Analog</option>
                  <option value="digital">Digital</option>
                  <option value="custom_state">Custom</option>
                  <option value="external">External</option>
                </select>
              </th>
              <th>
                <select aria-label="Filter by channel" @change=${(e: Event) => (this._filterChannel = (e.target as HTMLSelectElement).value)}>
                  <option value="">All</option>
                  ${this._channels.map((ch) => html`<option value=${ch.id}>${ch.name}</option>`)}
                </select>
              </th>
              <th><input type="text" placeholder="Filter..." aria-label="Filter by tag" .value=${this._filterTag} @input=${(e: Event) => (this._filterTag = (e.target as HTMLInputElement).value)} /></th>
              <th>
                <select aria-label="Filter by enabled" @change=${(e: Event) => (this._filterEnabled = (e.target as HTMLSelectElement).value)}>
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${this._renderBody(filtered)}
          </tbody>
        </table>
      </div>

      <alarm-detail-dialog
        .hass=${this.hass}
        .channels=${this._channels}
        .alarm=${this._detailAlarm}
        .open=${!!this._detailAlarm}
        @close=${() => (this._detailAlarm = undefined)}
        @edit-alarm=${(e: CustomEvent) => this._edit(e.detail.id)}
        @ack-alarm=${(e: CustomEvent) => this._ack(e.detail.id)}
        @shelve-alarm=${(e: CustomEvent) => (this._shelveTarget = e.detail.alarm)}
        @unshelve-alarm=${(e: CustomEvent) => this._unshelve(e.detail.id)}
        @trigger-action=${(e: CustomEvent) => this._triggerAction(e.detail.id)}
        @test-alarm=${(e: CustomEvent) => {
          const a = this._alarms.find((x) => x.id === e.detail.id);
          if (a) this._testNotification(a);
        }}
      ></alarm-detail-dialog>

      <shelve-dialog
        .open=${!!this._shelveTarget}
        .alarmId=${this._shelveTarget?.id ?? ""}
        .alarmName=${this._shelveTarget?.name ?? ""}
        @dialog-closed=${() => (this._shelveTarget = undefined)}
        @shelve-confirm=${async (e: CustomEvent) => {
          this._shelveTarget = undefined;
          await this._run(() => shelveAlarm(this.hass!, e.detail.alarmId, e.detail.minutes), "Alarm shelved");
          this._load();
        }}
      ></shelve-dialog>

      <scada-dialog
        .open=${!!this._deleteTarget}
        heading="Delete alarm?"
        width="small"
        @dialog-closed=${() => (this._deleteTarget = undefined)}
      >
        <p class="confirm-text">Permanently delete <strong>${this._deleteTarget?.name ?? ""}</strong>? This can't be undone.</p>
        <button slot="footer" class="btn btn-plain" @click=${() => (this._deleteTarget = undefined)}>Cancel</button>
        <button slot="footer" class="btn btn-danger" @click=${this._doDelete}>Delete</button>
      </scada-dialog>
    `;
  }
}
