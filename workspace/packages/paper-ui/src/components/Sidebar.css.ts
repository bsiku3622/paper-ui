import { createVar, fallbackVar } from "@vanilla-extract/css";

import { controlSizeVars, controlVars } from "../primitives/control/Control.css";
import { sidebarFace } from "../primitives/paint/recipes.css";
import { elevationStack, lineRule, tokens, transition, type Breakpoint } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

const below = (breakpoint: Breakpoint) => `not all and (min-width: ${tokens.layout.breakpoint[breakpoint]})`;
const touch = `(pointer: coarse) and (max-width: ${tokens.layout.breakpoint.sm}), (pointer: coarse) and (max-height: ${tokens.layout.breakpoint.sm})`;

const offsetVar = createVar();
export const sidebarOffsetProperty = offsetVar.slice("var(".length, -")".length);
const offset = fallbackVar(offsetVar, "0px");

export const sidebarRail = style({
  position: "sticky",
  insetBlockStart: offset,
  alignSelf: "start",
  boxSizing: "border-box",
  blockSize: `calc(${tokens.layout.viewport} - ${offset})`,
  display: "flex",
  flexDirection: "column",
  gap: tokens.layout.gap.xs,
  padding: tokens.layout.gap.md,
  overflowY: "auto",
  ...lineRule({ side: "end" }),
});

export const sidebarWidth = styleVariants(tokens.shape.dimension.width, (inlineSize) => ({ inlineSize }));

export const sidebarDrawer = styleVariants(tokens.layout.breakpoint, (_, breakpoint) => ({
  "@media": {
    [below(breakpoint)]: {
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
    },
  },
}));

export const sidebarClosed = styleVariants(tokens.layout.breakpoint, (_, breakpoint) => ({
  "@media": {
    [below(breakpoint)]: {
      transform: "translateX(calc(100% * -1))",
      selectors: { "&:dir(rtl)": { transform: "translateX(100%)" } },
    },
  },
}));

export const sidebarScrim = style({
  position: "fixed",
  inset: `${offset} 0 0 0`,
  ...elevationStack("overlay"),
});

export const sidebarDensity = style({
  "@media": { [touch]: { selectors: { "&&": { vars: controlSizeVars.lg } } } },
});

export const sidebarItem = style({ textAlign: "start" });
export const sidebarBadge = style({ display: "inline-flex", flexShrink: 0, marginInlineStart: "auto" });

export const sidebarGroup = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.layout.gap.xs,
  selectors: { "& + &": { marginBlockStart: tokens.layout.gap.sm } },
});
export const sidebarGroupTitle = style({ paddingBlock: tokens.layout.gap.xs, paddingInline: controlVars.buttonInset });

export const sidebarDivider = style({ marginBlock: tokens.layout.gap.sm });
export const sidebarFooter = style({ marginBlockStart: "auto", display: "flex", flexDirection: "column", gap: tokens.layout.gap.xs, selectors: { "&[hidden]": { display: "none" } } });
