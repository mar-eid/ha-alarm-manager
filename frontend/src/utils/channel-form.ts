/**
 * Conversion between a stored channel and the channel form's data, kept free of Lit so the
 * load → save round trip can be checked without a browser.
 */

import type { AlarmChannel, AlarmPriority, NotificationTargetEntry } from "../types";

/** The fields ha-form edits, in its flat data shape (priority as a select string). */
export interface ChannelFormData {
  name: string;
  min_priority: string;
  persistent_notification: boolean;
  mobile_push: boolean;
  critical_notification: boolean;
}

/** Body of `scada_alarm_manager/channel/create|update` (without type/channel_id). */
export interface ChannelPayload {
  name: string;
  notification_targets: NotificationTargetEntry[];
  min_priority: AlarmPriority;
  persistent_notification: boolean;
  mobile_push: boolean;
  critical_notification: boolean;
}

export const emptyChannelForm = (): ChannelFormData => ({
  name: "",
  min_priority: "0",
  persistent_notification: true,
  mobile_push: true,
  critical_notification: false,
});

/** Targets stored as plain strings (older channels) get the "all priorities" filter. */
export const normalizeTargets = (targets: AlarmChannel["notification_targets"]): NotificationTargetEntry[] =>
  (targets ?? []).map((t) =>
    typeof t === "string" ? { target: t, min_priority: 0 } : { target: t.target, min_priority: t.min_priority ?? 0 }
  );

export const channelToForm = (channel: AlarmChannel): ChannelFormData => ({
  name: channel.name,
  min_priority: String(channel.min_priority ?? 0),
  persistent_notification: channel.persistent_notification,
  mobile_push: channel.mobile_push,
  critical_notification: channel.critical_notification,
});

export const formToPayload = (data: ChannelFormData, targets: NotificationTargetEntry[]): ChannelPayload => ({
  name: data.name.trim(),
  notification_targets: targets,
  // The backend validates min_priority as an int (vol.In([0, 1, 2, 3])).
  min_priority: Number(data.min_priority) as AlarmPriority,
  persistent_notification: data.persistent_notification,
  mobile_push: data.mobile_push,
  critical_notification: data.critical_notification,
});
