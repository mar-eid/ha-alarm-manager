/**
 * Notification-target multi-select — removable chips + an "Add target" dropdown.
 * A self-contained alternative to <ha-selector>; emits `value-changed` ({ value: string[] })
 * to match HA picker conventions.
 *
 * Place at: frontend/src/components/notify-target-picker.ts
 *
 * Use in channels-view.ts (form state `_formTargets: string[]`):
 *   <notify-target-picker
 *     .value=${this._formTargets}
 *     @value-changed=${(e: CustomEvent) => (this._formTargets = e.detail.value)}>
 *   </notify-target-picker>
 *
 * ── Idiomatic alternative (no custom component) ───────────────────────────────
 * HA ships <ha-selector>. For a multi-select of notify services you can instead do:
 *   <ha-selector
 *     .hass=${this.hass}
 *     .selector=${{ select: { multiple: true, custom_value: true, options: NOTIFY_OPTIONS } }}
 *     .value=${this._formTargets}
 *     @value-changed=${(e) => (this._formTargets = e.detail.value)}>
 *   </ha-selector>
 * …where NOTIFY_OPTIONS = [{ value: "notify.mobile_app_x", label: "Marius — phone" }, …].
 * Use this picker when you want the chip styling shown in the prototype.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  mdiPlus,
  mdiClose,
  mdiCellphone,
  mdiShieldAccount,
  mdiAccountGroup,
  mdiAccountHardHat,
  mdiBell,
  mdiSend,
  mdiEmail,
  mdiBullhorn,
  mdiBellOutline,
} from "@mdi/js";
import { sharedStyles } from "../styles/shared-styles";

export interface NotifyTarget {
  id: string;
  label: string;
  path: string; // mdi svg path
}

// Default catalogue — replace at runtime with the user's notify.* services if you have them.
export const DEFAULT_NOTIFY_TARGETS: NotifyTarget[] = [
  { id: "notify.mobile_app_marius", label: "Marius — phone", path: mdiCellphone },
  { id: "notify.mobile_app_anna", label: "Anna — phone", path: mdiCellphone },
  { id: "notify.mobile_app_security", label: "Security — phone", path: mdiShieldAccount },
  { id: "notify.facilities_team", label: "Facilities team", path: mdiAccountGroup },
  { id: "notify.it_oncall", label: "IT on-call", path: mdiAccountHardHat },
  { id: "notify.persistent", label: "Persistent notification", path: mdiBell },
  { id: "notify.telegram_ops", label: "Telegram — Ops", path: mdiSend },
  { id: "notify.email_admin", label: "Email — admin", path: mdiEmail },
  { id: "notify.alexa_everywhere", label: "Alexa — announce", path: mdiBullhorn },
];

export interface TargetEntry {
  target: string;
  min_priority: number;
}

@customElement("notify-target-picker")
export class NotifyTargetPicker extends LitElement {
  @property({ attribute: false }) value: TargetEntry[] = [];
  @property({ attribute: false }) targets: NotifyTarget[] = DEFAULT_NOTIFY_TARGETS;
  @state() private _open = false;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        position: relative;
      }
      .box {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
        min-height: 40px;
        padding: 6px 8px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
      }
      .empty {
        font-size: 13.5px;
        color: var(--secondary-text-color, #727272);
        padding: 0 4px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 6px 5px 10px;
        border-radius: 9999px;
        font-size: 12.5px;
        font-weight: 500;
        background: color-mix(in srgb, var(--primary-color, #009ac7) 12%, transparent);
        color: var(--primary-color, #009ac7);
        --mdc-icon-size: 14px;
      }
      .chip .x {
        display: inline-flex;
        cursor: pointer;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        align-items: center;
        justify-content: center;
        --mdc-icon-size: 13px;
      }
      .chip .x:hover {
        background: color-mix(in srgb, var(--primary-color, #009ac7) 22%, transparent);
      }
      .add {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 10px;
        border-radius: 9999px;
        border: 1px dashed var(--divider-color, #e0e0e0);
        background: transparent;
        cursor: pointer;
        font: inherit;
        font-size: 12.5px;
        font-weight: 500;
        color: var(--secondary-text-color, #727272);
        --mdc-icon-size: 14px;
      }
      .add:disabled {
        cursor: not-allowed;
        color: var(--disabled-text-color, #bdbdbd);
      }
      .menu {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        z-index: 50;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        overflow: hidden auto;
        max-height: 260px;
      }
      .opt {
        padding: 9px 12px;
        cursor: pointer;
        font-size: 13.5px;
        display: flex;
        align-items: center;
        gap: 10px;
        --mdc-icon-size: 17px;
        color: var(--secondary-text-color, #727272);
      }
      .opt:hover {
        background: rgba(127, 127, 127, 0.08);
      }
      .opt .lbl {
        flex: 1;
        color: var(--primary-text-color, #212121);
      }
      .opt .id {
        font-size: 11.5px;
        font-family: var(--ha-font-family-code, monospace);
        color: var(--secondary-text-color, #727272);
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._onDoc = this._onDoc.bind(this);
    document.addEventListener("mousedown", this._onDoc);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("mousedown", this._onDoc);
  }
  private _onDoc(e: MouseEvent) {
    if (!e.composedPath().includes(this)) this._open = false;
  }

  private _meta(id: string): NotifyTarget {
    return this.targets.find((t) => t.id === id) ?? { id, label: id, path: mdiBellOutline };
  }

  private _emit(value: TargetEntry[]) {
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
  }

  private _add(id: string) {
    this._emit([...this.value, { target: id, min_priority: 0 }]);
  }
  private _remove(id: string) {
    this._emit(this.value.filter((v) => v.target !== id));
  }
  private _setPriority(id: string, priority: number) {
    this._emit(this.value.map((v) => v.target === id ? { ...v, min_priority: priority } : v));
  }

  render() {
    const ids = this.value.map((v) => v.target);
    const remaining = this.targets.filter((t) => !ids.includes(t.id));
    const priLabels: Record<number, string> = { 0: "All", 1: "Warn+", 2: "High+", 3: "Crit" };
    return html`
      <div class="box">
        ${this.value.length === 0
          ? html`<span class="empty">No targets — alarms log to history only</span>`
          : nothing}
        ${this.value.map((entry) => {
          const m = this._meta(entry.target);
          return html`
            <span class="chip">
              <ha-svg-icon .path=${m.path}></ha-svg-icon>
              ${m.label}
              <select style="border:none;background:transparent;font:inherit;font-size:11px;color:inherit;padding:0 2px;cursor:pointer"
                title="Minimum priority to notify this target"
                .value=${String(entry.min_priority)}
                @change=${(e: Event) => { e.stopPropagation(); this._setPriority(entry.target, parseInt((e.target as HTMLSelectElement).value)); }}
                @click=${(e: Event) => e.stopPropagation()}>
                ${[0, 1, 2, 3].map((p) => html`<option value=${p}>${priLabels[p]}</option>`)}
              </select>
              <span class="x" title="Remove" @click=${() => this._remove(entry.target)}>
                <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
              </span>
            </span>
          `;
        })}
        <button class="add" ?disabled=${remaining.length === 0} @click=${() => (this._open = !this._open)}>
          <ha-svg-icon .path=${mdiPlus}></ha-svg-icon>Add target
        </button>
      </div>
      ${this._open && remaining.length > 0
        ? html`
            <div class="menu">
              ${remaining.map(
                (t) => html`
                  <div
                    class="opt"
                    @click=${() => {
                      this._add(t.id);
                      if (remaining.length === 1) this._open = false;
                    }}
                  >
                    <ha-svg-icon .path=${t.path}></ha-svg-icon>
                    <span class="lbl">${t.label}</span>
                    <span class="id">${t.id}</span>
                  </div>
                `
              )}
            </div>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "notify-target-picker": NotifyTargetPicker;
    "ha-svg-icon": any;
  }
}
