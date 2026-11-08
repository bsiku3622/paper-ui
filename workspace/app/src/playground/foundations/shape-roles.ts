import { CONTROL_ICON, SHAPE, SHAPE_SOURCE } from "@paper-ui/inspect/shape";
import type { Bilingual } from "../../site/locale";
import { CONTROL_SIZES, SPACES, type ControlSize } from "@studio-baeks/paper-ui/tokens";

export const TARGET_NOTES: Record<keyof typeof SHAPE_SOURCE.target, Bilingual> = {
  min: { ko: "누를 수 있는 최소 크기 (WCAG 2.5.8)", en: "The smallest size that can be pressed (WCAG 2.5.8)" },
};

const ICONS = CONTROL_SIZES.map((size: ControlSize) => CONTROL_ICON[size]).join(" · ");
const controlGapStep = SPACES.find((step) => SHAPE.inset[step] === SHAPE.control.gap);

export const ROLE_ALIASES = {
  inset: { name: "shape.inset.xs ~ 3xl", rule: { ko: "= shape.space 같은 단계", en: "= the same step of shape.space" } },
  radius: { name: "shape.radius.*", rule: { ko: "= shape.radius 원본", en: "= the shape.radius source" } },
  "control.height": { name: "shape.control.height", rule: { ko: "= 원본 사다리", en: "= the source ladder" } },
  "control.inset.button": { name: "shape.control.inset.button", rule: { ko: "= 원본 사다리 (control.buttonInset) — 라벨이 상자를 정의하므로 입력값보다 넓게", en: "= the source ladder (control.buttonInset); wider than an input, since the label defines the box" } },
  "control.icon": { name: "shape.control.icon", rule: { ko: `= icon ${ICONS}`, en: `= icon ${ICONS}` } },
  "control.gap": { name: "shape.control.gap", rule: { ko: `= shape.space.${controlGapStep}`, en: `= shape.space.${controlGapStep}` } },
  target: { name: "shape.target.min", rule: { ko: "= shape.target 원본", en: "= the shape.target source" } },
} as const;

export const ROLE_FORMULAS = {
  "control.inset.input": { rule: { ko: "(control.height − 컨트롤 글자 줄) / 2", en: "(control.height − the control's text line) / 2" }, note: { ko: "입력값 글자 줄 사방에 같은 여백", en: "The same space on every side of the input's text line" } },
} as const;

export const ROLES_ON_SOURCE_BOARD = ["stroke", "focus", "selection", "icon", "dimension", "measure"] as const;
