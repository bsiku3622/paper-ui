import { formatBytes, formatNumber } from "../../../kit";
import { DAY, HOUR, MINUTE, now } from "./clock";

export { formatBytes, formatNumber };

const KST = 9 * HOUR;

const DAY_FORMAT = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" });
const CLOCK_FORMAT = new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Seoul" });
const SECONDS_FORMAT = new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZone: "Asia/Seoul" });
const MOMENT_FORMAT = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Seoul" });
const MOMENT_YEAR_FORMAT = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Seoul" });
const WEEKDAY_FORMAT = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short", timeZone: "Asia/Seoul" });

export const formatDay = (ms: number) => DAY_FORMAT.format(new Date(ms));
export const formatClock = (ms: number) => CLOCK_FORMAT.format(new Date(ms));
export const formatClockSeconds = (ms: number) => SECONDS_FORMAT.format(new Date(ms));
export const formatMoment = (ms: number) => {
  const year = new Date(ms + KST).getUTCFullYear() !== new Date(now() + KST).getUTCFullYear();
  return (year ? MOMENT_YEAR_FORMAT : MOMENT_FORMAT).format(new Date(ms));
};
export const formatDayHeading = (ms: number) => WEEKDAY_FORMAT.format(new Date(ms));

export const formatShortDay = (ms: number) => {
  const date = new Date(ms + KST);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
};

export const dayKey = (ms: number) => {
  const date = new Date(ms + KST);
  return date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
};

export const since = (ms: number, at = now()) => {
  const diff = at - ms;
  if (diff < MINUTE) return "방금";
  if (diff < HOUR) return `${Math.round(diff / MINUTE)}분 전`;
  if (diff < DAY) return `${Math.round(diff / HOUR)}시간 전`;
  if (diff < 7 * DAY) return `${Math.round(diff / DAY)}일 전`;
  return formatDay(ms);
};

export const elapsed = (ms: number, at = now()) => {
  const diff = at - ms;
  if (diff < MINUTE) return "방금";
  if (diff < HOUR) return `${Math.round(diff / MINUTE)}분 전`;
  if (diff < DAY) return `${Math.round(diff / HOUR)}시간 전`;
  if (diff < 60 * DAY) return `${Math.round(diff / DAY)}일 전`;
  return formatDay(ms);
};

export const remaining = (ms: number, at = now()) => {
  const diff = ms - at;
  if (diff <= 0) return "만료됨";
  const minutes = Math.floor(diff / MINUTE);
  if (minutes < 60) return `${Math.max(1, minutes)}분 남음`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}시간 남음`;
  return `${Math.floor(hours / 24)}일 남음`;
};

export const toLocalInput = (ms: number | null) => (ms === null ? "" : new Date(ms + KST).toISOString().slice(0, 16));
export const fromLocalInput = (value: string): number | null => {
  if (!value) return null;
  const ms = Date.parse(`${value}:00+09:00`);
  return Number.isFinite(ms) ? ms : null;
};

export const formatIec = (bytes: number) => {
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const units = ["KiB", "MiB", "GiB", "TiB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
};

export const formatRate = (mbps: number) => `${mbps.toFixed(2)} Mbps`;

export const formatSpan = (ms: number) => {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds}초`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return seconds % 60 ? `${minutes}분 ${seconds % 60}초` : `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  return minutes % 60 ? `${hours}시간 ${minutes % 60}분` : `${hours}시간`;
};

export const mimeOf = (name: string) => {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  const table: Record<string, string> = {
    pdf: "application/pdf", csv: "text/csv", md: "text/markdown", txt: "text/plain", bib: "text/x-bibtex", h: "text/x-chdr",
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", svg: "image/svg+xml", heic: "image/heic",
    mp4: "video/mp4", mov: "video/quicktime", mp3: "audio/mpeg", m4a: "audio/mp4",
    zip: "application/zip", "7z": "application/x-7z-compressed", gz: "application/gzip", bin: "application/octet-stream",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    hwpx: "application/haansofthwpx", gcode: "text/x-gcode", parquet: "application/vnd.apache.parquet", woff2: "font/woff2",
  };
  return table[extension] ?? "application/octet-stream";
};
