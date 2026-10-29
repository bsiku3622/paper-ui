import type { Align, Justify, JustifyItem } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants, globalStyle } = layered("components");

export const gridRoot = style({ display: "grid" });
globalStyle(`:where(.${gridRoot})`, { minWidth: 0 });

const ALIGN_ITEMS = { start: "start", center: "center", end: "end", stretch: "stretch", baseline: "baseline" } as const satisfies Record<Align, string>;
const JUSTIFY_CONTENT = { start: "start", center: "center", end: "end", between: "space-between" } as const satisfies Record<Justify, string>;
const JUSTIFY_ITEMS = { start: "start", center: "center", end: "end", stretch: "stretch" } as const satisfies Record<JustifyItem, string>;

export const gridAlign = styleVariants(ALIGN_ITEMS, (alignItems) => ({ alignItems }));
export const gridJustify = styleVariants(JUSTIFY_CONTENT, (justifyContent) => ({ justifyContent }));
export const gridJustifyItems = styleVariants(JUSTIFY_ITEMS, (justifyItems) => ({ justifyItems }));
