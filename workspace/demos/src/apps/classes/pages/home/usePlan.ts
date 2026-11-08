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
    if (!saved || (saved.stuId != null && saved.stuId !== stuId)) return null;

    const state: PlanState = {
      actions: saved.actions ?? {},
      addSelections: Array.isArray(saved.addSelections) ? saved.addSelections : [],
      moveTargets: saved.moveTargets ?? {},
    };
    const index = buildTradeIndex(data);
    const schedule = getStudentSchedule(index, stuId);
    if (schedule.length === 0) return null;

    let plan = null;
    const auto = hasAutoChoice(schedule, state);
    if (saved.previewKey || auto) {
      const { results } = findPlans({ schedule, index: index.subjects, ...state });
      plan = (saved.previewKey ? (results.find((item) => item.key === saved.previewKey) ?? null) : null) ?? (auto ? (results[0] ?? null) : null);
    }
    const planned = buildPlannedSchedule(schedule, index.subjects, state, plan);
    return sameSections(schedule, planned.sections) ? null : planned.sections;
  }, [data, stuId, enabled]);
