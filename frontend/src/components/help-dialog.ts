import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sharedStyles } from "../styles/shared-styles";

@customElement("help-dialog")
export class HelpDialog extends LitElement {
  @property({ type: Boolean }) open = false;

  static styles = [
    sharedStyles,
    css`
      .overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000;
      }
      .dialog {
        background: var(--card-background-color, white);
        border-radius: 12px;
        width: 90%; max-width: 640px; max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      .dialog-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .dialog-header h2 { margin: 0; font-size: 1.1em; }
      .close-btn {
        background: none; border: none; font-size: 1.4em;
        cursor: pointer; color: var(--secondary-text-color);
        padding: 4px 8px; border-radius: 4px;
      }
      .close-btn:hover { background: var(--secondary-background-color, #f5f5f5); }
      .dialog-body { padding: 20px; }
      .dialog-body h3 {
        margin: 20px 0 8px 0; font-size: 0.95em;
        color: var(--primary-color);
      }
      .dialog-body h3:first-child { margin-top: 0; }
      .dialog-body p { margin: 0 0 8px 0; font-size: 0.9em; line-height: 1.5; }
      .dialog-body ol, .dialog-body ul { margin: 0 0 8px 0; padding-left: 20px; font-size: 0.9em; line-height: 1.6; }
      .key { font-weight: 600; color: var(--primary-text-color); }
    `,
  ];

  private _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close"));
  }

  render() {
    if (!this.open) return html``;

    return html`
      <div class="overlay" @click=${this._close}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <h2>Quick Start Guide</h2>
            <button class="close-btn" @click=${this._close}>&times;</button>
          </div>
          <div class="dialog-body">
            <h3>Getting Started</h3>
            <ol>
              <li><span class="key">Create a channel</span> in the Channels tab to define where notifications go (mobile push, persistent panel, etc.).</li>
              <li><span class="key">Create an alarm</span> in the Create / Edit tab. Pick a source entity, set a trigger condition, and assign a channel.</li>
              <li><span class="key">Monitor alarms</span> in the Active tab. Acknowledge or shelve alarms from there.</li>
            </ol>

            <h3>Key Concepts</h3>
            <ul>
              <li><span class="key">Priority</span> controls notification behavior: Info (panel only), Warning (persistent), High (+ mobile push), Critical (bypasses DND).</li>
              <li><span class="key">Channels</span> route notifications to specific targets (e.g. your phone). Each channel can filter by priority and set per-target thresholds.</li>
              <li><span class="key">Trigger types:</span> Analog compares a numeric value against a threshold. Digital matches a specific state (on/off). Custom State matches against a list of values.</li>
              <li><span class="key">Latching</span> alarms stay active until manually reset, even after the condition clears.</li>
              <li><span class="key">Acknowledge Required</span> means the alarm won't return to normal until a user acknowledges it.</li>
              <li><span class="key">Hysteresis (deadband)</span> prevents rapid on/off cycling. The alarm triggers at the threshold but won't clear until the value moves past threshold +/- the deadband value.</li>
              <li><span class="key">Conditions</span> add a secondary gate: the alarm only fires when both the trigger and the condition are true.</li>
              <li><span class="key">Shelving</span> temporarily suppresses an alarm for a set duration.</li>
            </ul>

            <h3>Notification Templates</h3>
            <p>Override default notification text with Jinja2 templates. Available variables:</p>
            <p><span class="key">{{ name }}</span>, <span class="key">{{ value }}</span>, <span class="key">{{ unit }}</span>, <span class="key">{{ area }}</span>, <span class="key">{{ equipment }}</span>, <span class="key">{{ friendly_name }}</span>, <span class="key">{{ threshold }}</span>, <span class="key">{{ operator }}</span>, <span class="key">{{ priority }}</span></p>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "help-dialog": HelpDialog;
  }
}
