// text.ts — dates, sizes and paths the wiki prints. The wiki's present is the kit's NOW, moving on as the page stays open.

import { formatBytes, NOW } from "../../../kit";

export const DAY_MS = 86_400_000;

const START = Date.now();
// The demo's present moment: NOW when the page opened, moving with the clock after that.
export const present = () => NOW.getTime() + (Date.now() - START);

const STAMP = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
const DAY = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" });
const CLOCK = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const LONG_DAY = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric", weekday: "short" });

// 2026-11-03 00:00:49
export const stamp = (ms: number) => STAMP.format(ms);
// 2026-11-03
export const day = (ms: number) => DAY.format(ms);
// 00:00
export const clock = (ms: number) => CLOCK.format(ms);
// 2026년 11월 3일 (화)
export const longDay = (ms: number) => LONG_DAY.format(ms);

// 3시간 전
export const since = (ms: number) => {
  const diff = Math.max(0, present() - ms);
  const minute = 60_000;
  if (diff < minute) return "방금";
  if (diff < 60 * minute) return `${Math.round(diff / minute)}분 전`;
  if (diff < 24 * 60 * minute) return `${Math.round(diff / (60 * minute))}시간 전`;
  if (diff < 7 * 24 * 60 * minute) return `${Math.round(diff / (24 * 60 * minute))}일 전`;
  return day(ms);
};

export const sizeOf = (text: string) => new TextEncoder().encode(text).length;
export const size = (bytes: number) => formatBytes(bytes);

// +120, −45, 0
export const signed = (delta: number) => (delta > 0 ? `+${delta.toLocaleString("ko-KR")}` : delta < 0 ? `−${Math.abs(delta).toLocaleString("ko-KR")}` : "0");

export const hash = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
};

// 가나다 index: the first syllable's initial consonant, or the first letter.
const INITIALS = ["ㄱ", "ㄱ", "ㄴ", "ㄷ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅂ", "ㅅ", "ㅅ", "ㅇ", "ㅈ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
export const initialOf = (title: string) => {
  const code = title.codePointAt(0) ?? 0;
  if (code >= 0xac00 && code <= 0xd7a3) return INITIALS[Math.floor((code - 0xac00) / 588)] ?? "ㄱ";
  const ch = title.charAt(0).toUpperCase();
  return /[0-9]/.test(ch) ? "0-9" : ch || "?";
};

export const collator = new Intl.Collator("ko");
