// A doc's Markdown as the page shows it, scoped to the one class Prose puts on its root. Headings take their Text
// roles, code takes the code rules, and what is left is Shape, Layout and Color roles. Inline emphasis (strong, th)
// is the emphasis rule, so the palette stays closed.

import { globalStyle, style } from "@vanilla-extract/css";

import { codeRule, emphasisRule, tokens, typographyRule } from "@studio-baeks/paper-ui/tokens";

const line = `${tokens.shape.stroke.border} solid`;

export const prose = style({ color: tokens.color.ink.primary, ...typographyRule("body") });
// The reading width is set per block: the table wrapper stays open to the column, so a table wider than the reading
// width scrolls inside the wrapper instead of being cut, and only a narrow column makes it scroll.
globalStyle(`${prose} > *`, { maxWidth: tokens.shape.measure.lg });
globalStyle(`${prose} > *:first-child`, { marginTop: 0 });

globalStyle(`${prose} h1`, { ...typographyRule("title"), margin: `0 0 ${tokens.layout.gap.sm}` });
globalStyle(`${prose} h2`, {
  ...typographyRule("heading"),
  margin: `${tokens.layout.gap.xl} 0 ${tokens.layout.gap.md}`,
  paddingTop: tokens.shape.inset.xl,
  borderTop: `${line} ${tokens.color.border.base}`,
});
globalStyle(`${prose} h3`, { ...typographyRule("subheading"), margin: `${tokens.layout.gap.lg} 0 ${tokens.layout.gap.sm}` });
globalStyle(`${prose} h4`, { ...typographyRule("subheading"), margin: `${tokens.layout.gap.md} 0 ${tokens.layout.gap.sm}` });

globalStyle(`${prose} p`, { margin: `0 0 ${tokens.layout.gap.lg}` });
globalStyle(`${prose} ul, ${prose} ol`, { margin: `0 0 ${tokens.layout.gap.lg}`, paddingLeft: tokens.shape.inset.xl });
globalStyle(`${prose} li`, { margin: `${tokens.layout.gap.xs} 0` });
globalStyle(`${prose} strong`, emphasisRule("semibold"));

globalStyle(`${prose} code`, {
  ...codeRule("inline"),
  background: tokens.color.bg.sunken,
  paddingInline: tokens.shape.inset.xs,
  borderRadius: tokens.shape.radius.control,
});
globalStyle(`${prose} pre`, {
  background: tokens.color.bg.sunken,
  border: `${line} ${tokens.color.border.base}`,
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
  borderLeft: `${tokens.shape.stroke.emphasis} solid ${tokens.color.border.strong}`,
  color: tokens.color.ink.secondary,
});

// A table scrolls inside this wrapper, which carries the table's bottom margin.
export const tableScroll = style({ overflowX: "auto", margin: `0 0 ${tokens.layout.gap.lg}` });
globalStyle(`${prose} > ${tableScroll}`, { maxWidth: "none" });
globalStyle(`${prose} table`, { width: `min(100%, ${tokens.shape.measure.lg})`, borderCollapse: "collapse" });
globalStyle(`${prose} th`, {
  textAlign: "left",
  ...emphasisRule("semibold"),
  padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`,
  background: tokens.color.bg.sunken,
  borderBottom: `${line} ${tokens.color.border.strong}`,
});
globalStyle(`${prose} td`, {
  padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`,
  borderBottom: `${line} ${tokens.color.border.base}`,
});
globalStyle(`${prose} td code`, codeRule("compact"));
globalStyle(`${prose} hr`, { border: "none", borderTop: `${line} ${tokens.color.border.base}`, margin: `${tokens.layout.gap.xl} 0` });
