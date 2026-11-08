import { controlVars } from "../../primitives/control/Control.css";
import { CONTROL_LINE, lineFrame, markParts, stateStyle } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

export const markReset = style([stateStyle.focusVisible, stateStyle.disabled, {
  appearance: "none",
  margin: 0,
  flexShrink: 0,
  cursor: "pointer",
  overflow: "visible",
}]);

// A pseudo-element is placed from the padding box, inside the border, so the reach starts the line's room further out.
export const markBox = style([markReset, {
  position: "relative",
  display: "grid",
  placeContent: "center",
  ...lineFrame({ control: true }),
  selectors: {
    "&::before": { content: "''", position: "absolute", inset: `calc(${markParts(controlVars.mark).reach} - ${CONTROL_LINE})` },
  },
}]);
