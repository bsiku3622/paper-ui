import { controlVars } from "../primitives/control/Control.css";
import { SHAPE_RECIPES, markParts, tokens, transition, elevationCast, elevationStack } from "../tokens";
import { layered } from "../tokens/layers.css";
import { markReset } from "./recipes/mark.css";

const { style } = layered("components");

const { thumb, thumbWidth, travel, trackReach } = markParts(controlVars.mark);
const { inset } = SHAPE_RECIPES.switch;

export const switchRoot = style([markReset, {
  position: "relative",
  borderRadius: tokens.shape.radius.full,
  transition: transition("state", "background-color", "box-shadow"),
  selectors: {
    "&::after": {
      content: "''",
      position: "absolute",
      insetBlock: 0,
      insetInlineStart: inset,
      marginBlock: "auto",
      width: thumbWidth,
      height: thumb,
      borderRadius: tokens.shape.radius.full,
      ...elevationStack("lifted"),
      ...elevationCast("lifted"),
      transition: transition("state", "inset-inline-start"),
    },
    "&:checked::after": { insetInlineStart: `calc(${inset} + ${travel})` },
    "&::before": { content: "''", position: "absolute", insetBlock: trackReach, insetInline: 0 },
  },
  "@media": { "(forced-colors: active)": { selectors: { "&::after": { boxShadow: "none" } } } },
}]);
