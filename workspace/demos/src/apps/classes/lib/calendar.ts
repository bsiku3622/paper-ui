import type { Accent } from "@studio-baeks/paper-ui/tokens";

import { CALENDAR_ROWS } from "../data/generated/calendar";
import { hhmm } from "../data/periods";

export type EventCategory = "holiday" | "dorm" | "exam" | "term" | "academic" | "event";
export type TimeMode = "allday" | "clock" | "period";

export type CalendarEvent = {
  id: number;
  title: string;
  start: string;
  end: string;
  mode: TimeMode;
  startMinute: number | null;
  endMinute: number | null;
  startPeriod: number | null;
  endPeriod: number | null;
  category: EventCategory;
  grades: number[];
  majors: string[];
  personal: boolean;
  seriesId: string | null;
  note: string | null;
};

export type EventRequest = {
  id: number;
  title: string;
  start: string;
  end: string;
  category: EventCategory;
  grades: number[];
  majors: string[];
  note: string | null;
  status: "pending" | "approved" | "rejected";
  reason: string | null;
  requestedBy: string;
  createdAt: string;
};

export const CATEGORY_LABEL: Record<EventCategory, string> = { holiday: "공휴일", dorm: "귀가·생활관", exam: "시험", term: "학기", academic: "학사", event: "행사" };
export const CATEGORY_ACCENT: Record<EventCategory, Accent> = { holiday: "error", exam: "warning", term: "info", dorm: "success", academic: "primary", event: "primary" };
export const CATEGORY_ORDER: Record<EventCategory, number> = { holiday: 0, exam: 1, term: 2, dorm: 3, academic: 4, event: 5 };
export const MONTH_LABEL = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
export const WEEKDAY_LABEL = ["일", "월", "화", "수", "목", "금", "토"];

export const toKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const fromKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number) as [number, number, number];
  return new Date(year, month - 1, day);
};
export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const monthGrid = (year: number, month: number) => {
  const first = new Date(year, month - 1, 1);
  const start = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
};
export const inMonth = (date: Date, year: number, month: number) => date.getFullYear() === year && date.getMonth() + 1 === month;

export const BASE_EVENTS: readonly CalendarEvent[] = CALENDAR_ROWS.map(([title, start, end, category, grades, majors], index) => ({
  id: 100 + index,
  title,
  start,
  end,
  mode: "allday",
  startMinute: null,
  endMinute: null,
  startPeriod: null,
  endPeriod: null,
  category: category as EventCategory,
  grades: [...grades],
  majors: [...majors],
  personal: false,
  seriesId: null,
  note: null,
}));

export const groupByDate = (events: readonly CalendarEvent[]) => {
  const map: Record<string, CalendarEvent[]> = {};
  for (const event of events) {
    let cursor = fromKey(event.start);
    const last = fromKey(event.end);
    for (let guard = 0; cursor <= last && guard < 400; guard++) {
      (map[toKey(cursor)] ||= []).push(event);
      cursor = addDays(cursor, 1);
    }
  }
  for (const list of Object.values(map)) {
    list.sort((a, b) => {
      if (a.personal !== b.personal) return a.personal ? 1 : -1;
      return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category] || a.title.localeCompare(b.title, "ko");
    });
  }
  return map;
};

export type WeekMarker = { week: number; end: string };
export const weekMarkers = (events: readonly CalendarEvent[]): WeekMarker[] =>
  events
    .map((event) => {
      const match = /^(\d{1,2})주차\s*종료$/.exec(event.title.trim());
      return match ? { week: Number(match[1]), end: event.end } : null;
    })
    .filter((item): item is WeekMarker => item !== null)
    .sort((a, b) => a.end.localeCompare(b.end));

export const weekOf = (date: Date, markers: readonly WeekMarker[]) => {
  const key = toKey(date);
  for (const marker of markers) {
    if (key <= marker.end) return key >= toKey(addDays(fromKey(marker.end), -6)) ? marker.week : null;
  }
  return null;
};

export const timeLabel = (event: Pick<CalendarEvent, "mode" | "startMinute" | "endMinute" | "startPeriod" | "endPeriod">) => {
  if (event.mode === "clock" && event.startMinute !== null) {
    return event.endMinute !== null && event.endMinute !== event.startMinute ? `${hhmm(event.startMinute)}–${hhmm(event.endMinute)}` : hhmm(event.startMinute);
  }
  if (event.mode === "period" && event.startPeriod !== null) {
    return event.endPeriod !== null && event.endPeriod !== event.startPeriod ? `${event.startPeriod}–${event.endPeriod}교시` : `${event.startPeriod}교시`;
  }
  return "";
};

export const gradeLabel = (grades: readonly number[]) => (grades.length === 0 ? "" : `${grades.join("·")}학년`);
export const majorLabel = (majors: readonly string[]) => (majors.length === 0 ? "" : majors.join("·"));

export const gradeOf = (stuId: string | null, on: Date) => {
  const admitted = Number(stuId?.slice(0, 2));
  if (!stuId || !Number.isFinite(admitted)) return null;
  const schoolYear = on.getMonth() >= 2 ? on.getFullYear() : on.getFullYear() - 1;
  return Math.max(1, Math.min(3, schoolYear - (2000 + admitted) + 1));
};

export const isForMe = (event: Pick<CalendarEvent, "personal" | "grades" | "majors">, grade: number | null, major: string | null) => {
  if (event.personal) return true;
  return (grade === null || event.grades.length === 0 || event.grades.includes(grade)) && (major === null || event.majors.length === 0 || event.majors.includes(major));
};

export type Stretch = { label: string; start: string; end: string; vacation: boolean };
export const STRETCHES: readonly Stretch[] = [
  { label: "2026-1학기", start: "2026-02-23", end: "2026-06-19", vacation: false },
  { label: "여름방학", start: "2026-06-20", end: "2026-08-17", vacation: true },
  { label: "2026-2학기", start: "2026-08-18", end: "2026-12-11", vacation: false },
  { label: "겨울방학", start: "2026-12-12", end: "2027-02-22", vacation: true },
];
export const stretchOn = (key: string) => STRETCHES.find((item) => key >= item.start && key <= item.end) ?? null;

export const dayCode = (date: Date) => (["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const)[date.getDay()]!;
