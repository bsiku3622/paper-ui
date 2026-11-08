import { lineFrame, stateStyle, transition } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

export const inputFrame = style([stateStyle.focusVisible, stateStyle.disabled, {
  ...lineFrame({ control: true }),
  transition: [transition("hover", "border-color"), transition("state", "background-color")].join(", "),
}]);
