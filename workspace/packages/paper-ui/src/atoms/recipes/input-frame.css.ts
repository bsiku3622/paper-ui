import { lineFrame, stateStyle, transition } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

// The frame an input group draws around its value: the outline and the ring when the keyboard asks for one. Its size and corner
// are controlClass, its colour and the room its line takes fieldPaint, and its face the Surface fill the Atom is given. The border rises on hover, so it moves
// on the hover role as a Button's does; the face stays on state.
export const inputFrame = style([stateStyle.focusVisible, stateStyle.disabled, {
  ...lineFrame({ control: true }),
  transition: [transition("hover", "border-color"), transition("state", "background-color")].join(", "),
}]);
