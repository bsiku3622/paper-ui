import type { Scenario, StepId } from "./types";

export const STEPS: Record<StepId, { doing: string; done: string; ms: number }> = {
  open: { doing: "사진을 여는 중입니다", done: "사진을 열었습니다", ms: 650 },
  sheet: { doing: "종이 윤곽을 찾고 있습니다", done: "종이 윤곽을 살폈습니다", ms: 1000 },
  lines: { doing: "격자선을 찾고 있습니다", done: "격자선을 살폈습니다", ms: 900 },
  lattice: { doing: "칸을 세고 있습니다", done: "칸을 세었습니다", ms: 800 },
  refine: { doing: "사진을 펴고 있습니다", done: "사진을 폈습니다", ms: 1000 },
};

export const stepsFor = (scenario: Scenario): StepId[] => {
  if (scenario === "broken") return ["open"];
  if (scenario === "sheet" || scenario === "lined" || scenario === "unsure") return ["open", "sheet"];
  return ["open", "sheet", "lines", "lattice", "refine"];
};

export const SEARCH_MS = 1400;
export const RENDER_MS = 420;
export const EXPORT_PAGE_MS = 520;
