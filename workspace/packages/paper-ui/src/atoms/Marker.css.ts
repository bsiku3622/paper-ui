import { SHAPE_RECIPES } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

export const markerRoot = style({
  paddingInline: SHAPE_RECIPES.marker.overrun,
  marginInline: `calc(${SHAPE_RECIPES.marker.overrun} * -1)`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: `0 ${SHAPE_RECIPES.marker.position}`,
  backgroundSize: `100% ${SHAPE_RECIPES.marker.height}`,
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
});
