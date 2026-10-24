/**
 * Dialog wrapper used by every modal in the Alarm Center.
 *
 * Renders Home Assistant's own <ha-dialog> (the current webawesome-based one: `open`,
 * `header-title`, `slot="footer"`, `closed` event) when it is registered. Otherwise it
 * falls back to a native <dialog> opened with showModal(), which gives the same
 * behaviour: Escape closes, focus stays inside, the page behind is inert.
 *
 * Usage:
 *   <scada-dialog .open=${open} heading="Title" @dialog-closed=${...}>
 *     body…
 *     <button slot="footer">OK</button>
 *   </scada-dialog>
 *
 * Fires `dialog-closed` (not bubbling) whenever the dialog closes, whether by Escape,
 * the scrim, the close button or by the parent setting `open = false`.
 */

import { LitElement, html, css, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { mdiClose } from "@mdi/js";
import { sharedStyles } from "../styles/shared-styles";
import { ensureHaComponents } from "../utils/ha-load";

/** True when the registered ha-dialog is the current generation (has `headerTitle`). */
const haDialogUsable = (): boolean => {
  const ctor = customElements.get("ha-dialog") as (CustomElementConstructor & { prototype: object }) | undefined;
  return !!ctor && "headerTitle" in ctor.prototype;
};

@customElement("scada-dialog")
export class ScadaDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property() heading = "";
  @property() width: "small" | "medium" | "large" = "medium";

  @state() private _useHa = haDialogUsable();
  @query("dialog") private _native?: HTMLDialogElement;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: contents;
      }
      ha-dialog {
        --dialog-content-padding: 0 24px 16px;
      }
      .footer {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 8px;
        width: 100%;
      }
      dialog {
        width: min(var(--scada-dialog-width, 560px), calc(100vw - 32px));
        max-height: calc(100vh - 32px);
        padding: 0;
        border: none;
        border-radius: var(--ha-dialog-border-radius, 24px);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      }
      dialog[open] {
        display: flex;
        flex-direction: column;
      }
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.45);
      }
      dialog.small {
        --scada-dialog-width: 400px;
      }
      dialog.large {
        --scada-dialog-width: 720px;
      }
      .native-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 12px 8px 24px;
      }
      .native-head h2 {
        flex: 1;
        margin: 0;
        font-size: 1.25em;
        font-weight: 400;
        line-height: 1.4;
      }
      .native-body {
        flex: 1;
        overflow-y: auto;
        padding: 0 24px 16px;
      }
      .native-foot {
        padding: 12px 24px 20px;
      }
      @media (max-width: 600px) {
        dialog {
          width: 100vw;
          max-width: 100vw;
          max-height: 100vh;
          height: 100%;
          border-radius: 0;
        }
      }
    `,
  ];

  willUpdate(changed: PropertyValues) {
    // Decide renderer when opening; keep it stable while the dialog is up.
    if (changed.has("open") && this.open) {
      this._useHa = haDialogUsable();
      if (!this._useHa) {
        // Try to get HA's dialog registered for next time.
        ensureHaComponents().then(() => {
          if (!this.open) this._useHa = haDialogUsable();
        });
      }
    }
  }

  updated() {
    const dlg = this._native;
    if (!dlg) return;
    if (this.open && !dlg.open) dlg.showModal();
    else if (!this.open && dlg.open) dlg.close();
  }

  private _fireClosed() {
    this.dispatchEvent(new CustomEvent("dialog-closed"));
  }

  private _onHaClosed(e: Event) {
    // Ignore "closed" events bubbling up from content (e.g. select menus).
    if (e.target !== e.currentTarget) return;
    e.stopPropagation();
    this._fireClosed();
  }

  private _onNativeClose(e: Event) {
    e.stopPropagation();
    this._fireClosed();
  }

  private _onNativeClick(e: MouseEvent) {
    // A click on the dialog element itself (outside the content box) is a scrim click.
    if (e.target === this._native) {
      const r = this._native.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) this._native.close();
    }
  }

  render() {
    if (this._useHa) {
      return html`
        <ha-dialog
          .open=${this.open}
          header-title=${this.heading}
          width=${this.width}
          @closed=${this._onHaClosed}
        >
          <slot></slot>
          <div slot="footer" class="footer"><slot name="footer"></slot></div>
        </ha-dialog>
      `;
    }
    return html`
      <dialog
        class=${this.width}
        aria-labelledby="title"
        @close=${this._onNativeClose}
        @click=${this._onNativeClick}
      >
        <div class="native-head">
          <h2 id="title">${this.heading}</h2>
          <button class="icon-btn" aria-label="Close" @click=${() => this._native?.close()}>
            <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
          </button>
        </div>
        <div class="native-body"><slot></slot></div>
        <div class="native-foot footer"><slot name="footer"></slot></div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "scada-dialog": ScadaDialog;
    "ha-dialog": HTMLElement;
  }
}
