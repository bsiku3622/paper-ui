// The Shape inspector's notes: what the page says about values it cannot derive a reason for. Each map is
// keyed by its source, so a value added there fails typecheck until it has a note.

import { SHAPE_SOURCE } from "../../../../packages/paper-ui/src/tokens/shape";

export const TARGET_NOTES: Record<keyof typeof SHAPE_SOURCE.target, string> = {
  min: "누를 수 있는 최소 크기 (WCAG 2.5.8)",
};
