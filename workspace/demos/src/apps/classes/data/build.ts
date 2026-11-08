// The term's data, made up and seeded: which subjects are offered, who teaches the sections, when and where they meet,
// and which (invented) students sit in them. The same seed always makes the same school.
//
// The shape follows what the real app downloads per term: a list of subjects, each with sections, each with a roster.

import { pick, random, shuffle } from "../../../kit";
import { courseOf, DEPARTMENT_ORDER } from "./catalog";
import { DAYS, type Day } from "./periods";
import { makeNames, ME, type Student } from "./people";

export type SectionTime = { day: Day; period: number; room: string };
export type Section = { id: number; section: string; teacher: string; room: string; students: Student[]; times: SectionTime[] };
export type SubjectData = {
  subject: string;
  subjectId: number;
  english: string;
  isEc: boolean;
  credits: number | null;
  pf: boolean;
  department: string | null;
  category: string | null;
  sections: Section[];
  studentCount: number;
};
export type TermKey = { year: number; semester: number };
export type TermData = { term: TermKey; subjects: SubjectData[]; students: Student[]; cohorts: Record<string, number> };

export const termLabel = (term: TermKey) => `${term.year}-${term.semester}`;
export const TERMS: readonly TermKey[] = [
  { year: 2026, semester: 2 },
  { year: 2026, semester: 1 },
];

// ── what is offered, and who takes it ────────────────────────────────────────
// subject, then the share of each cohort (23, 24, 25, 26) that takes it this term.
type Row = readonly [string, number, number, number, number];

const OFFERED_FALL: readonly Row[] = [
  // 1학년 필수
  ["국어2", 0, 0, 0, 1], ["수학2", 0, 0, 0, 1], ["영어Ⅱ", 0, 0, 0, 1], ["정보과학2", 0, 0, 0, 1], ["화학및실험", 0, 0, 0, 1], ["한국사의이해", 0, 0, 0, 1], ["음악", 0, 0, 0, 1], ["체육2", 0, 0, 0, 1],
  // 2학년
  ["미적분학1", 0, 0.1, 0.42, 0], ["미적분학2(EC)", 0, 0.12, 0.3, 0], ["선형대수(EC)", 0, 0.1, 0.26, 0], ["확률및통계", 0, 0.28, 0.1, 0], ["문학", 0, 0.05, 0.6, 0], ["세계사의이해", 0, 0.05, 0.58, 0],
  ["체육4", 0, 0, 0.9, 0], ["정보과학3", 0, 0.05, 0.46, 0], ["자료구조", 0.05, 0.1, 0.26, 0], ["일반지구과학", 0, 0.08, 0.3, 0], ["일반지구과학실험", 0, 0.08, 0.26, 0],
  ["물리학및실험2", 0, 0.05, 0.36, 0], ["일반물리학1", 0, 0.28, 0.08, 0], ["일반물리학실험1", 0, 0.26, 0.07, 0], ["일반화학1", 0, 0.26, 0.12, 0], ["일반화학실험1", 0, 0.24, 0.1, 0],
  ["일반생물학1", 0, 0.14, 0.1, 0], ["일반생물학실험", 0, 0.12, 0.08, 0], ["생활음악", 0, 0.1, 0.34, 0], ["영어Ⅲ", 0, 0.05, 0.38, 0], ["정치와경제", 0, 0.06, 0.3, 0], ["철학", 0.08, 0.1, 0.24, 0],
  ["융합특강", 0, 0.12, 0.34, 0], ["창의공학", 0, 0.05, 0.1, 0.08],
  // 3학년과 그 위
  ["알고리즘", 0.1, 0.34, 0.06, 0], ["이산구조", 0.08, 0.3, 0.05, 0], ["고급알고리즘", 0.3, 0.1, 0, 0], ["미적분학3", 0.05, 0.3, 0.08, 0], ["기초해석학", 0.06, 0.14, 0.04, 0], ["수학특강", 0.3, 0.1, 0, 0],
  ["정보과학특강", 0.25, 0.08, 0, 0], ["물리학세미나", 0.2, 0.08, 0, 0], ["위상수학", 0.1, 0.04, 0, 0], ["중국언어와문화", 0.08, 0.2, 0.08, 0], ["일본언어와문화", 0.2, 0.12, 0.05, 0],
  ["글로벌문화와영어", 0.1, 0.26, 0.04, 0], ["소통과화법", 0.08, 0.2, 0.04, 0], ["비판적사고와토론", 0.1, 0.18, 0.05, 0], ["뉴스와미디어", 0.05, 0.16, 0.05, 0], ["생활체육2", 0.3, 0.3, 0, 0],
  ["지질학", 0.05, 0.14, 0.06, 0], ["해양학", 0.05, 0.12, 0.05, 0], ["별과우주", 0.04, 0.12, 0.08, 0], ["날씨와기후", 0.06, 0.15, 0.06, 0], ["법과학", 0.04, 0.1, 0.06, 0], ["우주생물학", 0.03, 0.1, 0.05, 0],
  ["수학적모델링", 0.05, 0.16, 0.05, 0], ["창의적문제해결기법", 0.1, 0.2, 0.05, 0], ["기초유기화학", 0.05, 0.12, 0.04, 0], ["기초전자기학", 0.05, 0.12, 0.04, 0], ["탐구물리", 0.04, 0.12, 0.05, 0],
  ["감염과면역", 0.04, 0.1, 0.04, 0], ["유전자의이해", 0.04, 0.1, 0.04, 0], ["디지털경제", 0.1, 0.14, 0.05, 0], ["그림,음악,영화로보는세계사", 0.05, 0.1, 0.05, 0.02], ["수학과예술", 0.04, 0.1, 0.05, 0],
  ["생물정보학입문", 0.03, 0.08, 0.04, 0], ["역사속의물리학", 0.03, 0.08, 0.04, 0], ["화학과예술", 0.03, 0.08, 0.04, 0], ["창의융합디자인", 0.04, 0.06, 0.08, 0.06],
];

const OFFERED_SPRING: readonly Row[] = [
  ["국어1", 0, 0, 0, 1], ["수학1", 0, 0, 0, 1], ["영어Ⅰ", 0, 0, 0, 1], ["정보과학1", 0, 0, 0, 1], ["물리학및실험1", 0, 0, 0, 1], ["미술", 0, 0, 0, 1], ["체육1", 0, 0, 0, 1],
  ["수학2", 0, 0, 0.05, 0], ["미적분학1", 0, 0.05, 0.3, 0], ["미적분학2(EC)", 0, 0.2, 0.2, 0], ["선형대수(EC)", 0, 0.2, 0.2, 0], ["논리와글쓰기", 0, 0.05, 0.6, 0], ["영어Ⅲ", 0, 0.05, 0.5, 0], ["정치와경제", 0, 0.1, 0.4, 0],
  ["철학", 0, 0.1, 0.4, 0], ["체육3", 0, 0, 0.9, 0], ["정보과학3", 0, 0.1, 0.4, 0], ["자료구조", 0.05, 0.1, 0.35, 0], ["프로그래밍과문제해결(EC)", 0, 0.1, 0.3, 0], ["일반지구과학", 0, 0.1, 0.2, 0], ["물리학및실험2", 0, 0.05, 0.3, 0],
  ["일반물리학1", 0, 0.25, 0.1, 0], ["일반물리학2", 0.1, 0.2, 0, 0], ["일반화학1", 0, 0.25, 0.1, 0], ["일반화학2", 0.1, 0.2, 0, 0], ["일반생물학1", 0, 0.2, 0.1, 0], ["일반생물학2", 0.1, 0.15, 0, 0],
  ["알고리즘", 0.1, 0.3, 0.1, 0], ["이산구조", 0.1, 0.3, 0.05, 0], ["확률및통계", 0.05, 0.3, 0.08, 0], ["고급알고리즘", 0.3, 0.1, 0, 0], ["수학특강", 0.2, 0.1, 0, 0], ["생활체육1", 0.3, 0.3, 0, 0],
  ["디지털경제", 0.1, 0.2, 0.05, 0], ["중국언어와문화", 0.1, 0.2, 0.05, 0], ["융합특강", 0, 0.1, 0.3, 0], ["지질학", 0.05, 0.1, 0.05, 0], ["날씨와기후", 0.05, 0.1, 0.05, 0], ["기초해석학", 0.05, 0.12, 0.05, 0],
];

// A lecture and its lab are taken together.
const LABS: Record<string, string> = { 일반지구과학: "일반지구과학실험", 일반물리학1: "일반물리학실험1", 일반물리학2: "일반물리학실험2", 일반화학1: "일반화학실험1", 일반화학2: "일반화학실험2", 일반생물학1: "일반생물학실험" };

const SIZE: Record<string, number> = { "23": 22, "24": 50, "25": 54, "26": 48 };
const FIRST: Record<string, number> = { "23": 311, "24": 321, "25": 301, "26": 301 };

// ── rooms ────────────────────────────────────────────────────────────────────
export const CLASSROOMS = [3202, 3203, 3204, 3205, 3206, 3207, 3302, 3303, 3304, 3305, 3306, 3307, 3402, 3403, 3404, 3405, 3406, 3407].map((number) => `형${number}`);
const ROOMS: Record<string, readonly string[]> = {
  수학: ["형3402", "형3403", "형3404", "형3405", "형3406", "형3407"],
  정보과학: ["창5701", "창5702", "창5703", "창5704"],
  물리학: ["탐2401", "탐2402", "탐2405", "탐2406"],
  화학: ["탐3201", "탐3202", "탐3203", "탐3204"],
  생물학: ["탐3301", "탐3302", "탐3303"],
  지구과학: ["탐2403", "탐2404", "탐2405"],
  국어: ["형3302", "형3303", "형3304"],
  사회: ["형3204", "형3205", "형3206"],
  외국어: ["형3202", "형3203", "형3305", "형3306", "형3307"],
  예체능: ["예6202", "예6203", "예6301"],
  융합: ["형3302", "형3304", "형3306", "형3207"],
};
const PE_ROOMS = ["운동장", "체육관"];
const OPEN_ROOMS = new Set(PE_ROOMS);

// ── time ─────────────────────────────────────────────────────────────────────
const SINGLE_STARTS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const DOUBLE_STARTS = [1, 2, 3, 5, 6, 7, 8];
const LAB_STARTS = [10, 10, 5, 7, 2, 6];

type Block = { day: Day; start: number; length: number; room: string };

const partition = (r: () => number, credits: number, lab: boolean): number[] => {
  if (lab) return [2];
  if (credits >= 4) return pick(r, [[1, 1, 1, 1], [2, 1, 1], [2, 2], [1, 1, 1, 1]]);
  if (credits === 3) return pick(r, [[1, 1, 1], [2, 1], [1, 1, 1]]);
  if (credits === 2) return pick(r, [[2], [1, 1], [2]]);
  return [1];
};

// Sections that are drawn by hand so the demo account's week reads well (a Wednesday 5–6교시 double, a room change after it).
type Designed = { section: number; teacher?: string; blocks: readonly [Day, number, number, string][] };
const DESIGNED: Record<string, Designed> = {
  "미적분학2(EC)": { section: 2, blocks: [["MON", 2, 1, "형3407"], ["WED", 2, 1, "형3407"], ["THU", 5, 1, "형3407"], ["FRI", 1, 1, "형3407"]] },
  "선형대수(EC)": { section: 1, blocks: [["TUE", 2, 2, "형3402"], ["MON", 5, 1, "형3402"]] },
  정보과학3: { section: 2, blocks: [["TUE", 4, 1, "창5702"], ["THU", 6, 1, "창5702"], ["WED", 9, 1, "창5702"]] },
  일반지구과학: { section: 3, blocks: [["WED", 5, 2, "탐2405"], ["TUE", 9, 1, "탐2405"]] },
  일반지구과학실험: { section: 3, blocks: [["MON", 10, 2, "탐2405"]] },
  세계사의이해: { section: 5, blocks: [["WED", 3, 1, "형3205"], ["FRI", 6, 1, "형3205"]] },
  문학: { section: 2, blocks: [["THU", 7, 2, "형3204"]] },
  체육4: { section: 3, blocks: [["THU", 3, 1, "운동장"]] },
  융합특강: { section: 1, blocks: [["TUE", 7, 1, "형3302"], ["FRI", 8, 2, "형3302"]] },
  생활음악: { section: 3, blocks: [["TUE", 10, 2, "예6202"]] },
};
const ME_SUBJECTS = ["미적분학2(EC)", "선형대수(EC)", "정보과학3", "일반지구과학", "일반지구과학실험", "세계사의이해", "문학", "체육4", "융합특강", "생활음악"];

export const subjectBase = (subject: string) => (subject.endsWith("(EC)") ? subject.slice(0, -4) : subject);
const courseFor = (subject: string) => courseOf(subject) ?? courseOf(subjectBase(subject));

// ── the build ────────────────────────────────────────────────────────────────
export const buildTerm = (term: TermKey): TermData => {
  const fall = term.semester === 2;
  const seed = `classes:${term.year}-${term.semester}`;
  const r = random(seed);
  const offered = fall ? OFFERED_FALL : OFFERED_SPRING;
  const taken = new Set<string>([ME.name]);

  // people
  const students: Student[] = [ME];
  const cohorts: Record<string, number> = {};
  const roster: Record<string, Student[]> = {};
  for (const cohort of ["23", "24", "25", "26"]) {
    const count = SIZE[cohort]!;
    const names = makeNames(`${seed}:students:${cohort}`, count, taken);
    const list: Student[] = names.map((name, index) => ({ stuId: `${cohort}-${FIRST[cohort]! + index}`, name }));
    roster[cohort] = cohort === "25" ? [ME, ...list.filter((item) => item.stuId !== ME.stuId).slice(0, count - 1)] : list;
    for (const student of roster[cohort]!) if (student.stuId !== ME.stuId) students.push(student);
    cohorts[cohort] = roster[cohort]!.length;
  }

  // who takes what
  const picks = new Map<string, string[]>();
  const rolls = random(`${seed}:picks`);
  const cohortIndex = { "23": 1, "24": 2, "25": 3, "26": 4 } as const;
  for (const cohort of ["23", "24", "25", "26"] as const) {
    for (const student of roster[cohort]!) {
      if (student.stuId === ME.stuId) {
        picks.set(student.stuId, fall ? ME_SUBJECTS : offered.filter((row) => row[3] > 0.25 && row[3] < 1).slice(0, 8).map((row) => row[0]));
        continue;
      }
      const list: string[] = [];
      for (const row of offered) {
        const weight = row[cohortIndex[cohort]];
        if (weight > 0 && rolls() < weight) {
          list.push(row[0]);
          const lab = LABS[row[0]];
          if (lab && offered.some((item) => item[0] === lab) && rolls() < 0.88) list.push(lab);
        }
      }
      picks.set(student.stuId, [...new Set(list)]);
    }
  }
  const demand = new Map<string, number>();
  for (const list of picks.values()) for (const name of list) demand.set(name, (demand.get(name) ?? 0) + 1);

  // teachers
  const perDepartment: Record<string, number> = { 수학: 6, 정보과학: 4, 물리학: 5, 화학: 4, 생물학: 4, 지구과학: 4, 국어: 4, 사회: 3, 외국어: 5, 예체능: 3, 융합: 2 };
  const teacherNames = makeNames(`${seed}:teachers`, Object.values(perDepartment).reduce((sum, n) => sum + n, 0), taken);
  const teachers: Record<string, string[]> = {};
  let cursor = 0;
  for (const department of DEPARTMENT_ORDER) {
    teachers[department] = teacherNames.slice(cursor, cursor + (perDepartment[department] ?? 0));
    cursor += perDepartment[department] ?? 0;
  }

  // sections: place each subject's meetings so that no room and no teacher is booked twice
  const roomBusy = new Set<string>();
  const teacherBusy = new Set<string>();
  const free = (room: string, teacher: string, day: Day, start: number, length: number) => {
    for (let p = start; p < start + length; p++) {
      if (!OPEN_ROOMS.has(room) && roomBusy.has(`${room}|${day}-${p}`)) return false;
      if (teacherBusy.has(`${teacher}|${day}-${p}`)) return false;
    }
    return true;
  };
  const take = (room: string, teacher: string, day: Day, start: number, length: number) => {
    for (let p = start; p < start + length; p++) {
      roomBusy.add(`${room}|${day}-${p}`);
      teacherBusy.add(`${teacher}|${day}-${p}`);
    }
  };
  // hand-made sections claim their rooms first
  if (fall) {
    for (const [subject, designed] of Object.entries(DESIGNED)) {
      const teacher = `designed:${subject}`;
      for (const [day, start, length, room] of designed.blocks) take(room, teacher, day, start, length);
    }
  }

  const subjects: SubjectData[] = [];
  let sectionId = 1000;
  let subjectId = 500;
  const ordered = [...offered].sort((a, b) => (demand.get(b[0]) ?? 0) - (demand.get(a[0]) ?? 0));
  const built = new Map<string, SubjectData>();
  for (const row of ordered) {
    const name = row[0];
    const total = demand.get(name) ?? 0;
    if (total === 0) continue;
    const course = courseFor(name);
    const department = course?.department ?? "융합";
    const credits = course?.credits ?? 3;
    const lab = name.includes("실험") && credits <= 2;
    const designed = fall ? DESIGNED[name] : undefined;
    const count = Math.max(designed?.section ?? 1, Math.min(5, Math.max(1, Math.round(total / 18))));
    const physical = name.startsWith("체육") || name.startsWith("생활체육");
    const pool = physical ? PE_ROOMS : (ROOMS[department] ?? CLASSROOMS);
    const teacherPool = shuffle(r, teachers[department] ?? teacherNames);
    const sections: Section[] = [];
    for (let index = 1; index <= count; index++) {
      const teacher = teacherPool[(index - 1) % teacherPool.length]!;
      const times: SectionTime[] = [];
      if (designed && designed.section === index) {
        for (const [day, start, length, room] of designed.blocks) for (let p = start; p < start + length; p++) times.push({ day, period: p, room });
        const lead = pick(r, teacherPool);
        sections.push({ id: sectionId++, section: `${index}분반`, teacher: designed.teacher ?? lead, room: designed.blocks[0]![3], students: [], times });
        continue;
      }
      const days = new Set<Day>();
      for (const length of partition(r, credits, lab)) {
        let block: Block | null = null;
        for (let attempt = 0; attempt < 160 && !block; attempt++) {
          const day = pick(r, DAYS.filter((item) => !days.has(item)));
          const start = lab ? pick(r, LAB_STARTS) : length === 2 ? pick(r, DOUBLE_STARTS) : pick(r, SINGLE_STARTS);
          const room = attempt < 80 ? pick(r, pool) : pick(r, CLASSROOMS);
          if (free(room, teacher, day, start, length)) block = { day, start, length, room };
        }
        if (!block) continue;
        days.add(block.day);
        take(block.room, teacher, block.day, block.start, block.length);
        for (let p = block.start; p < block.start + block.length; p++) times.push({ day: block.day, period: p, room: block.room });
      }
      times.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.period - b.period);
      sections.push({ id: sectionId++, section: `${index}분반`, teacher, room: times[0]?.room ?? pool[0]!, students: [], times });
    }
    const data: SubjectData = {
      subject: name,
      subjectId: subjectId++,
      english: course?.english ?? "",
      isEc: name.endsWith("(EC)"),
      credits: course?.credits ?? null,
      pf: course?.pf ?? false,
      department: course?.department ?? null,
      category: course?.category ?? null,
      sections,
      studentCount: 0,
    };
    built.set(name, data);
  }

  // enrolment: students in a fixed order (the demo account first). A student tries a few orders of what they want and keeps
  // the one that fits the most; each subject takes the least full section that does not overlap what is already chosen.
  const order = [ME, ...students.filter((student) => student.stuId !== ME.stuId)];
  for (const student of order) {
    const designedWeek = student.stuId === ME.stuId && fall;
    const plan = (names: readonly string[]) => {
      const taken = new Set<string>();
      const chosen: Section[] = [];
      for (const name of names) {
        const data = built.get(name);
        if (!data) continue;
        const designed = designedWeek ? DESIGNED[name] : undefined;
        const candidates = designed ? data.sections.filter((section) => section.id === data.sections[designed.section - 1]?.id) : [...data.sections].sort((a, b) => a.students.length - b.students.length);
        const fit = candidates.find((section) => section.times.every((time) => !taken.has(`${time.day}-${time.period}`)));
        if (!fit) continue;
        chosen.push(fit);
        for (const time of fit.times) taken.add(`${time.day}-${time.period}`);
      }
      return chosen;
    };
    const wanted = picks.get(student.stuId) ?? [];
    let best = plan(wanted);
    if (!designedWeek) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const alternative = plan(shuffle(r, wanted));
        if (alternative.length > best.length) best = alternative;
      }
    }
    for (const section of best) section.students.push(student);
  }

  for (const data of built.values()) {
    data.sections = data.sections.filter((section) => section.students.length > 0);
    data.studentCount = new Set(data.sections.flatMap((section) => section.students.map((student) => student.stuId))).size;
    if (data.sections.length > 0) subjects.push(data);
  }
  subjects.sort((a, b) => a.subject.localeCompare(b.subject, "ko"));
  return { term, subjects, students: order.filter((student) => subjects.some((data) => data.sections.some((section) => section.students.some((item) => item.stuId === student.stuId)))), cohorts };
};

const CACHE = new Map<string, TermData>();
export const termData = (term: TermKey): TermData => {
  const key = termLabel(term);
  const found = CACHE.get(key);
  if (found) return found;
  const made = buildTerm(term);
  CACHE.set(key, made);
  return made;
};
