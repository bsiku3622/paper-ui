// The plan the 수강 정정 page keeps, read for the home page. Home only reads it: nothing here writes the stored plan back (a
// useStored on the same key would write whatever it found, a first visit's "nothing" included, over what the other page makes).
//
// The result is the timetable with the plan applied, and null whenever there is nothing to choose between: the course-change
// window is closed, no plan was kept, the plan is for somebody else's timetable (a friend's, looked at on the other page), or
// the plan changes nothing. Home hides its switch then, so a person is never offered the same timetable twice.

import { useMemo } from "react";

import type { TermData } from "../../data/build";
import {
  buildPlannedSchedule,
  buildTradeIndex,
  findPlans,
  getStudentSchedule,
  hasAutoChoice,
  sameSections,
  type PlanState,
  type SectionInfo,
} from "../../lib/trade";
import type { SavedTradePlan } from "../trade/model";

// useStored keeps what it is given under "paper-apps:" + the key the other page gave it.
const STORED = "paper-apps:classes:trade-plan";

const readSaved = (): Partial<SavedTradePlan> | null => {
  try {
    const raw = localStorage.getItem(STORED);
    const found: unknown = raw === null ? null : JSON.parse(raw);
    return typeof found === "object" && found !== null ? (found as Partial<SavedTradePlan>) : null;
  } catch {
    return null;
  }
};

export const usePlannedSections = (data: TermData, stuId: string, enabled: boolean): SectionInfo[] | null =>
  useMemo(() => {
    if (!enabled) return null;
    const saved = readSaved();
    // null on the other page means the signed-in account's own timetable
    if (!saved || (saved.stuId != null && saved.stuId !== stuId)) return null;

    const state: PlanState = {
      actions: saved.actions ?? {},
      addSelections: Array.isArray(saved.addSelections) ? saved.addSelections : [],
      moveTargets: saved.moveTargets ?? {},
    };
    const index = buildTradeIndex(data);
    const schedule = getStudentSchedule(index, stuId);
    if (schedule.length === 0) return null;

    // The search over combinations runs only when it decides something: a combination was picked, or a choice is left to "자동".
    let plan = null;
    const auto = hasAutoChoice(schedule, state);
    if (saved.previewKey || auto) {
      const { results } = findPlans({ schedule, index: index.subjects, ...state });
      plan = (saved.previewKey ? (results.find((item) => item.key === saved.previewKey) ?? null) : null) ?? (auto ? (results[0] ?? null) : null);
    }
    const planned = buildPlannedSchedule(schedule, index.subjects, state, plan);
    return sameSections(schedule, planned.sections) ? null : planned.sections;
  }, [data, stuId, enabled]);
