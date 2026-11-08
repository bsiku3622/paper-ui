// 시험 — the school's exam timetables, and the part of them that is mine. A timetable lists every exam of the school with its
// date, minutes and the rooms by section; "mine" are the exams of the subjects the account takes in that term, matched by name
// (a special course's topic and the "(EC)" of an English class do not change the subject), with the room the section's rule
// names. Where the rule cannot decide, the school's own words are kept rather than a guess.

import { termData, TERMS, type Section, type SubjectData, type TermKey } from "../data/build";
import { EXAM_PERIODS, type ExamPeriodRow, type ExamRow } from "../data/generated/exams";
import { termIndex } from "./index";
import { koreanName, sectionNumber, weekdayOf } from "./utils";

// ── the timetables ───────────────────────────────────────────────────────────

export const KIND_LABEL: Record<string, string> = { midterm: "중간고사", final: "기말고사" };

// Earliest first; the page opens on the latest.
export const PERIODS: readonly ExamPeriodRow[] = [...EXAM_PERIODS].sort((a, b) => a.start.localeCompare(b.start));

// "2026-2-final" → the term 2026-2, if this app has it
const termOf = (period: ExamPeriodRow) => {
  const match = /^(\d{4})-(\d)-/.exec(period.key);
  return match ? TERMS.find((term) => term.year === Number(match[1]) && term.semester === Number(match[2])) : undefined;
};

// The timetables of a term, earliest first (a term that has none says so).
export const periodsOf = (term: TermKey): ExamPeriodRow[] =>
  PERIODS.filter((period) => {
    const owner = termOf(period);
    return owner !== undefined && owner.year === term.year && owner.semester === term.semester;
  });

// ── dates ────────────────────────────────────────────────────────────────────

const parts = (key: string) => key.split("-").map(Number) as [number, number, number];
const dayNumber = (key: string) => {
  const [year, month, day] = parts(key);
  return Date.UTC(year, month - 1, day) / 86_400_000;
};
// the days from `from` to `to`; negative when `to` is earlier
export const daysBetween = (from: string, to: string) => dayNumber(to) - dayNumber(from);
export const monthDay = (key: string) => `${parts(key)[1]}월 ${parts(key)[2]}일`;
export const dayLabel = (key: string) => `${monthDay(key)} (${weekdayOf(key)})`;
export const rangeLabel = (period: ExamPeriodRow) => `${dayLabel(period.start)} – ${dayLabel(period.end)}`;

// ── mine ─────────────────────────────────────────────────────────────────────

type Rule = readonly [room: string, sections: readonly string[]];

export type MyExam = {
  key: string;
  // the subject as a student knows it: "미적분학2", and for a special course its topic apart
  subject: string;
  topic: string | null;
  // the account takes the English class of it
  ec: boolean;
  date: string | null;
  start: number | null;
  end: number | null;
  section: string;
  teacher: string;
  // the room the section's rule names, or null when the rule cannot say
  room: string | null;
  // the school's rule, in its own words: "형3307(1반) 예6202(2,3반)"
  rules: string;
  // more than one room is listed (so the rule text is worth showing beside a decided room)
  split: boolean;
  // Several exams carry the subject's name (a special course with a topic each) and nothing says which is the account's.
  ambiguous: boolean;
  note: string | null;
};

export type MyExams = {
  period: ExamPeriodRow;
  exams: MyExam[];
  // the subjects of the term that have no exam in this timetable
  missing: string[];
  // how many subjects the account takes in the term
  subjects: number;
};

// "융합특강(AI시대의인간기술)" and "융합특강" are the same subject; so are "미적분학2" and "미적분학2(EC)".
const family = (name: string) => name.replace(/\([^()]*\)/g, "").replace(/\s+/g, "");

const uniqueRules = (rules: readonly Rule[]): Rule[] => {
  const seen = new Set<string>();
  return rules.filter(([room, sections]) => {
    const key = `${room}|${sections.join(",")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// 형3307(1반) 예6202(2,3반) — a room alone when the rule has no sections.
export const ruleText = (rules: readonly Rule[]) =>
  uniqueRules(rules)
    .map(([room, sections]) => (sections.length > 0 ? `${room}(${sections.join(",")}반)` : room))
    .join(" ");

// The room of a section: the only room when there is one for everybody, else the one rule that lists the section's number.
export const roomFor = (rules: readonly Rule[], section: string): string | null => {
  const all = uniqueRules(rules);
  const first = all[0];
  if (!first) return null;
  if (all.length === 1 && first[1].length === 0) return first[0];
  const rooms = new Set(all.filter(([, sections]) => sections.includes(section)).map(([room]) => room));
  return rooms.size === 1 ? [...rooms][0]! : null;
};

// Several exams carry one subject's name (Korean and foreign classes, an English one): the account's own is the one that is
// not the foreign class, is the English one if it takes that, or names its section. What cannot be told apart is all kept.
const choose = (candidates: readonly ExamRow[], subject: SubjectData, number: string): ExamRow[] => {
  let list = [...candidates];
  for (const keep of [(exam: ExamRow) => exam.ec === subject.isEc, (exam: ExamRow) => !/foreign/i.test(exam.english), (exam: ExamRow) => exam.rooms.some(([, sections]) => sections.includes(number))]) {
    if (list.length <= 1) break;
    const kept = list.filter(keep);
    if (kept.length > 0) list = kept;
  }
  return list;
};

const topicOf = (subject: string) => {
  const match = /\(([^()]*)\)\s*$/.exec(koreanName(subject));
  return match && match[1] !== "EC" ? match[1]! : null;
};

export const myExams = (period: ExamPeriodRow, stuId: string): MyExams => {
  const term = termOf(period);
  const entry = term ? termIndex(termData(term)).students.get(stuId) : undefined;
  const taken = (entry?.sections ?? []).flatMap(({ subject, sectionId }) => {
    const section = subject.sections.find((item: Section) => item.id === sectionId);
    return section ? [{ subject, section }] : [];
  });
  const used = new Set<string>();
  const exams: MyExam[] = [];
  const missing: string[] = [];
  for (const { subject, section } of taken) {
    const number = sectionNumber(section.section);
    const same = period.exams.filter((exam) => family(exam.subject) === family(subject.subject) && !used.has(exam.key));
    const found = choose(same, subject, number);
    if (found.length === 0) missing.push(subject.subject.replace(/\(EC\)$/, ""));
    for (const exam of found) {
      used.add(exam.key);
      exams.push({
        key: exam.key,
        subject: family(exam.subject),
        topic: topicOf(exam.subject),
        ec: subject.isEc,
        date: exam.date,
        start: exam.start,
        end: exam.end,
        section: section.section,
        teacher: section.teacher,
        room: roomFor(exam.rooms, number),
        rules: ruleText(exam.rooms),
        split: uniqueRules(exam.rooms).length > 1,
        ambiguous: found.length > 1,
        note: exam.note,
      });
    }
  }
  return { period, exams, missing, subjects: taken.length };
};

// ── the week ─────────────────────────────────────────────────────────────────

export type ExamDay = { date: string; exams: MyExam[] };

// Every day from the first to the last of the period, a day without an exam too: the whole week is what is read.
export const examDays = (period: ExamPeriodRow, exams: readonly MyExam[]): ExamDay[] => {
  const days: ExamDay[] = [];
  for (let stamp = Date.parse(`${period.start}T00:00:00Z`); stamp <= Date.parse(`${period.end}T00:00:00Z`); stamp += 86_400_000) {
    const date = new Date(stamp).toISOString().slice(0, 10);
    days.push({ date, exams: exams.filter((exam) => exam.date === date).sort((a, b) => (a.start ?? 0) - (b.start ?? 0)) });
  }
  return days;
};

// Exams of mine that overlap in time: both are kept and both are marked.
export const examConflicts = (exams: readonly MyExam[]): Set<string> => {
  const keys = new Set<string>();
  exams.forEach((a, index) => {
    if (!a.date || a.start === null || a.end === null) return;
    for (const b of exams.slice(index + 1)) {
      if (a.date === b.date && b.start !== null && b.end !== null && a.start < b.end && b.start < a.end) {
        keys.add(a.key);
        keys.add(b.key);
      }
    }
  });
  return keys;
};

// ── how far ──────────────────────────────────────────────────────────────────

export type Countdown =
  | { kind: "ahead"; days: number; exam: MyExam }
  | { kind: "today"; exam: MyExam }
  | { kind: "over"; since: number }
  | { kind: "none" };

// The next of my exams from `now` (a date key and a minute of the day): one still to come today counts as today.
export const countdown = (exams: readonly MyExam[], now: { key: string; minute: number }): Countdown => {
  const dated = exams.filter((exam): exam is MyExam & { date: string } => exam.date !== null).sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? 0) - (b.start ?? 0));
  const next = dated.find((exam) => exam.date > now.key || (exam.date === now.key && (exam.end ?? 0) > now.minute));
  if (next) return next.date === now.key ? { kind: "today", exam: next } : { kind: "ahead", days: daysBetween(now.key, next.date), exam: next };
  const last = dated[dated.length - 1];
  return last ? { kind: "over", since: daysBetween(last.date, now.key) } : { kind: "none" };
};
