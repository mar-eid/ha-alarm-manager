import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, getPriorityColor } from "../styles/shared-styles";
import { fetchAlarms, fetchChannels, fetchEvents } from "../data/websocket";
import { PRIORITY_LABELS, type HomeAssistant, type AlarmWithState, type AlarmEvent, type AlarmPriority } from "../types";

const ACTIVE_STATES = ["active_unacknowledged", "active_acknowledged", "returned_to_normal_unacknowledged"];

@customElement("settings-view")
export class SettingsView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _alarms: AlarmWithState[] = [];
  @state() private _channelCount = 0;
  @state() private _events: AlarmEvent[] = [];
  @state() private _loading = true;

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; max-width: 800px; }
      .stats-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 12px; margin-bottom: 24px;
      }
      .stat-card {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px; padding: 14px; text-align: center;
      }
      .stat-value { font-size: 1.8em; font-weight: 600; color: var(--primary-color); }
      .stat-label { font-size: 0.8em; color: var(--secondary-text-color); margin-top: 4px; }
      .section {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px; padding: 16px; margin-bottom: 16px;
      }
      .section h3 { margin: 0 0 12px; font-size: 1em; color: var(--secondary-text-color); }
      .freq-row {
        display: flex; align-items: center; gap: 8px; padding: 6px 0;
        border-bottom: 1px solid var(--divider-color);
        font-size: 0.9em;
      }
      .freq-row:last-child { border-bottom: none; }
      .freq-bar {
        height: 6px; border-radius: 3px; min-width: 4px;
      }
      .freq-count { font-weight: 600; min-width: 24px; text-align: right; font-variant-numeric: tabular-nums; }
      .freq-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--divider-color); font-size: 0.9em; }
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
      const [alarms, channels, events] = await Promise.all([
        fetchAlarms(this.hass),
        fetchChannels(this.hass),
        fetchEvents(this.hass, { limit: 500 }),
      ]);
      this._alarms = alarms;
      this._channelCount = channels.length;
      this._events = events;
    } finally {
      this._loading = false;
    }
  }

  private _getMostFrequent(): { name: string; count: number; priority: AlarmPriority }[] {
    const counts: Record<string, { count: number; name: string; priority: AlarmPriority }> = {};
    for (const ev of this._events) {
      if (ev.event_type === "triggered") {
        const alarm = this._alarms.find((a) => a.id === ev.alarm_id);
        const key = ev.alarm_id;
        if (!counts[key]) counts[key] = { count: 0, name: ev.alarm_name || "Unknown", priority: (alarm?.priority ?? 1) as AlarmPriority };
        counts[key].count++;
      }
    }
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 10);
  }

  private _getAvgAckTime(): string {
    const ackEvents = this._events.filter((e) => e.event_type === "acknowledged");
    if (ackEvents.length === 0) return "—";
    const triggerTimes: Record<string, string> = {};
    for (const ev of this._events) {
      if (ev.event_type === "triggered") triggerTimes[ev.alarm_id] = ev.timestamp;
    }
    let totalMin = 0;
    let count = 0;
    for (const ack of ackEvents) {
      const trigger = triggerTimes[ack.alarm_id];
      if (trigger) {
        const diff = (new Date(ack.timestamp).getTime() - new Date(trigger).getTime()) / 60000;
        if (diff > 0 && diff < 1440) { totalMin += diff; count++; }
      }
    }
    if (count === 0) return "—";
    const avg = totalMin / count;
    return avg < 60 ? `${Math.round(avg)} min` : `${(avg / 60).toFixed(1)} h`;
  }

  render() {
    if (this._loading) return html`<div class="empty-state">Loading...</div>`;

    const active = this._alarms.filter((a) => ACTIVE_STATES.includes(a.runtime.state)).length;
    const shelved = this._alarms.filter((a) => a.runtime.state === "shelved").length;
    const disabled = this._alarms.filter((a) => a.runtime.state === "disabled").length;
    const freq = this._getMostFrequent();
    const maxCount = freq.length > 0 ? freq[0].count : 1;

    return html`
      <h2>System Overview</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${this._alarms.length}</div>
          <div class="stat-label">Total Alarms</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${active}</div>
          <div class="stat-label">Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${shelved}</div>
          <div class="stat-label">Shelved</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${disabled}</div>
          <div class="stat-label">Disabled</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this._channelCount}</div>
          <div class="stat-label">Channels</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this._getAvgAckTime()}</div>
          <div class="stat-label">Avg. ACK Time</div>
        </div>
      </div>

      ${freq.length > 0 ? html`
        <div class="section">
          <h3>Most Frequent Alarms (recent ${this._events.length} events)</h3>
          ${freq.map((f) => html`
            <div class="freq-row">
              <span class="freq-count">${f.count}</span>
              <span class="freq-bar" style="width:${Math.max((f.count / maxCount) * 120, 4)}px;background:${getPriorityColor(f.priority)}"></span>
              <span class="freq-name">${f.name}</span>
              <span style="font-size:0.8em;color:var(--secondary-text-color)">${PRIORITY_LABELS[f.priority]}</span>
            </div>
          `)}
        </div>
      ` : ""}

      <div class="section">
        <h3>About</h3>
        <div class="info-row">
          <span>Integration</span>
          <span>SCADA Alarm Manager</span>
        </div>
        <div class="info-row">
          <span>Domain</span>
          <span>scada_alarm_manager</span>
        </div>
        <div class="info-row">
          <span>Total Events</span>
          <span>${this._events.length}+</span>
        </div>
      </div>

      <p style="margin-top: 16px; font-size: 0.85em; color: var(--secondary-text-color);">
        To change global settings, go to Settings &rarr; Integrations &rarr; SCADA Alarm Manager &rarr; Options.
      </p>
    `;
  }
}
