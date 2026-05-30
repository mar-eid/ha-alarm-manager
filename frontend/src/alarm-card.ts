/**
 * SCADA Alarm Card - Lovelace dashboard card.
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, getPriorityColor, getStateColor } from "./styles/shared-styles";
import { fetchAlarms, acknowledgeAlarm, shelveAlarm, subscribeAlarmChanges } from "./data/websocket";
import { PRIORITY_LABELS, STATE_LABELS, type HomeAssistant, type AlarmWithState, type AlarmPriority } from "./types";

interface CardConfig {
  type: string;
  title?: string;
  show_count?: boolean;
  show_list?: boolean;
  max_items?: number;
  filter_channel?: string;
  filter_priority?: number[];
  show_ack_button?: boolean;
  show_shelve_button?: boolean;
}

@customElement("scada-alarm-card")
export class ScadaAlarmCard extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config: CardConfig = { type: "custom:scada-alarm-card" };
  @state() private _alarms: AlarmWithState[] = [];
  @state() private _loading = true;
  private _unsub?: () => void;

  static styles = [
    sharedStyles,
    css`
      :host { display: block; }
      ha-card { overflow: hidden; }

      .severity-bar {
        height: 4px;
        transition: background-color 0.3s;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
      }

      .header-title { font-size: 1.1em; font-weight: 500; }

      .badges { display: flex; gap: 8px; }
      .count-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 10px; border-radius: 12px; font-size: 0.8em; font-weight: 600;
      }

      .alarm-list { padding: 0 16px 8px; }
      .alarm-item {
        display: flex; align-items: center; gap: 8px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .alarm-item:last-child { border-bottom: none; }

      .alarm-priority-dot {
        width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
      }
      .alarm-info { flex: 1; min-width: 0; }
      .alarm-name { font-weight: 500; font-size: 0.9em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .alarm-meta { font-size: 0.75em; color: var(--secondary-text-color); }
      .alarm-actions { display: flex; gap: 4px; flex-shrink: 0; }

      .footer {
        padding: 8px 16px 12px;
        text-align: center;
      }
      .footer a {
        color: var(--primary-color); text-decoration: none; font-size: 0.85em; font-weight: 500;
      }

      .empty-card {
        padding: 24px 16px; text-align: center;
        color: var(--secondary-text-color);
      }
      .empty-icon { font-size: 32px; margin-bottom: 8px; color: var(--alarm-normal); }
    `,
  ];

  setConfig(config: CardConfig) {
    this._config = {
      title: "Alarms",
      show_count: true,
      show_list: true,
      max_items: 10,
      show_ack_button: true,
      show_shelve_button: false,
      ...config,
    };
  }

  static getConfigElement() {
    return document.createElement("scada-alarm-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:scada-alarm-card",
      title: "SCADA Alarms",
      show_count: true,
      show_list: true,
      max_items: 10,
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadAlarms();
    this._subscribe();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
  }

  private async _loadAlarms() {
    if (!this.hass) return;
    try {
      let all = await fetchAlarms(this.hass);
      // Filter to active alarms
      all = all.filter(
        (a) =>
          a.runtime.state === "active_unacknowledged" ||
          a.runtime.state === "active_acknowledged" ||
          a.runtime.state === "returned_to_normal_unacknowledged"
      );

      // Apply config filters
      if (this._config.filter_channel) {
        all = all.filter((a) => a.channel_id === this._config.filter_channel);
      }
      if (this._config.filter_priority?.length) {
        all = all.filter((a) => this._config.filter_priority!.includes(a.priority));
      }

      this._alarms = all.sort((a, b) => b.priority - a.priority);
    } finally {
      this._loading = false;
    }
  }

  private async _subscribe() {
    if (!this.hass) return;
    this._unsub = await subscribeAlarmChanges(this.hass, () => {
      this._loadAlarms();
    });
  }

  private async _ack(e: Event, alarmId: string) {
    e.stopPropagation();
    if (!this.hass) return;
    await acknowledgeAlarm(this.hass, alarmId);
    this._loadAlarms();
  }

  private async _shelve(e: Event, alarmId: string) {
    e.stopPropagation();
    if (!this.hass) return;
    await shelveAlarm(this.hass, alarmId, 15);
    this._loadAlarms();
  }

  private _getHighestSeverity(): AlarmPriority {
    if (this._alarms.length === 0) return 0;
    return Math.max(...this._alarms.map((a) => a.priority)) as AlarmPriority;
  }

  private _getUnackedCount(): number {
    return this._alarms.filter(
      (a) => a.runtime.state === "active_unacknowledged" || a.runtime.state === "returned_to_normal_unacknowledged"
    ).length;
  }

  render() {
    const severityColor = this._alarms.length > 0 ? getPriorityColor(this._getHighestSeverity()) : "#4CAF50";
    const unacked = this._getUnackedCount();
    const maxItems = this._config.max_items ?? 10;

    return html`
      <ha-card>
        <div class="severity-bar" style="background: ${severityColor}"></div>

        <div class="card-header">
          <span class="header-title">${this._config.title ?? "Alarms"}</span>
          ${this._config.show_count ? html`
            <div class="badges">
              <span class="count-badge" style="background: ${this._alarms.length > 0 ? severityColor + "22" : "#4CAF5022"}; color: ${this._alarms.length > 0 ? severityColor : "#4CAF50"}">
                ${this._alarms.length} active
              </span>
              ${unacked > 0 ? html`
                <span class="count-badge" style="background: #F4433622; color: #F44336;">
                  ${unacked} unacked
                </span>
              ` : ""}
            </div>
          ` : ""}
        </div>

        ${this._config.show_list ? html`
          ${this._alarms.length === 0 ? html`
            <div class="empty-card">
              <div class="empty-icon">&#x2714;</div>
              <div>No active alarms</div>
            </div>
          ` : html`
            <div class="alarm-list">
              ${this._alarms.slice(0, maxItems).map((alarm) => {
                const isUnacked = alarm.runtime.state === "active_unacknowledged" || alarm.runtime.state === "returned_to_normal_unacknowledged";
                return html`
                  <div class="alarm-item">
                    <div class="alarm-priority-dot" style="background: ${getPriorityColor(alarm.priority)}"></div>
                    <div class="alarm-info">
                      <div class="alarm-name">${alarm.name}</div>
                      <div class="alarm-meta">
                        ${PRIORITY_LABELS[alarm.priority]} &middot;
                        ${alarm.runtime.last_value ?? alarm.source_entity_id}
                      </div>
                    </div>
                    <div class="alarm-actions">
                      ${this._config.show_ack_button && isUnacked ? html`
                        <button class="btn btn-primary btn-small" @click=${(e: Event) => this._ack(e, alarm.id)}>ACK</button>
                      ` : ""}
                      ${this._config.show_shelve_button ? html`
                        <button class="btn btn-small" style="background: #9C27B0; color: white;" @click=${(e: Event) => this._shelve(e, alarm.id)}>Shelve</button>
                      ` : ""}
                    </div>
                  </div>
                `;
              })}
              ${this._alarms.length > maxItems ? html`
                <div class="alarm-meta" style="text-align: center; padding: 8px;">
                  +${this._alarms.length - maxItems} more
                </div>
              ` : ""}
            </div>
          `}
        ` : ""}

        <div class="footer">
          <a href="/scada-alarm-manager">Open Alarm Center &rarr;</a>
        </div>
      </ha-card>
    `;
  }
}

// Register with HA card picker
const customCards = (window as any).customCards || [];
customCards.push({
  type: "scada-alarm-card",
  name: "SCADA Alarm Card",
  description: "Active alarm monitoring with quick actions",
  preview: true,
});
(window as any).customCards = customCards;

declare global {
  interface HTMLElementTagNameMap {
    "scada-alarm-card": ScadaAlarmCard;
  }
}
