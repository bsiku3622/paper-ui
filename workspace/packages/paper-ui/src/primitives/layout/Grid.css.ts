import { createVar } from "@vanilla-extract/css";

import { BREAKPOINTS, tokens, type Align, type Breakpoint, type Justify, type JustifyItem } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, styleVariants, globalStyle } = layered("components");
const reset = layered("reset");

export const gridRoot = style({ display: "grid", gridTemplateColumns: "minmax(0, 1fr)" });
globalStyle(`:where(.${gridRoot})`, { minWidth: 0 });
reset.globalStyle(`:where(ul.${gridRoot}, ol.${gridRoot})`, { marginBlock: 0, paddingInlineStart: 0, listStyleType: '""' });

const ALIGN_ITEMS = { start: "start", center: "center", end: "end", stretch: "stretch", baseline: "baseline" } as const satisfies Record<Align, string>;
const JUSTIFY_CONTENT = { start: "start", center: "center", end: "end", between: "space-between" } as const satisfies Record<Justify, string>;
const JUSTIFY_ITEMS = { start: "start", center: "center", end: "end", stretch: "stretch" } as const satisfies Record<JustifyItem, string>;

export const gridAlign = styleVariants(ALIGN_ITEMS, (alignItems) => ({ alignItems }));
export const gridJustify = styleVariants(JUSTIFY_CONTENT, (justifyContent) => ({ justifyContent }));
export const gridJustifyItems = styleVariants(JUSTIFY_ITEMS, (justifyItems) => ({ justifyItems }));

// Tracks go through variables because an inline track beats media queries; they are written narrow to wide, so the wider step wins by order.
const stepsOf = (property: "gridTemplateColumns" | "gridTemplateRows") => {
  const base = createVar();
  const steps = Object.fromEntries(BREAKPOINTS.map((step) => [step, createVar()])) as Record<Breakpoint, string>;
  const nameOf = (reference: string) => reference.slice("var(".length, -")".length);
  return {
    base: { property: nameOf(base), className: style({ [property]: base }) },
    at: Object.fromEntries(BREAKPOINTS.map((step) => [step, {
      property: nameOf(steps[step]),
      className: style({ "@media": { [`(min-width: ${tokens.layout.breakpoint[step]})`]: { [property]: steps[step] } } }),
    }])) as Record<Breakpoint, { property: string; className: string }>,
  };
};
export const gridColumnSteps = stepsOf("gridTemplateColumns");
export const gridRowSteps = stepsOf("gridTemplateRows");
