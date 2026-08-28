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

// preview 무대 — 순백(raised) 면 위에 컴포넌트를 세운다. 캔버스는 smoke 지만 컴포넌트는
// 흰 면 위에서 봐야 색·밀도를 왜곡 없이 평가한다. smoke 캔버스 위로 뜬 흰 무대라 경계는
// 회색 면 대신 헤어라인으로만.
globalStyle(".preview-stage", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: tokens.shape.height.lg.layout,
  padding: tokens.shape.padding.xl.layout,
  borderRadius: tokens.shape.radius.layout.lg,
  backgroundColor: tokens.color.paper.raised,
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  overflow: "auto",
});

globalStyle(".code-block", {
  position: "relative",
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  borderRadius: tokens.shape.radius.layout.md,
  background: tokens.color.paper.raised,
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
  background: tokens.color.paper.raised,
  color: tokens.color.ink.soft,
  borderRadius: tokens.shape.radius.interaction,
  height: tokens.shape.height.sm.interaction,
  paddingInline: tokens.shape.padding.sm.interaction,
  fontSize: tokens.text.size.label,
  fontFamily: tokens.text.font.sans,
  cursor: "pointer",
  transition: stateTransition("background", "color"),
});
globalStyle(".code-copy:hover", { background: tokens.color.paper.well, color: tokens.color.ink.base });
