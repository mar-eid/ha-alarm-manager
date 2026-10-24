/**
 * Shelve dialog: preset durations plus a slider. Emits `shelve-confirm`
 * ({ alarmId, minutes }) and `dialog-closed`.
 */

import { LitElement, html, css, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles/shared-styles";
import { formatDuration } from "../utils/format";
import "./scada-dialog";

const DEFAULT_MINUTES = 15;
const PRESETS = [15, 30, 60, 240, 480, 1440, 2880, 7200, 20160, 43200];
/** Slider stops (minutes). Roughly logarithmic and covering every preset, so the
 *  slider position always matches the selected duration from 5 min up to 30 days. */
const STEPS = [
  5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 360, 480, 720, 1440, 2160, 2880, 4320, 7200, 10080, 14400, 20160,
  30240, 43200,
];

@customElement("shelve-dialog")
export class ShelveDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property() alarmId = "";
  @property() alarmName = "";
  @state() private _minutes = DEFAULT_MINUTES;

  static styles = [
    sharedStyles,
    css`
      p {
        margin: 0 0 16px;
        font-size: 14px;
        line-height: 1.55;
      }
      .presets {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }
      .chip {
        height: 32px;
        padding: 0 14px;
        border-radius: 8px;
        cursor: pointer;
        font: inherit;
        font-size: 13px;
        font-weight: 500;
        border: 1px solid var(--divider-color, #e0e0e0);
        background: transparent;
        color: var(--primary-text-color, #212121);
      }
      .chip[aria-pressed="true"] {
        border-color: var(--scada-shelved-color);
        background: color-mix(in srgb, var(--scada-shelved-color) 16%, transparent);
        color: color-mix(in srgb, var(--scada-shelved-color) 75%, var(--primary-text-color, #212121));
      }
      .chip:focus-visible {
        outline: 2px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }
      .slider {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .slider input {
        flex: 1;
        accent-color: var(--scada-shelved-color);
      }
      .slider output {
        font-size: 14px;
        font-weight: 500;
        min-width: 80px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .btn-confirm {
        background: var(--scada-shelved-color);
        color: var(--text-primary-color, #fff);
      }
    `,
  ];

  willUpdate(changed: PropertyValues) {
    // Start from the default every time the dialog opens.
    if (changed.has("open") && this.open) this._minutes = DEFAULT_MINUTES;
  }

  private _fmt(m: number) {
    return formatDuration(m * 60);
  }

  private get _stepIndex(): number {
    const exact = STEPS.indexOf(this._minutes);
    if (exact >= 0) return exact;
    // Nearest stop for values not on the scale.
    return STEPS.reduce((best, s, i) => (Math.abs(s - this._minutes) < Math.abs(STEPS[best] - this._minutes) ? i : best), 0);
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
    return html`
      <scada-dialog .open=${this.open} heading="Shelve alarm" width="small" @dialog-closed=${this._close}>
        <p>
          Temporarily suppress <strong>${this.alarmName}</strong>. It won't notify or appear as active until the timer
          expires, then it returns to normal evaluation.
        </p>
        <div class="presets" role="group" aria-label="Duration presets">
          ${PRESETS.map(
            (m) => html`
              <button class="chip" aria-pressed=${this._minutes === m ? "true" : "false"} @click=${() => (this._minutes = m)}>
                ${this._fmt(m)}
              </button>
            `
          )}
        </div>
        <div class="slider">
          <input
            type="range"
            min="0"
            max=${STEPS.length - 1}
            step="1"
            aria-label="Shelve duration"
            aria-valuetext=${this._fmt(this._minutes)}
            .value=${String(this._stepIndex)}
            @input=${(e: Event) => (this._minutes = STEPS[Number((e.target as HTMLInputElement).value)])}
          />
          <output>${this._fmt(this._minutes)}</output>
        </div>
        <button slot="footer" class="btn btn-plain" @click=${this._close}>Cancel</button>
        <button slot="footer" class="btn btn-confirm" @click=${this._confirm}>Shelve for ${this._fmt(this._minutes)}</button>
      </scada-dialog>
    `;
  }
}
