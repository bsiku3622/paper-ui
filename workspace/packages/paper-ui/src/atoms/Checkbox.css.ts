import { controlVars } from "../primitives/control/Control.css";
import { SHAPE_RECIPES, markParts, transition } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

const { checkbox } = SHAPE_RECIPES;
const parts = markParts(controlVars.mark);

export const checkboxRoot = style({
  borderRadius: checkbox.radius,
  transition: transition("state", "background-color", "border-color"),
  selectors: {
    "&:checked::after": {
      content: "''",
      borderStyle: "solid",
      borderWidth: `0 0 ${checkbox.stroke} ${checkbox.stroke}`,
      transform: checkbox.markTransform,
    },
    "&:indeterminate::after": {
      content: "''",
      height: checkbox.dash.height,
      borderRadius: checkbox.dash.radius,
    },
  },
});

export const checkboxMark = style({
  selectors: {
    "&:checked::after": { width: parts.half, height: parts.short },
    "&:indeterminate::after": { width: parts.half },
  },
});
