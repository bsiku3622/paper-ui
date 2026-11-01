// Shape recipes — component anatomy built from Shape roles. A recipe holds only structural values
// (half with / 2, the 45° turn); optical ratios live in the source anatomy. Every value is a Shape
// role, a SHAPE_SOURCE anatomy value, or a formula over them. Formulas stay strings and are
// evaluated on the consuming element, like the roles they read.

import { ANATOMY, SHAPE, SPACE, controlSizes } from "./shape";
import { TYPOGRAPHY } from "./typography";

const { control, selection, stroke, radius } = SHAPE;

// Half a selection box: the check's long side and the radio dot.
const half = controlSizes((size) => `calc(${selection.size[size]} / 2)`);
// The track showing around a switch thumb reads as an emphasis stroke.
const rim = stroke.emphasis;
const thumb = controlSizes((size) => `calc(${selection.size[size]} - ${rim})`);
const trackHeight = controlSizes((size) => `calc(${selection.size[size]} + ${rim})`);

// How far a hit area reaches past a mark of this size, on each side, to be a minimum target: half the
// shortfall, so it is never positive and a mark that already is one reaches nowhere.
export const targetReach = (visual: string) => `calc((min(${visual}, ${SHAPE.target.min}) - ${SHAPE.target.min}) / 2)`;

// An inset hairline drawn inside an element's own box, so it adds no size: the off Switch's ring, a
// forced-colours mark, a selected face under increased contrast. It is the one box-shadow outside elevation.
export const strokeRing = (color: string): string => `inset 0 0 0 ${stroke.border} ${color}`;

export const SHAPE_RECIPES = {
  badge: { height: ANATOMY.badge.height, inset: ANATOMY.badge.inset, gap: SPACE.xs, dot: ANATOMY.inline.dot },
  checkbox: {
    radius: radius.selection,
    // The check is an L, half the box wide and a quarter tall, turned onto its diagonal. Turning
    // leaves its visual mass low and left, so it shifts by the source's ratios of its own stroke.
    mark: half,
    short: controlSizes((size) => `calc(${half[size]} / 2)`),
    stroke: stroke.emphasis,
    markTransform: `rotate(-45deg) translate(calc(${stroke.emphasis} * ${ANATOMY.checkbox.markShift.x}), calc(${stroke.emphasis} * ${ANATOMY.checkbox.markShift.y}))`,
    // Indeterminate: the check's long side as one round-capped emphasis line.
    dash: { width: half, height: stroke.emphasis, radius: radius.full },
  },
  radio: { dot: half },
  // Track = one control wide and the thumb plus a rim tall, so the thumb travels its own width.
  switch: {
    width: control.height,
    height: trackHeight,
    thumb,
    inset: rim,
    travel: thumb,
  },
  // The arrow is a trailing icon: it sits at the input inset, and the value stops a control gap
  // before it — the mirror of a Field's leading icon.
  select: {
    arrowInset: control.inset.input,
    paddingEnd: controlSizes((size) => `calc(${control.inset.input[size]} + ${control.icon[size]} + ${control.gap})`),
  },
  // One row of a textarea is exactly a Field of the same size: the first line sits where the
  // Field's line would.
  textarea: {
    paddingBlock: controlSizes((size) => {
      const line = TYPOGRAPHY.preset.textarea[size].leading;
      return `calc((${control.height[size]} - ${line}) / 2 - ${stroke.border})`;
    }),
  },
  marker: ANATOMY.marker,
  // The ring is a control icon tall; inline it follows the text it sits in.
  spinner: { size: control.icon, inline: ANATOMY.inline.spinner, stroke: stroke.emphasis },
  // Marks smaller than a minimum target reach past their edge; each is the inset of its hit area.
  target: {
    selection: controlSizes((size) => targetReach(selection.size[size])),
    switchBlock: controlSizes((size) => targetReach(trackHeight[size])),
    action: controlSizes((size) => targetReach(control.icon[size])),
  },
} as const;
