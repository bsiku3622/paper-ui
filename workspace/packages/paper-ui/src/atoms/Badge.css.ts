import { SHAPE_RECIPES, tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

export const badgeDot = style({
  width: SHAPE_RECIPES.badge.dot,
  height: SHAPE_RECIPES.badge.dot,
  borderRadius: tokens.shape.radius.full,
  flexShrink: 0,
});
