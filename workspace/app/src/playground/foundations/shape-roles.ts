// The Shape inspector's notes: what the page says about values it cannot derive a reason for. Each map is
// keyed by its source, so a value added there fails typecheck until it has a note.

import { CONTROL_ICON, SHAPE, SHAPE_SOURCE } from "@paper-ui/inspect/shape";
import { CONTROL_SIZES, SPACES, type ControlSize } from "@studio-baeks/paper-ui/tokens";

export const TARGET_NOTES: Record<keyof typeof SHAPE_SOURCE.target, string> = {
  min: "누를 수 있는 최소 크기 (WCAG 2.5.8)",
};

const controlGapStep = SPACES.find((step) => SHAPE.inset[step] === SHAPE.control.gap);

// The role board, one row per role in tokens.shape that isn't already a source row. The inspector test walks
// tokens.shape against these keys, so a role added there fails until it has a row or a place on the source board.
export const ROLE_ALIASES = {
  inset: { name: "shape.inset.xs ~ 3xl", rule: "= shape.space 같은 단계" },
  radius: { name: "shape.radius.*", rule: "= shape.radius 원본" },
  "control.height": { name: "shape.control.height", rule: "= 원본 사다리" },
  "control.icon": { name: "shape.control.icon", rule: `= icon ${CONTROL_SIZES.map((size: ControlSize) => CONTROL_ICON[size]).join(" · ")}` },
  "control.gap": { name: "shape.control.gap", rule: `= shape.space.${controlGapStep}` },
  target: { name: "shape.target.min", rule: "= shape.target 원본" },
} as const;

export const ROLE_FORMULAS = {
  "control.inset.input": { rule: "(control.height − 컨트롤 글자 줄) / 2", note: "입력값 줄상자 사방에 같은 여백" },
  "control.inset.button": { rule: `round(nearest, (control.height − 버튼 글자 줄) / 2 × ${SHAPE_SOURCE.control.buttonInsetRatio}, 1px)`, note: "라벨이 상자를 정의하므로 더 넓게" },
  "selection.size": { rule: "control.height / 2", note: "그래서 스위치 트랙 폭 = 컨트롤 높이" },
} as const;

// Roles the source board already lists under their own names.
export const ROLES_ON_SOURCE_BOARD = ["stroke", "focus", "icon", "dimension", "measure"] as const;
