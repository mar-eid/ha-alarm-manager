import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getPriorityColor } from "../styles/shared-styles";
import { PRIORITY_LABELS, type AlarmPriority } from "../types";

@customElement("severity-badge")
export class SeverityBadge extends LitElement {
  @property({ type: Number }) priority: AlarmPriority = 0;

  static styles = css`
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75em;
      font-weight: 600;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `;

  render() {
    const color = getPriorityColor(this.priority);
    const label = PRIORITY_LABELS[this.priority] ?? "Unknown";
    return html`
      <span class="badge" style="background-color: ${color}">${label}</span>
    `;
  }
}
