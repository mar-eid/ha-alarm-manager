/**
 * Alarm tile card — one active alarm as a card (the "Cards" layout tile from the
 * prototype). Severity accent bar, live value, state badge, inline ACK / Shelve.
 * Reuses the existing <severity-badge>. Emits `ack-alarm` ({ id }),
 * `shelve-alarm` ({ alarm }) and `open-alarm` ({ alarm }).
 *
 * Place at: frontend/src/components/alarm-tile-card.ts
 *
 * Cards grid (drop into active-alarms-view.ts as an alternative to the table):
 *   import "../components/alarm-tile-card";
 *   html`
 *     <div class="cards-grid">
 *       ${filtered.map((a) => html`
 *         <alarm-tile-card
 *           .alarm=${a}
 *           @ack-alarm=${(e) => this._ack(e.detail.id)}
 *           @shelve-alarm=${(e) => this._shelve(e.detail.alarm)}
 *           @open-alarm=${(e) => (this._detailAlarm = e.detail.alarm)}>
 *         </alarm-tile-card>`)}
 *     </div>`
 *   // .cards-grid { display:grid; gap:14px;
 *   //   grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sharedStyles, getPriorityColor, getStateColor } from "../styles/shared-styles";
import { STATE_LABELS, type AlarmWithState } from "../types";
import "./severity-badge";

const UNACKED_STATES = ["active_unacknowledged", "returned_to_normal_unacknowledged"];

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

@customElement("alarm-tile-card")
export class AlarmTileCard extends LitElement {
  @property({ attribute: false }) alarm!: AlarmWithState;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px 16px 14px 18px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        cursor: pointer;
        overflow: hidden;
        transition: box-shadow 0.15s;
      }
      .card:hover {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      }
      .accent {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
      }
      .top {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .top .ago {
        margin-left: auto;
        font-size: 12px;
        color: var(--secondary-text-color, #727272);
        white-space: nowrap;
      }
      .name {
        font-size: 15.5px;
        font-weight: 600;
        line-height: 1.25;
        color: var(--primary-text-color, #212121);
      }
      .sub {
        font-size: 12.5px;
        color: var(--secondary-text-color, #727272);
        margin-top: 2px;
      }
      .mid {
        display: flex;
        align-items: flex-end;
        gap: 10px;
      }
      .value {
        font-size: 22px;
        font-weight: 600;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .entity {
        font-size: 11px;
        font-family: var(--ha-font-family-code, monospace);
        color: var(--secondary-text-color, #727272);
        margin-top: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .state-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: 9999px;
        font-size: 11.5px;
        font-weight: 600;
        white-space: nowrap;
      }
      .state-badge .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
      .foot {
        border-top: 1px solid var(--divider-color, #e0e0e0);
        padding-top: 10px;
        display: flex;
        justify-content: flex-end;
        gap: 6px;
      }
      .btn-shelve {
        background: color-mix(in srgb, #9c27b0 14%, transparent);
        color: #9c27b0;
      }
      /* critical + unacked draws attention */
      :host([flashing]) .card {
        animation: flash 1.1s infinite alternate;
      }
      @keyframes flash {
        from {
          box-shadow: 0 0 0 1px #f44336;
        }
        to {
          box-shadow: 0 0 0 1px transparent;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        :host([flashing]) .card {
          animation: none;
        }
      }
    `,
  ];

  private _emit(type: string, detail: Record<string, unknown>) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  willUpdate() {
    const a = this.alarm;
    const flash =
      a && a.priority >= 3 && UNACKED_STATES.includes(a.runtime.state);
    this.toggleAttribute("flashing", !!flash);
  }

  render() {
    const a = this.alarm;
    if (!a) return html``;
    const color = getPriorityColor(a.priority);
    const stateColor = getStateColor(a.runtime.state);
    const isUnacked = UNACKED_STATES.includes(a.runtime.state);

    return html`
      <div class="card" @click=${() => this._emit("open-alarm", { alarm: a })}>
        <span class="accent" style=${`background:${color}`}></span>

        <div class="top">
          <severity-badge .priority=${a.priority}></severity-badge>
          <span class="ago">${timeAgo(a.runtime.triggered_at)}</span>
        </div>

        <div>
          <div class="name">${a.name}</div>
          <div class="sub">${a.area}${a.equipment ? ` · ${a.equipment}` : ""}</div>
        </div>

        <div class="mid">
          <div style="flex:1; min-width:0;">
            <div class="value" style=${`color:${color}`}>${a.runtime.last_value ?? "—"}</div>
            <div class="entity">${a.source_entity_id}</div>
          </div>
          <span
            class="state-badge"
            style=${`background:color-mix(in srgb, ${stateColor} 15%, transparent); color:${stateColor}`}
          >
            <span class="dot" style=${`background:${stateColor}`}></span>
            ${STATE_LABELS[a.runtime.state] ?? a.runtime.state}
          </span>
        </div>

        <div class="foot">
          ${isUnacked
            ? html`<button
                class="btn btn-primary"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  this._emit("ack-alarm", { id: a.id });
                }}
              >
                ACK
              </button>`
            : ""}
          <button
            class="btn btn-shelve"
            @click=${(e: Event) => {
              e.stopPropagation();
              this._emit("shelve-alarm", { alarm: a });
            }}
          >
            Shelve
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "alarm-tile-card": AlarmTileCard;
  }
}
