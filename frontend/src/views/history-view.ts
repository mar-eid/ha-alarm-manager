import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, getStateColor } from "../styles/shared-styles";
import { fetchEvents } from "../data/websocket";
import { STATE_LABELS, type HomeAssistant, type AlarmEvent } from "../types";

@customElement("history-view")
export class HistoryView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _events: AlarmEvent[] = [];
  @state() private _loading = true;
  @state() private _offset = 0;
  private _limit = 50;

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; }
      .pagination { display: flex; gap: 8px; justify-content: center; margin-top: 16px; }
      .event-type {
        display: inline-block; padding: 2px 6px; border-radius: 4px;
        font-size: 0.8em; font-weight: 500; text-transform: capitalize;
        background: var(--secondary-background-color, #f5f5f5);
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._loadEvents();
  }

  private async _loadEvents() {
    if (!this.hass) return;
    try {
      this._events = await fetchEvents(this.hass, {
        limit: this._limit,
        offset: this._offset,
      });
    } finally {
      this._loading = false;
    }
  }

  private _nextPage() {
    this._offset += this._limit;
    this._loading = true;
    this._loadEvents();
  }

  private _prevPage() {
    this._offset = Math.max(0, this._offset - this._limit);
    this._loading = true;
    this._loadEvents();
  }

  render() {
    if (this._loading) return html`<div class="empty-state">Loading...</div>`;

    if (this._events.length === 0 && this._offset === 0) {
      return html`<div class="empty-state">No alarm events recorded yet.</div>`;
    }

    return html`
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Alarm</th>
            <th>Event</th>
            <th>Old State</th>
            <th>New State</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          ${this._events.map(
            (event) => html`
              <tr>
                <td>${new Date(event.timestamp).toLocaleString()}</td>
                <td><strong>${event.alarm_name}</strong></td>
                <td><span class="event-type">${event.event_type}</span></td>
                <td>${event.old_state ? html`<span class="badge" style="background: ${getStateColor(event.old_state)}">${STATE_LABELS[event.old_state] ?? event.old_state}</span>` : "-"}</td>
                <td>${event.new_state ? html`<span class="badge" style="background: ${getStateColor(event.new_state)}">${STATE_LABELS[event.new_state] ?? event.new_state}</span>` : "-"}</td>
                <td>${event.user ?? "-"}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
      <div class="pagination">
        <button class="btn btn-small" ?disabled=${this._offset === 0} @click=${this._prevPage}>Previous</button>
        <span>Page ${Math.floor(this._offset / this._limit) + 1}</span>
        <button class="btn btn-small" ?disabled=${this._events.length < this._limit} @click=${this._nextPage}>Next</button>
      </div>
    `;
  }
}
