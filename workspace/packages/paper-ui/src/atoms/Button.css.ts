import { STATE_TINT_PROPERTY, stateStyle, tokens, transition } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

export const buttonRoot = style([stateStyle.focusVisible, {
  textDecoration: "none",
  userSelect: "none",
  transition: [transition("hover", STATE_TINT_PROPERTY, "border-color"), transition("state", "background-color", "color"), transition("press", "transform")].join(", "),
}]);

export const buttonFull = style({ width: "100%" });

export const buttonAnchored = style({ position: "relative" });
export const buttonBadge = style({
  position: "absolute",
  insetBlockStart: `calc(${tokens.shape.inset.xs} * -1)`,
  insetInlineEnd: `calc(${tokens.shape.inset.xs} * -1)`,
  display: "inline-flex",
  pointerEvents: "none",
});
