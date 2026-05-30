/**
 * TypeScript type definitions for SCADA Alarm Manager.
 */

export interface HomeAssistant {
  connection: {
    sendMessagePromise(msg: Record<string, unknown>): Promise<any>;
    subscribeMessage(
      callback: (msg: any) => void,
      msg: Record<string, unknown>
    ): Promise<() => void>;
  };
  states: Record<string, HassState>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>
  ): Promise<void>;
  language: string;
  user: { id: string; name: string; is_admin: boolean };
}

export interface HassState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

export type AlarmPriority = 0 | 1 | 2 | 3;
export const PRIORITY_LABELS: Record<AlarmPriority, string> = {
  0: "Info",
  1: "Warning",
  2: "High",
  3: "Critical",
};

export const PRIORITY_COLORS: Record<AlarmPriority, string> = {
  0: "#2196F3",
  1: "#FF9800",
  2: "#FF5722",
  3: "#F44336",
};

export type AlarmState =
  | "normal"
  | "active_unacknowledged"
  | "active_acknowledged"
  | "returned_to_normal_unacknowledged"
  | "shelved"
  | "disabled";

export const STATE_LABELS: Record<AlarmState, string> = {
  normal: "Normal",
  active_unacknowledged: "Active (Unacked)",
  active_acknowledged: "Active (Acked)",
  returned_to_normal_unacknowledged: "RTN (Unacked)",
  shelved: "Shelved",
  disabled: "Disabled",
};

export type TriggerType = "analog" | "digital" | "custom_state" | "external";

export interface AlarmDefinition {
  id: string;
  name: string;
  description: string;
  priority: AlarmPriority;
  area: string;
  equipment: string;
  tag: string;
  channel_id: string | null;
  enabled: boolean;
  latching: boolean;
  ack_required: boolean;
  auto_clear: boolean;
  repeat_interval: number | null;
  escalation_delay: number | null;
  source_entity_id: string;
  trigger_type: TriggerType;
  trigger_config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AlarmRuntimeState {
  alarm_id: string;
  state: AlarmState;
  triggered_at: string | null;
  acked_at: string | null;
  acked_by: string | null;
  shelved_until: string | null;
  previous_state: AlarmState | null;
  last_notification_at: string | null;
  last_value: string | null;
}

export interface AlarmWithState extends AlarmDefinition {
  runtime: AlarmRuntimeState;
}

export interface AlarmChannel {
  id: string;
  name: string;
  notification_targets: string[];
  min_priority: AlarmPriority;
  persistent_notification: boolean;
  mobile_push: boolean;
  critical_notification: boolean;
  repeat_cadence: number | null;
  escalation_target: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlarmEvent {
  id: number;
  alarm_id: string;
  alarm_name: string;
  event_type: string;
  timestamp: string;
  old_state: AlarmState | null;
  new_state: AlarmState | null;
  user: string | null;
  details: Record<string, any>;
}

export interface AlarmStateChange {
  alarm_id: string;
  alarm_name: string;
  old_state: string;
  new_state: string;
  priority: number;
  priority_name: string;
  channel_id: string | null;
}
