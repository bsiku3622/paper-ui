import { loop } from "../styles/motion.css";

import { SHAPE_RECIPES, tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

const edge = `calc(100% - ${SHAPE_RECIPES.spinner.stroke})`;

export const spinnerRoot = style([loop.spin, {
  display: "inline-block",
  flexShrink: 0,
  borderRadius: tokens.shape.radius.full,
  mask: `radial-gradient(farthest-side, transparent ${edge}, currentColor ${edge})`,
}]);

export const spinnerInline = style({ width: SHAPE_RECIPES.spinner.inline, height: SHAPE_RECIPES.spinner.inline });
