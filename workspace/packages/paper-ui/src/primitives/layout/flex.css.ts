import type { Align, Justify } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, styleVariants, globalStyle } = layered("components");
const reset = layered("reset");

export const stackRoot = style({ display: "flex", flexDirection: "column" });
export const inlineRoot = style({ display: "flex", flexDirection: "row", alignItems: "center" });
globalStyle(`:where(.${stackRoot}, .${inlineRoot})`, { minWidth: 0 });
// The empty marker rather than none: Safari stops announcing a list whose marker is none.
reset.globalStyle(`:where(ul.${stackRoot}, ol.${stackRoot}, ul.${inlineRoot}, ol.${inlineRoot})`, { marginBlock: 0, paddingInlineStart: 0, listStyleType: '""' });
export const inlineWrap = style({ flexWrap: "wrap" });

const ALIGN_ITEMS = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", baseline: "baseline" } as const satisfies Record<Align, string>;
const JUSTIFY_CONTENT = { start: "flex-start", center: "center", end: "flex-end", between: "space-between" } as const satisfies Record<Justify, string>;

export const flexAlign = styleVariants(ALIGN_ITEMS, (alignItems) => ({ alignItems }));
export const flexJustify = styleVariants(JUSTIFY_CONTENT, (justifyContent) => ({ justifyContent }));
