import { controlGeometry } from "../../internal/shape";
import { stateStyle, tokens } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, styleVariants } = layered("components");

// The native input of a selection mark with its own look taken off. The ring is drawn on the keyboard state, and
// a disabled mark fades.
export const controlReset = style([stateStyle.focusVisible, stateStyle.disabled, {
  appearance: "none",
  margin: 0,
  flexShrink: 0,
  cursor: "pointer",
  // A hit area reaches past the box through a pseudo-element, which the input would otherwise clip.
  overflow: "visible",
}]);

// A mark that is a box centring what it draws once checked. Its colour is markPaint.
export const selectionBox = style([controlReset, {
  position: "relative",
  display: "grid",
  placeContent: "center",
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
}]);

// The square Checkbox and Radio share, and how far its hit area reaches past it. A mark smaller than a minimum
// target is still one: the hit area is invisible and carries no paint. A pseudo-element is placed from the padding box,
// inside the border, so the reach starts a border further out.
export const selectionSize = styleVariants(controlGeometry.selection);
export const selectionReach = styleVariants(controlGeometry.selectionReach);
