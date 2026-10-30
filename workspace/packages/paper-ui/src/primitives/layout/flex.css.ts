import type { Align, Justify } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, styleVariants, globalStyle } = layered("components");

// Stack and Inline are one flex container turned two ways. Their roots come first, so the alignment a
// prop picks is the later rule.
export const stackRoot = style({ display: "flex", flexDirection: "column" });
export const inlineRoot = style({ display: "flex", flexDirection: "row", alignItems: "center" });
globalStyle(`:where(.${stackRoot}, .${inlineRoot})`, { minWidth: 0 });
export const inlineWrap = style({ flexWrap: "wrap" });

const ALIGN_ITEMS = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", baseline: "baseline" } as const satisfies Record<Align, string>;
const JUSTIFY_CONTENT = { start: "flex-start", center: "center", end: "flex-end", between: "space-between" } as const satisfies Record<Justify, string>;

export const flexAlign = styleVariants(ALIGN_ITEMS, (alignItems) => ({ alignItems }));
export const flexJustify = styleVariants(JUSTIFY_CONTENT, (justifyContent) => ({ justifyContent }));
