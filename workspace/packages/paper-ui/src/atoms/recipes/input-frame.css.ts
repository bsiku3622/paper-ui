import { controlGeometry } from "../../internal/shape";
import { stateStyle, tokens, transition } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, styleVariants } = layered("components");

// The frame an input group draws around its value: the outline, the corner and the ring when the keyboard asks
// for one. Its colour is fieldPaint, and its face the Surface fill the Atom is given. The border rises on hover, so
// it moves on the hover role as a Button's does; the face stays on state.
export const inputFrame = style([stateStyle.focusVisible, stateStyle.disabled, {
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
  transition: [transition("hover", "border-color"), transition("state", "background-color")].join(", "),
}]);

// The corner follows the size, as a Button's does.
export const inputFrameCorner = styleVariants(controlGeometry.corner);

// A pill follows inputFrameCorner, so the same specificity is won by order.
export const inputFramePill = style({ borderRadius: tokens.shape.radius.pill });
