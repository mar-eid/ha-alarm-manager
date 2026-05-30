/**
 * SCADA Alarm Center Card — Full Alarm Center as a Lovelace card.
 * Use in panel mode for near-fullscreen experience.
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "./styles/shared-styles";
import type { HomeAssistant } from "./types";

// Import all views
import "./views/active-alarms-view";
import "./views/all-alarms-view";
import "./views/history-view";
import "./views/channels-view";
import "./views/create-edit-view";
import "./views/settings-view";

type TabId = "active" | "all" | "history" | "channels" | "create-edit" | "settings";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "active", label: "Active Alarms" },
  { id: "all", label: "All Alarms" },
  { id: "history", label: "History" },
  { id: "channels", label: "Channels" },
  { id: "create-edit", label: "Create / Edit" },
  { id: "settings", label: "Settings" },
];

interface CardConfig {
  type: string;
  title?: string;
  default_tab?: TabId;
}

@customElement("scada-alarm-center-card")
export class ScadaAlarmCenterCard extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config: CardConfig = { type: "custom:scada-alarm-center-card" };
  @state() private _activeTab: TabId = "active";
  @state() private _editAlarmId?: string;

  static styles = [
    sharedStyles,
    css`
      :host { display: block; }
      ha-card { overflow: hidden; display: flex; flex-direction: column; min-height: 400px; }

      .card-title {
        padding: 16px 16px 0;
        font-size: 1.2em;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .tabs {
        border-bottom: 2px solid var(--divider-color, #e0e0e0);
        overflow-x: auto;
        flex-shrink: 0;
      }

      .tab {
        padding: 10px 16px;
        font-size: 0.85em;
      }

      .content {
        flex: 1;
        overflow-y: auto;
      }
    `,
  ];

  setConfig(config: CardConfig) {
    this._config = config;
    if (config.default_tab) {
      this._activeTab = config.default_tab;
    }
  }

  static getConfigElement() {
    // No custom editor — use YAML config
    return undefined;
  }

  static getStubConfig() {
    return {
      type: "custom:scada-alarm-center-card",
      title: "Alarm Center",
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("navigate", this._handleNavigate as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("navigate", this._handleNavigate as EventListener);
  }

  private _handleNavigate = (e: CustomEvent) => {
    const { view, alarmId } = e.detail;
    this._activeTab = view as TabId;
    this._editAlarmId = alarmId;
  };

  private _setTab(tab: TabId) {
    this._activeTab = tab;
    if (tab !== "create-edit") {
      this._editAlarmId = undefined;
    }
  }

  getCardSize() {
    return 8;
  }

  render() {
    return html`
      <ha-card>
        ${this._config.title ? html`
          <div class="card-title">${this._config.title}</div>
        ` : ""}

        <div class="tabs">
          ${TABS.map(
            (tab) => html`
              <button
                class="tab ${this._activeTab === tab.id ? "active" : ""}"
                @click=${() => this._setTab(tab.id)}
              >
                ${tab.label}
              </button>
            `
          )}
        </div>

        <div class="content">
          ${this._renderView()}
        </div>
      </ha-card>
    `;
  }

  private _renderView() {
    switch (this._activeTab) {
      case "active":
        return html`<active-alarms-view .hass=${this.hass}></active-alarms-view>`;
      case "all":
        return html`<all-alarms-view .hass=${this.hass}></all-alarms-view>`;
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
const customCards = (window as any).customCards || [];
customCards.push({
  type: "scada-alarm-center-card",
  name: "SCADA Alarm Center",
  description: "Full Alarm Center with tabs — use in panel mode for fullscreen",
  preview: false,
});
(window as any).customCards = customCards;

declare global {
  interface HTMLElementTagNameMap {
    "scada-alarm-center-card": ScadaAlarmCenterCard;
  }
}
