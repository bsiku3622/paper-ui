import { iconSizeVar } from "../primitives/Icon.css";
import { controlVars } from "../primitives/control/Control.css";
import { stateStyle, targetReach, tokens, transition } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

export const fieldWrap = style({
  display: "flex",
  alignItems: "center",
  width: "100%",
  cursor: "text",
});

export const fieldInput = style({
  flex: 1,
  minWidth: 0,
  // Chromium's input clips its own overflow, so a taller line-height alone can cut the caret at the box edge.
  height: "100%",
  border: "none",
  background: "transparent",
  outline: "none",
  font: "inherit",
  lineHeight: controlVars.inputLine,
  // Browser form styles set letter-spacing: normal, which cuts the wrapper's inheritance, so the inner input picks it up again.
  letterSpacing: "inherit",
  color: "inherit",
  padding: 0,
  margin: 0,
  selectors: {
    "&:disabled": { cursor: "inherit" },
    // Browsers draw their own clear (search) and reveal (Edge password) buttons inside the input; they are hidden because Field owns both.
    "&::-webkit-search-cancel-button, &::-webkit-search-decoration": { appearance: "none", display: "none" },
    "&::-ms-clear, &::-ms-reveal": { display: "none" },
  },
});

export const fieldAdornment = style({
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
});

export const fieldAction = style([stateStyle.focusVisible, stateStyle.disabledCursor, {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  borderRadius: tokens.shape.radius.control.xs,
  transition: transition("hover", "color"),
}]);

export const fieldActionReach = style({
  selectors: { "&::before": { content: "''", position: "absolute", inset: targetReach(iconSizeVar) } },
});

export const fieldTextAlign = styleVariants({
  start: { textAlign: "start" },
  center: { textAlign: "center" },
  end: { textAlign: "end" },
});
