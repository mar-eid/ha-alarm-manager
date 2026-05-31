/**
 * SCADA Alarm Banner — compact Lovelace monitoring card (redesigned).
 * Drop-in replacement for your current frontend/src/alarm-banner.ts.
 *
 *   • Header with bell icon, title, active/unacked summary, count pill
 *   • Severity bar (proportion of active by priority)
 *   • Optional interactive AREA filter (config: selectable_area: true) plus the
 *     static config filters filter_area / filter_priority / filter_channel
 *   • List of active alarms with inline ACK / Shelve
 *
 * Place at: frontend/src/alarm-banner.ts (replaces the current file).
 * Keep your alarm-card-editor.ts; add the new config keys to it as needed.
 *
 * YAML:
 *   type: custom:scada-alarm-banner
 *   title: Alarm Center
 *   max_items: 6
 *   selectable_area: true          # show the area dropdown on the card
 *   filter_area: Server Room       # or pin it
 *   show_ack_button: true
 *   show_shelve_button: true
 *   default_shelve_minutes: 15
 */

import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  mdiBellRing,
  mdiAlert,
  mdiAlertDecagram,
  mdiCheckCircleOutline,
  mdiBellSleep,
  mdiFilterVariant,
  mdiClose,
  mdiMenuDown,
} from "@mdi/js";
import { sharedStyles, getPriorityColor } from "./styles/shared-styles";
import { fetchAlarms, subscribeAlarmChanges, acknowledgeAlarm, shelveAlarm } from "./data/websocket";
import { type HomeAssistant, type AlarmWithState } from "./types";

interface AlarmBannerConfig {
  type: string;
  title?: string;
  max_items?: number;
  filter_area?: string;
  filter_priority?: number | string;
  filter_channel?: string;
  selectable_area?: boolean;
  show_ack_button?: boolean;
  show_shelve_button?: boolean;
  show_header?: boolean;
  default_shelve_minutes?: number;
}

const ACTIVE_STATES = [
  "active_unacknowledged",
  "active_acknowledged",
  "returned_to_normal_unacknowledged",
];
const UNACKED_STATES = ["active_unacknowledged", "returned_to_normal_unacknowledged"];
const ORDER = [3, 2, 1, 0];

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

@customElement("scada-alarm-banner")
export class ScadaAlarmBanner extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config!: AlarmBannerConfig;
  @state() private _alarms: AlarmWithState[] = [];
  @state() private _areaFilter = "";
  private _unsub?: () => void;

  static styles = [
    sharedStyles,
    css`
      ha-card {
        overflow: hidden;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px 12px;
      }
      .head .ic {
        width: 34px;
        height: 34px;
        border-radius: 9px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        --mdc-icon-size: 20px;
      }
      .head .t {
        flex: 1;
        min-width: 0;
      }
      .head .name {
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color, #212121);
      }
      .head .sub {
        font-size: 12.5px;
        color: var(--secondary-text-color, #727272);
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: 9999px;
        font-size: 13px;
        font-weight: 700;
        --mdc-icon-size: 14px;
      }
      .bar {
        display: flex;
        height: 6px;
        margin: 0 16px 12px;
        border-radius: 9999px;
        overflow: hidden;
        background: var(--secondary-background-color, #f0f0f0);
      }
      .filter {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 16px 12px;
        --mdc-icon-size: 16px;
        color: var(--secondary-text-color, #727272);
      }
      .filter .wrap {
        position: relative;
        flex: 1;
      }
      .filter select {
        width: 100%;
        height: 32px;
        padding: 0 28px 0 10px;
        border-radius: 9999px;
        border: 1px solid var(--divider-color, #e0e0e0);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        font: inherit;
        font-size: 13px;
        cursor: pointer;
        appearance: none;
      }
      .filter .chev {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        --mdc-icon-size: 18px;
      }
      .clear {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 32px;
        padding: 0 10px;
        border: none;
        border-radius: 9999px;
        background: var(--secondary-background-color, #f0f0f0);
        color: var(--secondary-text-color, #727272);
        font: inherit;
        font-size: 12.5px;
        cursor: pointer;
        --mdc-icon-size: 14px;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }
      .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        flex: none;
      }
      .row .info {
        flex: 1;
        min-width: 0;
      }
      .row .nm {
        font-size: 13.5px;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .row .meta {
        font-size: 12px;
        color: var(--secondary-text-color, #727272);
      }
      .row .val {
        font-size: 13.5px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .btn {
        height: 30px;
        --mdc-icon-size: 16px;
      }
      .btn-shelve {
        background: color-mix(in srgb, #9c27b0 14%, transparent);
        color: #9c27b0;
      }
      .empty {
        text-align: center;
        padding: 20px 16px 28px;
        color: var(--secondary-text-color, #727272);
        --mdc-icon-size: 40px;
      }
      .empty .lbl {
        font-size: 14px;
        font-weight: 500;
        margin-top: 8px;
        color: var(--primary-text-color, #212121);
      }
      .more {
        padding: 10px 16px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
        text-align: center;
        font-size: 13px;
        color: var(--secondary-text-color, #727272);
      }
    `,
  ];

  setConfig(config: AlarmBannerConfig) {
    this._config = {
      title: "Alarm Center",
      max_items: 5,
      show_ack_button: true,
      show_shelve_button: true,
      default_shelve_minutes: 15,
      ...config,
    };
    this._areaFilter = config.filter_area ?? "";
  }

  getCardSize() {
    return 3;
  }

  static getStubConfig() {
    return { type: "custom:scada-alarm-banner", title: "Alarm Center", max_items: 6 };
  }

  firstUpdated() {
    this._load();
    this._subscribe();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
  }
  updated(changed: PropertyValues) {
    if (changed.has("hass") && !changed.get("hass")) this._load();
  }

  private async _load() {
    if (!this.hass) return;
    this._alarms = await fetchAlarms(this.hass);
  }
  private async _subscribe() {
    if (!this.hass) return;
    this._unsub = await subscribeAlarmChanges(this.hass, () => this._load());
  }

  private async _ack(id: string) {
    if (this.hass) await acknowledgeAlarm(this.hass, id);
    this._load();
  }
  private async _shelve(id: string) {
    if (this.hass) await shelveAlarm(this.hass, id, this._config.default_shelve_minutes ?? 15);
    this._load();
  }

  private get _active(): AlarmWithState[] {
    const c = this._config;
    return this._alarms
      .filter((a) => ACTIVE_STATES.includes(a.runtime.state))
      .filter((a) => !this._areaFilter || a.area === this._areaFilter)
      .filter((a) => c.filter_priority == null || String(a.priority) === String(c.filter_priority))
      .filter((a) => !c.filter_channel || a.channel_id === c.filter_channel)
      .sort(
        (a, b) =>
          b.priority - a.priority ||
          new Date(b.runtime.triggered_at ?? 0).getTime() -
            new Date(a.runtime.triggered_at ?? 0).getTime()
      );
  }

  render() {
    if (!this._config) return html``;
    const c = this._config;
    const active = this._active;
    const total = active.length;
    const crit = active.filter((a) => a.priority === 3).length;
    const unacked = active.filter((a) => UNACKED_STATES.includes(a.runtime.state)).length;
    const accent = crit > 0 ? "#f44336" : total ? "#ff9800" : "#4caf50";
    const segs = ORDER.map((p) => ({ p, n: active.filter((a) => a.priority === p).length })).filter(
      (s) => s.n > 0
    );
    const areaOptions = [
      ...new Set(
        this._alarms.filter((a) => ACTIVE_STATES.includes(a.runtime.state)).map((a) => a.area)
      ),
    ]
      .filter(Boolean)
      .sort();
    const shown = active.slice(0, c.max_items);

    const showHeader = c.show_header ?? false;

    return html`
      <ha-card>
        ${showHeader ? html`
          <div class="head">
            <div class="ic" style=${`background:color-mix(in srgb, ${accent} 16%, transparent); color:${accent}`}>
              <ha-svg-icon .path=${mdiBellRing}></ha-svg-icon>
            </div>
            <div class="t">
              <div class="name">${c.title}</div>
              <div class="sub">
                ${this._areaFilter ? `${this._areaFilter} · ` : ""}
                ${total === 0 ? "All systems normal" : `${total} active · ${unacked} unacknowledged`}
              </div>
            </div>
            ${total > 0
            ? html`<span
                class="pill"
                style=${`background:color-mix(in srgb, ${accent} 15%, transparent); color:${accent}`}
              >
                <ha-svg-icon .path=${crit > 0 ? mdiAlertDecagram : mdiAlert}></ha-svg-icon>${total}
              </span>`
            : nothing}
          </div>
        ` : nothing}

        ${total > 0
          ? html`<div class="bar">
              ${segs.map(
                (s) =>
                  html`<span style=${`flex:${s.n}; background:${getPriorityColor(s.p)}`}></span>`
              )}
            </div>`
          : nothing}

        ${c.selectable_area && areaOptions.length > 0
          ? html`<div class="filter">
              <ha-svg-icon .path=${mdiFilterVariant}></ha-svg-icon>
              <div class="wrap">
                <select
                  .value=${this._areaFilter}
                  @change=${(e: Event) => (this._areaFilter = (e.target as HTMLSelectElement).value)}
                >
                  <option value="">All areas</option>
                  ${areaOptions.map((a) => html`<option value=${a}>${a}</option>`)}
                </select>
                <ha-svg-icon class="chev" .path=${mdiMenuDown}></ha-svg-icon>
              </div>
              ${this._areaFilter
                ? html`<button class="clear" @click=${() => (this._areaFilter = "")}>
                    <ha-svg-icon .path=${mdiClose}></ha-svg-icon>Clear
                  </button>`
                : nothing}
            </div>`
          : nothing}

        ${total === 0
          ? html`<div class="empty">
              <ha-svg-icon .path=${mdiCheckCircleOutline} style="color:#4caf50"></ha-svg-icon>
              <div class="lbl">No active alarms</div>
            </div>`
          : html`
              ${shown.map((a) => {
                const isUnacked = UNACKED_STATES.includes(a.runtime.state);
                const color = getPriorityColor(a.priority);
                return html`
                  <div class="row">
                    <span class="dot" style=${`background:${color}`}></span>
                    <div class="info">
                      <div class="nm">${a.name}</div>
                      <div class="meta">${a.area} · ${timeAgo(a.runtime.triggered_at)}</div>
                    </div>
                    <span class="val" style=${`color:${color}`}>${a.runtime.last_value ?? "—"}</span>
                    ${c.show_ack_button !== false && isUnacked
                      ? html`<button class="btn btn-primary" @click=${() => this._ack(a.id)}>ACK</button>`
                      : c.show_shelve_button !== false
                      ? html`<button class="btn btn-shelve" @click=${() => this._shelve(a.id)} title="Shelve">
                          <ha-svg-icon .path=${mdiBellSleep}></ha-svg-icon>
                        </button>`
                      : nothing}
                  </div>
                `;
              })}
              ${total > (c.max_items ?? 5)
                ? html`<div class="more">+ ${total - (c.max_items ?? 5)} more</div>`
                : nothing}
            `}
      </ha-card>
    `;
  }
}

// Register in the card picker
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "scada-alarm-banner",
  name: "SCADA Alarm Banner",
  description: "Compact monitoring card for the SCADA Alarm Manager.",
});

declare global {
  interface HTMLElementTagNameMap {
    "scada-alarm-banner": ScadaAlarmBanner;
    "ha-card": any;
    "ha-svg-icon": any;
  }
}
