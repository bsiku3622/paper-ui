// The state of the 수강 정정 page and everything derived from it, in one place so that the pieces of the screen only read.
//
// What a person decides — whose timetable, what to do with each subject, what to add, which combination to look at — is kept
// with useStored under "classes:trade-plan" and comes back on reload. What is only a moment of the screen (the row that is
// open, the subject pointed at, the words typed in a search) is plain state.
//
// A few URL words make a state reachable for a screenshot: ?demo=moves|plan|target|friend|blank seeds a plan (once; the word
// is taken off the address afterwards, and a plan that was stored is replaced only because the word was asked for),
// ?open=<subject> opens a row, ?add=<words> and ?who=<words> fill the two searches. Without them nothing stored is touched.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useStored, useToast } from "../../../../kit";
import type { SubjectData } from "../../data/build";
import type { Student } from "../../data/people";
import {
  buildPlannedSchedule,
  buildTradeIndex,
  bySubject,
  evaluateAddCandidates,
  findAddableAfterDrop,
  findBlockers,
  findPlans,
  findStudents,
  findSubjects,
  findTradePartners,
  getStudentSchedule,
  hasAutoChoice,
  missingCreditSubjects,
  sameSections,
  sectionsOverlap,
  suggestMoves,
  totalCredits,
  type PlanAction,
  type PlanResult,
  type PlanSearchResult,
  type PlanState,
  type SectionInfo,
  type SlotKey,
  type TradeIndex,
  type TradePartner,
} from "../../lib/trade";
import { koreanName, sectionNumber } from "../../lib/utils";
import { useClasses } from "../../state";

export type SavedTradePlan = PlanState & {
  // Whose timetable is being planned; null means the signed-in account's own.
  stuId: string | null;
  // The combination picked from the list; null means none picked (the first one is shown while something is left to "자동").
  previewKey: string | null;
};

export type PartnerGroup = { subject: string; from: SectionInfo; to: SectionInfo; partners: TradePartner[] };
export type Addable = { subject: string; sections: SectionInfo[] };

const EMPTY_SEARCH: PlanSearchResult = { results: [], truncated: false, variables: 0 };
const blank = (stuId: string | null): SavedTradePlan => ({ stuId, actions: {}, addSelections: [], moveTargets: {}, previewKey: null });
const withMoves = (stuId: string, subjects: readonly string[]): SavedTradePlan => ({ ...blank(stuId), actions: Object.fromEntries(subjects.map((subject) => [subject, "move" as const])) });

// ── plans for the screenshots ────────────────────────────────────────────────

const demoPlan = (demo: string, index: TradeIndex, me: string, friend: string | undefined): SavedTradePlan | null => {
  const moves: SavedTradePlan = { ...blank(me), actions: { 문학: "drop", 체육4: "move" }, addSelections: [{ subject: "감염과면역", sectionId: null }] };
  switch (demo) {
    case "moves":
      return moves;
    case "plan": {
      const found = findPlans({ schedule: getStudentSchedule(index, me), index: index.subjects, ...moves });
      return { ...moves, previewKey: found.results[1]?.key ?? null };
    }
    case "target": {
      const first = index.subjects.get("정보과학3")?.find((section) => sectionNumber(section.section) === "1");
      return { ...blank(me), actions: { 정보과학3: "move" }, moveTargets: { 정보과학3: first?.id ?? null } };
    }
    case "friend":
      return friend ? withMoves(friend, suggestMoves(getStudentSchedule(index, friend), index.subjects)) : null;
    case "blank":
      return blank(me);
    default:
      return null;
  }
};

// ── the model ────────────────────────────────────────────────────────────────

export const useTradeModel = () => {
  const { data, me, friends, studentName } = useClasses();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const index = useMemo(() => buildTradeIndex(data), [data]);

  // A first visit starts on the account's own timetable with a few subjects marked as moves, so there is something to see.
  const [saved, setSaved] = useStored<SavedTradePlan>("classes:trade-plan", () => withMoves(me.stuId, suggestMoves(getStudentSchedule(index, me.stuId), index.subjects)));
  const [hovered, setHovered] = useState<string | null>(null);
  const [openSubject, setOpenSubject] = useState<string | null>(() => params.get("open"));
  const [addQuery, setAddQuery] = useState(() => params.get("add") ?? "");
  const [whoQuery, setWhoQuery] = useState(() => params.get("who") ?? "");

  const stuId = saved.stuId && index.students.has(saved.stuId) ? saved.stuId : me.stuId;
  const state = useMemo<PlanState>(
    () => ({ actions: saved.actions ?? {}, addSelections: Array.isArray(saved.addSelections) ? saved.addSelections : [], moveTargets: saved.moveTargets ?? {} }),
    [saved.actions, saved.addSelections, saved.moveTargets],
  );
  const schedule = useMemo(() => getStudentSchedule(index, stuId), [index, stuId]);
  const enrolled = useMemo(() => new Set(schedule.map((section) => section.subject)), [schedule]);

  // the search: every combination in which no hour is used twice
  const search = useMemo(() => (schedule.length === 0 ? EMPTY_SEARCH : findPlans({ schedule, index: index.subjects, ...state })), [schedule, index, state]);
  const auto = useMemo(() => hasAutoChoice(schedule, state), [schedule, state]);
  const chosen = useMemo(() => (saved.previewKey ? (search.results.find((plan) => plan.key === saved.previewKey) ?? null) : null), [search, saved.previewKey]);
  // Something left to "자동" and nothing picked: the first combination is shown, so that "자동" does something to the grid.
  const preview: PlanResult | null = chosen ?? (auto ? (search.results[0] ?? null) : null);
  const planned = useMemo(() => buildPlannedSchedule(schedule, index.subjects, state, preview), [schedule, index, state, preview]);
  // Whether the grid shows something other than the timetable the person has.
  const changed = useMemo(() => !sameSections(schedule, planned.sections), [schedule, planned]);

  const credits = useMemo(() => {
    const now = totalCredits(schedule);
    const after = totalCredits(planned.sections);
    return { now, planned: after, delta: after - now, unknown: [...new Set([...missingCreditSubjects(schedule), ...missingCreditSubjects(planned.sections)])] };
  }, [schedule, planned]);

  const dropped = useMemo(() => schedule.filter((section) => state.actions[section.subject] === "drop").map((section) => section.subject), [schedule, state]);
  const marks = useMemo(
    () => ({
      move: schedule.filter((section) => state.actions[section.subject] === "move").length,
      drop: dropped.length,
      add: state.addSelections.filter((add) => !enrolled.has(add.subject)).length,
    }),
    [schedule, state, dropped, enrolled],
  );

  // the seats that could be swapped in the combination being looked at
  const partners = useMemo<PartnerGroup[]>(
    () =>
      preview
        ? preview.choices.flatMap(({ subject, from, to }) => (from && to && from.id !== to.id ? [{ subject, from, to, partners: findTradePartners(index.students, stuId, from, to) }] : []))
        : [],
    [preview, index, stuId],
  );

  // subjects that fit into the hours a drop frees (not the ones already taken, the added ones kept in the list)
  const addable = useMemo<Addable[]>(() => {
    if (dropped.length === 0) return [];
    const freed = new Set<SlotKey>();
    for (const section of schedule) if (dropped.includes(section.subject)) for (const slot of section.slots) freed.add(slot);
    const adding = new Set(state.addSelections.map((add) => add.subject));
    const base = planned.sections.filter((section) => !adding.has(section.subject));
    const keptAdds = planned.sections.filter((section) => adding.has(section.subject));
    const grouped = new Map<string, SectionInfo[]>();
    for (const section of findAddableAfterDrop(base, index.subjects, [])) {
      if (enrolled.has(section.subject) || keptAdds.some((other) => sectionsOverlap(other, section))) continue;
      grouped.set(section.subject, [...(grouped.get(section.subject) ?? []), section]);
    }
    return [...grouped]
      .filter(([, sections]) => sections.some((section) => section.slots.some((slot) => freed.has(slot))))
      .map(([subject, sections]) => ({ subject, sections }))
      .sort(bySubject);
  }, [dropped, schedule, planned, state.addSelections, index, enrolled]);

  // searching for a subject to add
  const addMatches = useMemo<SubjectData[]>(() => findSubjects(data.subjects.filter((subject) => !enrolled.has(subject.subject)), addQuery), [data, enrolled, addQuery]);
  const summaries = useMemo(() => {
    const map = new Map<string, { free: number; total: number }>();
    for (const subject of [...state.addSelections.map((add) => add.subject), ...addMatches.map((item) => item.subject), ...addable.map((item) => item.subject)]) {
      if (map.has(subject)) continue;
      const candidates = evaluateAddCandidates(planned.sections, index.subjects, subject);
      map.set(subject, { free: candidates.filter((candidate) => candidate.blockers.length === 0).length, total: candidates.length });
    }
    return map;
  }, [state.addSelections, addMatches, addable, planned, index]);

  const matches = useMemo<Student[]>(() => findStudents(data.students, whoQuery), [data, whoQuery]);

  // why no combination exists, when it can be said: a named section stands where a subject that is kept already is
  const reasons = useMemo(() => {
    if (search.results.length > 0 || search.variables === 0) return [];
    const kept = schedule.filter((section) => (state.actions[section.subject] ?? "keep") === "keep");
    const names = (blockers: SectionInfo[]) => blockers.map((blocker) => koreanName(blocker.subject)).join(", ");
    const out: string[] = [];
    for (const section of schedule) {
      const target = state.moveTargets[section.subject];
      if (state.actions[section.subject] !== "move" || target == null) continue;
      const found = index.subjects.get(section.subject)?.find((item) => item.id === target);
      const blockers = found ? findBlockers(kept, found) : [];
      if (found && blockers.length > 0) out.push(`${koreanName(section.subject)} ${sectionNumber(found.section)}분반은 ${names(blockers)} 때문에 갈 수 없습니다.`);
    }
    for (const add of state.addSelections) {
      if (enrolled.has(add.subject)) continue;
      const found = add.sectionId === null ? undefined : index.subjects.get(add.subject)?.find((item) => item.id === add.sectionId);
      const blockers = found ? findBlockers(kept, found) : [];
      if (found && blockers.length > 0) out.push(`${koreanName(add.subject)} ${sectionNumber(found.section)}분반은 ${names(blockers)} 때문에 넣을 수 없습니다.`);
    }
    return out;
  }, [search, schedule, state, index, enrolled]);

  // ── what a person does ────────────────────────────────────────────────────
  // Every change takes the picked combination back: it was one of the old list.
  const update = useCallback((change: (now: SavedTradePlan) => Partial<SavedTradePlan>) => setSaved((now) => ({ ...now, previewKey: null, ...change(now) })), [setSaved]);

  const setAction = useCallback(
    (subject: string, action: PlanAction) =>
      update((now) => {
        const actions = { ...now.actions };
        const moveTargets = { ...now.moveTargets };
        if (action === "keep") delete actions[subject];
        else actions[subject] = action;
        if (action !== "move") delete moveTargets[subject];
        return { actions, moveTargets };
      }),
    [update],
  );
  const setMoveTarget = useCallback((subject: string, sectionId: number | null) => update((now) => ({ moveTargets: { ...now.moveTargets, [subject]: sectionId } })), [update]);
  // A shortcut from a section in the open list: move this subject there.
  const moveTo = useCallback((subject: string, sectionId: number) => update((now) => ({ actions: { ...now.actions, [subject]: "move" }, moveTargets: { ...now.moveTargets, [subject]: sectionId } })), [update]);
  const toggleAdd = useCallback(
    (subject: string) =>
      update((now) => ({ addSelections: now.addSelections.some((add) => add.subject === subject) ? now.addSelections.filter((add) => add.subject !== subject) : [...now.addSelections, { subject, sectionId: null }] })),
    [update],
  );
  const setAddSection = useCallback((subject: string, sectionId: number | null) => update((now) => ({ addSelections: now.addSelections.map((add) => (add.subject === subject ? { ...add, sectionId } : add)) })), [update]);
  const pickPlan = useCallback((key: string | null) => setSaved((now) => ({ ...now, previewKey: key })), [setSaved]);
  const suggestions = useMemo(() => suggestMoves(schedule, index.subjects), [schedule, index]);
  const suggest = useCallback(() => update(() => ({ actions: Object.fromEntries(suggestions.map((subject) => [subject, "move" as const])), moveTargets: {} })), [update, suggestions]);

  const restart = useCallback(() => {
    setOpenSubject(null);
    setAddQuery("");
    setWhoQuery("");
  }, []);
  const chooseStudent = useCallback(
    (id: string) => {
      const before = saved;
      setSaved(blank(id));
      restart();
      toast(id === me.stuId ? "내 시간표로 돌아왔습니다" : `${studentName(id)}님의 시간표로 계획합니다`, { action: { label: "되돌리기", onSelect: () => setSaved(before) } });
    },
    [saved, setSaved, restart, toast, me.stuId, studentName],
  );
  const reset = useCallback(() => {
    const before = saved;
    setSaved(blank(saved.stuId));
    restart();
    toast("계획을 초기화했습니다", { action: { label: "되돌리기", onSelect: () => setSaved(before) } });
  }, [saved, setSaved, restart, toast]);
  const toggleOpen = useCallback((subject: string) => setOpenSubject((now) => (now === subject ? null : subject)), []);

  // ── seeding from the address ──────────────────────────────────────────────
  const demo = params.get("demo");
  const seeded = useRef<string | null>(null);
  useEffect(() => {
    if (!demo) {
      seeded.current = null;
      return;
    }
    // StrictMode runs an effect twice; the word is applied once.
    if (seeded.current === demo) return;
    seeded.current = demo;
    const plan = demoPlan(demo, index, me.stuId, friends[0]);
    if (plan) setSaved(plan);
    setParams(
      (now) => {
        const next = new URLSearchParams(now);
        next.delete("demo");
        return next;
      },
      { replace: true },
    );
  }, [demo, index, me.stuId, friends, setSaved, setParams]);

  return {
    index,
    me,
    stuId,
    name: studentName(stuId),
    isMe: stuId === me.stuId,
    schedule,
    enrolled,
    state,
    search,
    auto,
    chosen,
    preview,
    planned,
    changed,
    credits,
    dropped,
    marks,
    partners,
    addable,
    addMatches,
    summaries,
    matches,
    reasons,
    hovered,
    setHovered,
    openSubject,
    toggleOpen,
    highlight: hovered ?? openSubject,
    addQuery,
    setAddQuery,
    whoQuery,
    setWhoQuery,
    setAction,
    setMoveTarget,
    moveTo,
    toggleAdd,
    setAddSection,
    pickPlan,
    suggestions,
    suggest,
    chooseStudent,
    reset,
  };
};

export type TradeModel = ReturnType<typeof useTradeModel>;
