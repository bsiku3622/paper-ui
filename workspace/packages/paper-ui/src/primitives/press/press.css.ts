import { stateStyle } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

export const pressMotion = style([stateStyle.press, stateStyle.disabled, { cursor: "pointer" }]);

export const pressRing = style([stateStyle.focusVisible]);
