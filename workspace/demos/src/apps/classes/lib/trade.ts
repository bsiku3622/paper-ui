// 수강 정정 탐색 — what the trade page knows: given the term's data alone (no seat counts, so only time conflicts are
// judged), which ways are there to change one student's courses? A port of the original tradeEngine over this app's types.
//
// Every judgement is a comparison of slots: "MON-3" is Monday, third period. For each subject the engine lists the
// states it could end in, and finds the combinations in which no slot is used twice:
//
//   keep   not a variable — its slots are fixed, everyone else must stay clear of them
//   move   every section of the subject (or the one the student chose), the current one included
//   drop   nothing
//   add    every section of the subject (or the one chosen); it must be placed
//
// The search is a backtracking over the subjects with the fewest candidates first. A combination in which nothing
// changed is left out, results are sorted by how much they change (moves + drops), and only the first 200 are kept.

import type { Section, SectionTime, SubjectData, TermData } from "../data/build";
import { slotKey } from "../data/periods";
import type { Student } from "../data/people";
import { termIndex } from "./index";
import { initials, normalize } from "./search";
import { compactTimes, koreanName, sectionNumber } from "./utils";

export type SlotKey = string;

export type SectionInfo = {
  id: number;
  subject: string;
  section: string;
  teacher: string;
  room: string;
  times: SectionTime[];
  slots: SlotKey[];
  students: Student[];
  studentCount: number;
  // The subject's credits; null when the catalogue does not know them.
  credits: number | null;
};

export type SubjectIndex = Map<string, SectionInfo[]>;
// stuId → the sections that student sits in.
export type StudentIndex = Map<string, SectionInfo[]>;
export type TradeIndex = { subjects: SubjectIndex; students: StudentIndex };

const numberOf = (section: string) => Number(sectionNumber(section)) || 0;
export const bySubject = (a: { subject: string }, b: { subject: string }) => a.subject.localeCompare(b.subject, "ko");

const toSectionInfo = (subject: SubjectData, section: Section): SectionInfo => ({
  id: section.id,
  subject: subject.subject,
  section: section.section,
  teacher: section.teacher,
  room: section.room,
  times: section.times,
  slots: section.times.map((time) => slotKey(time.day, time.period)),
  students: section.students,
  studentCount: section.students.length,
  credits: subject.credits,
});

const CACHE = new WeakMap<TermData, TradeIndex>();

// Built once per term: the sections of every subject, and the sections of every student (from lib/index's termIndex).
export const buildTradeIndex = (data: TermData): TradeIndex => {
  const found = CACHE.get(data);
  if (found) return found;
  const byId = new Map<number, SectionInfo>();
  const subjects: SubjectIndex = new Map();
  for (const subject of data.subjects) {
    const sections = subject.sections.map((section) => toSectionInfo(subject, section)).sort((a, b) => numberOf(a.section) - numberOf(b.section));
    for (const info of sections) byId.set(info.id, info);
    subjects.set(subject.subject, sections);
  }
  const students: StudentIndex = new Map();
  for (const [stuId, entry] of termIndex(data).students) {
    students.set(stuId, entry.sections.flatMap(({ sectionId }) => byId.get(sectionId) ?? []));
  }
  const index = { subjects, students };
  CACHE.set(data, index);
  return index;
};

// The sections a student sits in, by subject name.
export const getStudentSchedule = (index: TradeIndex, stuId: string): SectionInfo[] => [...(index.students.get(stuId) ?? [])].sort(bySubject);

const conflicts = (slots: readonly SlotKey[], used: ReadonlySet<SlotKey>) => slots.some((slot) => used.has(slot));

// ── what is asked ────────────────────────────────────────────────────────────

// How a subject the student takes is handled; a subject that is not named is kept.
export type PlanAction = "keep" | "move" | "drop";

export type AddSelection = {
  subject: string;
  // One section fixed, or null when any section may do.
  sectionId: number | null;
};

// What the page keeps: what to do with each subject, what to add, where a move should land.
export type PlanState = {
  actions: Record<string, PlanAction>;
  addSelections: AddSelection[];
  // Subject → the section a move should land in; missing or null means "search every section".
  moveTargets: Record<string, number | null>;
};

export type PlanChoice = {
  subject: string;
  // The section taken now; null for a subject that is added.
  from: SectionInfo | null;
  // The section after the change; null for a drop.
  to: SectionInfo | null;
};

export type PlanResult = {
  key: string;
  // Only what changes; a subject that stays is not in the list.
  choices: PlanChoice[];
  moveCount: number;
  dropCount: number;
  addCount: number;
};

export type PlanSearchResult = {
  results: PlanResult[];
  // The search stopped at the cap, with more combinations left.
  truncated: boolean;
  // How many subjects were free to change. Zero means nothing was asked, which is not the same as "no combination".
  variables: number;
};

export const MAX_PLAN_RESULTS = 200;

export type PlanRequest = PlanState & {
  schedule: readonly SectionInfo[];
  index: SubjectIndex;
};

type Variable = { subject: string; from: SectionInfo | null; candidates: (SectionInfo | null)[] };

export const findPlans = ({ schedule, index, actions, addSelections, moveTargets }: PlanRequest, limit: number = MAX_PLAN_RESULTS): PlanSearchResult => {
  const fixed = new Set<SlotKey>();
  const variables: Variable[] = [];

  for (const current of schedule) {
    const action = actions[current.subject] ?? "keep";
    if (action === "keep") {
      for (const slot of current.slots) fixed.add(slot);
    } else if (action === "drop") {
      variables.push({ subject: current.subject, from: current, candidates: [null] });
    } else {
      const all = index.get(current.subject) ?? [current];
      const target = moveTargets[current.subject];
      const named = target == null ? all : all.filter((section) => section.id === target);
      // The section the student has now comes first, so that when the search is cut short it is the combinations
      // that change least that were found.
      const candidates = [...(named.length > 0 ? named : all)].sort((a, b) => Number(b.id === current.id) - Number(a.id === current.id));
      variables.push({ subject: current.subject, from: current, candidates });
    }
  }

  const enrolled = new Set(schedule.map((section) => section.subject));
  for (const { subject, sectionId } of addSelections) {
    if (enrolled.has(subject)) continue;
    const all = index.get(subject);
    if (!all || all.length === 0) continue;
    const candidates = sectionId === null ? all : all.filter((section) => section.id === sectionId);
    if (candidates.length === 0) continue;
    variables.push({ subject, from: null, candidates });
  }

  if (variables.length === 0) return { results: [], truncated: false, variables: 0 };

  // The subject with the fewest ways to end up goes first: a dead branch is cut early.
  const ordered = [...variables].sort((a, b) => a.candidates.length - b.candidates.length);
  const results: PlanResult[] = [];
  const picked: (SectionInfo | null)[] = new Array<SectionInfo | null>(ordered.length).fill(null);
  let truncated = false;

  const record = () => {
    const choices: PlanChoice[] = [];
    let moveCount = 0;
    let dropCount = 0;
    let addCount = 0;
    ordered.forEach((variable, depth) => {
      const to = picked[depth] ?? null;
      const from = variable.from;
      if (from && to && from.id === to.id) return;
      if (!from && to) addCount += 1;
      else if (from && !to) dropCount += 1;
      else moveCount += 1;
      choices.push({ subject: variable.subject, from, to });
    });
    if (choices.length === 0) return;
    if (results.length >= limit) {
      truncated = true;
      return;
    }
    choices.sort(bySubject);
    results.push({ key: choices.map((choice) => `${choice.subject}:${choice.to?.id ?? "x"}`).join("|"), choices, moveCount, dropCount, addCount });
  };

  const backtrack = (depth: number, used: Set<SlotKey>) => {
    if (truncated) return;
    if (depth === ordered.length) {
      record();
      return;
    }
    for (const candidate of ordered[depth]!.candidates) {
      if (truncated) return;
      if (candidate && conflicts(candidate.slots, used)) continue;
      picked[depth] = candidate;
      if (candidate) for (const slot of candidate.slots) used.add(slot);
      backtrack(depth + 1, used);
      if (candidate) for (const slot of candidate.slots) used.delete(slot);
      picked[depth] = null;
    }
  };
  backtrack(0, new Set(fixed));

  results.sort((a, b) => a.moveCount + a.dropCount - (b.moveCount + b.dropCount) || a.key.localeCompare(b.key));
  return { results, truncated, variables: variables.length };
};

// Subjects worth trying as moves, so that a first look has combinations to show: those that can change section on their
// own, the ones with the most ways first.
export const suggestMoves = (schedule: readonly SectionInfo[], index: SubjectIndex, count = 3): string[] =>
  schedule
    .map((section) => ({ subject: section.subject, found: findPlans({ schedule, index, actions: { [section.subject]: "move" }, addSelections: [], moveTargets: {} }, 20).results.length }))
    .filter((item) => item.found > 0)
    .sort((a, b) => b.found - a.found || a.subject.localeCompare(b.subject, "ko"))
    .slice(0, count)
    .map((item) => item.subject);

// ── one section against a timetable ──────────────────────────────────────────

export const sectionsOverlap = (a: SectionInfo, b: SectionInfo) => {
  const used = new Set(a.slots);
  return b.slots.some((slot) => used.has(slot));
};

// The subjects already in the timetable that stand in the way of a section.
export const findBlockers = (schedule: readonly SectionInfo[], candidate: SectionInfo): SectionInfo[] =>
  schedule.filter((section) => section.subject !== candidate.subject && sectionsOverlap(section, candidate));

export type AddCandidate = {
  section: SectionInfo;
  // What would have to go for this section to fit; empty means it can be added now.
  blockers: SectionInfo[];
};

// Each section of a subject against the timetable: does it fit, and if not, what is in the way.
export const evaluateAddCandidates = (schedule: readonly SectionInfo[], index: SubjectIndex, subject: string): AddCandidate[] =>
  (index.get(subject) ?? []).map((section) => ({ section, blockers: findBlockers(schedule, section) }));

// The sections that fit once the given subjects are dropped, for subjects not taken yet.
export const findAddableAfterDrop = (schedule: readonly SectionInfo[], index: SubjectIndex, dropSubjects: readonly string[]): SectionInfo[] => {
  const dropped = new Set(dropSubjects);
  const used = new Set<SlotKey>();
  for (const section of schedule) if (!dropped.has(section.subject)) for (const slot of section.slots) used.add(slot);
  const enrolled = new Set(schedule.map((section) => section.subject));
  const addable: SectionInfo[] = [];
  index.forEach((sections, subject) => {
    if (enrolled.has(subject)) return;
    for (const section of sections) if (section.slots.length > 0 && !conflicts(section.slots, used)) addable.push(section);
  });
  return addable.sort((a, b) => bySubject(a, b) || numberOf(a.section) - numberOf(b.section));
};

// ── swapping seats ───────────────────────────────────────────────────────────

export type TradePartner = {
  stuId: string;
  name: string;
  // The section the other student gives up (the one I want).
  gives: SectionInfo;
  // The section the other student gets (my place now).
  takes: SectionInfo;
};

// Who sits in `to` and could take `from` without a clash in their own week. Only the other side is checked here:
// whether I can go to `to` is for the caller to know (a combination the search found, or a section with no blockers).
export const findTradePartners = (students: StudentIndex, myStuId: string, from: SectionInfo, to: SectionInfo): TradePartner[] => {
  const partners: TradePartner[] = [];
  for (const student of to.students) {
    if (student.stuId === myStuId) continue;
    const theirs = students.get(student.stuId);
    if (!theirs) continue;
    const busy = new Set<SlotKey>();
    for (const section of theirs) if (section.id !== to.id) for (const slot of section.slots) busy.add(slot);
    if (conflicts(from.slots, busy)) continue;
    partners.push({ stuId: student.stuId, name: student.name, gives: to, takes: from });
  }
  return partners.sort((a, b) => a.stuId.localeCompare(b.stuId));
};

// A post that asks for a swap, ready to paste: "[정보과학3] 2분반(화4 수9 목6) ↔ 1분반(월8 목1) 교환하실 분 구합니다."
export const buildTradePost = (subject: string, from: SectionInfo, to: SectionInfo) =>
  [
    `[${koreanName(subject)}] ${sectionNumber(from.section)}분반(${compactTimes(from.times)}) ↔ ${sectionNumber(to.section)}분반(${compactTimes(to.times)}) 교환하실 분 구합니다.`,
    "서로 시간표가 겹치지 않는 분만 연락 주세요.",
  ].join("\n");

// ── the timetable after a plan ───────────────────────────────────────────────

// The timetable after a combination: what stays, what moves, what is added; what is dropped is gone.
export const applyPlan = (schedule: readonly SectionInfo[], plan: PlanResult): SectionInfo[] => {
  const changed = new Map(plan.choices.map((choice) => [choice.subject, choice.to]));
  const result: SectionInfo[] = [];
  for (const section of schedule) {
    if (!changed.has(section.subject)) {
      result.push(section);
      continue;
    }
    const to = changed.get(section.subject);
    if (to) result.push(to);
    changed.delete(section.subject);
  }
  changed.forEach((to) => {
    if (to) result.push(to);
  });
  return result.sort(bySubject);
};

// Whether two timetables hold the same sections; their order means nothing.
export const sameSections = (a: readonly SectionInfo[], b: readonly SectionInfo[]) => {
  if (a.length !== b.length) return false;
  const ids = new Set(a.map((section) => section.id));
  return b.every((section) => ids.has(section.id));
};

// A timetable's credits; a subject the catalogue does not know counts as none.
export const totalCredits = (sections: readonly SectionInfo[]) => sections.reduce((sum, section) => sum + (section.credits ?? 0), 0);
export const missingCreditSubjects = (sections: readonly SectionInfo[]) => sections.filter((section) => section.credits == null).map((section) => section.subject);

// Some choice was left to "자동": a move without a target section, or an added subject without one.
export const hasAutoChoice = (schedule: readonly SectionInfo[], state: PlanState) =>
  state.addSelections.some((add) => add.sectionId === null) || schedule.some((section) => (state.actions[section.subject] ?? "keep") === "move" && state.moveTargets[section.subject] == null);

export type PlannedSchedule = {
  sections: SectionInfo[];
  // Subjects that come in.
  entering: Set<string>;
  // Subjects whose section changed.
  moved: Set<string>;
  // Subjects that stay but clash with a section that was fixed on purpose.
  conflicting: Set<string>;
};

// The timetable with the plan applied. Given a combination it is that combination's result; without one, whatever has
// been chosen so far (drops, moves to a named section, additions to a named section). A dropped subject is not drawn: the
// hour it frees is easiest to see as an empty cell.
export const buildPlannedSchedule = (schedule: readonly SectionInfo[], index: SubjectIndex, state: PlanState, plan: PlanResult | null): PlannedSchedule => {
  const { actions, addSelections, moveTargets } = state;
  const leaving = new Set<string>();
  const entering = new Set<string>();
  const moved = new Set<string>();
  const conflicting = new Set<string>();

  if (plan) {
    for (const choice of plan.choices) {
      if (!choice.to) leaving.add(choice.subject);
      else if (!choice.from) entering.add(choice.subject);
      else if (choice.from.id !== choice.to.id) moved.add(choice.subject);
    }
    return { sections: applyPlan(schedule, plan), entering, moved, conflicting };
  }

  for (const section of schedule) if ((actions[section.subject] ?? "keep") === "drop") leaving.add(section.subject);

  const movedTo = new Map<string, SectionInfo>();
  for (const section of schedule) {
    if ((actions[section.subject] ?? "keep") !== "move") continue;
    const target = moveTargets[section.subject];
    if (target == null || target === section.id) continue;
    const found = (index.get(section.subject) ?? []).find((item) => item.id === target);
    if (found) movedTo.set(section.subject, found);
  }

  const staying = schedule.filter((section) => !leaving.has(section.subject)).map((section) => movedTo.get(section.subject) ?? section);
  movedTo.forEach((_, subject) => moved.add(subject));
  movedTo.forEach((target, subject) => {
    for (const blocker of findBlockers(staying.filter((section) => section.subject !== subject), target)) conflicting.add(blocker.subject);
  });

  // A subject already taken is not an addition: the plan may still name it (it was added, then the term changed), and
  // drawing it twice would put one section in the grid in two places. The stored plan is left as it is.
  const stayingSubjects = new Set(staying.map((section) => section.subject));
  const added: SectionInfo[] = [];
  for (const { subject, sectionId } of addSelections) {
    if (sectionId === null || stayingSubjects.has(subject)) continue;
    const section = (index.get(subject) ?? []).find((item) => item.id === sectionId);
    if (!section) continue;
    added.push(section);
    entering.add(subject);
    for (const blocker of findBlockers(staying, section)) conflicting.add(blocker.subject);
  }
  return { sections: [...staying, ...added], entering, moved, conflicting };
};

// ── looking things up ────────────────────────────────────────────────────────

// Letters of `word` appear in order in `target`, close enough together to mean it ("정3" → 정보과학3).
const inOrder = (target: string, word: string) => {
  let best = Infinity;
  for (let start = target.indexOf(word[0]!); start !== -1; start = target.indexOf(word[0]!, start + 1)) {
    let at = start;
    let found = true;
    for (let i = 1; i < word.length; i++) {
      at = target.indexOf(word[i]!, at + 1);
      if (at === -1) {
        found = false;
        break;
      }
    }
    if (!found) break;
    best = Math.min(best, at - start + 1);
  }
  return best <= word.length * 3 + 2;
};

// How well a text answers a query, 0 best; null when it does not. Case, spaces and marks do not matter, initials do.
export const looseRank = (text: string, query: string): number | null => {
  const target = normalize(text);
  const word = normalize(query);
  if (!word || !target) return null;
  if (target === word) return 0;
  if (target.startsWith(word)) return 1;
  if (target.includes(word)) return 2;
  if (initials(target).includes(word)) return 3;
  if (word.length >= 2 && (inOrder(target, word) || inOrder(initials(target), word))) return 4;
  return null;
};

const bestRank = (texts: readonly string[], query: string) => {
  let best: number | null = null;
  for (const text of texts) {
    const rank = looseRank(text, query);
    if (rank !== null && (best === null || rank < best)) best = rank;
  }
  return best;
};

// Students whose name or ID answers the query, the closest first.
export const findStudents = (students: readonly Student[], query: string, limit = 12): Student[] => {
  if (!query.trim()) return [];
  return students
    .flatMap((student) => {
      const rank = bestRank([student.name, student.stuId], query);
      return rank === null ? [] : [{ student, rank }];
    })
    .sort((a, b) => a.rank - b.rank || a.student.stuId.localeCompare(b.student.stuId))
    .slice(0, limit)
    .map((item) => item.student);
};

// Subjects whose name, Korean name or English name answers the query, the closest first.
export const findSubjects = (subjects: readonly SubjectData[], query: string, limit = 20): SubjectData[] => {
  if (!query.trim()) return [];
  return subjects
    .flatMap((subject) => {
      const rank = bestRank([koreanName(subject.subject), subject.subject, subject.english], query);
      return rank === null ? [] : [{ subject, rank }];
    })
    .sort((a, b) => a.rank - b.rank || bySubject(a.subject, b.subject))
    .slice(0, limit)
    .map((item) => item.subject);
};
