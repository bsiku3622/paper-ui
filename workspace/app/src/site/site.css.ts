// 사이트 chrome의 레이아웃·GNB — 전부 tokens.*로. 앱이 직접 정하는 길이는 GNB 한 줄 높이(ROW) 하나뿐이다.
//
// 앱 전용이지만 라이브러리와 같은 tokens 객체를 쓴다(vanilla-extract). 그래서
// shape/color/motion/layout 토큰이 바뀌면 여기도 자동으로 따라오고, 존재하지 않는
// 토큰을 참조하면 빌드가 깨진다 — 예전 plain CSS 가 옛 var 이름을 참조해 조용히
// 무너지던 문제(사이드바 붕괴)를 원천 차단한다.

import { createVar, globalStyle, style } from "@vanilla-extract/css";

import { tokens, transition } from "@studio-baeks/paper-ui/tokens";

const BP = tokens.layout.breakpoint;
const narrow = `screen and (max-width: ${BP.md})`;

// ── GNB ──────────────────────────────────────────────────────────────────────
// One row of the page's width; below md the links drop to a second row under the brand instead of
// breaking per character. The header's height is a variable so a sticky sidebar can sit below it.
// ROW is the one length the app owns: the GNB row's height, no token has it.
const ROW = "52px";
export const NAV_HEIGHT = createVar();
globalStyle(":root", {
  vars: { [NAV_HEIGHT]: ROW },
  "@media": { [narrow]: { vars: { [NAV_HEIGHT]: `calc(${ROW} + ${tokens.shape.control.height.md})` } } },
});

export const gnb = style({
  top: 0,
  height: NAV_HEIGHT,
  background: tokens.color.bg.canvas,
  borderBottom: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`,
});

export const gnbRow = style({
  display: "flex",
  alignItems: "center",
  gap: tokens.layout.gap.lg,
  maxWidth: tokens.layout.container.content,
  height: "100%",
  paddingInline: tokens.shape.inset.lg,
  marginInline: "auto",
  "@media": {
    [narrow]: {
      display: "grid",
      gridTemplateColumns: "auto minmax(0, 1fr)",
      gridTemplateRows: `${ROW} ${tokens.shape.control.height.md}`,
      rowGap: 0,
    },
  },
});

export const gnbLinks = style({
  display: "flex",
  alignItems: "center",
  gap: tokens.layout.gap.sm,
  flex: 1,
  "@media": { [narrow]: { gridColumn: "1 / -1", gridRow: 2 } },
});

export const gnbTools = style({ "@media": { [narrow]: { justifySelf: "end" } } });

// ── 반응형 격자 ──────────────────────────────────────────────────────────────
globalStyle(".hero-grid", {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
  gap: tokens.layout.gap.xl,
  alignItems: "center",
  "@media": {
    [`screen and (max-width: ${BP.md})`]: { gridTemplateColumns: "1fr", gap: tokens.layout.gap.lg },
  },
});

globalStyle(".principles-grid", {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: tokens.layout.gap.md,
  "@media": {
    [`screen and (max-width: ${BP.md})`]: { gridTemplateColumns: "1fr" },
  },
});

// ── GNB theme toggle ─────────────────────────────────────────────────────────
// Site navigation is app-owned; this class styles only its theme toggle button.

globalStyle(".gnb-theme", {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: tokens.shape.control.height.md,
  height: tokens.shape.control.height.md,
  padding: 0,
  border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`,
  borderRadius: tokens.shape.radius.control,
  background: tokens.color.bg.raised,
  color: tokens.color.ink.secondary,
  cursor: "pointer",
  fontSize: tokens.typography.role.body.size,
  lineHeight: 1,
  transition: transition("hover", "background", "color"),
});
globalStyle(".gnb-theme:hover", { background: tokens.color.interaction.bgHover.onSurface, color: tokens.color.ink.primary });
