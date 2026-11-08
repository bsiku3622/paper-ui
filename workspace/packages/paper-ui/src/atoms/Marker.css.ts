import { SHAPE_RECIPES } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

// The band: a stripe through the line box, not the whole box, painted per line so a wrapped phrase keeps its stripe on each.
// It runs a little past the glyphs, and the margin takes that back so the words stay where the sentence put them. The colours
// are markerPaint's.
export const markerRoot = style({
  paddingInline: SHAPE_RECIPES.marker.overrun,
  marginInline: `calc(${SHAPE_RECIPES.marker.overrun} * -1)`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: `0 ${SHAPE_RECIPES.marker.position}`,
  backgroundSize: `100% ${SHAPE_RECIPES.marker.height}`,
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
});
