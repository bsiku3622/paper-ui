import { createVar, fallbackVar, type StyleRule } from "@vanilla-extract/css";

import { controlVars } from "../primitives/control/Control.css";
import { sidebarFace } from "../primitives/paint/recipes.css";
import { BREAKPOINTS, elevationStack, lineRule, tokens, transition, type Breakpoint } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

const below = (breakpoint: Breakpoint) => `not all and (min-width: ${tokens.layout.breakpoint[breakpoint]})`;

const offsetVar = createVar();
const towardStart = createVar();
export const sidebarOffsetProperty = offsetVar.slice("var(".length, -")".length);
const offset = fallbackVar(offsetVar, "0px");

export const sidebarRail = style({
  vars: { [towardStart]: "translateX(calc(100% * -1))" },
  selectors: { "&:dir(rtl)": { vars: { [towardStart]: "translateX(100%)" } } },
  position: "sticky",
  insetBlockStart: offset,
  alignSelf: "start",
  boxSizing: "border-box",
  blockSize: `calc(${tokens.layout.viewport} - ${offset})`,
  display: "flex",
  flexDirection: "column",
  gap: tokens.layout.gap.xs,
  padding: tokens.layout.gap.sm,
  overflowY: "auto",
  ...lineRule({ side: "end" }),
});

export const sidebarWidth = styleVariants(tokens.shape.dimension.width, (inlineSize) => ({ inlineSize }));

const drawerRules = {
  position: "fixed",
  insetBlockStart: offset,
  insetBlockEnd: 0,
  insetInlineStart: 0,
  blockSize: "auto",
  // With `start`, Chrome shrinks a fixed box to its content.
  alignSelf: "normal",
  paddingBlockEnd: `max(${tokens.layout.gap.md}, env(safe-area-inset-bottom))`,
  backgroundColor: sidebarFace,
  ...elevationStack("modal"),
  transition: transition("state", "transform"),
} as const;

const closedRules = { transform: towardStart } as const;

export const sidebarDrawer = styleVariants({
  ...(Object.fromEntries(BREAKPOINTS.map((breakpoint) => [breakpoint, { "@media": { [below(breakpoint)]: drawerRules } }])) as Record<Breakpoint, StyleRule>),
  always: drawerRules,
});

export const sidebarClosed = styleVariants({
  ...(Object.fromEntries(BREAKPOINTS.map((breakpoint) => [breakpoint, { "@media": { [below(breakpoint)]: closedRules } }])) as Record<Breakpoint, StyleRule>),
  always: closedRules,
});

export const sidebarScrim = style({
  position: "fixed",
  inset: `${offset} 0 0 0`,
  ...elevationStack("overlay"),
});


export const sidebarItem = style({ textAlign: "start" });
export const sidebarBadge = style({ display: "inline-flex", flexShrink: 0, marginInlineStart: "auto" });

export const sidebarGroup = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.layout.gap.xs,
  selectors: { "& + &": { marginBlockStart: tokens.layout.gap.sm }, "&[hidden]": { display: "none" } },
});
export const sidebarGroupTitle = style({ boxSizing: "border-box", minInlineSize: 0, minBlockSize: tokens.shape.control.height.xs, alignContent: "center", paddingInline: controlVars.buttonInset });

export const sidebarDivider = style({ marginBlock: tokens.layout.gap.sm });
export const sidebarFooter = style({ marginBlockStart: "auto", display: "flex", flexDirection: "column", gap: tokens.layout.gap.xs, selectors: { "&[hidden]": { display: "none" } } });

export const sidebarGroupHead = style({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: tokens.layout.gap.xs });
export const sidebarGroupChevron = style({
  flexShrink: 0,
  transition: transition("state", "transform"),
  selectors: { '[aria-expanded="false"] &': { transform: "rotate(-90deg)" }, '[aria-expanded="false"]:dir(rtl) &': { transform: "rotate(90deg)" } },
});
