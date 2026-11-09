import { globalStyle, style } from "@vanilla-extract/css";

import { codeRule, emphasisRule, lineRule, tokens, typographyRule } from "@studio-baeks/paper-ui/tokens";

import "./fonts.css";

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
const BOX = tokens.shape.selection.size.md;

sets("> *", { marginTop: 0, marginBottom: tokens.layout.gap.lg });
sets("> :last-child", { marginBottom: 0 });
sets("p", { marginTop: 0, marginBottom: tokens.layout.gap.lg });
// The page's headings take Paper's title roles, in the page's own typeface.
const heading = (variant: "title" | "heading" | "subheading") => ({ ...typographyRule(variant), fontFamily: "inherit", wordBreak: "inherit", overflowWrap: "inherit" }) as const;
sets("h1", { ...heading("title"), marginBottom: tokens.layout.gap.lg });
sets("h2", { ...heading("heading"), marginBottom: tokens.layout.gap.md });
sets("h3", { ...heading("subheading"), marginBottom: tokens.layout.gap.md });
sets("h2:not(:first-child), h3:not(:first-child)", { paddingTop: tokens.layout.gap.md });
sets("strong", semibold);
sets("a", { color: "inherit", textDecoration: "underline", textUnderlineOffset: tokens.layout.gap.xs, cursor: "pointer" });
sets("blockquote", { marginLeft: 0, marginRight: 0, padding: `${tokens.shape.inset.xs} 0 ${tokens.shape.inset.xs} ${tokens.shape.inset.lg}`, ...lineRule({ side: "start", weight: "emphasis", level: "strong" }), color: tokens.color.ink.secondary });
sets("blockquote p:last-child", { marginBottom: 0 });
sets("ul, ol", { paddingLeft: tokens.shape.inset.xl });
sets("li", { marginBottom: tokens.layout.gap.xs });
sets("li p", { marginBottom: tokens.layout.gap.xs });
sets("li > :last-child", { marginBottom: 0 });

sets('ul[data-type="taskList"]', { listStyle: "none", paddingLeft: 0 });
sets('ul[data-type="taskList"] > li', { position: "relative", paddingLeft: tokens.shape.inset.xl });
sets('ul[data-type="taskList"] > li::before', {
  content: '""',
  position: "absolute",
  left: 0,
  top: tokens.layout.gap.xs,
  boxSizing: "border-box",
  width: BOX,
  height: BOX,
  ...lineRule(),
  borderColor: tokens.color.ink.secondary,
  borderRadius: tokens.shape.radius.selection,
  cursor: "pointer",
});
sets('ul[data-type="taskList"] > li[data-checked="true"]::before', { backgroundColor: tokens.color.ink.primary, borderColor: tokens.color.ink.primary });
sets('ul[data-type="taskList"] > li[data-checked="true"]::after', {
  content: '""',
  position: "absolute",
  left: `calc(${BOX} / 2 - ${BOX} / 2 / 2 / 2)`,
  top: `calc(${tokens.layout.gap.xs} + ${BOX} / 2 / 2 / 2)`,
  boxSizing: "border-box",
  width: `calc(${BOX} / 2 / 2)`,
  height: `calc(${BOX} / 2)`,
  ...lineRule({ weight: "emphasis" }),
  borderColor: tokens.color.bg.raised,
  borderTop: 0,
  borderLeft: 0,
  transform: "rotate(45deg)",
  pointerEvents: "none",
});
sets('ul[data-type="taskList"] > li[data-checked="true"] > p', { textDecorationLine: "line-through" });

sets("code", { ...codeRule("inline"), backgroundColor: tokens.color.bg.sunken, borderRadius: tokens.shape.radius.text, padding: `0 ${tokens.shape.inset.xs}` });
sets("pre", {
  backgroundColor: tokens.color.bg.sunken,
  ...lineRule(),
  padding: tokens.shape.inset.lg,
  borderRadius: tokens.shape.radius.text,
  overflow: "auto",
  whiteSpace: "pre-wrap",
});
sets("pre code", { padding: 0, background: "none" });
sets("hr", { border: 0, ...lineRule({ side: "top" }), margin: `${tokens.layout.gap.xl} 0` });
sets("img", { display: "block", maxWidth: "100%", maxHeight: "var(--pd-content-height)", objectFit: "contain", margin: `${tokens.layout.gap.sm} auto` });
sets("img[data-selected]", { outline: `${tokens.shape.stroke.emphasis} solid ${tokens.color.ink.tertiary}` });
sets("mark", { backgroundColor: tokens.color.marker.fill, color: tokens.color.marker.ink });

sets("table", { width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontFamily: "inherit", fontSize: "inherit", marginBottom: tokens.layout.gap.lg });
sets("th, td", { ...lineRule(), padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`, verticalAlign: "top", position: "relative", minWidth: "50px" });
sets("th", { backgroundColor: tokens.color.bg.sunken, ...semibold, textAlign: "left" });
sets("td p, th p", { marginBottom: 0 });

sets('[data-type="block-math"]', { display: "block", textAlign: "center", padding: `${tokens.layout.gap.sm} 0`, cursor: "pointer", fontStyle: "italic", userSelect: "none" });
sets('[data-type="inline-math"]', { fontStyle: "italic", cursor: "pointer", userSelect: "none" });

sets(".is-empty:first-child::before", { content: "attr(data-placeholder)", float: "left", height: 0, pointerEvents: "none", color: tokens.color.ink.tertiary, font: "inherit" });
sets("::selection", { backgroundColor: tokens.color.accent.info.soft });
