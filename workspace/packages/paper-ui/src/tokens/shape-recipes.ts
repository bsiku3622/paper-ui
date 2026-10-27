// Shape recipes — component anatomy built from Shape roles. No number is written here: every
// value is a Shape role, a SHAPE_SOURCE anatomy value, or a formula over them. Formulas stay
// strings and are evaluated on the consuming element, like the roles they read.

import { pathToVarRef } from "./helpers";
import { ANATOMY, SHAPE, SPACE, controlSizes } from "./shape";
import { CONTROL_SPEC } from "./text";

const { control, selection, stroke, radius } = SHAPE;

// Half a selection box: the check's long side and the radio dot.
const half = controlSizes((size) => `calc(${selection.size[size]} / 2)`);
// The track showing around a switch thumb reads as an emphasis stroke.
const rim = stroke.emphasis;
const thumb = controlSizes((size) => `calc(${selection.size[size]} - ${rim})`);

export const SHAPE_RECIPES = {
  button: { spinner: ANATOMY.inline.spinner },
  badge: { height: ANATOMY.badge.height, inset: ANATOMY.badge.inset, gap: SPACE.xs, dot: ANATOMY.inline.dot },
  checkbox: {
    radius: radius.selection,
    // The check is an L, half the box wide and a quarter tall, turned onto its diagonal. Turning
    // leaves its visual mass low and left, so it shifts by fractions of its own stroke.
    mark: half,
    short: controlSizes((size) => `calc(${half[size]} / 2)`),
    stroke: stroke.emphasis,
    markTransform: `rotate(-45deg) translate(calc(${stroke.emphasis} / 4), calc(${stroke.emphasis} / -2))`,
    // Indeterminate: the check's long side as one round-capped emphasis line.
    dash: { width: half, height: stroke.emphasis, radius: radius.full },
  },
  radio: { dot: half },
  // Track = one control wide and the thumb plus a rim tall, so the thumb travels its own width.
  switch: {
    width: control.height,
    height: controlSizes((size) => `calc(${selection.size[size]} + ${rim})`),
    thumb,
    inset: rim,
    travel: thumb,
  },
  // The arrow is a trailing icon: it sits at the input inset, and the value stops a control gap
  // before it — the mirror of a Field's leading icon.
  select: {
    arrow: control.icon,
    arrowInset: control.inset.input,
    paddingEnd: controlSizes((size) => `calc(${control.inset.input[size]} + ${control.icon[size]} + ${control.gap})`),
  },
  // One row of a textarea is exactly a Field of the same size: the first line sits where the
  // Field's line would.
  textarea: {
    minHeight: SHAPE.dimension.height.sm,
    paddingBlock: controlSizes((size) => {
      const line = pathToVarRef(["text", "palette", "leading", CONTROL_SPEC.textarea[size].leading]);
      return `calc((${control.height[size]} - ${line}) / 2 - ${stroke.border})`;
    }),
  },
  spinner: { size: control.icon, stroke: stroke.emphasis },
} as const;
