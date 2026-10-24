/**
 * Overflow ("three dots") menu for table rows.
 *
 * HA's own menu components have changed several times (ha-button-menu ->
 * ha-md-button-menu -> ha-dropdown) and none is guaranteed to be loaded on a dashboard,
 * so this is a small self-contained menu styled after HA's: an icon button that opens a
 * popover (top layer, light dismiss, Escape) with arrow-key navigation.
 *
 * Emits `menu-select` ({ action }) and stops click/key events from reaching the row.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { mdiDotsVertical } from "@mdi/js";
import { sharedStyles } from "../styles/shared-styles";

export interface RowMenuItem {
  action: string;
  label: string;
  icon: string;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}

@customElement("row-menu")
export class RowMenu extends LitElement {
  @property({ attribute: false }) items: RowMenuItem[] = [];
  @property() label = "More actions";
  @state() private _open = false;
  @query(".trigger") private _trigger!: HTMLButtonElement;
  @query(".menu") private _menu!: HTMLElement & { showPopover(): void; hidePopover(): void };

  static styles = [
    sharedStyles,
    css`
      :host {
        display: inline-block;
      }
      .menu {
        position: fixed;
        inset: unset;
        margin: 0;
        min-width: 200px;
        padding: 8px 0;
        border: none;
        border-radius: var(--ha-border-radius-lg, 12px);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.24);
      }
      .item {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
        min-height: 48px;
        padding: 0 16px;
        border: none;
        background: none;
        font: inherit;
        font-size: 14px;
        text-align: left;
        color: inherit;
        cursor: pointer;
        --mdc-icon-size: 22px;
      }
      .item ha-svg-icon {
        color: var(--secondary-text-color, #727272);
      }
      .item:hover,
      .item:focus-visible {
        background: var(--scada-hover-color);
        outline: none;
      }
      .item:disabled {
        opacity: 0.45;
        cursor: default;
        background: none;
      }
      .item.danger,
      .item.danger ha-svg-icon {
        color: var(--error-color, #db4437);
      }
    `,
  ];

  private _toggle(e: Event) {
    e.stopPropagation();
    if (this._open) this._menu.hidePopover();
    else this._show();
  }

  private _show() {
    const menu = this._menu;
    menu.showPopover();
    const r = this._trigger.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    let left = r.right - mw;
    let top = r.bottom + 4;
    if (left < 8) left = 8;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    this._items()[0]?.focus();
  }

  private _items(): HTMLButtonElement[] {
    return [...this.renderRoot.querySelectorAll<HTMLButtonElement>(".item:not(:disabled)")];
  }

  private _onToggle(e: Event & { newState?: string }) {
    this._open = e.newState === "open";
    // Return focus to the trigger when the menu closes while focus was inside it.
    if (!this._open && this.shadowRoot?.activeElement?.classList.contains("item")) this._trigger.focus();
  }

  private _onKey(e: KeyboardEvent) {
    e.stopPropagation();
    const items = this._items();
    const idx = items.indexOf(this.shadowRoot?.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Tab") {
      this._menu.hidePopover();
    }
  }

  private _select(item: RowMenuItem) {
    this._menu.hidePopover();
    this.dispatchEvent(new CustomEvent("menu-select", { detail: { action: item.action } }));
  }

  render() {
    return html`
      <button
        class="icon-btn trigger"
        aria-label=${this.label}
        title=${this.label}
        aria-haspopup="menu"
        aria-expanded=${this._open ? "true" : "false"}
        @click=${this._toggle}
        @keydown=${(e: KeyboardEvent) => e.stopPropagation()}
      >
        <ha-svg-icon .path=${mdiDotsVertical}></ha-svg-icon>
      </button>
      <div
        class="menu"
        role="menu"
        popover="auto"
        @toggle=${this._onToggle}
        @keydown=${this._onKey}
        @click=${(e: Event) => e.stopPropagation()}
      >
        ${this.items.map(
          (item) => html`
            <button
              class="item ${item.danger ? "danger" : ""}"
              role="menuitem"
              ?disabled=${item.disabled}
              title=${item.title ?? nothing}
              @click=${() => this._select(item)}
            >
              <ha-svg-icon .path=${item.icon}></ha-svg-icon>
              <span>${item.label}</span>
            </button>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "row-menu": RowMenu;
  }
}
