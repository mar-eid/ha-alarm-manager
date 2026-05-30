/**
 * SCADA Alarm Center - Full-screen sidebar panel.
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "./styles/shared-styles";
import type { HomeAssistant } from "./types";

// Import views
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
  icon: string;
}

const TABS: Tab[] = [
  { id: "active", label: "Active Alarms", icon: "🔴" },
  { id: "all", label: "All Alarms", icon: "📋" },
  { id: "history", label: "History", icon: "📜" },
  { id: "channels", label: "Channels", icon: "📡" },
  { id: "create-edit", label: "Create / Edit", icon: "✏️" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

@customElement("scada-alarm-center-panel")
export class ScadaAlarmCenterPanel extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) panel?: Record<string, unknown>;
  @state() private _activeTab: TabId = "active";
  @state() private _editAlarmId?: string;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--primary-background-color, #fafafa);
      }

      .header {
        background: var(--app-header-background-color, var(--primary-color));
        color: var(--app-header-text-color, white);
        padding: 16px 24px;
        font-size: 1.4em;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-icon {
        font-size: 1.2em;
      }

      .content {
        flex: 1;
        overflow-y: auto;
      }
    `,
  ];

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

  render() {
    return html`
      <div class="header">
        <span class="header-icon">&#x1F6A8;</span>
        <span>SCADA Alarm Center</span>
      </div>

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

declare global {
  interface HTMLElementTagNameMap {
    "scada-alarm-center-panel": ScadaAlarmCenterPanel;
  }
}
