import { stateStyle } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

// The motion of a press: the 1px the target sinks while it is pressed, the pointer cursor, and the look of a target
// that cannot be used. No colour and no transition (the element joins the roles it uses with transition()).
export const pressMotion = style([stateStyle.press, stateStyle.disabled, { cursor: "pointer" }]);
