import { controlSizes, type ControlSize } from "./control-sizes";
import { CONTROL_BUTTON_INSET, SHAPE } from "./shape";
import { CONTROL_LINE } from "./shape-recipes";
import { TYPOGRAPHY } from "./typography";

export const CONTROL_ANATOMIES = ["label", "icon", "input", "frame", "area", "mark", "track", "badge", "spinner", "segment", "slider"] as const;
export type ControlAnatomy = (typeof CONTROL_ANATOMIES)[number];

export const CONTROL_ANATOMY_PRESET: Partial<Record<ControlAnatomy, keyof typeof TYPOGRAPHY.preset>> = {
  label: "button",
  icon: "button",
  input: "field",
  frame: "field",
  area: "textarea",
  badge: "badge",
  segment: "button",
};

const { height } = SHAPE.control;
const { preset } = TYPOGRAPHY;

export const CONTROL = {
  inset: {
    input: controlSizes((size: ControlSize) => `calc((${height[size]} - ${preset.field[size].leading}) / 2)`),
    button: controlSizes((size: ControlSize) => CONTROL_BUTTON_INSET[size]),
  },
  select: {
    paddingEnd: controlSizes((size: ControlSize) => `calc((${height[size]} - ${preset.field[size].leading}) / 2 + ${SHAPE.control.icon[size]} + ${SHAPE.control.gap})`),
  },
  area: {
    paddingBlock: controlSizes((size: ControlSize) => `calc((${height[size]} - ${preset.textarea[size].leading}) / 2 - ${CONTROL_LINE})`),
  },
  inputLine: controlSizes((size: ControlSize) => preset.field[size].inputLeading),
} as const;
