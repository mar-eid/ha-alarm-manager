import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles/shared-styles";
import { errorMessage, notify } from "../utils/format";
import { renderLoading } from "../utils/render";
import { ensureHaComponents, whenDefined } from "../utils/ha-load";
import {
  channelToForm,
  emptyChannelForm,
  formToPayload,
  normalizeTargets,
  type ChannelFormData,
} from "../utils/channel-form";
import "../components/scada-dialog";
import { fetchChannels, createChannel, updateChannel, deleteChannel } from "../data/websocket";
import {
  PRIORITY_LABELS,
  type AlarmChannel,
  type AlarmPriority,
  type HomeAssistant,
  type NotificationTargetEntry,
} from "../types";
import "../components/notify-target-picker";
import { type NotifyTarget } from "../components/notify-target-picker";
import { mdiBellOutline } from "@mdi/js";

const LABELS: Record<string, string> = {
  name: "Channel name",
  min_priority: "Minimum priority",
  persistent_notification: "Persistent notifications",
  mobile_push: "Mobile push",
  critical_notification: "Critical alerts",
};

const HELPERS: Record<string, string> = {
  min_priority: "Only alarms at or above this priority will use this channel.",
  persistent_notification: "Show the alarm in Home Assistant's notifications panel.",
  mobile_push: "Send a push notification to mobile devices via the Companion app.",
  critical_notification: "Critical alerts bypass Do Not Disturb on iOS and Android.",
};

const PRIORITY_OPTIONS = [0, 1, 2, 3].map((p) => ({ value: String(p), label: PRIORITY_LABELS[p as AlarmPriority] }));

const GENERAL_SCHEMA = [
  {
    name: "",
    type: "grid",
    schema: [
      { name: "name", required: true, selector: { text: {} } },
      { name: "min_priority", required: true, selector: { select: { mode: "dropdown", options: PRIORITY_OPTIONS } } },
    ],
  },
];

const DELIVERY_SCHEMA = [
  {
    name: "",
    type: "grid",
    schema: [
      { name: "persistent_notification", selector: { boolean: {} } },
      { name: "mobile_push", selector: { boolean: {} } },
      { name: "critical_notification", selector: { boolean: {} } },
    ],
  },
];

@customElement("channels-view")
export class ChannelsView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;

  private get _notifyTargets(): NotifyTarget[] {
    if (!this.hass?.services?.notify) return [];
    return Object.keys(this.hass.services.notify)
      .filter((s) => s !== "send_message" && s !== "persistent_notification")
      .map((s) => ({
        id: `notify.${s}`,
        label: s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        path: mdiBellOutline,
      }));
  }
  @state() private _channels: AlarmChannel[] = [];
  @state() private _loading = true;
  @state() private _formAvailable = true;
  @state() private _editing: AlarmChannel | null = null;
  @state() private _data: ChannelFormData = emptyChannelForm();
  /** Edited by notify-target-picker, not ha-form (per-target priority has no selector). */
  @state() private _targets: NotificationTargetEntry[] = [];
  @state() private _saving = false;
  @state() private _error = "";

  @state() private _deleteTarget?: AlarmChannel;

  // Column filter
  @state() private _filterName = "";

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; }
      .editor { max-width: 840px; margin: 0 auto; }
      h2 { margin: 0 0 16px; font-size: 1.5em; font-weight: 400; }
      .error {
        margin-bottom: 16px;
        padding: 12px 16px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--error-color, #db4437) 12%, transparent);
        color: color-mix(in srgb, var(--error-color, #db4437) 75%, var(--primary-text-color, #212121));
      }
      .footer { display: flex; justify-content: flex-end; gap: 8px; padding: 8px 0 24px; }
      .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      td.row-actions { white-space: nowrap; }
      .confirm-text { margin: 0; line-height: 1.5; }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._loadChannels();
    // Not awaited by the table: the channel list still shows if ha-form never registers.
    ensureHaComponents()
      .then(() => whenDefined("ha-form", 3000))
      .then((ok) => (this._formAvailable = ok));
  }

  private async _loadChannels() {
    if (!this.hass) return;
    try {
      this._channels = await fetchChannels(this.hass);
    } finally {
      this._loading = false;
    }
  }

  private _startCreate() {
    this._editing = {} as AlarmChannel;
    this._data = emptyChannelForm();
    this._targets = [];
    this._error = "";
  }

  private _startEdit(channel: AlarmChannel) {
    this._editing = channel;
    this._data = channelToForm(channel);
    this._targets = normalizeTargets(channel.notification_targets);
    this._error = "";
  }

  private _cancel() {
    this._editing = null;
    this._error = "";
  }

  private _onFormChange(e: CustomEvent) {
    e.stopPropagation();
    this._data = { ...this._data, ...(e.detail.value as Partial<ChannelFormData>) };
  }

  private _computeLabel = (s: { name: string }) => LABELS[s.name] ?? s.name;
  private _computeHelper = (s: { name: string }) => HELPERS[s.name] ?? "";

  private async _save() {
    if (!this.hass) return;
    if (!this._data.name.trim()) {
      this._error = "Enter a channel name.";
      return;
    }
    this._error = "";
    const data = formToPayload(this._data, this._targets);
    this._saving = true;
    try {
      if (this._editing?.id) {
        await updateChannel(this.hass, this._editing.id, { ...data });
      } else {
        await createChannel(this.hass, { ...data });
      }
    } catch (err) {
      this._error = `Saving channel failed: ${errorMessage(err)}`;
      notify(this, this._error);
      return;
    } finally {
      this._saving = false;
    }
    this._editing = null;
    this._loadChannels();
  }

  private async _doDelete() {
    if (!this.hass || !this._deleteTarget) return;
    const { id, name } = this._deleteTarget;
    this._deleteTarget = undefined;
    try {
      await deleteChannel(this.hass, id);
      notify(this, `Deleted channel: ${name}`);
    } catch (err) {
      notify(this, `Deleting channel failed: ${errorMessage(err)}`);
    }
    this._loadChannels();
  }

  render() {
    if (this._loading) return renderLoading();
    if (this._editing !== null) return this._renderForm();

    return html`
      <div class="toolbar">
        <span>${this._channels.length} channel${this._channels.length !== 1 ? "s" : ""}</span>
        <button class="btn btn-primary" @click=${this._startCreate}>+ New channel</button>
      </div>
      <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Targets</th>
            <th>Min Priority</th>
            <th>Persistent</th>
            <th>Mobile</th>
            <th>Critical</th>
            <th>Actions</th>
          </tr>
          <tr class="filter-row">
            <th><input type="text" placeholder="Filter..." aria-label="Filter by name" .value=${this._filterName} @input=${(e: Event) => this._filterName = (e.target as HTMLInputElement).value} /></th>
            <th></th><th></th><th></th><th></th><th></th><th></th>
          </tr>
        </thead>
        <tbody>
          ${this._channels.filter((ch) => !this._filterName || ch.name.toLowerCase().includes(this._filterName.toLowerCase())).map(
            (ch) => html`
              <tr>
                <td><strong>${ch.name}</strong></td>
                <td>${ch.notification_targets.length === 0 ? "-" : normalizeTargets(ch.notification_targets).map((t) => t.target).join(", ")}</td>
                <td>${PRIORITY_LABELS[ch.min_priority] ?? "Info"}</td>
                <td>${ch.persistent_notification ? "Yes" : "No"}</td>
                <td>${ch.mobile_push ? "Yes" : "No"}</td>
                <td>${ch.critical_notification ? "Yes" : "No"}</td>
                <td class="row-actions">
                  <button class="btn btn-small btn-plain" @click=${() => this._startEdit(ch)}>Edit</button>
                  <button class="btn btn-small btn-plain danger" @click=${() => (this._deleteTarget = ch)}>Delete</button>
                </td>
              </tr>
            `
          )}
        </tbody>
      </table>
      </div>

      <scada-dialog
        .open=${!!this._deleteTarget}
        heading="Delete channel?"
        width="small"
        @dialog-closed=${() => (this._deleteTarget = undefined)}
      >
        <p class="confirm-text">
          Delete the channel <strong>${this._deleteTarget?.name ?? ""}</strong>? Alarms using it will no longer send
          notifications until you assign another channel.
        </p>
        <button slot="footer" class="btn btn-plain" @click=${() => (this._deleteTarget = undefined)}>Cancel</button>
        <button slot="footer" class="btn btn-danger" @click=${this._doDelete}>Delete</button>
      </scada-dialog>
    `;
  }

  private _section(title: string, sub: string | undefined, body: unknown) {
    return html`
      <section class="form-section">
        <div class="form-section-header">${title}${sub ? html`<span class="sub">${sub}</span>` : nothing}</div>
        <div class="form-section-body">${body}</div>
      </section>
    `;
  }

  private _haForm(schema: unknown[]) {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._data}
        .schema=${schema}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onFormChange}
      ></ha-form>
    `;
  }

  private _renderForm() {
    const isEdit = !!this._editing?.id;
    if (!this._formAvailable) {
      return html`
        <div class="editor">
          <div class="error">
            Home Assistant's form components could not be loaded. Reload the page (Ctrl+Shift+R) and try again.
          </div>
          <div class="footer">
            <button class="btn btn-plain" @click=${this._cancel}>Back</button>
          </div>
        </div>
      `;
    }

    return html`
      <div class="editor">
        <h2>${isEdit ? "Edit channel" : "New channel"}</h2>
        ${this._error ? html`<div class="error" role="alert">${this._error}</div>` : nothing}

        ${this._section("General", undefined, this._haForm(GENERAL_SCHEMA))}
        ${this._section(
          "Notification targets",
          "Notify services that receive alerts. Each target can set its own minimum priority to filter low-severity alarms.",
          html`
            <notify-target-picker
              .value=${this._targets}
              .targets=${this._notifyTargets}
              @value-changed=${(e: CustomEvent) => (this._targets = e.detail.value)}
            ></notify-target-picker>
          `
        )}
        ${this._section("Delivery", "How alarms on this channel reach people.", this._haForm(DELIVERY_SCHEMA))}

        <div class="footer">
          <button class="btn btn-plain" @click=${this._cancel}>Cancel</button>
          <button class="btn btn-primary" ?disabled=${this._saving} @click=${this._save}>
            ${this._saving ? "Saving…" : isEdit ? "Save" : "Create"}
          </button>
        </div>
      </div>
    `;
  }
}
