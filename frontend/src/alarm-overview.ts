/**
 * SCADA Alarm Overview — full Alarm Center as a Lovelace card.
 * Best used in a **panel mode** dashboard for fullscreen experience.
 *
 *   • MDI tab icons via <ha-svg-icon>
 *   • Status-pill header (all-normal / N active / N critical)
 *   • <alarm-kpi-strip> wired on the Active + All tabs, driving a priority filter
 *
 * YAML:
 *   type: custom:scada-alarm-overview
 *   title: Alarm Center        # optional, shown in header
 *   default_tab: active        # optional: active|all|history|channels|create-edit|settings
 */

import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./alarm-overview-editor";
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
  mdiHelpCircleOutline,
} from "@mdi/js";
import { sharedStyles } from "./styles/shared-styles";
import { fetchAlarms, subscribeAlarmChanges } from "./data/websocket";
import type { HomeAssistant, AlarmWithState } from "./types";

import "./components/alarm-kpi-strip";
import "./components/help-dialog";
import "./views/active-alarms-view";
import "./views/all-alarms-view";
import "./views/history-view";
import "./views/channels-view";
import "./views/create-edit-view";
import "./views/settings-view";

type TabId = "active" | "all" | "history" | "channels" | "create-edit" | "settings";

interface OverviewConfig {
  type: string;
  title?: string;
  default_tab?: TabId;
  show_header?: boolean;
  max_width?: string;
}

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

@customElement("scada-alarm-overview")
export class ScadaAlarmOverview extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config!: OverviewConfig;
  @state() private _activeTab: TabId = "active";
  @state() private _editAlarmId?: string;
  @state() private _priorityFilter = "";
  @state() private _alarms: AlarmWithState[] = [];
  @state() private _showHelp = false;
  private _unsub?: () => void;

  // --- Lovelace card API ---

  setConfig(config: OverviewConfig) {
    this._config = config;
    if (config.default_tab) this._activeTab = config.default_tab;
  }

  getCardSize() {
    return 12;
  }

  static getConfigElement() {
    return document.createElement("scada-alarm-overview-editor");
  }

  static getStubConfig() {
    return { type: "custom:scada-alarm-overview", title: "Alarm Center" };
  }

  // --- Styles ---

  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 600px;
        background: var(--primary-background-color, #fafafa);
      }
      .header {
        height: 56px;
        flex: none;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 16px;
        background: var(--card-background-color, #fff);
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        --mdc-icon-size: 24px;
      }
      .header .title {
        font-size: 20px;
        font-weight: 400;
        color: var(--primary-text-color, #212121);
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 9999px;
        font-size: 13px;
        font-weight: 600;
        --mdc-icon-size: 15px;
      }
      .tabs {
        display: flex;
        align-items: center;
        background: var(--card-background-color, #fff);
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        padding: 0 8px;
        overflow-x: auto;
        flex: none;
      }
      .tab {
        position: relative;
        height: 48px;
        padding: 0 18px;
        border: none;
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font: inherit;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color, #727272);
        white-space: nowrap;
        --mdc-icon-size: 19px;
      }
      .tab:hover {
        color: var(--primary-text-color, #212121);
      }
      .tab.active {
        color: var(--primary-color, #009ac7);
      }
      .tab.active::after {
        content: "";
        position: absolute;
        left: 10px;
        right: 10px;
        bottom: 0;
        height: 3px;
        border-radius: 3px 3px 0 0;
        background: var(--primary-color, #009ac7);
      }
      .tab .count {
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: 9999px;
        background: var(--ha-color-neutral-60, #989898);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tab.active .count {
        background: var(--primary-color, #009ac7);
      }
      .content {
        flex: 1;
        overflow-y: auto;
      }
      .help-btn {
        margin-left: auto;
        border: none;
        background: none;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        color: var(--secondary-text-color, #727272);
        --mdc-icon-size: 20px;
        display: flex;
        align-items: center;
      }
      .help-btn:hover {
        color: var(--primary-color, #009ac7);
        background: var(--secondary-background-color, #f5f5f5);
      }
    `,
  ];

  // --- Lifecycle ---

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

  updated(changed: PropertyValues) {
    if (changed.has("hass") && !changed.get("hass")) {
      this._loadAlarms();
      this._subscribe();
    }
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
    return this._alarms.filter((a) => ACTIVE_STATES.includes(a.runtime.state) && a.priority === 3)
      .length;
  }

  private _renderStatus() {
    const crit = this._criticalCount;
    const active = this._activeCount;
    let color: string, icon: string, text: string;
    if (crit > 0) {
      color = "#f44336";
      icon = mdiAlertDecagram;
      text = `${crit} critical`;
    } else if (active > 0) {
      color = "#ff9800";
      icon = mdiAlert;
      text = `${active} active`;
    } else {
      color = "#4caf50";
      icon = mdiCheckCircle;
      text = "All normal";
    }
    return html`
      <div
        class="status"
        style=${`background:color-mix(in srgb, ${color} 14%, transparent); color:${color}`}
      >
        <ha-svg-icon .path=${icon}></ha-svg-icon>${text}
      </div>
    `;
  }

  // --- Render ---

  render() {
    if (!this._config) return html``;
    const showHeader = this._config.show_header ?? false;
    const maxWidth = this._config.max_width ?? "";
    const showKpis = this._activeTab === "active" || this._activeTab === "all";
    return html`
      <div style=${maxWidth ? `max-width:${maxWidth};margin:0 auto` : ""}>
      ${showHeader ? html`
        <div class="header">
          <ha-svg-icon .path=${mdiBellRing} style="color: var(--primary-color)"></ha-svg-icon>
          <span class="title">${this._config.title ?? "Alarm Center"}</span>
          ${this._renderStatus()}
        </div>
      ` : nothing}

      <div class="tabs">
        ${TABS.map(
          (tab) => html`
            <button
              class="tab ${this._activeTab === tab.id ? "active" : ""}"
              @click=${() => this._setTab(tab.id)}
            >
              <ha-svg-icon .path=${tab.icon}></ha-svg-icon>
              <span>${tab.label}</span>
              ${tab.id === "active" && this._activeCount > 0
                ? html`<span class="count">${this._activeCount}</span>`
                : nothing}
            </button>
          `
        )}
        <button class="help-btn" title="Quick start guide" @click=${() => (this._showHelp = true)}>
          <ha-svg-icon .path=${mdiHelpCircleOutline}></ha-svg-icon>
        </button>
      </div>

      <div class="content">
        ${showKpis
          ? html`<alarm-kpi-strip
              .alarms=${this._alarms}
              .filterPriority=${this._priorityFilter}
              @priority-filter=${(e: CustomEvent) => {
                this._priorityFilter = e.detail.priority;
                if (this._priorityFilter && this._activeTab !== "active") this._setTab("active");
              }}
            ></alarm-kpi-strip>`
          : nothing}
        ${this._renderView()}
      </div>
      <help-dialog .open=${this._showHelp} @close=${() => (this._showHelp = false)}></help-dialog>
      </div>
    `;
  }

  private _renderView() {
    switch (this._activeTab) {
      case "active":
        return html`<active-alarms-view
          .hass=${this.hass}
          .priorityFilter=${this._priorityFilter}
        ></active-alarms-view>`;
      case "all":
        return html`<all-alarms-view
          .hass=${this.hass}
          .priorityFilter=${this._priorityFilter}
        ></all-alarms-view>`;
      case "history":
        return html`<history-view .hass=${this.hass}></history-view>`;
      case "channels":
        return html`<channels-view .hass=${this.hass}></channels-view>`;
      case "create-edit":
        return html`<create-edit-view
          .hass=${this.hass}
          .alarmId=${this._editAlarmId ?? ""}
        ></create-edit-view>`;
      case "settings":
        return html`<settings-view .hass=${this.hass}></settings-view>`;
      default:
        return html`<active-alarms-view .hass=${this.hass}></active-alarms-view>`;
    }
  }
}

// Register in the card picker
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "scada-alarm-overview",
  name: "SCADA Alarm Overview",
  description: "Full Alarm Center with tabs, KPI strip, and management views. Best in panel mode.",
});

declare global {
  interface HTMLElementTagNameMap {
    "scada-alarm-overview": ScadaAlarmOverview;
    "ha-svg-icon": any;
  }
}
