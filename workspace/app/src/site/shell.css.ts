// The geometry of the site shell: the header, the page frame, the sidebar frame and the content column.
// Everything is tokens.* from the same object the package reads (vanilla-extract), so a token that
// changes here follows and a token that does not exist breaks the build. Stacking goes through the
// elevation tiers the components carry; this file declares no z-index.

import { createVar, globalStyle, style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

// Below md the header is static, the sidebars fold into a disclosure and the content takes the gutter.
export const narrow = `screen and (max-width: ${tokens.layout.breakpoint.md})`;
const line = `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`;

// ROW is the one length the shell owns: the header's single row, which no token names. The header's height is a
// variable so a sticky sidebar can sit under it, and 0 once the header is static.
const ROW = "52px";
export const navHeight = createVar();
globalStyle(":root", {
  vars: { [navHeight]: ROW },
  "@media": { [narrow]: { vars: { [navHeight]: "0px" } } },
});
// An anchor lands below the sticky header. <main> takes focus from the skip link, and the page is no ring.
globalStyle("html", { scrollPaddingTop: navHeight });
globalStyle("main:focus", { outline: "none" });

// ── Frame ────────────────────────────────────────────────────────────────────
// The page's width: container.content, with the gutter inside it.
export const frame = style({
  width: "100%",
  maxWidth: tokens.layout.container.content,
  marginInline: "auto",
  paddingInline: tokens.layout.gutter,
  boxSizing: "border-box",
});

// ── Header ───────────────────────────────────────────────────────────────────
// One row of the frame; below md the links drop to a second row under the brand instead of breaking per
// character, and the header leaves the top of the screen with the rest of the page.
export const header = style({
  top: 0,
  height: navHeight,
  borderBottom: line,
  "@media": { [narrow]: { position: "static", height: `calc(${ROW} + ${tokens.shape.control.height.md})` } },
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
        gridTemplateRows: `${ROW} ${tokens.shape.control.height.md}`,
        rowGap: 0,
      },
    },
  },
]);
export const brand = style({ gridArea: "brand", display: "inline-flex" });
export const headerNav = style({ gridArea: "nav" });
export const headerTools = style({ gridArea: "tools", justifySelf: "end" });

// A link of the chrome. `bar` is a link of the navigation bar; `plain` carries no mark of its own, for a
// brand or a link set in a Text.
export const navLink = styleVariants({
  bar: {
    padding: `${tokens.shape.inset.xs} ${tokens.shape.inset.sm}`,
    color: tokens.color.ink.secondary,
    textDecoration: "none",
    selectors: { '&[aria-current="page"]': { color: tokens.color.ink.primary } },
  },
  plain: { color: tokens.color.ink.primary, textDecoration: "none" },
});

// The first Tab on every page. It appears at the top left once it has focus.
export const skipLink = style({
  position: "fixed",
  insetBlockStart: tokens.layout.gap.sm,
  insetInlineStart: tokens.layout.gap.sm,
  paddingBlock: tokens.shape.inset.sm,
  paddingInline: tokens.shape.inset.md,
  borderRadius: tokens.shape.radius.control,
  color: tokens.color.ink.primary,
  textDecoration: "none",
});

// ── Sidebar and content ──────────────────────────────────────────────────────
// A column of navigation beside the content. The content column may shrink, so a wide table or code block
// scrolls inside it instead of pushing the page. `isolation` keeps the sidebar (the sticky tier) under the header.
export const sidebarFrame = style({
  display: "grid",
  gridTemplateColumns: `${tokens.shape.dimension.width.lg} minmax(0, 1fr)`,
  width: "100%",
  maxWidth: tokens.layout.container.content,
  marginInline: "auto",
  isolation: "isolate",
  "@media": { [narrow]: { gridTemplateColumns: "minmax(0, 1fr)" } },
});

export const sidebar = style({
  top: navHeight,
  alignSelf: "start",
  minHeight: `calc(100vh - ${navHeight})`,
  maxHeight: `calc(100dvh - ${navHeight})`,
  overflowY: "auto",
  padding: tokens.layout.gutter,
  borderRight: line,
  "@media": {
    [narrow]: { position: "static", minHeight: 0, maxHeight: "none", overflowY: "visible", borderRight: 0, borderBottom: line },
  },
});

export const content = style({
  minWidth: 0,
  padding: tokens.shape.inset.xl,
  "@media": { [narrow]: { paddingInline: tokens.layout.gutter } },
});

// An item of the sidebar. The face of the current one (and the pointer's tint) is the Surface's own; the rest ink
// is set here and leaves the current item to that face, so it follows forced colours.
export const navItem = style({
  display: "block",
  padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`,
  textDecoration: "none",
  selectors: { '&:not([aria-current="page"])': { color: tokens.color.ink.secondary } },
});
// A heading or a caption stands in line with the items' text.
export const navHeading = style({ paddingInline: tokens.shape.inset.md });

// Under narrow the sidebar is a closed disclosure; its summary names the list and the page you are on.
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
