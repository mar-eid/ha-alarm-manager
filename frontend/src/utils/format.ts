/**
 * Formatting helpers shared by all views: time, values, durations and trigger text.
 * Everything follows the user's HA locale (hass.locale) where available.
 */

import type { AlarmChannel, AlarmWithState, HomeAssistant } from "../types";

const language = (hass?: HomeAssistant): string | undefined =>
  hass?.locale?.language || hass?.language || undefined;

const hour12 = (hass?: HomeAssistant): boolean | undefined => {
  const tf = hass?.locale?.time_format;
  if (tf === "12") return true;
  if (tf === "24") return false;
  return undefined;
};

const timeZone = (hass?: HomeAssistant): string | undefined =>
  hass?.locale?.time_zone === "server" ? hass?.config?.time_zone : undefined;

const parse = (iso: string | null | undefined): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

/** Absolute date + time, e.g. "24 Oct 2026, 14:05". */
export const formatDateTime = (hass: HomeAssistant | undefined, iso: string | null | undefined): string => {
  const d = parse(iso);
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(language(hass), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: hour12(hass),
      timeZone: timeZone(hass),
    }).format(d);
  } catch (_e) {
    return d.toLocaleString();
  }
};

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["second", 60],
  ["minute", 60],
  ["hour", 24],
  ["day", 7],
  ["week", 4.35],
  ["month", 12],
  ["year", Infinity],
];

/** Relative time, e.g. "5 minutes ago" / "in 2 hours". */
export const formatRelative = (hass: HomeAssistant | undefined, iso: string | null | undefined): string => {
  const d = parse(iso);
  if (!d) return "—";
  let value = (d.getTime() - Date.now()) / 1000;
  let unit: Intl.RelativeTimeFormatUnit = "second";
  for (const [u, size] of UNITS) {
    unit = u;
    if (Math.abs(value) < size) break;
    value /= size;
  }
  const rounded = unit === "second" && Math.abs(value) < 45 ? 0 : Math.round(value);
  try {
    return new Intl.RelativeTimeFormat(language(hass), { numeric: "auto" }).format(rounded, unit);
  } catch (_e) {
    return formatDateTime(hass, iso);
  }
};

/** Human-readable duration from seconds, e.g. "1 h 30 min", "45 s", "2 d". */
export const formatDuration = (totalSeconds: number | null | undefined): string => {
  if (!totalSeconds || totalSeconds <= 0) return "—";
  let s = Math.round(totalSeconds);
  const d = Math.floor(s / 86400);
  s -= d * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;
  const parts: string[] = [];
  if (d) parts.push(`${d} d`);
  if (h) parts.push(`${h} h`);
  if (m) parts.push(`${m} min`);
  if (s) parts.push(`${s} s`);
  return parts.join(" ");
};

/** Value as returned by ha-selector-duration. */
export interface DurationValue {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/** Duration selector value -> whole seconds, or null when empty/zero (= feature off). */
export const durationToSeconds = (value: DurationValue | number | string | null | undefined): number | null => {
  if (value == null || value === "") return null;
  let total: number;
  if (typeof value === "number") total = value;
  else if (typeof value === "string") total = Number(value);
  else
    total =
      (value.days ?? 0) * 86400 +
      (value.hours ?? 0) * 3600 +
      (value.minutes ?? 0) * 60 +
      (value.seconds ?? 0) +
      (value.milliseconds ?? 0) / 1000;
  if (!isFinite(total) || total <= 0) return null;
  return Math.round(total);
};

/** Seconds -> duration selector value (undefined when not set). */
export const secondsToDuration = (seconds: number | null | undefined): DurationValue | undefined => {
  if (!seconds || seconds <= 0) return undefined;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return { hours, minutes, seconds: Math.round(seconds % 60) };
};

/** Display name of an area: resolves an area_id via hass.areas, else shows the stored text. */
export const areaName = (hass: HomeAssistant | undefined, area: string | null | undefined): string => {
  if (!area) return "";
  return hass?.areas?.[area]?.name ?? area;
};

export const channelName = (channels: AlarmChannel[], channelId: string | null | undefined): string => {
  if (!channelId) return "";
  return channels.find((c) => c.id === channelId)?.name ?? channelId;
};

const unitOf = (hass: HomeAssistant | undefined, entityId: string): string =>
  hass?.states?.[entityId]?.attributes?.unit_of_measurement ?? "";

const withUnit = (value: unknown, unit: string): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (!unit) return String(value);
  return unit === "%" ? `${value}%` : `${value} ${unit}`;
};

export interface FormattedValue {
  text: string;
  /** Free text (external alarm messages, long strings): render clamped, not as a big number. */
  long: boolean;
}

/**
 * The alarm's current value. Uses HA's own state formatting (unit, translations) when the
 * source entity exists, else the value recorded when the alarm last evaluated.
 */
export const formatAlarmValue = (hass: HomeAssistant | undefined, alarm: AlarmWithState): FormattedValue => {
  if (alarm.trigger_type !== "external") {
    const stateObj = hass?.states?.[alarm.source_entity_id];
    if (stateObj) {
      if (typeof hass?.formatEntityState === "function") {
        try {
          const text = hass.formatEntityState(stateObj);
          return { text, long: text.length > 32 };
        } catch (_e) {
          // fall through to the raw state
        }
      }
      return { text: withUnit(stateObj.state, stateObj.attributes?.unit_of_measurement ?? ""), long: false };
    }
  }
  const raw = alarm.runtime.last_value;
  if (raw === null || raw === undefined || raw === "") return { text: "—", long: false };
  return { text: String(raw), long: alarm.trigger_type === "external" || String(raw).length > 32 };
};

const OPERATOR_TEXT: Record<string, string> = {
  ">": "Above",
  ">=": "At or above",
  "<": "Below",
  "<=": "At or below",
  "==": "Equal to",
  "!=": "Not equal to",
};

/** One readable sentence for the trigger, e.g. "Below 10%, hysteresis 3%". */
export const describeTrigger = (hass: HomeAssistant | undefined, alarm: AlarmWithState): string => {
  const cfg = alarm.trigger_config ?? {};
  const stateObj = hass?.states?.[alarm.source_entity_id];
  const stateLabel = (s: string): string => {
    if (stateObj && typeof hass?.formatEntityState === "function") {
      try {
        return hass.formatEntityState(stateObj, s);
      } catch (_e) {
        // use raw state
      }
    }
    return s;
  };
  switch (alarm.trigger_type) {
    case "analog": {
      const unit = unitOf(hass, alarm.source_entity_id);
      const op = OPERATOR_TEXT[cfg.operator] ?? cfg.operator ?? "";
      let text = `${op} ${withUnit(cfg.threshold, unit)}`;
      if (alarm.hysteresis != null) text += `, hysteresis ${withUnit(alarm.hysteresis, unit)}`;
      return text;
    }
    case "digital":
      return `State is "${stateLabel(String(cfg.target_state ?? "on"))}"`;
    case "custom_state": {
      const values: string[] = cfg.match_values ?? [];
      return values.length ? `State is one of: ${values.map(stateLabel).join(", ")}` : "No match values";
    }
    case "external":
      return "Raised and cleared by an automation or blueprint";
    default:
      return alarm.trigger_type;
  }
};

/** Shows a toast through HA's own notification system. */
export const notify = (el: HTMLElement, message: string): void => {
  el.dispatchEvent(new CustomEvent("hass-notification", { detail: { message }, bubbles: true, composed: true }));
};

export const errorMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return String(err);
};
