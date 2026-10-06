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

// preview 무대 — 세 surface와 control track 배경에서 가독성을 비교한다.
globalStyle(".preview-frame", { position: "relative" });
globalStyle(".preview-stage", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: tokens.shape.height.lg.layout,
  padding: tokens.shape.padding.xl.layout,
  borderRadius: tokens.shape.radius.layout.lg,
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  overflow: "auto",
});
globalStyle(".preview-stage--track", { background: tokens.color.control.track });

globalStyle(".preview-surface-switcher", {
  position: "absolute",
  top: tokens.shape.gap.sm,
  left: tokens.shape.gap.sm,
  zIndex: 1,
  display: "flex",
  gap: tokens.shape.gap.xs,
});
globalStyle(".preview-surface-button", {
  display: "grid",
  placeItems: "center",
  width: tokens.shape.height.sm.interaction,
  height: tokens.shape.height.sm.interaction,
  padding: 0,
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  borderRadius: tokens.shape.radius.interaction,
  color: tokens.color.ink.primary,
  cursor: "pointer",
});
globalStyle(".preview-surface-button--track", { background: tokens.color.control.track });
globalStyle('.preview-surface-button[aria-pressed="true"]', { borderColor: tokens.color.border.strong });
globalStyle(".preview-surface-button:hover", { borderColor: tokens.color.border.hover });
globalStyle(".preview-surface-button:focus-visible", {
  outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.interaction.focus}`,
  outlineOffset: tokens.shape.constants.focusRingOffset,
});

// Table처럼 자체 면과 외곽 형상이 사용성의 일부인 컴포넌트는 showcase용 Card에
// 다시 가두지 않는다. 실제 페이지에 놓였을 때의 직각 silhouette를 그대로 평가한다.
globalStyle(".preview-stage--flush", {
  justifyContent: "stretch",
  minHeight: "auto",
  padding: `${tokens.shape.height.lg.interaction} 0 0`,
  border: 0,
  borderRadius: 0,
});

globalStyle(".code-block", {
  position: "relative",
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  borderRadius: tokens.shape.radius.layout.md,
  background: tokens.color.bg.raised,
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
  fontFamily: tokens.text.palette.family.mono,
  fontSize: tokens.text.style.caption.size,
  fontWeight: tokens.text.palette.weight.normal,
  fontStyle: "normal",
  letterSpacing: tokens.text.style.caption.tracking,
  lineHeight: tokens.text.style.body.leading,
  color: tokens.color.ink.primary,
  tabSize: 2,
});

globalStyle(".code-block--error", { borderColor: tokens.color.accent.error.soft });
globalStyle(".code-block--editing", { background: tokens.color.bg.sunken });
globalStyle(".code-error", { display: "block", paddingInline: tokens.shape.padding.md.layout, paddingBottom: tokens.shape.padding.sm.interaction });

globalStyle(".code-block pre", {
  margin: 0,
  paddingBlock: tokens.shape.padding.xl.interaction,
  paddingInline: tokens.shape.padding.md.layout,
  overflowX: "auto",
  fontFamily: tokens.text.palette.family.mono,
  fontSize: tokens.text.style.caption.size,
  fontWeight: tokens.text.palette.weight.normal,
  fontStyle: "normal",
  letterSpacing: tokens.text.style.caption.tracking,
  lineHeight: tokens.text.style.body.leading,
  color: tokens.color.ink.primary,
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
