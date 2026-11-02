// The geometry of the site shell: the header, the page frame, the sidebar frame and the content column.
// Everything is tokens.* from the same object the package reads (vanilla-extract), so a token that
// changes here follows and a token that does not exist breaks the build. Stacking goes through the
// elevation tiers the components carry; this file declares no z-index.

import { createVar, globalStyle, style, styleVariants } from "@vanilla-extract/css";

import { emphasisRule, tokens } from "@studio-baeks/paper-ui/tokens";

// Below md the header is static, the sidebars fold into a disclosure and the content takes the gutter.
export const narrow = `screen and (max-width: ${tokens.layout.breakpoint.md})`;

// The header's one row: a small control and the same air above and below it. Its height is a variable so a sticky sidebar can
// sit under it, and 0 once the header is static.
const ROW = `calc(${tokens.shape.control.height.sm} + ${tokens.shape.inset.lg} + ${tokens.shape.inset.lg})`;
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

// The wordmark is a block, so the line box around it adds nothing to its height.
export const logoMark = style({ display: "block" });

// ── Header ───────────────────────────────────────────────────────────────────
// One row; below md the links drop to a second row under the brand instead of breaking per character, and the header
// leaves the top of the screen with the rest of the page. The canvas under it is the only edge it needs.
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

// How a Link of the chrome is inked. `bar` is a link of the navigation bar, whose words say where you are; `plain` is the
// brand and the skip link.
export const navLink = styleVariants({
  bar: {
    ...emphasisRule("medium"),
    color: tokens.color.ink.secondary,
    selectors: { '&[aria-current="page"]': { color: tokens.color.ink.primary } },
  },
  plain: { color: tokens.color.ink.primary },
});

// The first Tab on every page. It appears at the top left once it has focus.
export const skipLink = style({
  position: "fixed",
  insetBlockStart: tokens.layout.gap.sm,
  insetInlineStart: tokens.layout.gap.sm,
  paddingBlock: tokens.shape.inset.sm,
  paddingInline: tokens.shape.inset.md,
  borderRadius: tokens.shape.radius.control.md,
});

// ── Sidebar and content ──────────────────────────────────────────────────────
// A list of navigation beside the content, inside the page's frame. The content column may shrink, so a wide table or code
// block scrolls inside it instead of pushing the page. `isolation` keeps the sidebar (the sticky tier) under the header.
export const sidebarFrame = style([
  frame,
  {
    display: "grid",
    gridTemplateColumns: `${tokens.shape.dimension.width.lg} minmax(0, 1fr)`,
    columnGap: tokens.layout.gap["3xl"],
    isolation: "isolate",
    "@media": { [narrow]: { gridTemplateColumns: "minmax(0, 1fr)", columnGap: 0, paddingInline: 0 } },
  },
]);

// Where a row's words start inside its face.
const rowInset = `calc(${tokens.shape.control.inset.button.sm} + ${tokens.shape.stroke.border})`;

// The list stays under the header with its own scroll. It lies on the canvas with no face and no line. The words of its rows
// stand on the brand's axis and their faces hang out into the page's margin. A row's focus ring would be cut by the scroll,
// so the list keeps that much room around the rows.
export const sidebar = style({
  top: navHeight,
  alignSelf: "start",
  maxHeight: `calc(${tokens.layout.viewport} - ${navHeight})`,
  overflowY: "auto",
  marginInlineStart: `calc((${rowInset} + ${tokens.shape.inset.xs}) * -1)`,
  paddingInline: tokens.shape.inset.xs,
  paddingBlockStart: tokens.shape.inset.xl,
  paddingBlockEnd: tokens.shape.inset.xl,
  "@media": {
    [narrow]: { position: "static", maxHeight: "none", overflowY: "visible", marginInlineStart: 0, paddingInline: tokens.layout.gutter, paddingBlock: 0 },
  },
});

export const content = style({
  minWidth: 0,
  paddingBlockStart: tokens.shape.inset["2xl"],
  paddingBlockEnd: tokens.shape.inset["3xl"],
  "@media": { [narrow]: { paddingInline: tokens.layout.gutter, paddingBlockStart: tokens.shape.inset.xl } },
});

// A heading stands in line with the words of the rows.
export const navHeading = style({ paddingInline: rowInset });

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
