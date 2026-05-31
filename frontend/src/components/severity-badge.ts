import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  mdiInformation,
  mdiAlert,
  mdiAlertOctagon,
  mdiAlertDecagram,
} from "@mdi/js";
import { getPriorityColor } from "../styles/shared-styles";
import { PRIORITY_LABELS, type AlarmPriority } from "../types";

const PRIORITY_ICON: Record<AlarmPriority, string> = {
  0: mdiInformation,
  1: mdiAlert,
  2: mdiAlertOctagon,
  3: mdiAlertDecagram,
};

@customElement("severity-badge")
export class SeverityBadge extends LitElement {
  @property({ type: Number }) priority: AlarmPriority = 0;

  static styles = css`
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      --mdc-icon-size: 18px;
    }
  `;

  render() {
    const color = getPriorityColor(this.priority);
    const label = PRIORITY_LABELS[this.priority] ?? "Unknown";
    return html`
      <span
        class="badge"
        style="background: color-mix(in srgb, ${color} 18%, transparent); color: ${color}"
        title=${label}
      >
        <ha-svg-icon .path=${PRIORITY_ICON[this.priority]}></ha-svg-icon>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-svg-icon": any;
  }
}
