// 마크다운 prose — 전부 tokens.* 로. 제목은 text variant 사다리(h1–h4)와 정렬되고,
// 나머지는 shape/color 토큰을 쓴다. raw 값 없음.

import { globalStyle } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui";

globalStyle(".md", {
  maxWidth: tokens.layout.measure.lg,
  color: tokens.color.ink.primary,
  fontSize: tokens.text.style.body.size,
  lineHeight: tokens.text.style.body.leading,
});
globalStyle(".md > *:first-child", { marginTop: 0 });

// 제목 h1–h4 — text variant 토큰과 정렬.
globalStyle(".md h1", {
  fontSize: tokens.text.style.title.size,
  fontWeight: tokens.text.palette.weight.bold,
  lineHeight: tokens.text.style.title.leading,
  letterSpacing: tokens.text.style.title.tracking,
  margin: `0 0 ${tokens.shape.space.sm}`,
});
globalStyle(".md h2", {
  fontSize: tokens.text.style.heading.size,
  fontWeight: tokens.text.palette.weight.semibold,
  lineHeight: tokens.text.style.heading.leading,
  letterSpacing: tokens.text.style.heading.tracking,
  margin: `${tokens.shape.space.xl} 0 ${tokens.shape.space.md}`,
  paddingTop: tokens.layout.padding.lg,
  borderTop: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`,
});
globalStyle(".md h3", {
  fontSize: tokens.text.style.subheading.size,
  fontWeight: tokens.text.palette.weight.semibold,
  lineHeight: tokens.text.style.subheading.leading,
  letterSpacing: tokens.text.style.subheading.tracking,
  margin: `${tokens.shape.space.lg} 0 ${tokens.shape.space.sm}`,
});
globalStyle(".md h4", {
  fontSize: tokens.text.style.subheading.size,
  fontWeight: tokens.text.palette.weight.semibold,
  lineHeight: tokens.text.style.subheading.leading,
  letterSpacing: tokens.text.style.subheading.tracking,
  margin: `${tokens.shape.space.md} 0 ${tokens.shape.space.sm}`,
});

globalStyle(".md p", { margin: `0 0 ${tokens.shape.space.lg}` });
globalStyle(".md a", { color: tokens.color.accent.info.ink, textDecoration: "none" });
globalStyle(".md a:hover", { textDecoration: "underline", textUnderlineOffset: "0.2em" });
globalStyle(".md ul, .md ol", { margin: `0 0 ${tokens.shape.space.lg}`, paddingLeft: tokens.shape.space.xl });
globalStyle(".md li", { margin: `${tokens.shape.space.xs} 0` });
globalStyle(".md strong", { fontWeight: tokens.text.palette.weight.semibold });

globalStyle(".md code", {
  fontFamily: tokens.text.palette.family.mono,
  fontSize: "0.85em", // em 상대 — 본문 글자에 비례
  background: tokens.color.bg.sunken,
  padding: "0.1em 0.4em",
  borderRadius: tokens.shape.radius.control,
});
globalStyle(".md pre", {
  background: tokens.color.bg.sunken,
  border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`,
  borderRadius: tokens.shape.radius.surface.md,
  padding: tokens.layout.padding.md,
  overflow: "auto",
  margin: `0 0 ${tokens.shape.space.lg}`,
});
globalStyle(".md pre code", { background: "none", padding: 0, fontSize: tokens.text.style.caption.size, lineHeight: tokens.text.style.body.leading });

globalStyle(".md blockquote", {
  margin: `0 0 ${tokens.shape.space.lg}`,
  padding: `${tokens.layout.padding.sm} ${tokens.layout.padding.md}`,
  borderLeft: `${tokens.shape.stroke.emphasis} solid ${tokens.color.border.strong}`,
  color: tokens.color.ink.secondary,
});

globalStyle(".md table", { width: "100%", borderCollapse: "collapse", margin: `0 0 ${tokens.shape.space.lg}`, fontSize: tokens.text.style.body.size });
globalStyle(".md th", {
  textAlign: "left",
  fontWeight: tokens.text.palette.weight.semibold,
  padding: `${tokens.shape.space.sm} ${tokens.shape.space.md}`,
  background: tokens.color.bg.sunken,
  borderBottom: `${tokens.shape.stroke.border} solid ${tokens.color.border.strong}`,
});
globalStyle(".md td", {
  padding: `${tokens.shape.space.sm} ${tokens.shape.space.md}`,
  borderBottom: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`,
});
globalStyle(".md td code", { fontSize: "0.8em" });
globalStyle(".md hr", { border: "none", borderTop: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, margin: `${tokens.shape.space.xl} 0` });
