// Curriculum arithmetic: what a course needs, where a person stands, and how one department's courses fall into columns.
// Pure functions over data/catalog, shared by 자몽 and by anything else that asks "can I take this yet?":
//
//   · prerequisites — who needs whom (택일 = one of several), whether a set of taken courses satisfies a course, which earlier
//     courses must have been taken because a later one was (inferred), and the state of a course for a person;
//   · graduation — credits by strand (자연과학 · 인문사회 · 융합 · EC) against REQUIREMENTS, GPA on the 4.3 scale;
//   · 자몽's workbook — the term slots, the record of one card (term · grade · EC), the roadmap summary;
//   · the board — a department's courses by prerequisite depth, laid out with lib/graph.

import { COURSES, COURSE_BY_NAME, DEPARTMENT_ORDER, GRADE_POINTS, PREREQUISITES, REQUIREMENTS, type Category, type Course, type Prereq } from "../data/catalog";
import { layoutGraph } from "./graph";
import { initials, normalize } from "./search";

// ── names ────────────────────────────────────────────────────────────────────

// The catalogue spells the four courses that also run in English "미적분학2(EC)"; a person reads (and an exam lists) the plain name.
export const displayName = (name: string) => name.replace(/\(EC\)$/, "");

// ── prerequisites ────────────────────────────────────────────────────────────

export type PrereqIndex = ReadonlyMap<string, readonly Prereq[]>;

// course → the edges that lead into it
export const buildPrereqIndex = (edges: readonly Prereq[]): PrereqIndex => {
  const index = new Map<string, Prereq[]>();
  for (const edge of edges) index.set(edge.after, [...(index.get(edge.after) ?? []), edge]);
  return index;
};

// course → the courses that list it as a prerequisite
export const buildUnlockIndex = (edges: readonly Prereq[]): ReadonlyMap<string, readonly string[]> => {
  const index = new Map<string, string[]>();
  for (const edge of edges) index.set(edge.before, [...(index.get(edge.before) ?? []), edge.after]);
  return index;
};

export const PREREQ_INDEX = buildPrereqIndex(PREREQUISITES);
export const UNLOCK_INDEX = buildUnlockIndex(PREREQUISITES);

// A course whose prerequisites are all taken, where 택일 edges need only one of them: 예술속의물리 ← (물리학및실험2 또는
// 일반물리학2), 법과학 ← 화학및실험 + 생물학및실험.
export const prereqSatisfied = (course: string, taken: ReadonlySet<string>, index: PrereqIndex = PREREQ_INDEX) => {
  const edges = index.get(course);
  if (!edges || edges.length === 0) return true;
  const required = edges.filter((edge) => !edge.alternative);
  const optional = edges.filter((edge) => edge.alternative);
  if (!required.every((edge) => taken.has(edge.before))) return false;
  return optional.length === 0 || optional.some((edge) => taken.has(edge.before));
};

// Courses that are not on record but must have been taken: the prerequisites, and theirs in turn, of what is. A 택일 edge says
// nothing about which one was taken, so it infers nothing.
export const inferPrereqs = (taken: ReadonlySet<string>, index: PrereqIndex = PREREQ_INDEX): Set<string> => {
  const inferred = new Set<string>();
  const queue = [...taken];
  while (queue.length > 0) {
    const name = queue.pop()!;
    for (const edge of index.get(name) ?? []) {
      if (edge.alternative || taken.has(edge.before) || inferred.has(edge.before)) continue;
      inferred.add(edge.before);
      queue.push(edge.before);
    }
  }
  return inferred;
};

export type CourseState = "taken" | "current" | "inferred" | "available" | "locked";
export const COURSE_STATE_LABEL: Record<CourseState, string> = { taken: "이수", current: "수강 중", inferred: "이수 추정", available: "수강 가능", locked: "선수 미이수" };

// A course being taken now counts as satisfying its successors' prerequisites: the point of looking is to plan the next term.
export const courseState = (course: string, taken: ReadonlySet<string>, current: ReadonlySet<string>, inferred: ReadonlySet<string>, index: PrereqIndex = PREREQ_INDEX): CourseState => {
  if (current.has(course)) return "current";
  if (taken.has(course)) return "taken";
  if (inferred.has(course)) return "inferred";
  return prereqSatisfied(course, new Set([...taken, ...inferred, ...current]), index) ? "available" : "locked";
};

// A course's name for a sentence about `home`'s department: a course of another department says which ("미적분학1(수학)").
const nameIn = (course: string, home?: string) => {
  const other = COURSE_BY_NAME.get(course);
  return `${displayName(course)}${home && other && other.department !== home ? `(${other.department})` : ""}`;
};

// "수학2" · "미적분학1, 선형대수" · "화학및실험, 생물학및실험" · "(물리학및실험2 또는 일반물리학2)" — a course's prerequisites in words.
export const prereqWords = (name: string, home?: string): string => {
  const edges = PREREQ_INDEX.get(name) ?? [];
  const required = edges.filter((edge) => !edge.alternative).map((edge) => nameIn(edge.before, home));
  const optional = edges.filter((edge) => edge.alternative).map((edge) => nameIn(edge.before, home));
  const either = optional.length > 1 ? `(${optional.join(" 또는 ")})` : optional.join("");
  return [...required, ...(either ? [either] : [])].join(", ");
};

// The courses that list `name` as a prerequisite.
export const unlocksOf = (name: string, home?: string): string[] => (UNLOCK_INDEX.get(name) ?? []).map((course) => nameIn(course, home));

// ── grades and credits ───────────────────────────────────────────────────────

const round2 = (value: number) => Math.round(value * 100) / 100;

export type Gpa = {
  overall: number | null;
  natural: number | null;
  // credits that the figure rests on
  gradedCredits: number;
  // taken, graded courses (not P/F) that still have no grade
  missing: number;
};

// Only graded courses count. A P/F course has no grade to count even if one is written, and a course with no grade yet is left out
// rather than counted as zero.
export const computeGpa = (items: readonly { course: Course; grade: string | null }[], points: Record<string, number> = GRADE_POINTS): Gpa => {
  let sum = 0;
  let credits = 0;
  let naturalSum = 0;
  let naturalCredits = 0;
  let missing = 0;
  for (const { course, grade } of items) {
    if (course.pf) continue;
    const point = grade ? points[grade] : undefined;
    if (point === undefined) {
      missing += 1;
      continue;
    }
    sum += point * course.credits;
    credits += course.credits;
    if (course.category === "natural") {
      naturalSum += point * course.credits;
      naturalCredits += course.credits;
    }
  }
  return { overall: credits ? round2(sum / credits) : null, natural: naturalCredits ? round2(naturalSum / naturalCredits) : null, gradedCredits: credits, missing };
};

export type Requirement = { key: string; label: string; earned: number; required: number; met: boolean };

export type Progress = {
  total: number;
  ap: number;
  ec: number;
  byCategory: Record<Category, number>;
  // 자연과학 · 인문사회 · 융합 · EC · 계
  requirements: Requirement[];
  ready: boolean;
};

const STRAND_LABEL: Record<string, string> = { natural: "자연과학", humanities: "인문사회", convergence: "융합", ec: "EC", total: "계" };

// Credits towards graduation. An EC credit is one earned in the English class, which is a fact about the card, not the course.
export const computeProgress = (taken: readonly { course: Course; ec: boolean }[], requirements: Record<string, number> = REQUIREMENTS): Progress => {
  const byCategory: Record<Category, number> = { natural: 0, humanities: 0, convergence: 0 };
  let total = 0;
  let ap = 0;
  let ec = 0;
  for (const { course, ec: english } of taken) {
    byCategory[course.category] += course.credits;
    total += course.credits;
    ap += course.apCredits;
    if (english) ec += course.credits;
  }
  const strands = ["natural", "humanities", "convergence"] as const;
  const wanted = (key: string) => (key === "total" ? strands.reduce((sum, strand) => sum + (requirements[strand] ?? 0), 0) : (requirements[key] ?? 0));
  const earned = (key: string) => (key === "ec" ? ec : key === "total" ? total : (byCategory[key as Category] ?? 0));
  const rows = [...strands, "ec", "total"].map((key): Requirement => ({ key, label: STRAND_LABEL[key] ?? key, earned: earned(key), required: wanted(key), met: earned(key) >= wanted(key) }));
  return { total, ap, ec, byCategory, requirements: rows, ready: rows.every((row) => row.met) };
};

// ── 자몽's workbook ──────────────────────────────────────────────────────────

// Not the calendar's term but the nth semester since admission; "S" is a summer or winter term. There are eight places for six
// semesters, because a leave of absence pushes the rest back.
export type TermKey = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "S";
export const TERM_KEYS: readonly TermKey[] = ["1", "2", "3", "4", "5", "6", "7", "8", "S"];
export const REGULAR_TERMS = 6;
export const isTermKey = (value: unknown): value is TermKey => typeof value === "string" && (TERM_KEYS as readonly string[]).includes(value);
export const slotLabel = (key: TermKey) => (key === "S" ? "계절학기" : `${key}학기`);
// 10 to 30 credits in a regular term; a seasonal term has no lower bound
export const TERM_CREDITS = { min: 10, max: 30 } as const;

// The student number starts with the year of admission ("25-307" → 2025); that is all it takes to say which semester a calendar term is.
export const admissionYear = (stuId: string): number | null => {
  const match = /^(\d{2})-/.exec(stuId);
  return match ? 2000 + Number(match[1]) : null;
};
export const termSlotOf = (stuId: string, year: number, semester: number): TermKey | null => {
  const admitted = admissionYear(stuId);
  if (admitted === null) return null;
  const index = (year - admitted) * 2 + semester;
  return index >= 1 && index <= 8 ? (String(index) as TermKey) : null;
};

// One card's record. Choosing the term is what makes it a record: with no term there is nothing to count, and clearing the term
// removes the record. A re-take is choosing the term again, so a course has at most one.
export type ZamongEntry = { term: TermKey; grade: string | null; ec: boolean };
export type ZamongMap = Record<string, ZamongEntry>;

// 시수 outside the classroom, typed by the person: nothing in the school's data says how many.
export type Hours = { selfDev: number; collab: number; global: number };
export const EMPTY_HOURS: Hours = { selfDev: 0, collab: 0, global: 0 };
export const HOUR_LABEL: Record<keyof Hours, string> = { selfDev: "자기계발", collab: "협업", global: "세계시민" };
export const HOUR_REQUIREMENTS = { selfDev: 60, collab: 60, global: 60, total: 270 } as const;

// ── order ────────────────────────────────────────────────────────────────────

// 일반물리학1 and 일반물리학실험1 are taken together: take 실험 out of the name and the other is there (일반생물학실험 → 일반생물학1).
// The catalogue draws the lab as the lecture's successor only because a sheet reads left to right.
export const coRequisitePairs = (names: Iterable<string>): Map<string, string> => {
  const all = new Set(names);
  const pairs = new Map<string, string>();
  for (const name of all) {
    if (!name.includes("실험")) continue;
    const stripped = name.replace("실험", "");
    const partner = all.has(stripped) ? stripped : all.has(`${stripped}1`) ? `${stripped}1` : null;
    if (!partner || partner === name) continue;
    pairs.set(name, partner);
    pairs.set(partner, name);
  }
  return pairs;
};

// The prerequisite depth of every course in `courses`, with a lecture and its lab on the same depth.
const layoutOf = (courses: readonly Course[]) => {
  const pairs = coRequisitePairs(courses.map((course) => course.name));
  const edges = PREREQUISITES.filter((edge) => pairs.get(edge.after) !== edge.before);
  const graph = layoutGraph(courses, edges);
  const depth = new Map(graph.nodes.map((node) => [node.name, node.level]));
  for (const [name, partner] of pairs) {
    const deeper = Math.max(depth.get(name) ?? 0, depth.get(partner) ?? 0);
    depth.set(name, deeper);
    depth.set(partner, deeper);
  }
  return { graph, depth, pairs };
};

const GLOBAL_DEPTH = layoutOf(COURSES).depth;
const DEPARTMENT_RANK = new Map(DEPARTMENT_ORDER.map((name, index) => [name, index]));

// Within a term the courses stand department by department (in the order of the tabs), the ones that others build on first.
export const courseCompare = (a: Course, b: Course) =>
  (DEPARTMENT_RANK.get(a.department) ?? DEPARTMENT_ORDER.length) - (DEPARTMENT_RANK.get(b.department) ?? DEPARTMENT_ORDER.length) ||
  (GLOBAL_DEPTH.get(a.name) ?? 0) - (GLOBAL_DEPTH.get(b.name) ?? 0) ||
  a.name.localeCompare(b.name, "ko");

// ── the roadmap ──────────────────────────────────────────────────────────────

export type RoadmapCourse = { name: string; label: string; ec: boolean };
export type TermSummary = {
  key: TermKey;
  label: string;
  credits: number;
  courses: RoadmapCourse[];
  // inside the 10–30 credit range (an empty term is fine)
  ok: boolean;
  gpa: number | null;
};

export type ZamongSummary = {
  recorded: number;
  terms: TermSummary[];
  progress: Progress;
  hours: Requirement[];
  hoursTotal: number;
  hoursReady: boolean;
  gpa: Gpa;
  ecCourses: RoadmapCourse[];
  ready: boolean;
};

export const summarize = (entries: ZamongMap, hours: Hours): ZamongSummary => {
  const items: { course: Course; entry: ZamongEntry }[] = [];
  for (const [name, entry] of Object.entries(entries)) {
    const course = COURSE_BY_NAME.get(name);
    if (course && isTermKey(entry.term)) items.push({ course, entry });
  }
  items.sort((a, b) => courseCompare(a.course, b.course));
  const label = ({ course, entry }: { course: Course; entry: ZamongEntry }): RoadmapCourse => ({ name: course.name, label: `${displayName(course.name)}${entry.ec ? "(EC)" : ""}`, ec: entry.ec });

  const terms = TERM_KEYS.map((key): TermSummary => {
    const mine = items.filter((item) => item.entry.term === key);
    const credits = mine.reduce((sum, item) => sum + item.course.credits, 0);
    return {
      key,
      label: slotLabel(key),
      credits,
      courses: mine.map(label),
      ok: credits === 0 || (credits <= TERM_CREDITS.max && (key === "S" || credits >= TERM_CREDITS.min)),
      gpa: computeGpa(mine.map((item) => ({ course: item.course, grade: item.entry.grade }))).overall,
    };
  });

  const total = hours.selfDev + hours.collab + hours.global;
  const hourRows: Requirement[] = [
    ...(["selfDev", "collab", "global"] as const).map((key): Requirement => ({ key, label: HOUR_LABEL[key], earned: hours[key], required: HOUR_REQUIREMENTS[key], met: hours[key] >= HOUR_REQUIREMENTS[key] })),
    { key: "total", label: "총 시수", earned: total, required: HOUR_REQUIREMENTS.total, met: total >= HOUR_REQUIREMENTS.total },
  ];
  const progress = computeProgress(items.map(({ course, entry }) => ({ course, ec: entry.ec })));
  const hoursReady = hourRows.every((row) => row.met);
  return {
    recorded: items.length,
    terms,
    progress,
    hours: hourRows,
    hoursTotal: total,
    hoursReady,
    gpa: computeGpa(items.map(({ course, entry }) => ({ course, grade: entry.grade }))),
    ecCourses: items.filter((item) => item.entry.ec).map(label),
    ready: progress.ready && hoursReady,
  };
};

// ── the board ────────────────────────────────────────────────────────────────

export type BoardColumn = { depth: number; courses: Course[] };
export type Board = {
  courses: Course[];
  columns: BoardColumn[];
  // False when no prerequisite joins two courses of the department (융합): a ladder of one column would only be a long list.
  ladder: boolean;
};

const BOARDS = new Map<string, Board>();

// A department's courses by prerequisite depth, left column first, in the order lib/graph puts them (courses whose prerequisites sit
// higher stand higher). A lecture's lab stands right under it.
export const boardOf = (department: string): Board => {
  const cached = BOARDS.get(department);
  if (cached) return cached;
  const courses = COURSES.filter((course) => course.department === department);
  const { graph, depth, pairs } = layoutOf(courses);
  const row = new Map(graph.nodes.map((node) => [node.name, node.y]));
  const byDepth = new Map<number, Course[]>();
  for (const course of courses) byDepth.set(depth.get(course.name) ?? 0, [...(byDepth.get(depth.get(course.name) ?? 0) ?? []), course]);
  const columns = [...byDepth.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([level, list]): BoardColumn => {
      const sorted = [...list].sort((a, b) => (row.get(a.name) ?? 0) - (row.get(b.name) ?? 0) || a.name.localeCompare(b.name, "ko"));
      const placed = new Set<string>();
      const ordered: Course[] = [];
      for (const course of sorted) {
        if (placed.has(course.name)) continue;
        ordered.push(course);
        placed.add(course.name);
        const partner = pairs.get(course.name);
        const mate = partner ? sorted.find((item) => item.name === partner) : undefined;
        if (mate && !placed.has(mate.name)) {
          ordered.push(mate);
          placed.add(mate.name);
        }
      }
      return { depth: level, courses: ordered };
    });
  const board: Board = { courses: columns.flatMap((column) => column.courses), columns, ladder: graph.edges.length > 0 };
  BOARDS.set(department, board);
  return board;
};

// ── finding a course by typing ───────────────────────────────────────────────

const inOrder = (target: string, word: string) => {
  let at = -1;
  for (const char of word) {
    at = target.indexOf(char, at + 1);
    if (at === -1) return false;
  }
  return true;
};

// Courses whose name starts with, contains or loosely spells what was typed (initials work: ㅁㅈㅂㅎ → 미적분학).
export const searchCourses = (query: string, limit = 6): Course[] => {
  const raw = query.trim();
  const word = normalize(raw);
  if (!word) return [];
  const choseong = /^[ㄱ-ㅎ]+$/.test(raw);
  const scored: { course: Course; score: number }[] = [];
  for (const course of COURSES) {
    const name = normalize(displayName(course.name));
    const english = normalize(course.english);
    const score = name.startsWith(word) ? 0 : name.includes(word) || english.includes(word) ? 1 : choseong ? (initials(name).includes(raw) ? 2 : -1) : word.length >= 2 && inOrder(name, word) ? 3 : -1;
    if (score >= 0) scored.push({ course, score });
  }
  return scored.sort((a, b) => a.score - b.score || a.course.name.length - b.course.name.length || a.course.name.localeCompare(b.course.name, "ko")).slice(0, limit).map((item) => item.course);
};
