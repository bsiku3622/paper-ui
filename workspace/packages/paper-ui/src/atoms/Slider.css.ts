import { controlVars } from "../primitives/control/Control.css";
import { sliderVars } from "../primitives/paint/recipes.css";
import { elevationCast, lineFrame, markParts, stateStyle, targetReach, tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

const { sliderThumb, trackHeight } = markParts(controlVars.mark);

const thumb = {
  boxSizing: "border-box",
  width: sliderVars.thumb,
  height: trackHeight,
  ...lineFrame({ weight: "emphasis" }),
  borderRadius: tokens.shape.radius.full,
  ...elevationCast("lifted"),
} as const;

export const sliderRoot = style([stateStyle.focusVisible, stateStyle.disabled, {
  vars: { [sliderVars.thumb]: sliderThumb },
  appearance: "none",
  display: "block",
  boxSizing: "content-box",
  margin: 0,
  paddingBlock: `calc(${targetReach(trackHeight)} * -1)`,
  backgroundClip: "content-box",
  borderRadius: tokens.shape.radius.full,
  cursor: "pointer",
  selectors: {
    "&::-webkit-slider-thumb": { appearance: "none", ...thumb },
    "&::-moz-range-thumb": thumb,
    "&::-moz-range-track": { background: "transparent" },
  },
}]);
