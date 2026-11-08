// Mock data helpers. Every app draws from a fixed "now" and seeded numbers, so a screen looks the same on every load and
// in every screenshot.

import { random } from "./Art";

export { random };

// The demos' present moment.
export const NOW = new Date("2026-11-04T14:30:00+09:00");

export const pick = <T,>(r: () => number, list: readonly T[]): T => list[Math.floor(r() * list.length)]!;
export const int = (r: () => number, min: number, max: number) => min + Math.floor(r() * (max - min + 1));
export const chance = (r: () => number, p: number) => r() < p;
export const shuffle = <T,>(r: () => number, list: readonly T[]): T[] => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
};

export const KOREAN_NAMES = [
  "김서연", "이도윤", "박지호", "최하린", "정민준", "한지우", "윤서아", "강하준", "조예린", "임시우",
  "오지안", "신유나", "권태오", "황다은", "송민재", "류하늘", "배수아", "문지환", "남궁별", "백서윤",
  "서지민", "안소율", "홍준서", "전채원", "고은우", "양다인", "유건우", "장서윤", "노하람", "하윤슬",
] as const;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// minutes before NOW, as a Date.
export const ago = (minutes: number) => new Date(NOW.getTime() - minutes * MINUTE);
export const daysAgo = (days: number) => new Date(NOW.getTime() - days * DAY);

export const relative = (date: Date) => {
  const diff = NOW.getTime() - date.getTime();
  const future = diff < 0;
  const abs = Math.abs(diff);
  const say = (n: number, unit: string) => (future ? `${n}${unit} 뒤` : `${n}${unit} 전`);
  if (abs < MINUTE) return "방금";
  if (abs < HOUR) return say(Math.round(abs / MINUTE), "분");
  if (abs < DAY) return say(Math.round(abs / HOUR), "시간");
  if (abs < 7 * DAY) return say(Math.round(abs / DAY), "일");
  return formatDate(date);
};

const DATE = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", timeZone: "Asia/Seoul" });
const DATE_YEAR = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" });
const TIME = new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul" });
const WEEKDAY = new Intl.DateTimeFormat("ko-KR", { weekday: "short", timeZone: "Asia/Seoul" });

export const formatDate = (date: Date, withYear = date.getFullYear() !== NOW.getFullYear()) => (withYear ? DATE_YEAR : DATE).format(date);
export const formatTime = (date: Date) => TIME.format(date);
export const formatWeekday = (date: Date) => WEEKDAY.format(date);

export const formatBytes = (bytes: number) => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value >= 100 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
};

// 3:07, 1:02:45
export const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${rest}` : `${m}:${rest}`;
};

export const formatNumber = (value: number) => new Intl.NumberFormat("ko-KR").format(value);
