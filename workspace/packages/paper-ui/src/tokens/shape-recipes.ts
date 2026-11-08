// Shape recipes — component anatomy built from Shape roles. A recipe holds only structural values
// (half with / 2, the 45° turn); optical ratios live in the source anatomy. Every value is a Shape
// role, a SHAPE_SOURCE anatomy value, or a formula over them. Formulas stay strings and are
// evaluated on the consuming element, like the roles they read.

import { controlSizes } from "./control-sizes";
import { ANATOMY, SHAPE, SPACE } from "./shape";

const { control, selection, stroke, radius } = SHAPE;

// The track showing around a switch thumb reads as an emphasis stroke.
const rim = stroke.emphasis;

// How far a hit area reaches past a mark of this size, on each side, to be a minimum target: half the
// shortfall, so it is never positive and a mark that already is one reaches nowhere.
export const targetReach = (visual: string) => `calc((min(${visual}, ${SHAPE.target.min}) - ${SHAPE.target.min}) / 2)`;

// An inset hairline drawn inside an element's own box, so it adds no size: the off Switch's ring, a
// forced-colours mark, a selected face under increased contrast. It is the one box-shadow outside elevation.
export const strokeRing = (color: string): string => `inset 0 0 0 ${stroke.border} ${color}`;

// The room a control keeps for its line. A control with no line keeps none: its face, and a shadow inside it, reach its edge, and
// what it holds stands at its inset from that edge, where a design file measures it. A line, a status, more contrast or forced
// colours (where the OS draws the edge of every control) give the room back, and the inset gives that much up, so nothing inside
// moves. The paint that knows whether there is a line sets the room on the control; the control's frame and insets read it. The
// property is registered as a length that inherits, so a native select reads its frame's room, every control that holds a line
// sets its own, and anything else reads none: its initial value is a zero length.
export const CONTROL_LINE_PROPERTY = "--pui-control-line";
export const CONTROL_LINE = `var(${CONTROL_LINE_PROPERTY})`;
export const CONTROL_LINE_ROOM = { none: { [CONTROL_LINE_PROPERTY]: "initial" }, line: { [CONTROL_LINE_PROPERTY]: stroke.border } } as const;
// What an inset leaves for the content once the line has its room.
export const insideLine = (inset: string): string => `calc(${inset} - ${CONTROL_LINE})`;

// The corner of what sits inside a rounded box at a distance from its edge: the two curves stay parallel when the inner one is
// the outer one less the distance, and a distance past the curve leaves a square corner.
export const nestedRadius = (outer: string, inset: string): string => `max(0px, calc(${outer} - ${inset}))`;

// What a selection box derives, whatever its size. One set of formulas read two ways: by size in the tables below, and over
// Control's variable on the element, so a mark needs no class per size.
export const markParts = (box: string) => {
  const half = `calc(${box} / 2)`;
  const thumb = `calc(${box} - ${rim})`;
  const trackHeight = `calc(${box} + ${rim})`;
  return {
    // Half a box is the check's long side, and a quarter is the check's short side. The radio's dot is the source's share of the box.
    half,
    short: `calc(${half} / 2)`,
    dot: `calc(${box} * ${ANATOMY.radio.dot})`,
    // Track = as tall as a box plus a rim, and the source's share of that long: short and stout. The thumb is round, keeps a rim on
    // every side, and travels what is left.
    trackWidth: `calc(${trackHeight} * ${ANATOMY.switch.length})`,
    trackHeight,
    thumb,
    thumbWidth: thumb,
    travel: `calc(${trackHeight} * ${ANATOMY.switch.length} - ${thumb} - ${rim} - ${rim})`,
    // A Slider's thumb is a circle as tall as its track, the round knob a Switch has.
    sliderThumb: trackHeight,
    // Marks smaller than a minimum target reach past their edge; each is the inset of its hit area.
    reach: targetReach(box),
    trackReach: targetReach(trackHeight),
  };
};
const bySize = (part: keyof ReturnType<typeof markParts>) => controlSizes((size) => markParts(selection.size[size])[part]);
const thumb = bySize("thumb");

export const SHAPE_RECIPES = {
  badge: { height: ANATOMY.badge.height, inset: ANATOMY.badge.inset, gap: SPACE.xs, dot: ANATOMY.inline.dot },
  checkbox: {
    radius: radius.selection,
    // The check is an L, half the box wide and a quarter tall, turned onto its diagonal. Turning
    // leaves its visual mass low and left, so it shifts by the source's ratios of its own stroke.
    mark: bySize("half"),
    short: bySize("short"),
    stroke: stroke.emphasis,
    markTransform: `rotate(-45deg) translate(calc(${stroke.emphasis} * ${ANATOMY.checkbox.markShift.x}), calc(${stroke.emphasis} * ${ANATOMY.checkbox.markShift.y}))`,
    // Indeterminate: the check's long side as one round-capped emphasis line.
    dash: { width: bySize("half"), height: stroke.emphasis, radius: radius.full },
  },
  radio: { dot: bySize("dot") },
  switch: {
    width: bySize("trackWidth"),
    height: bySize("trackHeight"),
    thumb,
    thumbWidth: bySize("thumbWidth"),
    inset: rim,
    travel: bySize("travel"),
  },
  // A segment's chip stands this far inside its track, and a Slider's thumb wears the emphasis stroke as its rim.
  segment: { inset: SPACE.xs },
  slider: { thumb: bySize("sliderThumb"), rim },
  marker: ANATOMY.marker,
  // The ring is a control icon tall; inline it follows the text it sits in.
  spinner: { size: control.icon, inline: ANATOMY.inline.spinner, stroke: stroke.emphasis, tail: ANATOMY.spinner.tail },
  target: {
    selection: bySize("reach"),
    switchBlock: bySize("trackReach"),
  },
} as const;
