// 통계 — the numbers of one term, counted from its data. Every function here is pure in (data, cohorts), so the page can
// memoise them; none of them reads the clock or the session.
//
// Students are counted by the cohorts the filter lets through (23/24/25/26학번). Teachers and rooms are counted over the
// whole timetable, as the original does: the filter is about who sits in a class, not about the school's week.

import type { TermData } from "../../data/build";
import { DAYS, PERIODS, slotKey } from "../../data/periods";
import { termIndex } from "../../lib/index";
import { cohortOf, koreanName } from "../../lib/utils";

// Five days of eleven periods: what a room can be used for in a week.
export const WEEK_SLOTS = DAYS.length * PERIODS.length;

// "한지우" → "한지", "남궁별" → "남궁별": the first two syllables of a name, written in a small cell instead of the whole
// name. Students who share a given name ("한지우", "안지우") still differ.
export const shortName = (name: string) => (name.startsWith("남궁") ? name.slice(0, 3) : name.slice(0, 2));

// How many people of each cohort: { "24": 8, "25": 20 }.
export type ByCohort = Record<string, number>;

// "24학번 8명 · 25학번 20명"
export const breakdown = (byCohort: ByCohort) =>
  Object.entries(byCohort)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cohort, count]) => `${cohort}학번 ${count}명`)
    .join(" · ");

// ── students ─────────────────────────────────────────────────────────────────

export type SubjectCount = { subject: string; name: string; students: number; byCohort: ByCohort };

// Every subject somebody of the chosen cohorts takes, the most taken first. A student in two sections counts once.
export const subjectCounts = (data: TermData, years: readonly string[]): SubjectCount[] => {
  const out: SubjectCount[] = [];
  for (const subject of data.subjects) {
    const seen = new Map<string, string>();
    for (const section of subject.sections) {
      for (const student of section.students) {
        const cohort = cohortOf(student.stuId);
        if (years.includes(cohort)) seen.set(student.stuId, cohort);
      }
    }
    if (seen.size === 0) continue;
    const byCohort: ByCohort = {};
    for (const cohort of seen.values()) byCohort[cohort] = (byCohort[cohort] ?? 0) + 1;
    out.push({ subject: subject.subject, name: koreanName(subject.subject), students: seen.size, byCohort });
  }
  return out.sort((a, b) => b.students - a.students || a.name.localeCompare(b.name, "ko"));
};

// "How many have N": one value and the number of people (or teachers) who have exactly it.
export type Bucket = { value: number; count: number; byCohort: ByCohort };

const bucketsOf = (items: readonly { cohort: string; value: number }[]): Bucket[] => {
  const map = new Map<number, Bucket>();
  for (const { cohort, value } of items) {
    const bucket = map.get(value) ?? { value, count: 0, byCohort: {} };
    bucket.count += 1;
    bucket.byCohort[cohort] = (bucket.byCohort[cohort] ?? 0) + 1;
    map.set(value, bucket);
  }
  return [...map.values()].sort((a, b) => a.value - b.value);
};

// Periods a student sits in each week (a period counts once) and subjects a student takes.
export const studentLoads = (data: TermData, years: readonly string[]) => {
  const periods: { cohort: string; value: number }[] = [];
  const subjects: { cohort: string; value: number }[] = [];
  for (const entry of termIndex(data).students.values()) {
    const cohort = cohortOf(entry.stuId);
    if (!years.includes(cohort)) continue;
    periods.push({ cohort, value: new Set(entry.placed.map((placed) => slotKey(placed.day, placed.period))).size });
    subjects.push({ cohort, value: entry.subjects.length });
  }
  return { periods: bucketsOf(periods), subjects: bucketsOf(subjects) };
};

// ── teachers and rooms ───────────────────────────────────────────────────────

export type TeacherLoad = { name: string; periods: number; sections: number };

// Teachers by the periods they teach in a week, the most first.
export const teacherLoads = (data: TermData): TeacherLoad[] =>
  [...termIndex(data).teachers.values()]
    .map((teacher) => ({ name: teacher.name, periods: teacher.placed.length, sections: teacher.sections }))
    .sort((a, b) => b.periods - a.periods || a.name.localeCompare(b.name, "ko"));

// How many teachers teach N periods a week.
export const teacherBuckets = (loads: readonly TeacherLoad[]): Bucket[] => bucketsOf(loads.map((load) => ({ cohort: "", value: load.periods })));

export type RoomUse = { name: string; periods: number; sections: number };

// Rooms by the periods of the week they are used in (a period two classes share counts once), the most first.
export const roomUses = (data: TermData): RoomUse[] => {
  const out: RoomUse[] = [];
  for (const [name, placed] of termIndex(data).rooms) {
    out.push({
      name,
      periods: new Set(placed.map((item) => slotKey(item.day, item.period))).size,
      sections: new Set(placed.map((item) => `${item.subjectId}:${item.section}`)).size,
    });
  }
  return out.sort((a, b) => b.periods - a.periods || a.name.localeCompare(b.name, "ko"));
};
