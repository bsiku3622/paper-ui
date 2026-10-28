import { tokens, SPACE_KEYS, type Space } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

export const gridRoot = style({ display: "grid", minWidth: 0 });
export const gridAlign = styleVariants({ start: { alignItems: "start" }, center: { alignItems: "center" }, end: { alignItems: "end" }, stretch: { alignItems: "stretch" } });
export const gridJustify = styleVariants({ start: { justifyItems: "start" }, center: { justifyItems: "center" }, end: { justifyItems: "end" }, stretch: { justifyItems: "stretch" } });
export const gridRowGap = styleVariants(Object.fromEntries(SPACE_KEYS.map((size) => [size, { rowGap: tokens.layout.gap[size] }])) as Record<Space, { rowGap: string }>);
export const gridColumnGap = styleVariants(Object.fromEntries(SPACE_KEYS.map((size) => [size, { columnGap: tokens.layout.gap[size] }])) as Record<Space, { columnGap: string }>);
