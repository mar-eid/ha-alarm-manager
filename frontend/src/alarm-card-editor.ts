/**
 * Config editor for the SCADA Alarm Card.
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface CardConfig {
  type: string;
  title?: string;
  show_count?: boolean;
  show_list?: boolean;
  max_items?: number;
  filter_channel?: string;
  show_ack_button?: boolean;
  show_shelve_button?: boolean;
}

@customElement("scada-alarm-card-editor")
export class ScadaAlarmCardEditor extends LitElement {
  @property({ attribute: false }) hass?: any;
  @state() private _config: CardConfig = { type: "custom:scada-alarm-card" };

  static styles = css`
    :host { display: block; padding: 16px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; margin-bottom: 4px; font-size: 0.85em; font-weight: 500; }
    .form-group input[type="text"],
    .form-group input[type="number"] {
      width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;
    }
    .checkbox-group { display: flex; gap: 16px; flex-wrap: wrap; margin: 8px 0; }
    .checkbox-group label { display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 0.9em; }
  `;

  setConfig(config: CardConfig) {
    this._config = { ...config };
  }

  private _changed() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="form-group">
        <label>Title</label>
        <input type="text" .value=${this._config.title ?? "Alarms"}
          @input=${(e: Event) => { this._config = { ...this._config, title: (e.target as HTMLInputElement).value }; this._changed(); }} />
      </div>
      <div class="form-group">
        <label>Max Items</label>
        <input type="number" min="1" max="50" .value=${String(this._config.max_items ?? 10)}
          @input=${(e: Event) => { this._config = { ...this._config, max_items: parseInt((e.target as HTMLInputElement).value) || 10 }; this._changed(); }} />
      </div>
      <div class="form-group">
        <label>Filter by Channel ID (optional)</label>
        <input type="text" .value=${this._config.filter_channel ?? ""}
          @input=${(e: Event) => { this._config = { ...this._config, filter_channel: (e.target as HTMLInputElement).value || undefined }; this._changed(); }} />
      </div>
      <div class="checkbox-group">
        <label><input type="checkbox" .checked=${this._config.show_count !== false}
          @change=${(e: Event) => { this._config = { ...this._config, show_count: (e.target as HTMLInputElement).checked }; this._changed(); }} /> Show Counts</label>
        <label><input type="checkbox" .checked=${this._config.show_list !== false}
          @change=${(e: Event) => { this._config = { ...this._config, show_list: (e.target as HTMLInputElement).checked }; this._changed(); }} /> Show Alarm List</label>
        <label><input type="checkbox" .checked=${this._config.show_ack_button !== false}
          @change=${(e: Event) => { this._config = { ...this._config, show_ack_button: (e.target as HTMLInputElement).checked }; this._changed(); }} /> ACK Button</label>
        <label><input type="checkbox" .checked=${this._config.show_shelve_button === true}
          @change=${(e: Event) => { this._config = { ...this._config, show_shelve_button: (e.target as HTMLInputElement).checked }; this._changed(); }} /> Shelve Button</label>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "scada-alarm-card-editor": ScadaAlarmCardEditor;
  }
}
