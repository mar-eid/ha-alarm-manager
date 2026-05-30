/**
 * SCADA Alarm Dashboard — complete alarm management as a Lovelace card.
 * New element name to avoid any caching issues with previous cards.
 *
 * Usage:
 *   type: custom:scada-alarm-dashboard
 *   title: Alarm Center
 *   default_tab: active
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  mdiBellRing,
  mdiFormatListChecks,
  mdiHistory,
  mdiBroadcast,
  mdiPlusBox,
  mdiCog,
  mdiAlert,
  mdiAlertDecagram,
  mdiCheckCircle,
} from "@mdi/js";
import { sharedStyles } from "./styles/shared-styles";
import { fetchAlarms, subscribeAlarmChanges } from "./data/websocket";
import type { HomeAssistant, AlarmWithState } from "./types";

import "./components/alarm-kpi-strip";
import "./views/active-alarms-view";
import "./views/all-alarms-view";
import "./views/history-view";
import "./views/channels-view";
import "./views/create-edit-view";
import "./views/settings-view";

type TabId = "active" | "all" | "history" | "channels" | "create-edit" | "settings";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "active", label: "Active", icon: mdiBellRing },
  { id: "all", label: "All Alarms", icon: mdiFormatListChecks },
  { id: "history", label: "History", icon: mdiHistory },
  { id: "channels", label: "Channels", icon: mdiBroadcast },
  { id: "create-edit", label: "Create / Edit", icon: mdiPlusBox },
  { id: "settings", label: "Settings", icon: mdiCog },
];

const ACTIVE_STATES = [
  "active_unacknowledged",
  "active_acknowledged",
  "returned_to_normal_unacknowledged",
];

interface DashboardConfig {
  type: string;
  title?: string;
  default_tab?: TabId;
}

@customElement("scada-alarm-dashboard")
export class ScadaAlarmDashboard extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config: DashboardConfig = { type: "custom:scada-alarm-dashboard" };
  @state() private _activeTab: TabId = "active";
  @state() private _editAlarmId?: string;
  @state() private _priorityFilter = "";
  @state() private _alarms: AlarmWithState[] = [];
  private _unsub?: () => void;

  static styles = [
    sharedStyles,
    css`
      :host { display: block; }
      ha-card {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: 500px;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        --mdc-icon-size: 22px;
      }
      .header .title {
        flex: 1;
        font-size: 18px;
        font-weight: 500;
        color: var(--primary-text-color, #212121);
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        --mdc-icon-size: 14px;
      }
      .tabs {
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        padding: 0 4px;
        overflow-x: auto;
        flex-shrink: 0;
      }
      .tab {
        position: relative;
        height: 44px;
        padding: 0 14px;
        border: none;
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font: inherit;
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color, #727272);
        white-space: nowrap;
        --mdc-icon-size: 17px;
      }
      .tab:hover { color: var(--primary-text-color, #212121); }
      .tab.active { color: var(--primary-color, #009ac7); }
      .tab.active::after {
        content: "";
        position: absolute;
        left: 8px; right: 8px; bottom: 0;
        height: 3px;
        border-radius: 3px 3px 0 0;
        background: var(--primary-color, #009ac7);
      }
      .tab .count {
        min-width: 16px; height: 16px;
        padding: 0 4px;
        border-radius: 9999px;
        background: var(--secondary-text-color, #989898);
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tab.active .count { background: var(--primary-color, #009ac7); }
      .content {
        flex: 1;
        overflow-y: auto;
      }
    `,
  ];

  setConfig(config: DashboardConfig) {
    this._config = { title: "Alarm Center", ...config };
    if (config.default_tab) {
      this._activeTab = config.default_tab;
    }
  }

  static getStubConfig() {
    return {
      type: "custom:scada-alarm-dashboard",
      title: "Alarm Center",
    };
  }

  getCardSize() {
    return 10;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("navigate", this._handleNavigate as EventListener);
    this._loadAlarms();
    this._subscribe();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("navigate", this._handleNavigate as EventListener);
    this._unsub?.();
  }

  private async _loadAlarms() {
    if (!this.hass) return;
    this._alarms = await fetchAlarms(this.hass);
  }

  private async _subscribe() {
    if (!this.hass) return;
    this._unsub = await subscribeAlarmChanges(this.hass, () => this._loadAlarms());
  }

  private _handleNavigate = (e: CustomEvent) => {
    const { view, alarmId } = e.detail;
    this._activeTab = view as TabId;
    this._editAlarmId = alarmId;
  };

  private _setTab(tab: TabId) {
    this._activeTab = tab;
    if (tab !== "create-edit") this._editAlarmId = undefined;
  }

  private get _activeCount() {
    return this._alarms.filter((a) => ACTIVE_STATES.includes(a.runtime.state)).length;
  }

  private get _criticalCount() {
    return this._alarms.filter(
      (a) => ACTIVE_STATES.includes(a.runtime.state) && a.priority === 3
    ).length;
  }

  private _renderStatus() {
    const crit = this._criticalCount;
    const active = this._activeCount;
    let color: string, icon: string, text: string;
    if (crit > 0) {
      color = "#f44336"; icon = mdiAlertDecagram; text = `${crit} critical`;
    } else if (active > 0) {
      color = "#ff9800"; icon = mdiAlert; text = `${active} active`;
    } else {
      color = "#4caf50"; icon = mdiCheckCircle; text = "All normal";
    }
    return html`
      <div class="status"
        style=${`background:color-mix(in srgb, ${color} 14%, transparent); color:${color}`}>
        <ha-svg-icon .path=${icon}></ha-svg-icon>${text}
      </div>
    `;
  }

  render() {
    const showKpis = this._activeTab === "active" || this._activeTab === "all";
    return html`
      <ha-card>
        <div class="header">
          <ha-svg-icon .path=${mdiBellRing} style="color: var(--primary-color)"></ha-svg-icon>
          <span class="title">${this._config.title}</span>
          ${this._renderStatus()}
        </div>

        <div class="tabs">
          ${TABS.map((tab) => html`
            <button class="tab ${this._activeTab === tab.id ? "active" : ""}"
              @click=${() => this._setTab(tab.id)}>
              <ha-svg-icon .path=${tab.icon}></ha-svg-icon>
              <span>${tab.label}</span>
              ${tab.id === "active" && this._activeCount > 0
                ? html`<span class="count">${this._activeCount}</span>`
                : nothing}
            </button>
          `)}
        </div>

        <div class="content">
          ${showKpis ? html`
            <alarm-kpi-strip
              .alarms=${this._alarms}
              .filterPriority=${this._priorityFilter}
              @priority-filter=${(e: CustomEvent) => {
                this._priorityFilter = e.detail.priority;
              }}>
            </alarm-kpi-strip>
          ` : nothing}
          ${this._renderView()}
        </div>
      </ha-card>
    `;
  }

  private _renderView() {
    switch (this._activeTab) {
      case "active":
        return html`<active-alarms-view .hass=${this.hass} .priorityFilter=${this._priorityFilter}></active-alarms-view>`;
      case "all":
        return html`<all-alarms-view .hass=${this.hass} .priorityFilter=${this._priorityFilter}></all-alarms-view>`;
      case "history":
        return html`<history-view .hass=${this.hass}></history-view>`;
      case "channels":
        return html`<channels-view .hass=${this.hass}></channels-view>`;
      case "create-edit":
        return html`<create-edit-view .hass=${this.hass} .alarmId=${this._editAlarmId ?? ""}></create-edit-view>`;
      case "settings":
        return html`<settings-view .hass=${this.hass}></settings-view>`;
      default:
        return html`<active-alarms-view .hass=${this.hass}></active-alarms-view>`;
    }
  }
}

// Register with HA card picker
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "scada-alarm-dashboard",
  name: "SCADA Alarm Dashboard",
  description: "Complete alarm management dashboard with KPI strip, tabs, and all views",
  preview: false,
});

declare global {
  interface HTMLElementTagNameMap {
    "scada-alarm-dashboard": ScadaAlarmDashboard;
    "ha-card": any;
    "ha-svg-icon": any;
  }
}
