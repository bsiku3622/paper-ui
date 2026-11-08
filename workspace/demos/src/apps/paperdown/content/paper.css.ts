// Content: the look of a sheet of paper and of the words on it. Paper has no page and no serif face, and its Text roles are
// fixed pixel sizes; a paper is set in points that follow its own settings, headings are multiples of the body's size, and a
// page's width and margins are millimetres. Every rule reads a variable the stage sets (--pd-width, --pd-height, --pd-margin,
// --pd-font, --pd-size, --pd-leading, --pd-content-height) and Paper's tokens for colour, lines and radii. The type scale is the
// original's, in em.

import { globalStyle, style } from "@vanilla-extract/css";

import { codeRule, emphasisRule, lineRule, tokens } from "@studio-baeks/paper-ui/tokens";

import "./fonts.css";
import { BLOCK, BLOCK_CODE_PADDING, BOX, CELL_PADDING, CODE_PADDING, GAP, HEADING, MATH, QUOTE_PADDING, UNDERLINE_OFFSET } from "./rhythm";

// The stage: the paper's column, centred on the workspace.
export const lane = style({ width: "100%", minWidth: 0 });
// Its width is the paper's and the two lines of its faces, as the zoom makes it.
export const stage = style({ margin: "0 auto", width: "calc((var(--pd-width) + 2px) * var(--pd-zoom))" });
export const caption = style({ marginBottom: tokens.layout.gap.md });
export const end = style({ textAlign: "center", marginTop: tokens.layout.gap.lg });

// The paper itself: its box in millimetres, in the document's own face and size.
export const stack = style({
  position: "relative",
  // The width is the paper's own: a face's border stands outside it (the stage is two lines wider, as the original's is), so
  // the words have the width a page of that size has.
  boxSizing: "content-box",
  width: "var(--pd-width)",
  fontFamily: "var(--pd-font)",
  fontSize: "var(--pd-size)",
  lineHeight: "var(--pd-leading)",
  zoom: "var(--pd-zoom)",
  minHeight: "var(--pd-stack-min, 0)",
});

// Pages: faces behind the words, one for each page, with the number at the foot.
export const pages = style({ position: "absolute", inset: 0, pointerEvents: "none" });
// A page stands one paper and one gap below the one before it (--pd-index counts from the first).
export const page = style({ position: "absolute", insetInline: 0, top: "calc(var(--pd-index) * (var(--pd-height) + var(--pd-page-gap)))", height: "var(--pd-height)" });
export const number = style({ position: "absolute", insetInline: 0, bottom: tokens.layout.gap.lg, textAlign: "center" });

// The words.
export const doc = style({
  position: "relative",
  boxSizing: "border-box",
  padding: "var(--pd-margin)",
  fontFamily: "var(--pd-font)",
  fontSize: "var(--pd-size)",
  lineHeight: "var(--pd-leading)",
  color: tokens.color.ink.primary,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
  wordBreak: "normal",
  caretColor: tokens.color.ink.primary,
  outline: "none",
  selectors: { "&:focus, &:focus-visible": { outline: "none" } },
});
export const sheet = style({ minHeight: "var(--pd-height)" });
export const tall = style({ minHeight: 0 });

// Every part of a list of selectors starts at the paper: "th, td" is ".doc th, .doc td", never a rule for every table on the page.
const within = (selector: string) => selector.split(",").map((part) => `${doc} ${part.trim()}`).join(", ");
const sets = (selector: string, rule: Parameters<typeof globalStyle>[1]) => globalStyle(within(selector), rule);

const semibold = emphasisRule("semibold");

sets("> *", { marginTop: 0, marginBottom: BLOCK });
sets("> :last-child", { marginBottom: 0 });
sets("p", { marginTop: 0, marginBottom: BLOCK });
for (const [tag, rule] of Object.entries(HEADING)) {
  sets(tag, { fontSize: rule.size, lineHeight: rule.leading, ...semibold, letterSpacing: rule.tracking, marginBottom: rule.after });
}
sets("h2:not(:first-child), h3:not(:first-child)", { paddingTop: GAP.heading });
sets("strong", semibold);
sets("a", { color: "inherit", textDecoration: "underline", textUnderlineOffset: UNDERLINE_OFFSET, cursor: "pointer" });
sets("blockquote", { marginLeft: 0, marginRight: 0, padding: QUOTE_PADDING, ...lineRule({ side: "start", weight: "emphasis", level: "strong" }), color: tokens.color.ink.secondary });
sets("blockquote p:last-child", { marginBottom: 0 });
sets("ul, ol", { paddingLeft: GAP.indent });
sets("li", { marginBottom: GAP.item });
sets("li p", { marginBottom: GAP.tight });
sets("li > :last-child", { marginBottom: 0 });

// A checklist: the box is drawn on the item, so the item's words stay one editable stretch.
sets('ul[data-type="taskList"]', { listStyle: "none", paddingLeft: 0 });
sets('ul[data-type="taskList"] > li', { position: "relative", paddingLeft: GAP.indent });
sets('ul[data-type="taskList"] > li::before', {
  content: '""',
  position: "absolute",
  left: 0,
  top: BOX.top,
  boxSizing: "border-box",
  width: BOX.size,
  height: BOX.size,
  ...lineRule(),
  borderColor: tokens.color.ink.secondary,
  borderRadius: tokens.shape.radius.selection,
  cursor: "pointer",
});
sets('ul[data-type="taskList"] > li[data-checked="true"]::before', { backgroundColor: tokens.color.ink.primary, borderColor: tokens.color.ink.primary });
sets('ul[data-type="taskList"] > li[data-checked="true"]::after', {
  content: '""',
  position: "absolute",
  left: BOX.tick.left,
  top: BOX.tick.top,
  boxSizing: "border-box",
  width: BOX.tick.width,
  height: BOX.tick.height,
  ...lineRule({ weight: "emphasis" }),
  borderColor: tokens.color.bg.raised,
  borderTop: 0,
  borderLeft: 0,
  transform: "rotate(45deg)",
  pointerEvents: "none",
});
// Strike only this item's own paragraphs, so a nested unchecked task stays readable.
sets('ul[data-type="taskList"] > li[data-checked="true"] > p', { textDecorationLine: "line-through" });

sets("code", { ...codeRule("inline"), backgroundColor: tokens.color.bg.sunken, borderRadius: tokens.shape.radius.text, padding: CODE_PADDING });
sets("pre", {
  backgroundColor: tokens.color.bg.sunken,
  ...lineRule(),
  padding: BLOCK_CODE_PADDING,
  borderRadius: tokens.shape.radius.text,
  overflow: "auto",
  whiteSpace: "pre-wrap",
});
sets("pre code", { padding: 0, background: "none" });
sets("hr", { border: 0, ...lineRule({ side: "top" }), margin: `${GAP.rule} 0` });
sets("img", { display: "block", maxWidth: "100%", maxHeight: "var(--pd-content-height)", objectFit: "contain", margin: `${GAP.figure} auto` });
sets("img[data-selected]", { outline: `${tokens.shape.stroke.emphasis} solid ${tokens.color.ink.tertiary}` });
sets("mark", { backgroundColor: tokens.color.marker.fill, color: tokens.color.marker.ink });

sets("table", { width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontFamily: "inherit", fontSize: "inherit", marginBottom: GAP.table });
sets("th, td", { ...lineRule(), padding: CELL_PADDING, verticalAlign: "top", position: "relative", minWidth: "50px" });
sets("th", { backgroundColor: tokens.color.bg.sunken, ...semibold, textAlign: "left" });
sets("td p, th p", { marginBottom: 0 });

// Formulas: set in the paper's face, drawn from their LaTeX by lib/text.ts (there is no KaTeX here).
sets('[data-type="block-math"]', { display: "block", textAlign: "center", padding: `${GAP.math} 0`, fontSize: MATH.block, cursor: "pointer", fontStyle: "italic", userSelect: "none" });
sets('[data-type="inline-math"]', { fontStyle: "italic", fontSize: MATH.inline, cursor: "pointer", userSelect: "none" });

// The placeholder of an empty first block.
sets(".is-empty:first-child::before", { content: "attr(data-placeholder)", float: "left", height: 0, pointerEvents: "none", color: tokens.color.ink.tertiary, font: "inherit" });
sets("::selection", { backgroundColor: tokens.color.accent.info.soft });
