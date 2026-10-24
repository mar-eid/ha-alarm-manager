/**
 * Alarm tile card: one active alarm as a card (the "Cards" layout of the Active tab).
 * Severity accent bar, current value, state chip, inline ACK / Shelve.
 * Emits `ack-alarm` ({ id }), `shelve-alarm` ({ alarm }) and `open-alarm` ({ alarm }).
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sharedStyles, getPriorityColor } from "../styles/shared-styles";
import type { AlarmWithState, HomeAssistant } from "../types";
import { areaName, formatAlarmValue } from "../utils/format";
import { onActivateKey, renderStateChip } from "../utils/render";
import "./severity-badge";
import "./rel-time";

const UNACKED_STATES = ["active_unacknowledged", "returned_to_normal_unacknowledged"];

@customElement("alarm-tile-card")
export class AlarmTileCard extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
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
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
      }
      .card:focus-visible {
        outline: 2px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
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
      .big-value {
        font-size: 22px;
        font-weight: 500;
        line-height: 1.1;
        font-variant-numeric: tabular-nums;
        color: var(--primary-text-color, #212121);
        overflow-wrap: anywhere;
      }
      .mid .value-text {
        max-width: none;
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
      .foot {
        border-top: 1px solid var(--divider-color, #e0e0e0);
        padding-top: 10px;
        display: flex;
        justify-content: flex-end;
        gap: 6px;
      }
      /* critical + unacked draws attention */
      :host([flashing]) .card {
        animation: flash 1.1s infinite alternate;
      }
      @keyframes flash {
        from {
          box-shadow: 0 0 0 2px var(--error-color, #db4437);
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
    const isUnacked = UNACKED_STATES.includes(a.runtime.state);
    const value = formatAlarmValue(this.hass, a);
    const open = () => this._emit("open-alarm", { alarm: a });

    return html`
      <div
        class="card"
        tabindex="0"
        aria-label=${`${a.name}, open details`}
        @click=${open}
        @keydown=${onActivateKey(open)}
      >
        <span class="accent" style=${`background:${color}`}></span>

        <div class="top">
          <severity-badge .priority=${a.priority}></severity-badge>
          <span class="ago"><rel-time .hass=${this.hass} .datetime=${a.runtime.triggered_at}></rel-time></span>
        </div>

        <div>
          <div class="name">${a.name}</div>
          <div class="sub">${[areaName(this.hass, a.area), a.equipment].filter(Boolean).join(" · ")}</div>
        </div>

        <div class="mid">
          <div style="flex:1; min-width:0;">
            ${value.long
              ? html`<div class="value-text" title=${value.text}>${value.text}</div>`
              : html`<div class="big-value">${value.text}</div>`}
            <div class="entity">${a.source_entity_id}</div>
          </div>
          ${renderStateChip(a.runtime.state)}
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
