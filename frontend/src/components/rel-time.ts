/**
 * Relative time ("5 minutes ago") with the exact time as tooltip, refreshed every 30 s.
 * Same format everywhere in the Alarm Center; follows the user's HA locale.
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { formatDateTime, formatRelative } from "../utils/format";
import type { HomeAssistant } from "../types";

@customElement("rel-time")
export class RelTime extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property() datetime: string | null = null;
  private _timer?: number;

  static styles = css`
    :host {
      white-space: nowrap;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._timer = window.setInterval(() => this.requestUpdate(), 30000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearInterval(this._timer);
  }

  render() {
    if (!this.datetime) return html`—`;
    return html`<time datetime=${this.datetime} title=${formatDateTime(this.hass, this.datetime)}
      >${formatRelative(this.hass, this.datetime)}</time
    >`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rel-time": RelTime;
  }
}
