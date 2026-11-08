import { controlVars } from "../primitives/control/Control.css";
import { markParts, tokens, transition } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

const { dot } = markParts(controlVars.mark);

export const radioRoot = style({
  borderRadius: tokens.shape.radius.full,
  transition: transition("state", "background-color", "border-color"),
  selectors: {
    "&:checked::after": {
      content: "''",
      width: dot,
      height: dot,
      borderRadius: tokens.shape.radius.full,
    },
  },
});
