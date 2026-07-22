// 컴포넌트 상세 — preview·controls·code 레이아웃. 전부 tokens.* (raw 값 없음).

import { globalStyle } from "@vanilla-extract/css";

import { tokens, stateTransition } from "@studio-baeks/paper-ui";

const BP = tokens.layout.breakpoint;

globalStyle(".detail-body", {
  display: "grid",
  gridTemplateColumns: `1fr ${tokens.shape.width.lg.layout}`,
  gap: tokens.shape.gap.xl,
  alignItems: "start",
  "@media": {
    [`screen and (max-width: ${BP.md})`]: { gridTemplateColumns: "1fr" },
  },
});

// preview 무대 — 옅은 점 격자 위에 컴포넌트를 중앙 정렬로 세운다.
globalStyle(".preview-stage", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: tokens.shape.height.lg.layout,
  padding: tokens.shape.padding.xl.layout,
  borderRadius: tokens.shape.radius.layout.lg,
  backgroundColor: tokens.color.paper.subtle,
  backgroundImage: `radial-gradient(${tokens.color.border.base} ${tokens.shape.constants.borderWidth}, transparent ${tokens.shape.constants.borderWidth})`,
  backgroundSize: `${tokens.shape.constants.textureCell} ${tokens.shape.constants.textureCell}`,
  overflow: "auto",
});

globalStyle(".code-block", {
  position: "relative",
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  borderRadius: tokens.shape.radius.layout.md,
  background: tokens.color.paper.base,
  overflow: "hidden",
});

globalStyle(".code-block pre", {
  margin: 0,
  paddingBlock: tokens.shape.padding.md.interaction,
  paddingInline: tokens.shape.padding.md.layout,
  overflowX: "auto",
  fontFamily: tokens.text.font.mono,
  fontSize: tokens.text.size.caption,
  lineHeight: tokens.text.leading.body,
  color: tokens.color.ink.base,
  tabSize: 2,
});

globalStyle(".code-copy", {
  position: "absolute",
  top: tokens.shape.padding.xs.layout,
  right: tokens.shape.padding.xs.layout,
  appearance: "none",
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  background: tokens.color.paper.base,
  color: tokens.color.ink.soft,
  borderRadius: tokens.shape.radius.interaction,
  height: tokens.shape.height.sm.interaction,
  paddingInline: tokens.shape.padding.sm.interaction,
  fontSize: tokens.text.size.label,
  fontFamily: tokens.text.font.sans,
  cursor: "pointer",
  transition: stateTransition("background", "color"),
});
globalStyle(".code-copy:hover", { background: tokens.color.paper.muted, color: tokens.color.ink.base });
