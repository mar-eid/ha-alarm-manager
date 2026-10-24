import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sharedStyles } from "../styles/shared-styles";
import "./scada-dialog";

@customElement("help-dialog")
export class HelpDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) version = "";

  static styles = [
    sharedStyles,
    css`
      h3 {
        margin: 20px 0 8px 0;
        font-size: 0.95em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      h3:first-child {
        margin-top: 0;
      }
      p {
        margin: 0 0 8px 0;
        font-size: 0.9em;
        line-height: 1.5;
      }
      ol,
      ul {
        margin: 0 0 8px 0;
        padding-left: 20px;
        font-size: 0.9em;
        line-height: 1.6;
      }
      .key {
        font-weight: 600;
        color: var(--primary-text-color);
      }
      code {
        font-family: var(--ha-font-family-code, monospace);
        font-size: 0.9em;
      }
      .version-line {
        margin-top: 20px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
        font-size: 0.8em;
        color: var(--secondary-text-color);
      }
    `,
  ];

  private _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close"));
  }

  render() {
    return html`
      <scada-dialog .open=${this.open} heading="Quick start guide" width="large" @dialog-closed=${this._close}>
        <h3>Getting started</h3>
        <ol>
          <li><span class="key">Create a channel</span> in the Channels tab to define where notifications go (mobile push, persistent panel, etc.).</li>
          <li><span class="key">Create an alarm</span> in the Create / Edit tab. Pick a source entity, set a trigger condition, and assign a channel.</li>
          <li><span class="key">Monitor alarms</span> in the Active tab. Acknowledge or shelve alarms from there.</li>
        </ol>

        <h3>Key concepts</h3>
        <ul>
          <li><span class="key">Priority</span> controls notification behavior: Info (panel only), Warning (persistent), High (+ mobile push), Critical (bypasses DND).</li>
          <li><span class="key">Channels</span> route notifications to specific targets (e.g. your phone). Each channel can filter by priority and set per-target thresholds.</li>
          <li><span class="key">Trigger types:</span> Analog compares a numeric value against a threshold. Digital matches a specific state (on/off). Custom State matches against a list of values.</li>
          <li><span class="key">Latching</span> alarms stay active until manually reset, even after the condition clears.</li>
          <li><span class="key">Acknowledge required</span> means the alarm won't return to normal until a user acknowledges it.</li>
          <li><span class="key">Hysteresis (deadband)</span> prevents rapid on/off cycling. The alarm triggers at the threshold but won't clear until the value moves past threshold +/- the deadband value.</li>
          <li><span class="key">Conditions</span> add a secondary gate: the alarm only fires when both the trigger and the condition are true.</li>
          <li><span class="key">Shelving</span> temporarily suppresses an alarm for a set duration.</li>
        </ul>

        <h3>Notification templates</h3>
        <p>Override default notification text with Jinja2 templates. Available variables:</p>
        <p>
          ${["name", "value", "unit", "area", "equipment", "friendly_name", "threshold", "operator", "priority"].map(
            (v, i) => html`${i ? ", " : ""}<code>{{ ${v} }}</code>`
          )}
        </p>

        ${this.version ? html`<div class="version-line">SCADA Alarm Manager v${this.version}</div>` : ""}
        <button slot="footer" class="btn btn-plain" @click=${this._close}>Close</button>
      </scada-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "help-dialog": HelpDialog;
  }
}
