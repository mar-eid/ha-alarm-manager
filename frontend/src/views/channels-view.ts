import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles/shared-styles";
import { fetchChannels, createChannel, updateChannel, deleteChannel } from "../data/websocket";
import { PRIORITY_LABELS, type HomeAssistant, type AlarmChannel, type AlarmPriority } from "../types";
import "../components/notify-target-picker";

@customElement("channels-view")
export class ChannelsView extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _channels: AlarmChannel[] = [];
  @state() private _loading = true;
  @state() private _editing: AlarmChannel | null = null;
  @state() private _formName = "";
  @state() private _formTargets: string[] = [];
  @state() private _formMinPriority: AlarmPriority = 0;
  @state() private _formPersistent = true;
  @state() private _formMobile = true;
  @state() private _formCritical = false;

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
      .filter-row input {
        width: 100%; padding: 4px 6px; font-size: 0.8em;
        border: 1px solid var(--divider-color, #ccc); border-radius: 4px;
        background: var(--card-background-color, white);
        color: var(--primary-text-color, #333);
      }
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
    this._formTargets = [];
    this._formMinPriority = 0;
    this._formPersistent = true;
    this._formMobile = true;
    this._formCritical = false;
  }

  private _startEdit(channel: AlarmChannel) {
    this._editing = channel;
    this._formName = channel.name;
    this._formTargets = [...channel.notification_targets];
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

    if (this._editing?.id) {
      await updateChannel(this.hass, this._editing.id, data);
    } else {
      await createChannel(this.hass, data);
    }
    this._editing = null;
    this._loadChannels();
  }

  private async _delete(channelId: string) {
    if (!this.hass || !confirm("Delete this channel?")) return;
    await deleteChannel(this.hass, channelId);
    this._loadChannels();
  }

  render() {
    if (this._loading) return html`<div class="empty-state">Loading...</div>`;

    return html`
      ${this._editing !== null ? this._renderForm() : ""}
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span>${this._channels.length} channel${this._channels.length !== 1 ? "s" : ""}</span>
        <button class="btn btn-primary" @click=${this._startCreate}>+ New Channel</button>
      </div>
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
            <th><input type="text" placeholder="Filter..." .value=${this._filterName} @input=${(e: Event) => this._filterName = (e.target as HTMLInputElement).value} /></th>
            <th></th><th></th><th></th><th></th><th></th><th></th>
          </tr>
        </thead>
        <tbody>
          ${this._channels.filter((ch) => !this._filterName || ch.name.toLowerCase().includes(this._filterName.toLowerCase())).map(
            (ch) => html`
              <tr>
                <td><strong>${ch.name}</strong></td>
                <td>${ch.notification_targets.join(", ") || "-"}</td>
                <td>${PRIORITY_LABELS[ch.min_priority] ?? "Info"}</td>
                <td>${ch.persistent_notification ? "Yes" : "No"}</td>
                <td>${ch.mobile_push ? "Yes" : "No"}</td>
                <td>${ch.critical_notification ? "Yes" : "No"}</td>
                <td class="actions">
                  <button class="btn btn-small btn-primary" @click=${() => this._startEdit(ch)}>Edit</button>
                  <button class="btn btn-small btn-danger" @click=${() => this._delete(ch.id)}>Delete</button>
                </td>
              </tr>
            `
          )}
        </tbody>
      </table>
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
          <div class="form-group">
            <label>Notification Targets</label>
            <notify-target-picker
              .value=${this._formTargets}
              @value-changed=${(e: CustomEvent) => this._formTargets = e.detail.value}
            ></notify-target-picker>
          </div>
        </div>
        <div class="form-group">
          <label>Minimum Priority</label>
          <select .value=${String(this._formMinPriority)} @change=${(e: Event) => (this._formMinPriority = Number((e.target as HTMLSelectElement).value) as AlarmPriority)}>
            <option value="0">Info</option>
            <option value="1">Warning</option>
            <option value="2">High</option>
            <option value="3">Critical</option>
          </select>
        </div>
        <div class="checkbox-group">
          <label><input type="checkbox" .checked=${this._formPersistent} @change=${(e: Event) => (this._formPersistent = (e.target as HTMLInputElement).checked)} /> Persistent Notifications</label>
          <label><input type="checkbox" .checked=${this._formMobile} @change=${(e: Event) => (this._formMobile = (e.target as HTMLInputElement).checked)} /> Mobile Push</label>
          <label><input type="checkbox" .checked=${this._formCritical} @change=${(e: Event) => (this._formCritical = (e.target as HTMLInputElement).checked)} /> Critical Alerts</label>
        </div>
        <div class="actions">
          <button class="btn btn-primary" @click=${this._save}>Save</button>
          <button class="btn" style="background: var(--secondary-background-color)" @click=${() => (this._editing = null)}>Cancel</button>
        </div>
      </div>
    `;
  }
}
