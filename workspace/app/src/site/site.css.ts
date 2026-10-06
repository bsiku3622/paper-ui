// 사이트 chrome의 레이아웃·GNB — 전부 tokens.*로. raw 값 없음.
//
// 앱 전용이지만 라이브러리와 같은 tokens 객체를 쓴다(vanilla-extract). 그래서
// shape/color/motion/layout 토큰이 바뀌면 여기도 자동으로 따라오고, 존재하지 않는
// 토큰을 참조하면 빌드가 깨진다 — 예전 plain CSS 가 옛 var 이름을 참조해 조용히
// 무너지던 문제(사이드바 붕괴)를 원천 차단한다.

import { globalStyle } from "@vanilla-extract/css";

import { tokens, stateTransition } from "@studio-baeks/paper-ui";

const BP = tokens.layout.breakpoint;

// ── 반응형 격자 ──────────────────────────────────────────────────────────────
globalStyle(".hero-grid", {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
  gap: tokens.shape.gap.xl,
  alignItems: "center",
  "@media": {
    [`screen and (max-width: ${BP.md})`]: { gridTemplateColumns: "1fr", gap: tokens.shape.gap.lg },
  },
});

globalStyle(".principles-grid", {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: tokens.shape.gap.md,
  "@media": {
    [`screen and (max-width: ${BP.md})`]: { gridTemplateColumns: "1fr" },
  },
});

// ── GNB — 지면 맨 위 한 줄 ───────────────────────────────────────────────────
// 흰 지면 위 깔끔한 바. 스크롤에도 조용히 붙어 있다.
// ⚠ .gnb · .gnb-inner · .gnb-nav · .gnb-link 은 지웠다. 사이트 GNB 가 라이브러리
// Navbar 를 직접 쓰게 되면서(항목이 링크가 될 수 있게 `as` 를 열었다) 손으로 짠 헤더가
// 통째로 사라졌다. 남은 .gnb-theme 은 헤더가 아니라 테마 토글 버튼의 모양이다.

globalStyle(".gnb-theme", {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: tokens.shape.height.md.interaction,
  height: tokens.shape.height.md.interaction,
  padding: 0,
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  borderRadius: tokens.shape.radius.interaction,
  background: tokens.color.bg.raised,
  color: tokens.color.ink.secondary,
  cursor: "pointer",
  fontSize: tokens.text.style.body.size,
  lineHeight: 1,
  transition: stateTransition("background", "color"),
});
globalStyle(".gnb-theme:hover", { background: tokens.color.interaction.bgHover.onSurface, color: tokens.color.ink.primary });
