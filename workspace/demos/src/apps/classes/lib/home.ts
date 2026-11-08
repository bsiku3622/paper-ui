import { BREAKS, DAYS, PERIODS, type BreakTime, type Day, type PeriodTime } from "../data/periods";
import type { TermData } from "../data/build";
import { dayCode, groupByDate, stretchOn, toKey, type CalendarEvent } from "./calendar";
import { continuesClass, isBreakGap, isSameClass } from "./schedule";
import type { SectionInfo } from "./trade";

export type TodayClass = { period: number; subject: string; section: string; teacher: string; room: string; department: string | null };
export type OffReason = "vacation" | "weekend" | "holiday";

export type HomeData = {
  date: string;
  minute: number;
  day: Day | null;
  hasClass: boolean;
  offReason: OffReason | null;
  offLabel: string | null;
  vacation: { label: string; since: string; resumesOn: string; daysLeft: number } | null;
  today: TodayClass[];
  week: Record<Day, TodayClass[]>;
  periods: readonly PeriodTime[];
  breaks: readonly BreakTime[];
  events: CalendarEvent[];
  breakName: string | null;
};

export const weekOf = (data: TermData, stuId: string): Record<Day, TodayClass[]> => {
  const week: Record<Day, TodayClass[]> = { MON: [], TUE: [], WED: [], THU: [], FRI: [] };
  for (const subject of data.subjects) {
    for (const section of subject.sections) {
      if (!section.students.some((student) => student.stuId === stuId)) continue;
      for (const time of section.times) {
        week[time.day].push({ period: time.period, subject: subject.subject, section: section.section, teacher: section.teacher, room: time.room, department: subject.department });
      }
    }
  }
  for (const day of DAYS) week[day].sort((a, b) => a.period - b.period);
  return week;
};

export const planHome = (home: HomeData, sections: readonly SectionInfo[], departments: ReadonlyMap<string, string | null>): HomeData => {
  const week: Record<Day, TodayClass[]> = { MON: [], TUE: [], WED: [], THU: [], FRI: [] };
  for (const section of sections) {
    for (const time of section.times) {
      week[time.day].push({ period: time.period, subject: section.subject, section: section.section, teacher: section.teacher, room: time.room || section.room, department: departments.get(section.subject) ?? null });
    }
  }
  for (const day of DAYS) week[day].sort((a, b) => a.period - b.period);
  return { ...home, week, today: home.hasClass && home.day ? week[home.day] : [] };
};

const daysBetween = (from: string, to: string) => Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86_400_000);

export const buildHome = (data: TermData, stuId: string, key: string, minute: number, allEvents: readonly CalendarEvent[]): HomeData => {
  const date = new Date(`${key}T00:00:00`);
  const code = dayCode(date);
  const day = code === "SAT" || code === "SUN" ? null : code;
  const events = (groupByDate(allEvents)[key] ?? []).filter((event) => event.category !== "term" || !/주차 종료/.test(event.title));
  const holiday = events.find((event) => event.category === "holiday");
  const stretch = stretchOn(key);
  const week = weekOf(data, stuId);

  let offReason: OffReason | null = null;
  let offLabel: string | null = null;
  if (stretch?.vacation) {
    offReason = "vacation";
    offLabel = stretch.label;
  } else if (day === null) {
    offReason = "weekend";
    offLabel = "주말";
  } else if (holiday) {
    offReason = "holiday";
    offLabel = holiday.title;
  }
  const hasClass = offReason === null && day !== null;
  const breakName = BREAKS.find((item) => minute >= item.start && minute < item.end)?.name ?? null;
  return {
    date: key,
    minute,
    day,
    hasClass,
    offReason,
    offLabel,
    vacation: offReason === "vacation" && stretch ? { label: stretch.label, since: stretch.start, resumesOn: toKey(new Date(`${stretch.end}T00:00:00`)), daysLeft: daysBetween(key, stretch.end) + 1 } : null,
    today: hasClass && day ? week[day] : [],
    week,
    periods: PERIODS,
    breaks: BREAKS,
    events: events.filter((event) => event.title !== ""),
    breakName,
  };
};

export type HomeView = {
  livePeriod: number | null;
  inBreak: boolean;
  breakKind: "이동" | "공강";
  current: TodayClass | null;
  currentPeriods: number[];
  next: TodayClass | null;
  periodLabel: string | null;
  freeMinutes: number;
};

export const deriveHomeView = (home: HomeData): HomeView => {
  const { periods, breaks, minute, today } = home;
  const byPeriod = new Map(periods.map((item) => [item.period, item]));
  const livePeriod = home.hasClass ? (periods.find((item) => minute >= item.start && minute < item.end)?.period ?? null) : null;
  const joined = (a: TodayClass, b: TodayClass, from: number, to: number) => isSameClass(a, b) && isBreakGap(from, to);

  let current = livePeriod !== null ? (today.find((item) => item.period === livePeriod) ?? null) : null;
  let anchor = livePeriod;
  let inBreak = false;

  if (home.hasClass && livePeriod === null) {
    const before = [...periods].reverse().find((item) => item.end <= minute);
    const after = periods.find((item) => item.start > minute);
    const ended = [...(before ? [before.end] : []), ...breaks.filter((item) => item.end <= minute).map((item) => item.end)];
    if (after && ended.length > 0 && isBreakGap(Math.max(...ended), after.start)) inBreak = true;
    if (before && after && isBreakGap(before.end, after.start)) {
      const beforeClass = today.find((item) => item.period === before.period);
      const afterClass = today.find((item) => item.period === after.period);
      if (beforeClass && afterClass && joined(beforeClass, afterClass, before.end, after.start)) {
        current = beforeClass;
        anchor = before.period;
      }
    }
  }

  const currentPeriods: number[] = [];
  if (current && anchor !== null) {
    currentPeriods.push(anchor);
    for (let p = anchor - 1; ; p--) {
      const earlier = today.find((item) => item.period === p);
      const earlierTime = byPeriod.get(p);
      const hereTime = byPeriod.get(p + 1);
      if (!earlier || !earlierTime || !hereTime || !joined(current, earlier, earlierTime.end, hereTime.start)) break;
      currentPeriods.unshift(p);
    }
    for (let p = anchor + 1; ; p++) {
      const later = today.find((item) => item.period === p);
      const earlierTime = byPeriod.get(p - 1);
      const hereTime = byPeriod.get(p);
      if (!later || !earlierTime || !hereTime || !joined(current, later, earlierTime.end, hereTime.start)) break;
      currentPeriods.push(p);
    }
  }

  const next = today.find((item) => !currentPeriods.includes(item.period) && (byPeriod.get(item.period)?.start ?? 0) > minute) ?? null;
  const upcoming = periods.find((item) => item.start > minute) ?? null;
  const breakKind: "이동" | "공강" = inBreak && !current && upcoming && today.some((item) => item.period === upcoming.period) ? "이동" : "공강";

  const periodText = currentPeriods.length > 1 ? `${currentPeriods[0]}–${currentPeriods[currentPeriods.length - 1]}교시` : livePeriod ? `${livePeriod}교시` : home.breakName ? null : breakKind;
  const breakText = home.breakName ?? (inBreak && current ? "쉬는시간" : null);
  const periodLabel = !home.hasClass ? null : [periodText, breakText].filter(Boolean).join(" · ");

  const freeMinutes = today.reduce((sum, item, index) => {
    if (index === 0) return sum;
    const before = today[index - 1]!;
    if (item.period - before.period <= 1) return sum;
    const earlier = byPeriod.get(before.period);
    const here = byPeriod.get(item.period);
    return earlier && here ? sum + (here.start - earlier.end) : sum;
  }, 0);

  return { livePeriod, inBreak, breakKind, current, currentPeriods, next, periodLabel, freeMinutes };
};

export type DayBlock = { klass: TodayClass; periods: number[]; start: PeriodTime; end: PeriodTime };

export const blocksOf = (classes: readonly TodayClass[], periods: readonly PeriodTime[]): DayBlock[] => {
  const byPeriod = new Map(periods.map((item) => [item.period, item]));
  const blocks: DayBlock[] = [];
  for (const klass of [...classes].sort((a, b) => a.period - b.period)) {
    const time = byPeriod.get(klass.period);
    if (!time) continue;
    const last = blocks[blocks.length - 1];
    if (last && continuesClass({ klass: last.klass, period: last.periods[last.periods.length - 1]!, end: last.end.end }, { klass, period: klass.period, start: time.start })) {
      last.periods.push(klass.period);
      last.end = time;
      continue;
    }
    blocks.push({ klass, periods: [klass.period], start: time, end: time });
  }
  return blocks;
};
export const dayBlocks = (home: HomeData) => blocksOf(home.today, home.periods);

export type SubjectSummary = { subject: string; section: string; teacher: string; rooms: string[]; department: string | null; times: { day: Day; periods: number[] }[]; periodCount: number };
export const collectSubjects = (week: Record<Day, TodayClass[]>): SubjectSummary[] => {
  const map = new Map<string, SubjectSummary>();
  for (const day of DAYS) {
    for (const klass of week[day]) {
      const key = `${klass.subject}\u0000${klass.section}`;
      const entry = map.get(key) ?? { subject: klass.subject, section: klass.section, teacher: klass.teacher, rooms: [], department: klass.department, times: [], periodCount: 0 };
      map.set(key, entry);
      if (klass.room && !entry.rooms.includes(klass.room)) entry.rooms.push(klass.room);
      const slot = entry.times.find((time) => time.day === day);
      if (slot) slot.periods.push(klass.period);
      else entry.times.push({ day, periods: [klass.period] });
      entry.periodCount += 1;
    }
  }
  return [...map.values()].sort((a, b) => a.subject.localeCompare(b.subject, "ko"));
};
