/**
 * Severity KPI strip for the SCADA Alarm Center.
 * Shows total/critical/high/warning/info/unacked/shelved counts + a severity bar.
 * Clicking a priority tile emits `priority-filter` ({ priority: "0".."3" | "" }).
 *
 * Place at: frontend/src/components/alarm-kpi-strip.ts
 * Use in alarm-center-panel.ts above <active-alarms-view>:
 *   <alarm-kpi-strip .alarms=${this._alarms}
 *     .filterPriority=${this._priorityFilter}
 *     @priority-filter=${(e) => { this._priorityFilter = e.detail.priority; }}>
 *   </alarm-kpi-strip>
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  mdiBellRing,
  mdiInformation,
  mdiAlert,
  mdiAlertOctagon,
  mdiAlertDecagram,
  mdiBellAlert,
  mdiBellSleep,
} from "@mdi/js";
import { sharedStyles, getPriorityColor } from "../styles/shared-styles";
import { PRIORITY_LABELS, type AlarmPriority, type AlarmWithState } from "../types";

const ACTIVE_STATES = [
  "active_unacknowledged",
  "active_acknowledged",
  "returned_to_normal_unacknowledged",
];
const UNACKED_STATES = ["active_unacknowledged", "returned_to_normal_unacknowledged"];
const ORDER: AlarmPriority[] = [3, 2, 1, 0];
const PRIORITY_ICON: Record<AlarmPriority, string> = {
  0: mdiInformation,
  1: mdiAlert,
  2: mdiAlertOctagon,
  3: mdiAlertDecagram,
};

@customElement("alarm-kpi-strip")
export class AlarmKpiStrip extends LitElement {
  @property({ attribute: false }) alarms: AlarmWithState[] = [];
  @property() filterPriority = "";

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        padding: 16px 24px 8px;
      }
      .kpis {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .tile {
        flex: 1;
        min-width: 120px;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 16px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        background: var(--card-background-color, #fff);
        cursor: default;
        font: inherit;
        text-align: left;
        transition: box-shadow 0.15s, border-color 0.15s, background 0.15s;
      }
      .tile[data-clickable] {
        cursor: pointer;
      }
      .tile[data-clickable]:hover {
        box-shadow: 0 0 0 1px var(--c);
      }
      .tile.sel {
        border-color: var(--c);
        background: color-mix(in srgb, var(--c) 12%, var(--card-background-color, #fff));
      }
      .tile .ic {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--c) 16%, transparent);
        --mdc-icon-size: 22px;
        color: var(--c);
      }
      .num {
        font-size: 26px;
        font-weight: 500;
        line-height: 1.05;
        font-variant-numeric: tabular-nums;
        color: var(--primary-text-color, #212121);
      }
      .num.zero {
        color: var(--secondary-text-color, #727272);
      }
      .lbl {
        font-size: 12px;
        color: var(--secondary-text-color, #727272);
        white-space: nowrap;
      }
      .bar-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 12px;
      }
      .bar {
        flex: 1;
        height: 8px;
        border-radius: 9999px;
        overflow: hidden;
        display: flex;
        background: var(--secondary-background-color, #f0f0f0);
      }
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color, #727272);
        white-space: nowrap;
      }
    `,
  ];

  private _emit(priority: string) {
    this.dispatchEvent(
      new CustomEvent("priority-filter", { detail: { priority }, bubbles: true, composed: true })
    );
  }

  private _tile(
    color: string,
    count: number,
    label: string,
    icon: string,
    filter: string | null
  ) {
    const clickable = filter !== null;
    const selected = clickable && this.filterPriority === filter;
    return html`
      <button
        class="tile ${selected ? "sel" : ""}"
        style=${`--c:${color}`}
        ?data-clickable=${clickable}
        @click=${() => clickable && this._emit(this.filterPriority === filter ? "" : (filter as string))}
      >
        <div class="ic"><ha-svg-icon .path=${icon}></ha-svg-icon></div>
        <div>
          <div class="num ${count === 0 ? "zero" : ""}">${count}</div>
          <div class="lbl">${label}</div>
        </div>
      </button>
    `;
  }

  render() {
    const active = this.alarms.filter((a) => ACTIVE_STATES.includes(a.runtime.state));
    const byP = (p: number) => active.filter((a) => a.priority === p).length;
    const unacked = active.filter((a) => UNACKED_STATES.includes(a.runtime.state)).length;
    const shelved = this.alarms.filter((a) => a.runtime.state === "shelved").length;
    const total = active.length;
    const segs = ORDER.map((p) => ({ p, n: byP(p) })).filter((s) => s.n > 0);

    return html`
      <div class="kpis">
        ${this._tile("#5e5e5e", total, "Active alarms", mdiBellRing, null)}
        ${ORDER.map((p) =>
          this._tile(getPriorityColor(p), byP(p), PRIORITY_LABELS[p], PRIORITY_ICON[p], String(p))
        )}
        ${this._tile("#ff9800", unacked, "Unacknowledged", mdiBellAlert, null)}
        ${this._tile("#9c27b0", shelved, "Shelved", mdiBellSleep, null)}
      </div>
      ${total > 0
        ? html`
            <div class="bar-row">
              <div class="bar">
                ${segs.map(
                  (s) =>
                    html`<span
                      style=${`flex:${s.n};background:${getPriorityColor(s.p)}`}
                      title=${`${s.n} ${PRIORITY_LABELS[s.p as AlarmPriority]}`}
                    ></span>`
                )}
              </div>
              <span class="hint">${unacked} of ${total} need attention</span>
            </div>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "alarm-kpi-strip": AlarmKpiStrip;
    // provided by HA frontend at runtime
    "ha-svg-icon": any;
  }
}
