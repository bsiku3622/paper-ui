import { termData, TERMS, type Section, type SubjectData, type TermKey } from "../data/build";
import { EXAM_PERIODS, type ExamPeriodRow, type ExamRow } from "../data/generated/exams";
import { termIndex } from "./index";
import { koreanName, sectionNumber, weekdayOf } from "./utils";

export const KIND_LABEL: Record<string, string> = { midterm: "중간고사", final: "기말고사" };

export const PERIODS: readonly ExamPeriodRow[] = [...EXAM_PERIODS].sort((a, b) => a.start.localeCompare(b.start));

const termOf = (period: ExamPeriodRow) => {
  const match = /^(\d{4})-(\d)-/.exec(period.key);
  return match ? TERMS.find((term) => term.year === Number(match[1]) && term.semester === Number(match[2])) : undefined;
};

export const periodsOf = (term: TermKey): ExamPeriodRow[] =>
  PERIODS.filter((period) => {
    const owner = termOf(period);
    return owner !== undefined && owner.year === term.year && owner.semester === term.semester;
  });

const parts = (key: string) => key.split("-").map(Number) as [number, number, number];
const dayNumber = (key: string) => {
  const [year, month, day] = parts(key);
  return Date.UTC(year, month - 1, day) / 86_400_000;
};
export const daysBetween = (from: string, to: string) => dayNumber(to) - dayNumber(from);
export const monthDay = (key: string) => `${parts(key)[1]}월 ${parts(key)[2]}일`;
export const dayLabel = (key: string) => `${monthDay(key)} (${weekdayOf(key)})`;
export const rangeLabel = (period: ExamPeriodRow) => `${dayLabel(period.start)} – ${dayLabel(period.end)}`;

type Rule = readonly [room: string, sections: readonly string[]];

export type MyExam = {
  key: string;
  subject: string;
  topic: string | null;
  ec: boolean;
  date: string | null;
  start: number | null;
  end: number | null;
  section: string;
  teacher: string;
  room: string | null;
  rules: string;
  split: boolean;
  ambiguous: boolean;
  note: string | null;
};

export type MyExams = {
  period: ExamPeriodRow;
  exams: MyExam[];
  missing: string[];
  subjects: number;
};

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

export const ruleText = (rules: readonly Rule[]) =>
  uniqueRules(rules)
    .map(([room, sections]) => (sections.length > 0 ? `${room}(${sections.join(",")}반)` : room))
    .join(" ");

export const roomFor = (rules: readonly Rule[], section: string): string | null => {
  const all = uniqueRules(rules);
  const first = all[0];
  if (!first) return null;
  if (all.length === 1 && first[1].length === 0) return first[0];
  const rooms = new Set(all.filter(([, sections]) => sections.includes(section)).map(([room]) => room));
  return rooms.size === 1 ? [...rooms][0]! : null;
};

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

export type ExamDay = { date: string; exams: MyExam[] };

export const examDays = (period: ExamPeriodRow, exams: readonly MyExam[]): ExamDay[] => {
  const days: ExamDay[] = [];
  for (let stamp = Date.parse(`${period.start}T00:00:00Z`); stamp <= Date.parse(`${period.end}T00:00:00Z`); stamp += 86_400_000) {
    const date = new Date(stamp).toISOString().slice(0, 10);
    days.push({ date, exams: exams.filter((exam) => exam.date === date).sort((a, b) => (a.start ?? 0) - (b.start ?? 0)) });
  }
  return days;
};

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

export type Countdown =
  | { kind: "ahead"; days: number; exam: MyExam }
  | { kind: "today"; exam: MyExam }
  | { kind: "over"; since: number }
  | { kind: "none" };

export const countdown = (exams: readonly MyExam[], now: { key: string; minute: number }): Countdown => {
  const dated = exams.filter((exam): exam is MyExam & { date: string } => exam.date !== null).sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? 0) - (b.start ?? 0));
  const next = dated.find((exam) => exam.date > now.key || (exam.date === now.key && (exam.end ?? 0) > now.minute));
  if (next) return next.date === now.key ? { kind: "today", exam: next } : { kind: "ahead", days: daysBetween(now.key, next.date), exam: next };
  const last = dated[dated.length - 1];
  return last ? { kind: "over", since: daysBetween(last.date, now.key) } : { kind: "none" };
};
