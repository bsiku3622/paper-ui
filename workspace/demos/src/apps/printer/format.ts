// Formatting for the printer console. Times are drawn in Korea Standard Time whatever the machine's zone is, so a
// screenshot reads the same everywhere, and a setting chooses 12 or 24 hours and how a date is written.

export type DateFormat = "ko" | "iso" | "dmy";

export type Stamp = { hour12: boolean; dateFormat: DateFormat };

export const DEFAULT_STAMP: Stamp = { hour12: true, dateFormat: "ko" };

const KST = 9 * 3_600_000;

// The moment the demo starts at: the host's clock then (2026-11-04 19:07:35 KST).
export const CAPTURED_AT = Date.parse("2026-11-04T19:07:35+09:00");

type Parts = { year: number; month: number; day: number; hour: number; minute: number; second: number; weekday: number };

export const partsOf = (ms: number): Parts => {
  const date = new Date(ms + KST);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
    weekday: date.getUTCDay(),
  };
};

const two = (value: number) => String(value).padStart(2, "0");

export const clockText = (ms: number, hour12: boolean, seconds = false) => {
  const { hour, minute, second } = partsOf(ms);
  const tail = seconds ? `:${two(second)}` : "";
  if (!hour12) return `${two(hour)}:${two(minute)}${tail}`;
  const half = hour < 12 ? "오전" : "오후";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${half} ${h}:${two(minute)}${tail}`;
};

export const dateText = (ms: number, format: DateFormat, withYear: boolean) => {
  const { year, month, day } = partsOf(ms);
  if (format === "iso") return `${year}-${two(month)}-${two(day)}`;
  if (format === "dmy") return `${two(day)}.${two(month)}.${withYear ? year : String(year).slice(2)}`;
  return withYear ? `${year}년 ${month}월 ${day}일` : `${month}월 ${day}일`;
};

// 11월 4일 오후 12:51 — the year is added when it is not the year of `now`.
export const stampText = (ms: number, now: number, stamp: Stamp) => {
  const withYear = partsOf(ms).year !== partsOf(now).year;
  return `${dateText(ms, stamp.dateFormat, withYear)} ${clockText(ms, stamp.hour12)}`;
};

// 6:13:47 and 0:12:25: a countdown or an elapsed time on the dashboard.
export const hms = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${two(m)}:${two(s)}`;
};

// 6h 31m 25s: a duration in a table.
export const longDuration = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return "--";
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}시간 ${m}분 ${s}초`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
};

// 6h 31m — the name of a file carries it.
export const shortDuration = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
};

export const millimetres = (value: number, digits = 2) => `${value.toFixed(digits)} mm`;

export const metres = (millimetresValue: number, digits = 2) => `${(millimetresValue / 1000).toFixed(digits)} m`;

export const grams = (value: number) => `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} g`;

export const bytesText = (bytes: number) => {
  const units = ["B", "kB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit++;
  }
  return `${unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
};

export const degrees = (value: number, digits = 1) => `${value.toFixed(digits)}°C`;

export const percent = (ratio: number, digits = 0) => `${(ratio * 100).toFixed(digits)}%`;

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
