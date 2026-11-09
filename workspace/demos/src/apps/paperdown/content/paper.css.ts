import { globalStyle, style } from "@vanilla-extract/css";

import { codeRule, emphasisRule, lineRule, tokens } from "@studio-baeks/paper-ui/tokens";

import "./fonts.css";

const BLOCK = "1em";
const GAP = {
  block: BLOCK,
  tight: "0.25em",
  item: "0.3em",
  heading: "0.7em",
  headingSmall: "0.65em",
  indent: "1.6em",
  rule: "1.6em",
  figure: "0.5em",
  table: "1.2em",
  math: "0.6em",
} as const;

const HEADING = {
  h1: { size: "2.25em", leading: 1.4, tracking: "-0.04em", after: "1em" },
  h2: { size: "1.5em", leading: 1.5, tracking: "-0.025em", after: "0.7em" },
  h3: { size: "1.2em", leading: 1.5, tracking: "normal", after: "0.65em" },
} as const;

const UNDERLINE_OFFSET = "3px";

const QUOTE_PADDING = "0.15em 0 0.15em 1.2em";
const CODE_PADDING = "0.15em 0.35em";
const BLOCK_CODE_PADDING = "1em";
const CELL_PADDING = "0.5em 0.7em";
const MATH = { block: "1.1em", inline: "1.05em" } as const;

const BOX = {
  size: "1em",
  top: "0.33em",
  tick: { left: "0.34em", top: "0.43em", width: "0.3em", height: "0.55em" },
} as const;

export const lane = style({ width: "100%", minWidth: 0 });
export const stage = style({ margin: "0 auto", width: "calc((var(--pd-width) + 2px) * var(--pd-zoom))" });
export const caption = style({ marginBottom: tokens.layout.gap.md });
export const end = style({ textAlign: "center", marginTop: tokens.layout.gap.lg });

export const stack = style({
  position: "relative",
  boxSizing: "content-box",
  width: "var(--pd-width)",
  fontFamily: "var(--pd-font)",
  fontSize: "var(--pd-size)",
  lineHeight: "var(--pd-leading)",
  zoom: "var(--pd-zoom)",
  minHeight: "var(--pd-stack-min, 0)",
});

export const pages = style({ position: "absolute", inset: 0, pointerEvents: "none" });
export const page = style({ position: "absolute", insetInline: 0, top: "calc(var(--pd-index) * (var(--pd-height) + var(--pd-page-gap)))", height: "var(--pd-height)" });
export const number = style({ position: "absolute", insetInline: 0, bottom: tokens.layout.gap.lg, textAlign: "center" });

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

sets('[data-type="block-math"]', { display: "block", textAlign: "center", padding: `${GAP.math} 0`, fontSize: MATH.block, cursor: "pointer", fontStyle: "italic", userSelect: "none" });
sets('[data-type="inline-math"]', { fontStyle: "italic", fontSize: MATH.inline, cursor: "pointer", userSelect: "none" });

sets(".is-empty:first-child::before", { content: "attr(data-placeholder)", float: "left", height: 0, pointerEvents: "none", color: tokens.color.ink.tertiary, font: "inherit" });
sets("::selection", { backgroundColor: tokens.color.accent.info.soft });
