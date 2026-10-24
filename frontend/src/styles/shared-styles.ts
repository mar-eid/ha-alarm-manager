/**
 * Shared styles for SCADA Alarm Manager frontend.
 *
 * All colors come from Home Assistant theme variables (with fallbacks), so the
 * panel follows light/dark mode and custom themes.
 */

import { css } from "lit";

export const sharedStyles = css`
  :host {
    --scada-shelved-color: var(--purple-color, #926bc7);
    --scada-hover-color: color-mix(in srgb, var(--primary-text-color, #212121) 5%, transparent);
    --scada-tonal-color: color-mix(in srgb, var(--primary-text-color, #212121) 8%, transparent);

    font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, "Roboto", sans-serif));
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    font-size: 1.2em;
    font-weight: 500;
  }

  .card-content {
    padding: 0 16px 16px;
  }

  /* --- Tables --- */

  .table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9em;
  }

  th {
    text-align: left;
    padding: 8px 12px;
    border-bottom: 2px solid var(--divider-color, #e0e0e0);
    color: var(--secondary-text-color, #727272);
    font-weight: 500;
    white-space: nowrap;
  }

  td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
    vertical-align: middle;
  }

  tbody tr:hover {
    background-color: var(--scada-hover-color);
  }

  tbody tr.clickable {
    cursor: pointer;
  }

  tbody tr.clickable:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: -2px;
  }

  .filter-row th {
    padding-top: 4px;
    padding-bottom: 6px;
    border-bottom-width: 1px;
  }

  .filter-row input,
  .filter-row select {
    width: 100%;
    min-width: 70px;
    box-sizing: border-box;
    padding: 4px 6px;
    font: inherit;
    font-size: 0.85em;
    font-weight: 400;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 4px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
  }

  .sort-btn {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    cursor: pointer;
    --mdc-icon-size: 16px;
  }

  .sort-btn:hover,
  .sort-btn.sorted {
    color: var(--primary-text-color, #212121);
  }

  .sort-btn:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    border-radius: 2px;
  }

  td.name-cell {
    min-width: 180px;
  }

  .muted {
    font-size: 0.8em;
    color: var(--secondary-text-color, #727272);
  }

  .mono {
    font-family: var(--ha-font-family-code, monospace);
    font-size: 0.85em;
  }

  /* --- Values --- */

  .value {
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .value-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
    max-width: 320px;
    font-size: 0.9em;
    font-weight: 400;
    line-height: 1.35;
    color: var(--secondary-text-color, #727272);
  }

  /* --- Buttons (styled after ha-button) --- */

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 36px;
    padding: 0 16px;
    border: none;
    border-radius: 18px;
    cursor: pointer;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    background: var(--scada-tonal-color);
    color: var(--primary-text-color, #212121);
    transition: filter 0.15s, opacity 0.15s;
    --mdc-icon-size: 18px;
  }

  .btn:hover {
    filter: brightness(0.95);
  }

  .btn:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: default;
    filter: none;
  }

  .btn-primary {
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
  }

  .btn-danger {
    background: var(--error-color, #db4437);
    color: var(--text-primary-color, #fff);
  }

  .btn-plain {
    background: transparent;
    color: var(--primary-color, #03a9f4);
  }

  .btn-plain:hover {
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 10%, transparent);
    filter: none;
  }

  .btn-plain.danger {
    color: var(--error-color, #db4437);
  }

  .btn-plain.danger:hover {
    background: color-mix(in srgb, var(--error-color, #db4437) 10%, transparent);
  }

  .btn-shelve {
    background: color-mix(in srgb, var(--scada-shelved-color) 16%, transparent);
    color: color-mix(in srgb, var(--scada-shelved-color) 75%, var(--primary-text-color, #212121));
  }

  .btn-small {
    min-height: 30px;
    padding: 0 12px;
    font-size: 13px;
    border-radius: 15px;
  }

  .icon-btn {
    width: 40px;
    height: 40px;
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    cursor: pointer;
    color: var(--secondary-text-color, #727272);
    --mdc-icon-size: 22px;
  }

  .icon-btn:hover {
    background: var(--scada-hover-color);
    color: var(--primary-text-color, #212121);
  }

  .icon-btn:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* --- Chips / badges --- */

  /* Tonal status chip: set --c to a theme color. Text is the color mixed toward the
     primary text color so it keeps contrast in both light and dark themes. */
  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 10px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
    white-space: nowrap;
    background: color-mix(in srgb, var(--c) 16%, transparent);
    color: color-mix(in srgb, var(--c) 70%, var(--primary-text-color, #212121));
  }

  .status-chip .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex: none;
    background: var(--c);
  }

  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 32px;
    padding: 0 6px 0 12px;
    border: 1px solid var(--primary-color, #03a9f4);
    border-radius: 8px;
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 12%, transparent);
    color: var(--primary-text-color, #212121);
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    --mdc-icon-size: 16px;
  }

  .filter-chip:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }

  /* --- Tabs --- */

  .tabs {
    display: flex;
    align-items: center;
    background: var(--card-background-color, #fff);
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
    padding: 0 8px;
    overflow-x: auto;
    flex: none;
  }

  .tab {
    position: relative;
    height: 48px;
    padding: 0 18px;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    color: var(--secondary-text-color, #727272);
    white-space: nowrap;
    --mdc-icon-size: 19px;
  }

  .tab:hover {
    color: var(--primary-text-color, #212121);
  }

  .tab:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: -2px;
  }

  .tab.active {
    color: var(--primary-color, #03a9f4);
  }

  .tab.active::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 0;
    height: 3px;
    border-radius: 3px 3px 0 0;
    background: var(--primary-color, #03a9f4);
  }

  /* --- Loading / empty --- */

  .loading {
    display: flex;
    justify-content: center;
    padding: 48px 16px;
  }

  .css-spinner {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 4px solid color-mix(in srgb, var(--primary-color, #03a9f4) 20%, transparent);
    border-top-color: var(--primary-color, #03a9f4);
    animation: scada-spin 0.9s linear infinite;
  }

  @keyframes scada-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .empty-state {
    text-align: center;
    padding: 48px 16px;
    color: var(--secondary-text-color, #727272);
  }

  .empty-state ha-svg-icon {
    --mdc-icon-size: 48px;
    display: block;
    margin: 0 auto 12px;
    color: var(--success-color, #43a047);
  }

  /* --- Forms (legacy native inputs: channels form, card editors) --- */

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 4px;
    font-size: 0.85em;
    font-weight: 500;
    color: var(--secondary-text-color, #727272);
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 4px;
    font-size: 0.9em;
    box-sizing: border-box;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
  }

  .hint {
    font-size: 0.8em;
    color: var(--secondary-text-color, #727272);
    margin-top: 4px;
    line-height: 1.4;
  }

  @media (prefers-reduced-motion: reduce) {
    .css-spinner {
      animation-duration: 2s;
    }
  }
`;

/** Priority colors as theme variables. Critical and High are kept clearly apart
 *  (red vs. deep orange), and Critical additionally uses a solid badge. */
const PRIORITY_COLORS: Record<number, string> = {
  0: "var(--info-color, #039be5)",
  1: "var(--warning-color, #ffa600)",
  2: "var(--deep-orange-color, #ff6f22)",
  3: "var(--error-color, #db4437)",
};

const STATE_COLORS: Record<string, string> = {
  normal: "var(--success-color, #43a047)",
  active_unacknowledged: "var(--error-color, #db4437)",
  active_acknowledged: "var(--warning-color, #ffa600)",
  returned_to_normal_unacknowledged: "var(--info-color, #039be5)",
  shelved: "var(--purple-color, #926bc7)",
  disabled: "var(--disabled-text-color, #9e9e9e)",
};

const NEUTRAL_COLOR = "var(--disabled-text-color, #9e9e9e)";

export const getPriorityColor = (priority: number): string => PRIORITY_COLORS[priority] ?? NEUTRAL_COLOR;

export const getStateColor = (state: string): string => STATE_COLORS[state] ?? NEUTRAL_COLOR;
