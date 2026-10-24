/**
 * Small render helpers shared by the views.
 */

import { html, type TemplateResult } from "lit";
import { mdiCheckCircleOutline } from "@mdi/js";
import { getStateColor } from "../styles/shared-styles";
import { STATE_LABELS, type AlarmState, type AlarmWithState, type HomeAssistant } from "../types";
import { formatAlarmValue } from "./format";

/** HA's spinner when available (ha-spinner, older ha-circular-progress), else a CSS spinner. */
export const renderLoading = (): TemplateResult => {
  if (customElements.get("ha-spinner")) {
    return html`<div class="loading"><ha-spinner size="medium" aria-label="Loading"></ha-spinner></div>`;
  }
  if (customElements.get("ha-circular-progress")) {
    return html`<div class="loading">
      <ha-circular-progress indeterminate aria-label="Loading"></ha-circular-progress>
    </div>`;
  }
  return html`<div class="loading"><span class="css-spinner" role="progressbar" aria-label="Loading"></span></div>`;
};

export const renderEmpty = (text: string, icon: string = mdiCheckCircleOutline): TemplateResult =>
  html`<div class="empty-state"><ha-svg-icon .path=${icon}></ha-svg-icon><div>${text}</div></div>`;

export const renderStateChip = (state: AlarmState | string): TemplateResult =>
  html`<span class="status-chip" style=${`--c:${getStateColor(state)}`}>
    <span class="dot"></span>${STATE_LABELS[state as AlarmState] ?? state}
  </span>`;

export const renderValue = (hass: HomeAssistant | undefined, alarm: AlarmWithState): TemplateResult => {
  const v = formatAlarmValue(hass, alarm);
  return v.long
    ? html`<span class="value-text" title=${v.text}>${v.text}</span>`
    : html`<span class="value">${v.text}</span>`;
};

/** Keyboard activation for clickable rows/cards: Enter or Space on the element itself. */
export const onActivateKey = (handler: () => void) => (e: KeyboardEvent) => {
  if (e.target !== e.currentTarget) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handler();
  }
};

declare global {
  interface HTMLElementTagNameMap {
    "ha-spinner": HTMLElement;
    "ha-circular-progress": HTMLElement;
  }
}
