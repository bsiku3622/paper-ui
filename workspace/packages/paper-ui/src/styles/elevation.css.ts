import { ELEVATIONS, elevationStyle, tokens, type Elevation } from "../tokens";
import { layered } from "../tokens/layers.css";

const { styleVariants } = layered("utilities");

export const elevation = styleVariants(
  Object.fromEntries(ELEVATIONS.map((tier) => [tier, elevationStyle(tier)])) as Record<Elevation, ReturnType<typeof elevationStyle>>,
);

const STICKY_TOPS = { none: "0px", ...tokens.layout.gap };
export type StickyTop = keyof typeof STICKY_TOPS;
export const stickyTop = styleVariants(STICKY_TOPS, (top) => ({ top, maxHeight: `calc(${tokens.layout.viewport} - ${top} - ${top})` }));
