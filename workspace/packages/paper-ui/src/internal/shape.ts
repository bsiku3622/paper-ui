import type { StyleRule } from "@vanilla-extract/css";

import { SHAPE_RECIPES, controlSizes, tokens } from "../tokens";

export const geometry = SHAPE_RECIPES;

const { height } = tokens.shape.control;
const box = tokens.shape.selection.size;

// Each sized Atom picks its role here; no stylesheet patches a size ladder of its own.
export const controlGeometry = {
  button: controlSizes((size) => ({ height: height[size], paddingInline: tokens.shape.control.inset.button[size] } satisfies StyleRule)),
  // A square the height of a control, with no inset: the label is an icon.
  iconButton: controlSizes((size) => ({ height: height[size], width: height[size], paddingInline: 0 } satisfies StyleRule)),
  field: controlSizes((size) => ({ height: height[size], paddingInline: tokens.shape.control.inset.input[size] } satisfies StyleRule)),
  // The line box a Field's value sits in: taller than the glyph line the inset reads, for the caret.
  fieldInput: controlSizes((size) => ({ lineHeight: tokens.typography.preset.field[size].inputLeading } satisfies StyleRule)),
  select: controlSizes((size) => ({ height: height[size], paddingInline: tokens.shape.control.inset.input[size], paddingInlineEnd: geometry.select.paddingEnd[size] } satisfies StyleRule)),
  // The trailing arrow sits at the input inset.
  selectArrow: controlSizes((size) => ({ insetInlineEnd: geometry.select.arrowInset[size] } satisfies StyleRule)),
  textarea: controlSizes((size) => ({ paddingInline: tokens.shape.control.inset.input[size], paddingBlock: geometry.textarea.paddingBlock[size] } satisfies StyleRule)),
  // The box Checkbox and Radio share, and what each draws inside it once checked.
  selection: controlSizes((size) => ({ width: box[size], height: box[size] } satisfies StyleRule)),
  checkbox: controlSizes((size) => ({
    selectors: {
      "&:checked::after": { width: geometry.checkbox.mark[size], height: geometry.checkbox.short[size] },
      "&:indeterminate::after": { width: geometry.checkbox.dash.width[size] },
    },
  } satisfies StyleRule)),
  radio: controlSizes((size) => ({
    selectors: { "&:checked::after": { width: geometry.radio.dot[size], height: geometry.radio.dot[size] } },
  } satisfies StyleRule)),
  // The track, its thumb at the rim, and the thumb moved by its own width when checked.
  switch: controlSizes((size) => ({
    width: geometry.switch.width[size],
    height: geometry.switch.height[size],
    selectors: {
      "&::after": { width: geometry.switch.thumb[size], height: geometry.switch.thumb[size], insetInlineStart: geometry.switch.inset },
      "&:checked::after": { insetInlineStart: `calc(${geometry.switch.inset} + ${geometry.switch.travel[size]})` },
    },
  } satisfies StyleRule)),
  // A hit area past what is drawn, on an invisible pseudo-element placed from the padding box, so a bordered mark starts
  // a border further out.
  selectionReach: controlSizes((size) => ({
    selectors: { "&::before": { content: "''", position: "absolute", inset: `calc(${geometry.target.selection[size]} - ${tokens.shape.stroke.border})` } },
  } satisfies StyleRule)),
  switchReach: controlSizes((size) => ({
    selectors: { "&::before": { content: "''", position: "absolute", insetBlock: geometry.target.switchBlock[size], insetInline: 0 } },
  } satisfies StyleRule)),
  fieldActionReach: controlSizes((size) => ({
    selectors: { "&::before": { content: "''", position: "absolute", inset: geometry.target.action[size] } },
  } satisfies StyleRule)),
  badge: controlSizes((size) => ({ height: geometry.badge.height[size], paddingInline: geometry.badge.inset[size] } satisfies StyleRule)),
  spinner: controlSizes((size) => ({ width: geometry.spinner.size[size], height: geometry.spinner.size[size] } satisfies StyleRule)),
  // Inside a line of text the ring is as tall as the text.
  spinnerInline: { width: geometry.spinner.inline, height: geometry.spinner.inline } satisfies StyleRule,
};
