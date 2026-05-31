/**
 * Visual editor for the SCADA Alarm Banner card.
 * Allows configuring filters, display options from the HA card editor UI.
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "./styles/shared-styles";
import { fetchChannels } from "./data/websocket";
import type { HomeAssistant, AlarmChannel } from "./types";

interface BannerConfig {
  type: string;
  title?: string;
  max_items?: number;
  filter_area?: string;
  filter_priority?: number | string;
  filter_channel?: string;
  filter_states?: string[];
  selectable_area?: boolean;
  show_ack_button?: boolean;
  show_shelve_button?: boolean;
  show_header?: boolean;
  default_shelve_minutes?: number;
}

@customElement("scada-alarm-banner-editor")
export class ScadaAlarmBannerEditor extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config!: BannerConfig;
  @state() private _channels: AlarmChannel[] = [];

  static styles = [
    sharedStyles,
    css`
      :host { display: block; }
      .row {
        display: flex; gap: 12px; margin-bottom: 12px; align-items: center;
      }
      .row > * { flex: 1; min-width: 0; }
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
      .checkbox-row {
        display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px;
      }
      .checkbox-row label {
        display: flex; align-items: center; gap: 4px; font-size: 0.9em; cursor: pointer;
      }
    `,
  ];

  setConfig(config: BannerConfig) {
    this._config = config;
    this._loadChannels();
  }

  private async _loadChannels() {
    if (!this.hass) return;
    try {
      this._channels = await fetchChannels(this.hass);
    } catch {
      // ignore
    }
  }

  private _update(key: string, value: unknown) {
    const newConfig = { ...this._config, [key]: value };
    // Remove empty string values (reset to default)
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
          <label>Max items shown</label>
          <input type="number" min="1" max="50"
            .value=${String(this._config.max_items ?? 5)}
            @input=${(e: Event) => this._update("max_items", parseInt((e.target as HTMLInputElement).value) || 5)} />
        </div>
        <div class="form-group">
          <label>Default shelve (min)</label>
          <input type="number" min="1" max="480"
            .value=${String(this._config.default_shelve_minutes ?? 15)}
            @input=${(e: Event) => this._update("default_shelve_minutes", parseInt((e.target as HTMLInputElement).value) || 15)} />
        </div>
      </div>

      <div class="form-group">
        <label>Filter by area</label>
        <ha-area-picker
          .hass=${this.hass}
          .value=${this._config.filter_area ?? ""}
          @value-changed=${(e: CustomEvent) => this._update("filter_area", e.detail.value || undefined)}
          .label=${"Area (empty = all)"}
        ></ha-area-picker>
      </div>

      <div class="form-group">
        <label>Show alarm states</label>
        <div class="checkbox-row">
          ${([
            ["active_unacknowledged", "Active (Unacked)"],
            ["active_acknowledged", "Active (Acked)"],
            ["returned_to_normal_unacknowledged", "RTN (Unacked)"],
            ["shelved", "Shelved"],
            ["normal", "Normal"],
            ["disabled", "Disabled"],
          ] as const).map(([state, label]) => {
            const states = this._config.filter_states ?? ["active_unacknowledged", "active_acknowledged", "returned_to_normal_unacknowledged"];
            const checked = states.includes(state);
            return html`<label title="Show alarms in ${label} state">
              <input type="checkbox" .checked=${checked}
                @change=${(e: Event) => {
                  const on = (e.target as HTMLInputElement).checked;
                  const current = [...(this._config.filter_states ?? ["active_unacknowledged", "active_acknowledged", "returned_to_normal_unacknowledged"])];
                  if (on && !current.includes(state)) current.push(state);
                  if (!on) { const i = current.indexOf(state); if (i >= 0) current.splice(i, 1); }
                  this._update("filter_states", current.length > 0 ? current : undefined);
                }} />
              ${label}
            </label>`;
          })}
        </div>
      </div>

      <div class="row">
        <div class="form-group">
          <label>Filter by priority</label>
          <select .value=${String(this._config.filter_priority ?? "")}
            @change=${(e: Event) => {
              const v = (e.target as HTMLSelectElement).value;
              this._update("filter_priority", v ? parseInt(v) : undefined);
            }}>
            <option value="">All priorities</option>
            <option value="0">Info</option>
            <option value="1">Warning</option>
            <option value="2">High</option>
            <option value="3">Critical</option>
          </select>
        </div>
        <div class="form-group">
          <label>Filter by channel</label>
          <select .value=${this._config.filter_channel ?? ""}
            @change=${(e: Event) => this._update("filter_channel", (e.target as HTMLSelectElement).value || undefined)}>
            <option value="">All channels</option>
            ${this._channels.map((ch) => html`<option value=${ch.id}>${ch.name}</option>`)}
          </select>
        </div>
      </div>

      <div class="checkbox-row">
        <label>
          <input type="checkbox"
            .checked=${this._config.show_header ?? false}
            @change=${(e: Event) => this._update("show_header", (e.target as HTMLInputElement).checked)} />
          Show header
        </label>
        <label>
          <input type="checkbox"
            .checked=${this._config.selectable_area ?? false}
            @change=${(e: Event) => this._update("selectable_area", (e.target as HTMLInputElement).checked)} />
          Area dropdown
        </label>
        <label>
          <input type="checkbox"
            .checked=${this._config.show_ack_button ?? true}
            @change=${(e: Event) => this._update("show_ack_button", (e.target as HTMLInputElement).checked)} />
          ACK button
        </label>
        <label>
          <input type="checkbox"
            .checked=${this._config.show_shelve_button ?? true}
            @change=${(e: Event) => this._update("show_shelve_button", (e.target as HTMLInputElement).checked)} />
          Shelve button
        </label>
      </div>
    `;
  }
}
