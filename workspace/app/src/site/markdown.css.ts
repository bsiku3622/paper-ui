// 마크다운 prose — 전부 tokens.* 로. 제목은 text variant 사다리(h1=title·h2=heading·
// h3=subheading)와 정확히 정렬되고, 나머지는 shape/color 토큰. raw 값 없음.

import { globalStyle } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui";

globalStyle(".md", {
  maxWidth: tokens.shape.measure.lg,
  color: tokens.color.ink.base,
  fontSize: tokens.shape.fontSize.lg, // 15px — 본문보다 한 단 큰 읽기 크기
  lineHeight: tokens.text.leading.body,
});
globalStyle(".md > *:first-child", { marginTop: 0 });

// 제목 h1/h2/h3 — text variant 토큰과 정렬 (title · heading · subheading).
globalStyle(".md h1", {
  fontSize: tokens.text.size.title,
  fontWeight: tokens.text.weight.bold,
  lineHeight: tokens.text.leading.title,
  letterSpacing: tokens.text.tracking.title,
  margin: `0 0 ${tokens.shape.gap.sm}`,
});
globalStyle(".md h2", {
  fontSize: tokens.text.size.heading,
  fontWeight: tokens.text.weight.semibold,
  lineHeight: tokens.text.leading.heading,
  letterSpacing: tokens.text.tracking.heading,
  margin: `${tokens.shape.gap.xl} 0 ${tokens.shape.gap.md}`,
  paddingTop: tokens.shape.padding.lg.layout,
  borderTop: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
});
globalStyle(".md h3", {
  fontSize: tokens.text.size.subheading,
  fontWeight: tokens.text.weight.semibold,
  lineHeight: tokens.text.leading.subheading,
  letterSpacing: tokens.text.tracking.subheading,
  margin: `${tokens.shape.gap.lg} 0 ${tokens.shape.gap.sm}`,
});

globalStyle(".md p", { margin: `0 0 ${tokens.shape.gap.lg}` });
globalStyle(".md a", { color: tokens.color.accent.blue.ink, textDecoration: "none" });
globalStyle(".md a:hover", { textDecoration: "underline", textUnderlineOffset: "0.2em" });
globalStyle(".md ul, .md ol", { margin: `0 0 ${tokens.shape.gap.lg}`, paddingLeft: tokens.shape.padding.xl.interaction });
globalStyle(".md li", { margin: `${tokens.shape.gap.xs} 0` });
globalStyle(".md strong", { fontWeight: tokens.text.weight.semibold });

globalStyle(".md code", {
  fontFamily: tokens.text.font.mono,
  fontSize: "0.85em", // em 상대 — 본문 글자에 비례
  background: tokens.color.paper.muted,
  padding: "0.1em 0.4em",
  borderRadius: tokens.shape.radius.interaction,
});
globalStyle(".md pre", {
  background: tokens.color.paper.subtle,
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  borderRadius: tokens.shape.radius.layout.md,
  padding: tokens.shape.padding.md.layout,
  overflow: "auto",
  margin: `0 0 ${tokens.shape.gap.lg}`,
});
globalStyle(".md pre code", { background: "none", padding: 0, fontSize: tokens.text.size.caption, lineHeight: tokens.text.leading.body });

globalStyle(".md blockquote", {
  margin: `0 0 ${tokens.shape.gap.lg}`,
  padding: `${tokens.shape.padding.sm.layout} ${tokens.shape.padding.md.layout}`,
  borderLeft: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.border.strong}`,
  color: tokens.color.ink.soft,
});

globalStyle(".md table", { width: "100%", borderCollapse: "collapse", margin: `0 0 ${tokens.shape.gap.lg}`, fontSize: tokens.text.size.body });
globalStyle(".md th", {
  textAlign: "left",
  fontWeight: tokens.text.weight.semibold,
  padding: `${tokens.shape.padding.sm.interaction} ${tokens.shape.padding.md.interaction}`,
  background: tokens.color.paper.subtle,
  borderBottom: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.strong}`,
});
globalStyle(".md td", {
  padding: `${tokens.shape.padding.sm.interaction} ${tokens.shape.padding.md.interaction}`,
  borderBottom: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
});
globalStyle(".md td code", { fontSize: "0.8em" });
globalStyle(".md hr", { border: "none", borderTop: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`, margin: `${tokens.shape.gap.xl} 0` });
