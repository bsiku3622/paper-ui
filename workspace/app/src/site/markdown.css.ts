// 마크다운 prose — 전부 tokens.* 로. 제목은 text variant 사다리(h1–h4)와 정렬되고,
// 나머지는 shape/color 토큰을 쓴다. raw 값 없음.

import { globalStyle } from "@vanilla-extract/css";

import { emphasisRule, tokens } from "@studio-baeks/paper-ui/tokens";

globalStyle(".md", {
  color: tokens.color.ink.primary,
  fontSize: tokens.typography.role.body.size,
  lineHeight: tokens.typography.role.body.leading,
});
// 읽기 폭은 블록마다 건다 — 표 wrapper 는 칼럼 폭까지 열려 있어야 표가 읽기 폭을 넘어도 잘리지 않고, 칼럼이 좁을 때만 스크롤한다.
globalStyle(".md > *", { maxWidth: tokens.shape.measure.lg });
globalStyle(".md > *:first-child", { marginTop: 0 });

// 제목 h1–h4 — text variant 토큰과 정렬.
globalStyle(".md h1", {
  fontSize: tokens.typography.role.title.size,
  fontWeight: tokens.typography.palette.weight.bold,
  lineHeight: tokens.typography.role.title.leading,
  letterSpacing: tokens.typography.role.title.tracking,
  margin: `0 0 ${tokens.layout.gap.sm}`,
});
globalStyle(".md h2", {
  fontSize: tokens.typography.role.heading.size,
  fontWeight: tokens.typography.palette.weight.semibold,
  lineHeight: tokens.typography.role.heading.leading,
  letterSpacing: tokens.typography.role.heading.tracking,
  margin: `${tokens.layout.gap.xl} 0 ${tokens.layout.gap.md}`,
  paddingTop: tokens.shape.inset.xl,
  borderTop: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`,
});
globalStyle(".md h3", {
  fontSize: tokens.typography.role.subheading.size,
  fontWeight: tokens.typography.palette.weight.semibold,
  lineHeight: tokens.typography.role.subheading.leading,
  letterSpacing: tokens.typography.role.subheading.tracking,
  margin: `${tokens.layout.gap.lg} 0 ${tokens.layout.gap.sm}`,
});
globalStyle(".md h4", {
  fontSize: tokens.typography.role.subheading.size,
  fontWeight: tokens.typography.palette.weight.semibold,
  lineHeight: tokens.typography.role.subheading.leading,
  letterSpacing: tokens.typography.role.subheading.tracking,
  margin: `${tokens.layout.gap.md} 0 ${tokens.layout.gap.sm}`,
});

globalStyle(".md p", { margin: `0 0 ${tokens.layout.gap.lg}` });
globalStyle(".md a", { color: tokens.color.interaction.link, textDecoration: "none" });
globalStyle(".md a:hover", { textDecoration: "underline", textUnderlineOffset: tokens.typography.palette.decoration.underlineOffset });
globalStyle(".md ul, .md ol", { margin: `0 0 ${tokens.layout.gap.lg}`, paddingLeft: tokens.shape.inset.xl });
globalStyle(".md li", { margin: `${tokens.layout.gap.xs} 0` });
globalStyle(".md strong", { fontWeight: tokens.typography.palette.weight.semibold });

globalStyle(".md code", {
  fontFamily: tokens.typography.palette.family.mono,
  fontSize: "0.85em", // em 상대 — 본문 글자에 비례
  background: tokens.color.bg.sunken,
  paddingInline: tokens.shape.inset.xs,
  borderRadius: tokens.shape.radius.control,
});
globalStyle(".md pre", {
  background: tokens.color.bg.sunken,
  border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`,
  borderRadius: tokens.shape.radius.surface.md,
  padding: tokens.shape.inset.lg,
  overflow: "auto",
  margin: `0 0 ${tokens.layout.gap.lg}`,
});
// 코드 블록은 본문 굵기가 아니라 가볍게 — 코드 글자를 굵은 줄로 읽히게 하지 않는다.
globalStyle(".md pre code", { background: "none", padding: 0, fontSize: tokens.typography.role.caption.size, lineHeight: tokens.typography.role.body.leading, ...emphasisRule("regular") });

globalStyle(".md blockquote", {
  margin: `0 0 ${tokens.layout.gap.lg}`,
  padding: `${tokens.shape.inset.md} ${tokens.shape.inset.lg}`,
  borderLeft: `${tokens.shape.stroke.emphasis} solid ${tokens.color.border.strong}`,
  color: tokens.color.ink.secondary,
});

globalStyle(".md > .md-table", { maxWidth: "none", overflowX: "auto", margin: `0 0 ${tokens.layout.gap.lg}` });
globalStyle(".md table", { width: `min(100%, ${tokens.shape.measure.lg})`, borderCollapse: "collapse", fontSize: tokens.typography.role.body.size });
globalStyle(".md th", {
  textAlign: "left",
  fontWeight: tokens.typography.palette.weight.semibold,
  padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`,
  background: tokens.color.bg.sunken,
  borderBottom: `${tokens.shape.stroke.border} solid ${tokens.color.border.strong}`,
});
globalStyle(".md td", {
  padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`,
  borderBottom: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`,
});
globalStyle(".md td code", { fontSize: "0.8em" });
globalStyle(".md hr", { border: "none", borderTop: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, margin: `${tokens.layout.gap.xl} 0` });
