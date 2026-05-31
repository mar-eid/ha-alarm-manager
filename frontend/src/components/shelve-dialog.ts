/**
 * Shelve dialog — replaces the window.prompt() shelve flow with a real modal.
 * Preset durations + a fine slider. Emits `shelve-confirm` ({ alarmId, minutes })
 * and `dialog-closed`.
 *
 * Place at: frontend/src/components/shelve-dialog.ts
 *
 * Use in active-alarms-view.ts / all-alarms-view.ts:
 *   // replace the prompt()-based _shelve() with:
 *   private _shelve(alarm: AlarmWithState) { this._shelveTarget = alarm; }
 *
 *   <shelve-dialog
 *     .open=${!!this._shelveTarget}
 *     .alarmId=${this._shelveTarget?.id ?? ""}
 *     .alarmName=${this._shelveTarget?.name ?? ""}
 *     @dialog-closed=${() => (this._shelveTarget = undefined)}
 *     @shelve-confirm=${async (e: CustomEvent) => {
 *       await shelveAlarm(this.hass!, e.detail.alarmId, e.detail.minutes);
 *       this._shelveTarget = undefined;
 *       this._load();
 *     }}>
 *   </shelve-dialog>
 */

import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { mdiBellSleep, mdiClose } from "@mdi/js";
import { sharedStyles } from "../styles/shared-styles";

const SHELVE_COLOR = unsafeCSS("#9c27b0");
const PRESETS = [15, 30, 60, 240, 480];

@customElement("shelve-dialog")
export class ShelveDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property() alarmId = "";
  @property() alarmName = "";
  @state() private _minutes = 15;

  static styles = [
    sharedStyles,
    css`
      .overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(2px);
        padding: 20px;
      }
      .dialog {
        width: min(440px, 94vw);
        background: var(--card-background-color, #fff);
        border-radius: 16px;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.32);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 12px 16px 20px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        --mdc-icon-size: 22px;
        color: var(--alarm-shelved, ${SHELVE_COLOR});
      }
      .title {
        flex: 1;
        font-size: 17px;
        font-weight: 500;
        color: var(--primary-text-color, #212121);
      }
      .icon-btn {
        border: none;
        background: none;
        cursor: pointer;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color, #727272);
        --mdc-icon-size: 22px;
      }
      .icon-btn:hover {
        background: var(--secondary-background-color, #f0f0f0);
      }
      .body {
        padding: 20px;
      }
      .body p {
        margin: 0 0 16px;
        font-size: 14px;
        line-height: 1.55;
        color: var(--primary-text-color, #212121);
      }
      .presets {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }
      .chip {
        padding: 8px 14px;
        border-radius: 9999px;
        cursor: pointer;
        font: inherit;
        font-size: 13px;
        font-weight: 500;
        border: 1px solid var(--divider-color, #e0e0e0);
        background: transparent;
        color: var(--primary-text-color, #212121);
      }
      .chip.sel {
        border-color: ${SHELVE_COLOR};
        background: color-mix(in srgb, ${SHELVE_COLOR} 14%, transparent);
        color: ${SHELVE_COLOR};
      }
      .slider {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .slider input {
        flex: 1;
        accent-color: ${SHELVE_COLOR};
      }
      .slider span {
        font-size: 14px;
        font-weight: 600;
        min-width: 64px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .foot {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 0 20px 20px;
      }
      .btn-shelve {
        background: ${SHELVE_COLOR};
        color: #fff;
      }
    `,
  ];

  private _fmt(m: number) {
    return m < 60 ? `${m} min` : `${m / 60} h`;
  }

  private _close() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }

  private _confirm() {
    this.dispatchEvent(
      new CustomEvent("shelve-confirm", {
        detail: { alarmId: this.alarmId, minutes: this._minutes },
      })
    );
  }

  render() {
    if (!this.open) return html``;
    return html`
      <div class="overlay" @click=${this._close}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="head">
            <ha-svg-icon .path=${mdiBellSleep}></ha-svg-icon>
            <span class="title">Shelve alarm</span>
            <button class="icon-btn" @click=${this._close}>
              <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
            </button>
          </div>
          <div class="body">
            <p>
              Temporarily suppress <strong>${this.alarmName}</strong>. It won't notify or appear as
              active until the timer expires, then it returns to normal evaluation.
            </p>
            <div class="presets">
              ${PRESETS.map(
                (m) => html`
                  <button class="chip ${this._minutes === m ? "sel" : ""}" @click=${() => (this._minutes = m)}>
                    ${this._fmt(m)}
                  </button>
                `
              )}
            </div>
            <div class="slider">
              <input
                type="range"
                min="5"
                max="480"
                step="5"
                .value=${String(this._minutes)}
                @input=${(e: Event) => (this._minutes = Number((e.target as HTMLInputElement).value))}
              />
              <span>${this._fmt(this._minutes)}</span>
            </div>
          </div>
          <div class="foot">
            <button class="btn" @click=${this._close}>Cancel</button>
            <button class="btn btn-shelve" @click=${this._confirm}>
              Shelve for ${this._fmt(this._minutes)}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "shelve-dialog": ShelveDialog;
    "ha-svg-icon": any;
  }
}
