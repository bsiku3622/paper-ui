// 사이트 chrome의 레이아웃·GNB — 전부 tokens.*로. raw 값 없음.
//
// 앱 전용이지만 라이브러리와 같은 tokens 객체를 쓴다(vanilla-extract). 그래서
// shape/color/motion/layout 토큰이 바뀌면 여기도 자동으로 따라오고, 존재하지 않는
// 토큰을 참조하면 빌드가 깨진다 — 예전 plain CSS 가 옛 var 이름을 참조해 조용히
// 무너지던 문제(사이드바 붕괴)를 원천 차단한다.

import { globalStyle } from "@vanilla-extract/css";

import { tokens, stateTransition } from "@studio-baeks/paper-ui/tokens";

const BP = tokens.layout.breakpoint;

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
  transition: stateTransition("background", "color"),
});
globalStyle(".gnb-theme:hover", { background: tokens.color.interaction.bgHover.onSurface, color: tokens.color.ink.primary });
