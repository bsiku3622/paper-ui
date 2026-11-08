import { controlVars } from "../../primitives/control/Control.css";
import { CONTROL_LINE, lineFrame, markParts, stateStyle } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

// The native input of a selection mark with its own look taken off. The ring is drawn on the keyboard state, and
// a disabled mark fades.
export const markReset = style([stateStyle.focusVisible, stateStyle.disabled, {
  appearance: "none",
  margin: 0,
  flexShrink: 0,
  cursor: "pointer",
  // A hit area reaches past the box through a pseudo-element, which the input would otherwise clip.
  overflow: "visible",
}]);

// A mark that is a box centring what it draws once checked. Its colour is markPaint and its size is Control's. A mark smaller than a
// minimum target is still one: the hit area is invisible and carries no paint. A pseudo-element is placed from the padding box, inside
// the border, so the reach starts the line's room further out.
export const markBox = style([markReset, {
  position: "relative",
  display: "grid",
  placeContent: "center",
  ...lineFrame({ control: true }),
  selectors: {
    "&::before": { content: "''", position: "absolute", inset: `calc(${markParts(controlVars.mark).reach} - ${CONTROL_LINE})` },
  },
}]);
