// What a photo goes through on its way to becoming a page. The wording of the first four is the app's own (the engine
// reports `sheet`, `lines`, `lattice` and `refine`); the mock walks them with timers.

import type { Scenario, StepId } from "./types";

export const STEPS: Record<StepId, { doing: string; done: string; ms: number }> = {
  open: { doing: "사진을 여는 중입니다", done: "사진을 열었습니다", ms: 650 },
  sheet: { doing: "종이 윤곽을 찾고 있습니다", done: "종이 윤곽을 살폈습니다", ms: 1000 },
  lines: { doing: "격자선을 찾고 있습니다", done: "격자선을 살폈습니다", ms: 900 },
  lattice: { doing: "칸을 세고 있습니다", done: "칸을 세었습니다", ms: 800 },
  refine: { doing: "사진을 펴고 있습니다", done: "사진을 폈습니다", ms: 1000 },
};

// A plain page needs no grid search, which is the slower of the two; a file that cannot be opened stops at the first step.
export const stepsFor = (scenario: Scenario): StepId[] => {
  if (scenario === "broken") return ["open"];
  if (scenario === "sheet" || scenario === "lined" || scenario === "unsure") return ["open", "sheet"];
  return ["open", "sheet", "lines", "lattice", "refine"];
};

// Searching a sheet for printed lines when someone asks for it.
export const SEARCH_MS = 1400;
// Drawing a page again after a setting changed.
export const RENDER_MS = 420;
// One page of a PDF.
export const EXPORT_PAGE_MS = 520;
