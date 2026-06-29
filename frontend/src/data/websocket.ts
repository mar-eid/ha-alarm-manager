/**
 * Typed WebSocket client for SCADA Alarm Manager.
 */

import type {
  AlarmChannel,
  AlarmEvent,
  AlarmStateChange,
  AlarmWithState,
  HomeAssistant,
} from "../types";

// --- Integration metadata ---

export const fetchVersion = async (hass: HomeAssistant): Promise<string> => {
  const result = await hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/version",
  });
  return result.version;
};

export const fetchDashboardConfig = async (
  hass: HomeAssistant,
  urlPath: string | null
): Promise<any> => {
  return hass.connection.sendMessagePromise({
    type: "lovelace/config",
    url_path: urlPath,
  });
};

export const triggerAlarmAction = async (
  hass: HomeAssistant,
  alarmId: string
): Promise<void> => {
  await hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/alarm/trigger_action",
    alarm_id: alarmId,
  });
};

// --- Alarm CRUD ---

export const fetchAlarms = async (
  hass: HomeAssistant
): Promise<AlarmWithState[]> => {
  const result = await hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/alarm/list",
  });
  return result.alarms;
};

export const fetchAlarm = async (
  hass: HomeAssistant,
  alarmId: string
): Promise<AlarmWithState> => {
  return hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/alarm/get",
    alarm_id: alarmId,
  });
};

export const createAlarm = async (
  hass: HomeAssistant,
  data: Record<string, unknown>
): Promise<AlarmWithState> => {
  return hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/alarm/create",
    ...data,
  });
};

export const updateAlarm = async (
  hass: HomeAssistant,
  alarmId: string,
  data: Record<string, unknown>
): Promise<AlarmWithState> => {
  return hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/alarm/update",
    alarm_id: alarmId,
    ...data,
  });
};

export const deleteAlarm = async (
  hass: HomeAssistant,
  alarmId: string
): Promise<void> => {
  await hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/alarm/delete",
    alarm_id: alarmId,
  });
};

// --- Alarm Actions ---

export const acknowledgeAlarm = async (
  hass: HomeAssistant,
  alarmId: string
): Promise<void> => {
  await hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/alarm/acknowledge",
    alarm_id: alarmId,
  });
};

export const acknowledgeAllAlarms = async (
  hass: HomeAssistant,
  channelId?: string,
  priority?: number
): Promise<{ acknowledged: number }> => {
  const msg: Record<string, unknown> = {
    type: "scada_alarm_manager/alarm/acknowledge_all",
  };
  if (channelId) msg.channel_id = channelId;
  if (priority !== undefined) msg.priority = priority;
  return hass.connection.sendMessagePromise(msg);
};

export const shelveAlarm = async (
  hass: HomeAssistant,
  alarmId: string,
  duration: number
): Promise<void> => {
  await hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/alarm/shelve",
    alarm_id: alarmId,
    duration,
  });
};

export const unshelveAlarm = async (
  hass: HomeAssistant,
  alarmId: string
): Promise<void> => {
  await hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/alarm/unshelve",
    alarm_id: alarmId,
  });
};

export const resetAlarm = async (
  hass: HomeAssistant,
  alarmId: string
): Promise<void> => {
  await hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/alarm/reset",
    alarm_id: alarmId,
  });
};

// --- Channel CRUD ---

export const fetchChannels = async (
  hass: HomeAssistant
): Promise<AlarmChannel[]> => {
  const result = await hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/channel/list",
  });
  return result.channels;
};

export const fetchChannel = async (
  hass: HomeAssistant,
  channelId: string
): Promise<AlarmChannel> => {
  return hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/channel/get",
    channel_id: channelId,
  });
};

export const createChannel = async (
  hass: HomeAssistant,
  data: Record<string, unknown>
): Promise<AlarmChannel> => {
  return hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/channel/create",
    ...data,
  });
};

export const updateChannel = async (
  hass: HomeAssistant,
  channelId: string,
  data: Record<string, unknown>
): Promise<AlarmChannel> => {
  return hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/channel/update",
    channel_id: channelId,
    ...data,
  });
};

export const deleteChannel = async (
  hass: HomeAssistant,
  channelId: string
): Promise<void> => {
  await hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/channel/delete",
    channel_id: channelId,
  });
};

// --- Events ---

export const fetchEvents = async (
  hass: HomeAssistant,
  params: {
    alarm_id?: string;
    event_type?: string;
    start?: string;
    end?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<AlarmEvent[]> => {
  const result = await hass.connection.sendMessagePromise({
    type: "scada_alarm_manager/event/list",
    ...params,
  });
  return result.events;
};

// --- Subscription ---

export const subscribeAlarmChanges = async (
  hass: HomeAssistant,
  callback: (event: AlarmStateChange) => void
): Promise<() => void> => {
  return hass.connection.subscribeMessage(callback, {
    type: "scada_alarm_manager/subscribe",
  });
};
