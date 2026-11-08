// A doc's Markdown as the page shows it, scoped to the one class Prose puts on its root. Headings take their Text
// roles, code takes the code rules, and what is left is Shape, Layout and Color roles. Inline emphasis (strong, th)
// is the emphasis rule, so the palette stays closed.

import { globalStyle, style } from "@vanilla-extract/css";

import { codeRule, emphasisRule, lineRule, tokens, typographyRule } from "@studio-baeks/paper-ui/tokens";

// Docs are read, not worked in, so their running text is the lead role, a step up from the app's body. Like the Playground they
// take the whole column: the running text, a table and a code block fill it, and a table wider than the column scrolls inside
// its wrapper instead of being cut.
export const prose = style({ color: tokens.color.ink.primary, ...typographyRule("lead") });
globalStyle(`${prose} > *:first-child`, { marginTop: 0 });

globalStyle(`${prose} h1`, { ...typographyRule("title"), margin: `0 0 ${tokens.layout.gap.sm}` });
globalStyle(`${prose} h2`, { ...typographyRule("title"), margin: `${tokens.layout.gap["3xl"]} 0 ${tokens.layout.gap.md}` });
globalStyle(`${prose} h3`, { ...typographyRule("heading"), margin: `${tokens.layout.gap.xl} 0 ${tokens.layout.gap.sm}` });
globalStyle(`${prose} h4`, { ...typographyRule("subheading"), margin: `${tokens.layout.gap.lg} 0 ${tokens.layout.gap.sm}` });

globalStyle(`${prose} p`, { margin: `0 0 ${tokens.layout.gap.lg}` });
globalStyle(`${prose} ul, ${prose} ol`, { margin: `0 0 ${tokens.layout.gap.lg}`, paddingLeft: tokens.shape.inset.xl });
globalStyle(`${prose} li`, { margin: `${tokens.layout.gap.xs} 0` });
globalStyle(`${prose} strong`, emphasisRule("semibold"));

globalStyle(`${prose} code`, {
  ...codeRule("inline"),
  background: tokens.color.bg.sunken,
  paddingInline: tokens.shape.inset.xs,
  borderRadius: tokens.shape.radius.text,
});
globalStyle(`${prose} pre`, {
  background: tokens.color.bg.sunken,
  ...lineRule(),
  borderRadius: tokens.shape.radius.surface.md,
  padding: tokens.shape.inset.lg,
  overflow: "auto",
  margin: `0 0 ${tokens.layout.gap.lg}`,
});
// A block is lighter than the paragraph around it, so code is not read as a bold line.
globalStyle(`${prose} pre code`, { ...codeRule("block"), ...emphasisRule("regular"), background: "none", padding: 0 });

globalStyle(`${prose} blockquote`, {
  margin: `0 0 ${tokens.layout.gap.lg}`,
  padding: `${tokens.shape.inset.md} ${tokens.shape.inset.lg}`,
  ...lineRule({ side: "start", weight: "emphasis", level: "strong" }),
  color: tokens.color.ink.secondary,
});

// A table scrolls inside this wrapper, which carries the table's bottom margin.
export const tableScroll = style({ overflowX: "auto", margin: `0 0 ${tokens.layout.gap.lg}` });
globalStyle(`${prose} table`, { width: "100%", borderCollapse: "collapse" });
globalStyle(`${prose} th`, {
  textAlign: "left",
  ...emphasisRule("semibold"),
  padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`,
  background: tokens.color.bg.sunken,
  ...lineRule({ side: "bottom", level: "strong" }),
});
globalStyle(`${prose} td`, {
  padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`,
  ...lineRule({ side: "bottom" }),
});
globalStyle(`${prose} td code`, codeRule("compact"));
globalStyle(`${prose} hr`, { border: "none", ...lineRule({ side: "top" }), margin: `${tokens.layout.gap.xl} 0` });
