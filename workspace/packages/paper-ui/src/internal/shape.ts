import type { StyleRule } from "@vanilla-extract/css";

import { tokens } from "../tokens";
import { controlSizes } from "../tokens/shape";
import { SHAPE_RECIPES } from "../tokens/shape-recipes";

export const geometry = SHAPE_RECIPES;

// Each control picks its role here; no stylesheet patches a size ladder of its own.
export const controlGeometry = {
  button: controlSizes((size) => ({ height: tokens.shape.control.height[size], paddingInline: tokens.shape.control.inset.button[size] } satisfies StyleRule)),
  field: controlSizes((size) => ({ height: tokens.shape.control.height[size], paddingInline: tokens.shape.control.inset.input[size] } satisfies StyleRule)),
  select: controlSizes((size) => ({ height: tokens.shape.control.height[size], paddingInline: tokens.shape.control.inset.input[size], paddingInlineEnd: geometry.select.paddingEnd[size] } satisfies StyleRule)),
  textarea: controlSizes((size) => ({ paddingInline: tokens.shape.control.inset.input[size], paddingBlock: geometry.textarea.paddingBlock[size] } satisfies StyleRule)),
};

// The keyboard focus ring: Shape owns its width and offset, Color its ink.
export const focusRing = {
  outline: `${tokens.shape.focus.width} solid ${tokens.color.interaction.focus}`,
  outlineOffset: tokens.shape.focus.offset,
} satisfies StyleRule;
