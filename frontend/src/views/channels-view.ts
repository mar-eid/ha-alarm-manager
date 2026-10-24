import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles/shared-styles";
import { errorMessage, notify } from "../utils/format";
import { renderLoading } from "../utils/render";
import "../components/scada-dialog";
import { fetchChannels, createChannel, updateChannel, deleteChannel } from "../data/websocket";
import { PRIORITY_LABELS, type HomeAssistant, type AlarmChannel, type AlarmPriority } from "../types";
import "../components/notify-target-picker";
import { type NotifyTarget } from "../components/notify-target-picker";
import { mdiBellOutline } from "@mdi/js";

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
  @state() private _editing: AlarmChannel | null = null;
  @state() private _formName = "";
  @state() private _formTargets: Array<{target: string; min_priority: number}> = [];
  @state() private _formMinPriority: AlarmPriority = 0;
  @state() private _formPersistent = true;
  @state() private _formMobile = true;
  @state() private _formCritical = false;

  @state() private _deleteTarget?: AlarmChannel;

  // Column filter
  @state() private _filterName = "";

  static styles = [
    sharedStyles,
    css`
      :host { display: block; padding: 16px; }
      .form-card {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px; padding: 16px; margin-bottom: 16px;
      }
      .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
      .form-row > * { flex: 1; min-width: 200px; }
      .checkbox-group { display: flex; gap: 16px; align-items: center; margin: 8px 0; }
      .checkbox-group label { display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 0.9em; }
      .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      td.row-actions { white-space: nowrap; }
      .confirm-text { margin: 0; line-height: 1.5; }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._loadChannels();
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
    this._formName = "";
    this._formTargets = [] as Array<{target: string; min_priority: number}>;
    this._formMinPriority = 0;
    this._formPersistent = true;
    this._formMobile = true;
    this._formCritical = false;
  }

  private _startEdit(channel: AlarmChannel) {
    this._editing = channel;
    this._formName = channel.name;
    this._formTargets = channel.notification_targets.map((t: any) =>
      typeof t === "string" ? { target: t, min_priority: 0 } : { target: t.target, min_priority: t.min_priority ?? 0 }
    );
    this._formMinPriority = channel.min_priority;
    this._formPersistent = channel.persistent_notification;
    this._formMobile = channel.mobile_push;
    this._formCritical = channel.critical_notification;
  }

  private async _save() {
    if (!this.hass || !this._formName.trim()) return;
    const data = {
      name: this._formName.trim(),
      notification_targets: this._formTargets,
      min_priority: this._formMinPriority,
      persistent_notification: this._formPersistent,
      mobile_push: this._formMobile,
      critical_notification: this._formCritical,
    };

    try {
      if (this._editing?.id) {
        await updateChannel(this.hass, this._editing.id, data);
      } else {
        await createChannel(this.hass, data);
      }
    } catch (err) {
      notify(this, `Saving channel failed: ${errorMessage(err)}`);
      return;
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

    return html`
      ${this._editing !== null ? this._renderForm() : ""}
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
                <td>${ch.notification_targets.length === 0 ? "-" : ch.notification_targets.map((t: any) => typeof t === "string" ? t : t.target).join(", ")}</td>
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

  private _renderForm() {
    return html`
      <div class="form-card">
        <h3>${this._editing?.id ? "Edit Channel" : "New Channel"}</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Name</label>
            <input type="text" .value=${this._formName} @input=${(e: Event) => (this._formName = (e.target as HTMLInputElement).value)} />
          </div>
        </div>
        <div class="form-group">
          <label>Notification Targets</label>
          <notify-target-picker
            .value=${this._formTargets}
            .targets=${this._notifyTargets}
            @value-changed=${(e: CustomEvent) => (this._formTargets = e.detail.value)}
          ></notify-target-picker>
          <div class="hint">Select which notify services receive alerts. Each target can set a minimum priority to filter low-severity alarms.</div>
        </div>
        <div class="form-group">
          <label>Minimum Priority</label>
          <select title="Only alarms at this priority or higher will use this channel" .value=${String(this._formMinPriority)} @change=${(e: Event) => (this._formMinPriority = Number((e.target as HTMLSelectElement).value) as AlarmPriority)}>
            <option value="0">Info</option>
            <option value="1">Warning</option>
            <option value="2">High</option>
            <option value="3">Critical</option>
          </select>
          <div class="hint">Only alarms at or above this priority will use this channel.</div>
        </div>
        <div class="checkbox-group">
          <label title="Show alarm in HA UI persistent notifications panel"><input type="checkbox" .checked=${this._formPersistent} @change=${(e: Event) => (this._formPersistent = (e.target as HTMLInputElement).checked)} /> Persistent Notifications</label>
          <label title="Send push notification to mobile devices via Companion App"><input type="checkbox" .checked=${this._formMobile} @change=${(e: Event) => (this._formMobile = (e.target as HTMLInputElement).checked)} /> Mobile Push</label>
          <label title="Critical alerts bypass Do Not Disturb on iOS/Android"><input type="checkbox" .checked=${this._formCritical} @change=${(e: Event) => (this._formCritical = (e.target as HTMLInputElement).checked)} /> Critical Alerts</label>
        </div>
        <div class="actions">
          <button class="btn btn-primary" @click=${this._save}>Save</button>
          <button class="btn btn-plain" @click=${() => (this._editing = null)}>Cancel</button>
        </div>
      </div>
    `;
  }
}
