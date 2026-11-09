import { createVar, globalStyle, style, styleVariants } from "@vanilla-extract/css";

import { emphasisRule, tokens, transition } from "@studio-baeks/paper-ui/tokens";

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
    gridTemplateColumns: `${tokens.shape.dimension.width.lg} auto minmax(0, 1fr)`,
    isolation: "isolate",
    "@media": { [narrow]: { gridTemplateColumns: "minmax(0, 1fr)", columnGap: 0, paddingInline: 0 } },
  },
]);

export const sidebarRule = style({ "@media": { [narrow]: { display: "none" } } });

const rowInset = tokens.shape.control.inset.button.sm;

export const sidebar = style({
  top: navHeight,
  alignSelf: "start",
  maxHeight: `calc(${tokens.layout.viewport} - ${navHeight})`,
  overflowY: "auto",
  marginInlineStart: `calc((${rowInset} + ${tokens.shape.inset.xs}) * -1)`,
  paddingInline: tokens.shape.inset.xs,
  paddingInlineEnd: tokens.shape.inset.md,
  paddingBlockStart: tokens.shape.inset.xl,
  paddingBlockEnd: tokens.shape.inset.xl,
  "@media": {
    [narrow]: { position: "static", maxHeight: "none", overflowY: "visible", marginInlineStart: 0, paddingInline: tokens.layout.gutter, paddingBlock: 0 },
  },
});

export const content = style({
  minWidth: 0,
  paddingInlineStart: tokens.layout.gap["2xl"],
  paddingBlockStart: tokens.shape.inset["2xl"],
  paddingBlockEnd: tokens.shape.inset["3xl"],
  "@media": { [narrow]: { paddingInline: tokens.layout.gutter, paddingBlockStart: tokens.shape.inset.xl } },
});

export const navHeading = style({ paddingInline: rowInset });

export const groupChevron = style({
  transition: transition("state", "transform"),
  selectors: { '[aria-expanded="false"] > &': { transform: "rotate(-90deg)" } },
});

export const summary = style({
  display: "none",
  listStyle: "none",
  selectors: { "&::-webkit-details-marker": { display: "none" } },
  "@media": {
    [narrow]: {
      display: "flex",
      alignItems: "center",
      gap: tokens.layout.gap.sm,
      minHeight: tokens.shape.control.height.md,
      paddingInline: tokens.shape.inset.md,
      cursor: "pointer",
    },
  },
});
export const summaryCurrent = style({ flex: 1, minWidth: 0 });
export const chevron = style({
  selectors: { "details[open] > summary &": { transform: "rotate(90deg)" } },
});
export const disclosureBody = style({
  "@media": { [narrow]: { paddingBlockStart: tokens.layout.gap.lg } },
});
