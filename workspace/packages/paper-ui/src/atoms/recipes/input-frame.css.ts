import { stateStyle, tokens, transition } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

// The frame an input group draws around its value: the outline, the corner and the ring when the keyboard asks
// for one. Its colour is fieldPaint, and its face the Surface fill the Atom is given. The border rises on hover, so
// it moves on the hover role as a Button's does; the face stays on state.
export const inputFrame = style([stateStyle.focusVisible, stateStyle.disabled, {
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
  borderRadius: tokens.shape.radius.control,
  transition: [transition("hover", "border-color"), transition("state", "background-color")].join(", "),
}]);

// A pill takes its corners from the height. It follows inputFrame, so the same specificity is won by order.
export const inputFramePill = style({ borderRadius: tokens.shape.radius.full });
