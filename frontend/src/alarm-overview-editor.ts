/**
 * Visual editor for the SCADA Alarm Overview card.
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "./styles/shared-styles";

interface OverviewConfig {
  type: string;
  title?: string;
  default_tab?: string;
  show_header?: boolean;
  max_width?: string;
}

@customElement("scada-alarm-overview-editor")
export class ScadaAlarmOverviewEditor extends LitElement {
  @property({ attribute: false }) hass?: unknown;
  @state() private _config!: OverviewConfig;

  static styles = [
    sharedStyles,
    css`
      :host { display: block; }
      .form-group { margin-bottom: 12px; }
      .form-group label {
        display: block; margin-bottom: 4px; font-size: 0.85em;
        font-weight: 500; color: var(--secondary-text-color);
      }
      .form-group input, .form-group select {
        width: 100%; padding: 8px; border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px; font: inherit; font-size: 0.9em;
        background: var(--card-background-color, white);
        color: var(--primary-text-color); box-sizing: border-box;
      }
      .row { display: flex; gap: 12px; margin-bottom: 12px; }
      .row > * { flex: 1; }
      .checkbox-row {
        display: flex; gap: 16px; margin-bottom: 12px;
      }
      .checkbox-row label {
        display: flex; align-items: center; gap: 4px; font-size: 0.9em; cursor: pointer;
      }
    `,
  ];

  setConfig(config: OverviewConfig) {
    this._config = config;
  }

  private _update(key: string, value: unknown) {
    const newConfig = { ...this._config, [key]: value };
    if (value === "" || value === undefined) delete (newConfig as Record<string, unknown>)[key];
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig } }));
  }

  render() {
    if (!this._config) return html``;

    return html`
      <div class="form-group">
        <label>Title</label>
        <input type="text"
          .value=${this._config.title ?? "Alarm Center"}
          @input=${(e: Event) => this._update("title", (e.target as HTMLInputElement).value)} />
      </div>

      <div class="row">
        <div class="form-group">
          <label>Default tab</label>
          <select .value=${this._config.default_tab ?? "active"}
            @change=${(e: Event) => this._update("default_tab", (e.target as HTMLSelectElement).value)}>
            <option value="active">Active</option>
            <option value="all">All Alarms</option>
            <option value="history">History</option>
            <option value="channels">Channels</option>
            <option value="create-edit">Create / Edit</option>
            <option value="settings">Settings</option>
          </select>
        </div>
        <div class="form-group">
          <label>Max width</label>
          <input type="text"
            .value=${this._config.max_width ?? ""}
            @input=${(e: Event) => this._update("max_width", (e.target as HTMLInputElement).value)}
            placeholder="e.g. 1200px (empty = full)" />
        </div>
      </div>

      <div class="checkbox-row">
        <label>
          <input type="checkbox"
            .checked=${this._config.show_header ?? false}
            @change=${(e: Event) => this._update("show_header", (e.target as HTMLInputElement).checked)} />
          Show header
        </label>
      </div>
    `;
  }
}
