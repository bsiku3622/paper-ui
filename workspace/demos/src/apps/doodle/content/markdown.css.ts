import { globalStyle, style } from "@vanilla-extract/css";

import { codeRule, emphasisRule, lineRule, tokens, typographyRule } from "@studio-baeks/paper-ui/tokens";

const gap = tokens.layout.gap;
const role = tokens.typography.role;

export const root = style({
  ...typographyRule("body"),
  lineHeight: role.lead.leading,
  color: tokens.color.ink.primary,
});

const inRoot = (selector: string) => `${root} ${selector}`;

globalStyle(inRoot("h1"), { ...typographyRule("display"), ...emphasisRule("semibold"), margin: `0 0 ${gap.xl}` });
globalStyle(inRoot("h2"), { ...typographyRule("subheading"), margin: `${gap["2xl"]} 0 ${gap.md}` });
globalStyle(inRoot("h3, h4, h5, h6"), { ...typographyRule("body"), ...emphasisRule("semibold"), margin: `${gap.xl} 0 ${gap.sm}` });
globalStyle(inRoot("> :first-child"), { marginTop: 0 });

globalStyle(inRoot("p"), { margin: `0 0 ${gap.lg}`, maxWidth: tokens.shape.measure.xs });
globalStyle(inRoot("ul, ol"), { margin: `0 0 ${gap.xl}`, paddingInlineStart: gap.xl });
globalStyle(inRoot("li"), { margin: `${gap.xs} 0` });
globalStyle(inRoot("li p"), { margin: 0 });
globalStyle(inRoot("li p + p"), { marginTop: gap.sm });
globalStyle(inRoot("li::marker"), { color: tokens.color.ink.tertiary });
globalStyle(inRoot("li[data-task]"), { listStyle: "none", display: "flex", alignItems: "center", gap: gap.sm, marginInlineStart: `calc(${gap.xl} * -1)` });

globalStyle(inRoot("blockquote"), {
  margin: `${gap["2xl"]} 0 ${gap.lg}`,
  padding: `${gap.xs} 0 ${gap.xs} ${gap.lg}`,
  ...lineRule({ side: "start", weight: "emphasis", level: "strong" }),
  color: tokens.color.ink.tertiary,
});
globalStyle(inRoot("blockquote p"), { margin: 0 });

globalStyle(inRoot("strong"), { ...emphasisRule("bold") });
globalStyle(inRoot("del"), { color: tokens.color.ink.tertiary });
globalStyle(inRoot("code"), {
  ...codeRule("inline"),
  padding: `0 ${gap.xs}`,
  borderRadius: tokens.shape.radius.text,
  backgroundColor: tokens.color.bg.sunken,
});
globalStyle(inRoot("pre"), {
  margin: `0 0 ${gap.lg}`,
  padding: gap.md,
  overflowX: "auto",
  borderRadius: tokens.shape.radius.surface.sm,
  backgroundColor: tokens.color.bg.sunken,
});
globalStyle(inRoot("pre code"), { ...codeRule("block"), padding: 0, backgroundColor: "transparent" });
globalStyle(inRoot("hr"), { margin: `${gap.xl} 0`, border: 0, ...lineRule({ side: "top" }) });

globalStyle(inRoot("table"), { width: "100%", margin: `0 0 ${gap.lg}`, borderCollapse: "collapse" });
globalStyle(inRoot("th, td"), { padding: `${gap.sm} ${gap.md}`, textAlign: "start", ...lineRule({ side: "bottom" }) });
globalStyle(inRoot("th"), { ...typographyRule("label"), color: tokens.color.ink.tertiary });
globalStyle(inRoot("[data-align='right']"), { textAlign: "end" });
globalStyle(inRoot("[data-align='center']"), { textAlign: "center" });
