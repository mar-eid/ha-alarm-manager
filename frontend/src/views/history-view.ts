import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles/shared-styles";
import { fetchEvents } from "../data/websocket";
import type { HomeAssistant, AlarmEvent } from "../types";
import { renderEmpty, renderLoading, renderStateChip } from "../utils/render";
import { mdiHistory } from "@mdi/js";
import "../components/rel-time";

@customElement("history-view")
export class HistoryView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _events: AlarmEvent[] = [];
  @state() private _loading = true;
  @state() private _offset = 0;
  private _limit = 50;

  // Column filters
  @state() private _filterAlarm = "";
  @state() private _filterEvent = "";
  @state() private _filterUser = "";

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; }
      .pagination { display: flex; gap: 8px; justify-content: center; margin-top: 16px; }
      .event-type {
        display: inline-block; padding: 2px 6px; border-radius: 4px;
        font-size: 0.8em; font-weight: 500; text-transform: capitalize;
        background: var(--scada-tonal-color);
      }
      .pagination span { align-self: center; font-size: 0.9em; }
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

  private get _filtered(): AlarmEvent[] {
    return this._events.filter((ev) => {
      if (this._filterAlarm && !ev.alarm_name.toLowerCase().includes(this._filterAlarm.toLowerCase())) return false;
      if (this._filterEvent && ev.event_type !== this._filterEvent) return false;
      if (this._filterUser && !(ev.user ?? "").toLowerCase().includes(this._filterUser.toLowerCase())) return false;
      return true;
    });
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
    if (this._loading) return renderLoading();

    if (this._events.length === 0 && this._offset === 0) {
      return renderEmpty("No alarm events recorded yet.", mdiHistory);
    }

    const eventTypes = [...new Set(this._events.map((e) => e.event_type))].sort();
    const filtered = this._filtered;

    return html`
      <div class="table-wrap">
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
          <tr class="filter-row">
            <th></th>
            <th><input type="text" placeholder="Filter..." aria-label="Filter by alarm" .value=${this._filterAlarm} @input=${(e: Event) => this._filterAlarm = (e.target as HTMLInputElement).value} /></th>
            <th>
              <select aria-label="Filter by event type" @change=${(e: Event) => this._filterEvent = (e.target as HTMLSelectElement).value}>
                <option value="">All</option>
                ${eventTypes.map((t) => html`<option value=${t}>${t}</option>`)}
              </select>
            </th>
            <th></th>
            <th></th>
            <th><input type="text" placeholder="Filter..." aria-label="Filter by user" .value=${this._filterUser} @input=${(e: Event) => this._filterUser = (e.target as HTMLInputElement).value} /></th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(
            (event) => html`
              <tr>
                <td class="muted"><rel-time .hass=${this.hass} .datetime=${event.timestamp}></rel-time></td>
                <td><strong>${event.alarm_name}</strong></td>
                <td><span class="event-type">${event.event_type}</span>${event.event_type === "suppressed" && event.details?.suppressed_by_name ? html`<br><span class="muted">by ${event.details.suppressed_by_name}</span>` : ""}</td>
                <td>${event.old_state ? renderStateChip(event.old_state) : "—"}</td>
                <td>${event.new_state ? renderStateChip(event.new_state) : "—"}</td>
                <td>${event.user ?? "—"}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
      </div>
      <div class="pagination">
        <button class="btn btn-small" ?disabled=${this._offset === 0} @click=${this._prevPage}>Previous</button>
        <span>Page ${Math.floor(this._offset / this._limit) + 1}</span>
        <button class="btn btn-small" ?disabled=${this._events.length < this._limit} @click=${this._nextPage}>Next</button>
      </div>
    `;
  }
}
