// 컴포넌트 상세 — preview·controls·code 레이아웃. 전부 tokens.* (raw 값 없음).

import { globalStyle } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui";

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
  backgroundColor: tokens.color.surface.raised,
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  overflow: "auto",
});

// Table처럼 자체 면과 외곽 형상이 사용성의 일부인 컴포넌트는 showcase용 Card에
// 다시 가두지 않는다. 실제 페이지에 놓였을 때의 직각 silhouette를 그대로 평가한다.
globalStyle(".preview-stage--flush", {
  justifyContent: "stretch",
  minHeight: "auto",
  padding: 0,
  border: 0,
  borderRadius: 0,
  backgroundColor: "transparent",
});

globalStyle(".code-block", {
  position: "relative",
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  borderRadius: tokens.shape.radius.layout.md,
  background: tokens.color.surface.raised,
  overflow: "hidden",
});

globalStyle(".code-editor", {
  display: "block",
  width: "100%",
  minHeight: tokens.shape.height.xl.layout,
  boxSizing: "border-box",
  resize: "vertical",
  margin: 0,
  paddingBlock: tokens.shape.padding.xl.interaction,
  paddingInline: tokens.shape.padding.md.layout,
  border: 0,
  outline: 0,
  background: "transparent",
  overflowX: "auto",
  fontFamily: tokens.text.font.mono,
  fontSize: tokens.text.size.caption,
  fontWeight: tokens.text.weight.normal,
  fontStyle: "normal",
  letterSpacing: tokens.text.tracking.caption,
  lineHeight: tokens.text.leading.body,
  color: tokens.color.content.primary,
  tabSize: 2,
});

globalStyle(".code-block--error", { borderColor: tokens.color.accent.error.edge });
globalStyle(".code-block--editing", { background: tokens.color.surface.sunken });
globalStyle(".code-error", { display: "block", paddingInline: tokens.shape.padding.md.layout, paddingBottom: tokens.shape.padding.sm.interaction });

globalStyle(".code-block pre", {
  margin: 0,
  paddingBlock: tokens.shape.padding.xl.interaction,
  paddingInline: tokens.shape.padding.md.layout,
  overflowX: "auto",
  fontFamily: tokens.text.font.mono,
  fontSize: tokens.text.size.caption,
  fontWeight: tokens.text.weight.normal,
  fontStyle: "normal",
  letterSpacing: tokens.text.tracking.caption,
  lineHeight: tokens.text.leading.body,
  color: tokens.color.content.primary,
  tabSize: 2,
});

globalStyle(".code-actions", {
  position: "absolute",
  top: tokens.shape.padding.xs.layout,
  right: tokens.shape.padding.xs.layout,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.xs,
});
globalStyle(".code-edit", { minWidth: tokens.shape.height.sm.interaction });
