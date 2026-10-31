import { stateStyle, tokens, transition } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

// The native input of a selection mark with its own look taken off. The ring is drawn on the keyboard state, and
// a disabled mark fades.
export const controlReset = style([stateStyle.focusVisible, stateStyle.disabled, {
  appearance: "none",
  margin: 0,
  flexShrink: 0,
  cursor: "pointer",
}]);

// A mark that is a box centring what it draws once checked. Its colour is markPaint.
export const selectionBox = style([controlReset, {
  display: "grid",
  placeContent: "center",
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
  transition: transition("state", "background-color", "border-color"),
}]);
