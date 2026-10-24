/**
 * Noise view (F21) — "bad actor" lists for cleaning up alarm noise
 * (ISA-18.2 / EEMUA 191 style). Data comes from scada_alarm_manager/noise_report.
 */

import { LitElement, html, css, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles/shared-styles";
import { fetchNoiseReport } from "../data/websocket";
import "../components/severity-badge";
import {
  STATE_LABELS,
  type HomeAssistant,
  type NoiseAlarmInfo,
  type NoiseReport,
} from "../types";

const PERIODS: { hours: number; label: string }[] = [
  { hours: 24, label: "24 h" },
  { hours: 168, label: "7 days" },
  { hours: 720, label: "30 days" },
];

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} h ${minutes % 60} min`;
  return `${Math.floor(hours / 24)} d ${hours % 24} h`;
};

const sinceNow = (iso: string | null): string =>
  iso ? formatDuration((Date.now() - new Date(iso).getTime()) / 1000) : "unknown";

const isAnalog = (row: NoiseAlarmInfo) => row.trigger_type === "analog";

@customElement("noise-view")
export class NoiseView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _hours = 168;
  @state() private _report?: NoiseReport;
  @state() private _loading = true;
  @state() private _error = "";

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; }
      .toolbar {
        display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;
      }
      .toolbar .label { color: var(--secondary-text-color, #727272); font-size: 0.9em; margin-right: 4px; }
      .chip {
        border: 1px solid var(--divider-color, #e0e0e0);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        border-radius: 9999px; padding: 4px 14px; cursor: pointer; font: inherit; font-size: 0.85em;
      }
      .chip.active {
        background: var(--primary-color, #03a9f4); border-color: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
      }
      .kpis {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px; margin-bottom: 24px;
      }
      .kpi {
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 12px 14px;
      }
      .kpi .value { font-size: 1.6em; font-weight: 500; color: var(--primary-text-color, #212121); }
      .kpi .name { font-size: 0.8em; color: var(--secondary-text-color, #727272); margin-top: 2px; }
      .kpi.warn .value { color: var(--warning-color, #ff9800); }
      section {
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: var(--ha-card-border-radius, 12px);
        margin-bottom: 20px;
        overflow: hidden;
      }
      section h3 { margin: 0; padding: 14px 16px 2px; font-size: 1.05em; font-weight: 500; }
      section .desc { padding: 0 16px 10px; font-size: 0.85em; color: var(--secondary-text-color, #727272); }
      .scroll { overflow-x: auto; }
      .none { padding: 12px 16px 16px; color: var(--secondary-text-color, #727272); font-size: 0.9em; }
      .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
      .sub { font-size: 0.8em; color: var(--secondary-text-color, #727272); }
      .advice { font-size: 0.85em; color: var(--secondary-text-color, #727272); min-width: 180px; }
      .stale { color: var(--error-color, #f44336); font-weight: 600; }
      .bar {
        height: 6px; border-radius: 3px; background: var(--primary-color, #03a9f4); margin-top: 4px; opacity: 0.6;
      }
      .deleted { font-style: italic; color: var(--secondary-text-color, #727272); }
      .footnote { font-size: 0.8em; color: var(--secondary-text-color, #727272); margin-top: 8px; }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  private async _load() {
    if (!this.hass) return;
    this._loading = true;
    this._error = "";
    try {
      this._report = await fetchNoiseReport(this.hass, this._hours);
    } catch (e: any) {
      this._error = e?.message ?? String(e);
    } finally {
      this._loading = false;
    }
  }

  private _setPeriod(hours: number) {
    if (hours === this._hours) return;
    this._hours = hours;
    this._load();
  }

  private _edit(alarmId: string) {
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { view: "create-edit", alarmId },
        bubbles: true,
        composed: true,
      })
    );
  }

  // --- Shared cells ---

  private _nameCell(row: NoiseAlarmInfo) {
    if (row.deleted) return html`<td class="deleted">${row.name}</td>`;
    return html`<td>
      <strong>${row.name}</strong>
      ${row.area || row.source_entity_id
        ? html`<div class="sub">${[row.area, row.source_entity_id].filter(Boolean).join(" · ")}</div>`
        : nothing}
    </td>`;
  }

  private _priorityCell(row: NoiseAlarmInfo) {
    return html`<td>
      ${row.priority !== undefined
        ? html`<severity-badge .priority=${row.priority}></severity-badge>`
        : nothing}
    </td>`;
  }

  private _editCell(row: NoiseAlarmInfo) {
    return html`<td>
      ${row.deleted
        ? nothing
        : html`<button class="btn btn-small btn-primary" @click=${() => this._edit(row.alarm_id)}>
            Edit
          </button>`}
    </td>`;
  }

  // --- Suggested actions ---

  private _adviceFrequent(row: NoiseAlarmInfo): string {
    if (row.deleted) return "";
    if (isAnalog(row) && !row.hysteresis) return "Add hysteresis, or move the threshold away from normal operation.";
    if (!row.trigger_delay) return "Add a trigger delay so short spikes do not alarm.";
    return "Check the threshold, and whether someone actually needs to act on this alarm.";
  }

  private _adviceChatter(row: NoiseAlarmInfo): string {
    if (row.deleted) return "";
    if (isAnalog(row) && !row.hysteresis) return "Add hysteresis (deadband).";
    if (!row.clear_delay) return "Add a clear delay so it does not re-trigger right after clearing.";
    return "Increase the hysteresis or the clear delay.";
  }

  private _adviceFleeting(row: NoiseAlarmInfo, seconds: number): string {
    if (row.deleted) return "";
    if (!row.trigger_delay) return `Add a trigger delay of at least ${seconds} s.`;
    return "Increase the trigger delay.";
  }

  // --- Sections ---

  private _section(
    title: string,
    desc: string,
    headers: string[],
    rows: unknown[],
    renderRow: (row: any) => TemplateResult,
    emptyText: string
  ) {
    return html`
      <section>
        <h3>${title}</h3>
        <div class="desc">${desc}</div>
        ${rows.length === 0
          ? html`<div class="none">${emptyText}</div>`
          : html`<div class="scroll">
              <table>
                <thead>
                  <tr>${headers.map((h) => html`<th class=${h.startsWith("#") ? "num" : ""}>${h.replace(/^#/, "")}</th>`)}</tr>
                </thead>
                <tbody>${rows.map(renderRow)}</tbody>
              </table>
            </div>`}
      </section>
    `;
  }

  private _renderKpis(r: NoiseReport) {
    const k = r.kpis;
    const tiles: { value: string; name: string; warn?: boolean }[] = [
      { value: String(k.activations), name: "Activations in period" },
      { value: String(k.per_day), name: "Average per day" },
      { value: `${k.top_share} %`, name: `Share from top ${r.thresholds.top_count}`, warn: k.top_share >= 50 && k.activations > 0 },
      { value: String(k.standing), name: `Standing (${k.stale} stale)`, warn: k.stale > 0 },
      { value: String(k.chattering), name: "Chattering alarms", warn: k.chattering > 0 },
      { value: String(k.fleeting), name: "Fleeting alarms", warn: k.fleeting > 0 },
      { value: String(k.hidden), name: "Shelved / disabled" },
    ];
    return html`<div class="kpis">
      ${tiles.map(
        (t) => html`<div class="kpi ${t.warn ? "warn" : ""}">
          <div class="value">${t.value}</div>
          <div class="name">${t.name}</div>
        </div>`
      )}
    </div>`;
  }

  render() {
    const toolbar = html`<div class="toolbar">
      <span class="label">Period:</span>
      ${PERIODS.map(
        (p) => html`<button class="chip ${p.hours === this._hours ? "active" : ""}" @click=${() => this._setPeriod(p.hours)}>
          ${p.label}
        </button>`
      )}
    </div>`;

    if (this._loading && !this._report) return html`${toolbar}<div class="empty-state">Loading...</div>`;
    if (this._error) return html`${toolbar}<div class="empty-state">Could not load the noise report: ${this._error}</div>`;
    const r = this._report;
    if (!r) return toolbar;
    const t = r.thresholds;
    const maxCount = r.top[0]?.count ?? 1;

    return html`
      ${toolbar}
      ${this._renderKpis(r)}

      ${this._section(
        `Top ${t.top_count} most frequent`,
        "Alarms that activated most often in the period. Usually a handful of alarms cause most of the noise, so start here.",
        ["Alarm", "Priority", "#Activations", "#Share", "#Suppressed", "Suggested action", ""],
        r.top,
        (row: NoiseReport["top"][number]) => html`<tr>
          ${this._nameCell(row)}
          ${this._priorityCell(row)}
          <td class="num">${row.count}<div class="bar" style=${`width:${Math.max(4, (row.count / maxCount) * 100)}%`}></div></td>
          <td class="num">${row.share} %</td>
          <td class="num">${row.suppressed || "–"}</td>
          <td class="advice">${this._adviceFrequent(row)}</td>
          ${this._editCell(row)}
        </tr>`,
        "No alarm activations in this period."
      )}

      ${this._section(
        "Standing alarms",
        `Alarms that are active right now, longest first. Active for more than ${t.stale_hours} h counts as stale: nobody is acting on it.`,
        ["Alarm", "Priority", "State", "#Active for", "Suggested action", ""],
        r.standing,
        (row: NoiseReport["standing"][number]) => html`<tr>
          ${this._nameCell(row)}
          ${this._priorityCell(row)}
          <td>${STATE_LABELS[row.state] ?? row.state}</td>
          <td class="num ${row.stale ? "stale" : ""}">${formatDuration(row.duration)}</td>
          <td class="advice">${row.stale ? "Fix the cause, change the limit, or make it a status instead of an alarm." : ""}</td>
          ${this._editCell(row)}
        </tr>`,
        "No active alarms right now."
      )}

      ${this._section(
        "Chattering alarms",
        `${t.chatter_count} or more activations within ${t.chatter_window} s. The value is probably hovering around the threshold.`,
        ["Alarm", "Priority", "#Bursts", "#Largest burst", "#Activations", "Suggested action", ""],
        r.chattering,
        (row: NoiseReport["chattering"][number]) => html`<tr>
          ${this._nameCell(row)}
          ${this._priorityCell(row)}
          <td class="num">${row.bursts}</td>
          <td class="num">${row.max_burst}</td>
          <td class="num">${row.count}</td>
          <td class="advice">${this._adviceChatter(row)}</td>
          ${this._editCell(row)}
        </tr>`,
        "No chattering alarms in this period."
      )}

      ${this._section(
        "Fleeting alarms",
        `Activations that ended within ${t.fleeting_seconds} s, before anyone could react.`,
        ["Alarm", "Priority", "#Fleeting", "#Of activations", "#Shortest", "Suggested action", ""],
        r.fleeting,
        (row: NoiseReport["fleeting"][number]) => html`<tr>
          ${this._nameCell(row)}
          ${this._priorityCell(row)}
          <td class="num">${row.fleeting}</td>
          <td class="num">${row.activations}</td>
          <td class="num">${row.shortest} s</td>
          <td class="advice">${this._adviceFleeting(row, t.fleeting_seconds)}</td>
          ${this._editCell(row)}
        </tr>`,
        "No fleeting alarms in this period."
      )}

      ${this._section(
        "Shelved and disabled",
        "Alarms that are hidden right now. A hidden alarm can hide a real problem, so check these regularly.",
        ["Alarm", "Priority", "Status", "#Hidden for", "Suggested action", ""],
        r.hidden,
        (row: NoiseReport["hidden"][number]) => html`<tr>
          ${this._nameCell(row)}
          ${this._priorityCell(row)}
          <td>
            ${row.kind === "shelved" ? "Shelved" : "Disabled"}
            ${row.until ? html`<div class="sub">until ${new Date(row.until).toLocaleString()}</div>` : nothing}
          </td>
          <td class="num">${sinceNow(row.since)}</td>
          <td class="advice">
            ${row.kind === "shelved"
              ? "Check that the reason for shelving still applies."
              : "Delete it if it is no longer needed, or fix it and turn it back on."}
          </td>
          ${this._editCell(row)}
        </tr>`,
        "No shelved or disabled alarms."
      )}

      <div class="footnote">
        Period: ${new Date(r.start).toLocaleString()} – ${new Date(r.end).toLocaleString()}.
        Suppressed activations (a stricter alarm on the same sensor was active) are not counted as noise.
        Thresholds follow ISA-18.2 / EEMUA 191 defaults.
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "noise-view": NoiseView;
  }
}
