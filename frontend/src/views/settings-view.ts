import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles/shared-styles";
import { fetchAlarms, fetchChannels } from "../data/websocket";
import type { HomeAssistant } from "../types";

@customElement("settings-view")
export class SettingsView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _alarmCount = 0;
  @state() private _channelCount = 0;
  @state() private _loading = true;

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; max-width: 600px; }
      .stats-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px; margin-bottom: 24px;
      }
      .stat-card {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px; padding: 16px; text-align: center;
      }
      .stat-value { font-size: 2em; font-weight: 600; color: var(--primary-color); }
      .stat-label { font-size: 0.85em; color: var(--secondary-text-color); margin-top: 4px; }
      .info-section {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px; padding: 16px;
      }
      .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--divider-color); }
      .info-row:last-child { border-bottom: none; }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._loadStats();
  }

  private async _loadStats() {
    if (!this.hass) return;
    try {
      const [alarms, channels] = await Promise.all([
        fetchAlarms(this.hass),
        fetchChannels(this.hass),
      ]);
      this._alarmCount = alarms.length;
      this._channelCount = channels.length;
    } finally {
      this._loading = false;
    }
  }

  render() {
    if (this._loading) return html`<div class="empty-state">Loading...</div>`;

    return html`
      <h2>System Overview</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${this._alarmCount}</div>
          <div class="stat-label">Alarms Configured</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this._channelCount}</div>
          <div class="stat-label">Channels</div>
        </div>
      </div>

      <div class="info-section">
        <h3>About</h3>
        <div class="info-row">
          <span>Integration</span>
          <span>SCADA Alarm Manager</span>
        </div>
        <div class="info-row">
          <span>Version</span>
          <span>0.1.0</span>
        </div>
        <div class="info-row">
          <span>Domain</span>
          <span>scada_alarm_manager</span>
        </div>
      </div>

      <p style="margin-top: 24px; font-size: 0.85em; color: var(--secondary-text-color);">
        To change global settings (notification repeat interval, escalation delay, history retention),
        go to Settings &rarr; Integrations &rarr; SCADA Alarm Manager &rarr; Options.
      </p>
    `;
  }
}
