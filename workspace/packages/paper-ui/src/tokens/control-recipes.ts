// Control — the second-order Foundation of a sized Atom: what one size means across Shape (height, corner, icon) and
// Typography (the line its text stands on). Neither system can say it alone, so it lives here and not in either. The numbers
// stay in their sources; everything here is a formula over roles, evaluated on the element that uses it.

import { controlSizes, type ControlSize } from "./control-sizes";
import { CONTROL_BUTTON_INSET, SHAPE } from "./shape";
import { CONTROL_LINE } from "./shape-recipes";
import { TYPOGRAPHY } from "./typography";

// What a control is shaped as, across the sizes. label is a Button: its text defines the box. icon is a square. input is a
// typed value: the box comes first. frame is an input whose own element holds the inset, as a Select's native select does.
// area is many lines, so its rows set the height. mark is the square of a Checkbox or a Radio and track the bar of a Switch: they
// stand beside a line of text, so they read the selection size and not the control height. badge is a word on its own ladder, and
// spinner is a ring as wide as the control's icon. segment is a row of choices on one track, as tall as the control, and slider is a
// bar as tall as a Switch's track.
export const CONTROL_ANATOMIES = ["label", "icon", "input", "frame", "area", "mark", "track", "badge", "spinner", "segment", "slider"] as const;
export type ControlAnatomy = (typeof CONTROL_ANATOMIES)[number];

// The Typography preset an anatomy stands on. The marks and the ring hold no text.
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
    // Measured from the glyph line: the same room above, below and beside the glyphs. The input's own line box
    // (inputLeading) is taller, for the caret, and the inset does not read it.
    input: controlSizes((size: ControlSize) => `calc((${height[size]} - ${preset.field[size].leading}) / 2)`),
    // A button's label defines its box, so it sits wider than a typed value. The source sets it by hand for each size, so it
    // does not read the height: overriding the height moves the input inset and leaves this one where it is.
    button: controlSizes((size: ControlSize) => CONTROL_BUTTON_INSET[size]),
  },
  // A Select's arrow is a trailing icon at the input inset, and the value stops a control gap before it: the mirror of a Field's
  // leading icon.
  select: {
    paddingEnd: controlSizes((size: ControlSize) => `calc((${height[size]} - ${preset.field[size].leading}) / 2 + ${SHAPE.control.icon[size]} + ${SHAPE.control.gap})`),
  },
  // One row of a textarea is exactly a Field of the same size: the first line sits where the Field's line would, and the line's
  // room comes out of the inset as it does beside.
  area: {
    paddingBlock: controlSizes((size: ControlSize) => `calc((${height[size]} - ${preset.textarea[size].leading}) / 2 - ${CONTROL_LINE})`),
  },
  // The line box a typed value sits in: taller than the glyph line the inset reads, for the caret.
  inputLine: controlSizes((size: ControlSize) => preset.field[size].inputLeading),
} as const;
