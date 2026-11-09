import { createVar, globalStyle, style, styleVariants } from "@vanilla-extract/css";

import { emphasisRule, tokens } from "@studio-baeks/paper-ui/tokens";

export const narrow = `screen and (max-width: ${tokens.layout.breakpoint.md})`;

const ROW = `calc(${tokens.shape.control.height.sm} + ${tokens.shape.inset.lg} + ${tokens.shape.inset.lg})`;
export const navHeight = createVar();
const frameMax = createVar();
const frameGutter = createVar();
globalStyle(":root", {
  vars: { [navHeight]: ROW, [frameMax]: tokens.layout.container.content, [frameGutter]: tokens.layout.gutter },
  "@media": { [narrow]: { vars: { [navHeight]: "0px" } } },
});
globalStyle("html", { scrollPaddingTop: navHeight });
// <main> takes focus from the skip link; the page itself shows no ring.
globalStyle("main:focus", { outline: "none" });

export const frame = style({
  width: "100%",
  maxWidth: frameMax,
  marginInline: "auto",
  paddingInline: frameGutter,
  boxSizing: "border-box",
});

export const frameScope = style({ display: "contents" });
export const wideFrame = style({
  vars: { [frameMax]: "none", [frameGutter]: tokens.layout.gap["2xl"] },
  "@media": { [narrow]: { vars: { [frameGutter]: tokens.layout.gutter } } },
});

export const logoMark = style({ display: "block" });

export const header = style({
  height: navHeight,
  "@media": { [narrow]: { position: "static", height: "auto" } },
});

export const headerInner = style([
  frame,
  {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    gridTemplateAreas: '"brand nav tools"',
    alignItems: "center",
    columnGap: tokens.layout.gap.lg,
    height: "100%",
    "@media": {
      [narrow]: {
        gridTemplateColumns: "auto minmax(0, 1fr)",
        gridTemplateAreas: '"brand tools" "nav nav"',
        rowGap: tokens.layout.gap.sm,
        paddingBlock: tokens.shape.inset.md,
      },
    },
  },
]);
export const brand = style({ gridArea: "brand" });
export const headerNav = style({ gridArea: "nav", justifySelf: "end", "@media": { [narrow]: { justifySelf: "start" } } });
export const headerTools = style({ gridArea: "tools", justifySelf: "end" });

export const navLink = styleVariants({
  bar: {
    ...emphasisRule("medium"),
    color: tokens.color.ink.secondary,
    selectors: { '&[aria-current="page"]': { color: tokens.color.ink.primary } },
  },
  plain: { color: tokens.color.ink.primary },
});

export const skipLink = style({
  position: "fixed",
  insetBlockStart: tokens.layout.gap.sm,
  insetInlineStart: tokens.layout.gap.sm,
  paddingBlock: tokens.shape.inset.sm,
  paddingInline: tokens.shape.inset.md,
  borderRadius: tokens.shape.radius.control.md,
});

export const sidebarFrame = style([
  frame,
  {
    display: "grid",
    gridTemplateColumns: `${tokens.shape.dimension.width.lg} minmax(0, 1fr)`,
    isolation: "isolate",
    "@media": { [narrow]: { gridTemplateColumns: "minmax(0, 1fr)", columnGap: 0, paddingInline: 0 } },
  },
]);

export const menuButton = style({ display: "none", "@media": { [narrow]: { display: "inline-flex" } } });

export const content = style({
  minWidth: 0,
  paddingInlineStart: tokens.layout.gap["2xl"],
  paddingBlockStart: tokens.shape.inset["2xl"],
  paddingBlockEnd: tokens.shape.inset["3xl"],
  "@media": { [narrow]: { paddingInline: tokens.layout.gutter, paddingBlockStart: tokens.shape.inset.xl } },
});

