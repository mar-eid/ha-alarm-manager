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
  services: Record<string, Record<string, unknown>>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>
  ): Promise<void>;
  language: string;
  user: { id: string; name: string; is_admin: boolean };
  panels?: Record<string, { title?: string; url_path: string; component_name?: string }>;
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
  condition_template: string | null;
  notification_title_template: string | null;
  notification_text_template: string | null;
  hysteresis: number | null;
  repeat_interval: number | null;
  escalation_delay: number | null;
  trigger_delay: number | null;
  clear_delay: number | null;
  action_label: string | null;
  action_service: string | null;
  action_entity: string | null;
  action_target: Record<string, unknown> | null;
  link_page_path: string | null;
  link_view_path: string | null;
  suppress_milder: boolean;
  auto_ack_delay: number | null;
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
  returned_at?: string | null;
}

export interface AlarmWithState extends AlarmDefinition {
  runtime: AlarmRuntimeState;
  /** More severe active alarm on the same sensor currently suppressing this one (F19). */
  suppressed_by?: { id: string; name: string } | null;
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

// --- Noise analysis (F21) ---

export interface NoiseAlarmInfo {
  alarm_id: string;
  name: string;
  deleted: boolean;
  priority?: AlarmPriority;
  area?: string;
  tag?: string;
  source_entity_id?: string;
  trigger_type?: TriggerType;
  hysteresis?: number | null;
  trigger_delay?: number | null;
  clear_delay?: number | null;
}

export interface NoiseReport {
  hours: number;
  start: string;
  end: string;
  thresholds: {
    top_count: number;
    chatter_count: number;
    chatter_window: number;
    fleeting_seconds: number;
    stale_hours: number;
  };
  kpis: {
    activations: number;
    per_day: number;
    alarms_with_activations: number;
    top_share: number;
    suppressed: number;
    standing: number;
    stale: number;
    chattering: number;
    fleeting: number;
    hidden: number;
  };
  top: (NoiseAlarmInfo & { count: number; share: number; suppressed: number; last: string })[];
  standing: (NoiseAlarmInfo & { state: AlarmState; since: string; duration: number; stale: boolean })[];
  chattering: (NoiseAlarmInfo & { bursts: number; max_burst: number; count: number })[];
  fleeting: (NoiseAlarmInfo & { fleeting: number; activations: number; shortest: number })[];
  hidden: (NoiseAlarmInfo & { kind: "shelved" | "disabled"; since: string | null; until: string | null })[];
}
