import { controlSizes } from "./control-sizes";
import { ANATOMY, SHAPE, SPACE } from "./shape";

const { control, selection, stroke, radius } = SHAPE;

const rim = stroke.emphasis;

export const targetReach = (visual: string) => `calc((min(${visual}, ${SHAPE.target.min}) - ${SHAPE.target.min}) / 2)`;

export const strokeRing = (color: string): string => `inset 0 0 0 ${stroke.border} ${color}`;

export const CONTROL_LINE_PROPERTY = "--pui-control-line";
export const CONTROL_LINE = `var(${CONTROL_LINE_PROPERTY})`;
export const CONTROL_LINE_ROOM = { none: { [CONTROL_LINE_PROPERTY]: "initial" }, line: { [CONTROL_LINE_PROPERTY]: stroke.border } } as const;
export const insideLine = (inset: string): string => `calc(${inset} - ${CONTROL_LINE})`;

export const nestedRadius = (outer: string, inset: string): string => `max(0px, calc(${outer} - ${inset}))`;

export const markParts = (box: string) => {
  const half = `calc(${box} / 2)`;
  const thumb = `calc(${box} - ${rim})`;
  const trackHeight = `calc(${box} + ${rim})`;
  return {
    half,
    short: `calc(${half} / 2)`,
    dot: `calc(${box} * ${ANATOMY.radio.dot})`,
    trackWidth: `calc(${trackHeight} * ${ANATOMY.switch.length})`,
    trackHeight,
    thumb,
    thumbWidth: thumb,
    travel: `calc(${trackHeight} * ${ANATOMY.switch.length} - ${thumb} - ${rim} - ${rim})`,
    sliderThumb: trackHeight,
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
    mark: bySize("half"),
    short: bySize("short"),
    stroke: stroke.emphasis,
    markTransform: `rotate(-45deg) translate(calc(${stroke.emphasis} * ${ANATOMY.checkbox.markShift.x}), calc(${stroke.emphasis} * ${ANATOMY.checkbox.markShift.y}))`,
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
  segment: { inset: SPACE.xs },
  slider: { thumb: bySize("sliderThumb"), rim },
  marker: ANATOMY.marker,
  spinner: { size: control.icon, inline: ANATOMY.inline.spinner, stroke: stroke.emphasis, tail: ANATOMY.spinner.tail },
  target: {
    selection: bySize("reach"),
    switchBlock: bySize("trackReach"),
  },
} as const;
