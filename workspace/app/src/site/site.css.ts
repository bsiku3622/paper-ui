// 사이트 chrome 의 레이아웃·GNB·사이드바 — 전부 tokens.* 로. raw 값 없음.
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
globalStyle(".gnb", {
  position: "sticky",
  top: 0,
  zIndex: tokens.layout.z.sticky,
  background: tokens.color.paper.base,
  borderBottom: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
});

globalStyle(".gnb-inner", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.shape.gap.xl,
  height: tokens.shape.atom.navbar,
  maxWidth: tokens.layout.container.content,
  width: "100%",
  marginInline: "auto",
});

globalStyle(".gnb-nav", {
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.xs,
});

// nav item — rounded rect. rest 는 조용, hover 에 옅은 면, active 는 진해진다.
globalStyle(".gnb-link", {
  display: "inline-flex",
  alignItems: "center",
  height: tokens.shape.height.md.interaction,
  paddingInline: tokens.shape.padding.md.interaction,
  borderRadius: tokens.shape.radius.interaction,
  fontSize: tokens.text.size.body,
  fontWeight: tokens.text.weight.normal,
  letterSpacing: tokens.text.tracking.body,
  color: tokens.color.ink.soft,
  textDecoration: "none",
  transition: stateTransition("background", "color"),
});
globalStyle(".gnb-link:hover", { background: tokens.color.paper.subtle, color: tokens.color.ink.base });
globalStyle('.gnb-link[data-active="true"]', { background: tokens.color.paper.subtle, color: tokens.color.ink.base });

// ── 사이드바 ─────────────────────────────────────────────────────────────────
// 흰 지면 위 리스트. 편안한 밀도 — 항목은 28px 높이에 넉넉한 좌우 여백, active 는
// 굵기를 바꾸지 않고 옅은 회색 pill 로만 구분(ChatGPT 결).
globalStyle(".side-nav", {
  alignSelf: "start",
  position: "sticky",
  background: tokens.color.paper.base,
  borderRight: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
});

globalStyle(".side-group", {
  display: "flex",
  flexDirection: "column",
  gap: tokens.shape.gap.xs,
});
globalStyle(".side-group + .side-group", { marginTop: tokens.shape.gap.lg });

// 그룹 라벨 — 또렷한 검정. 항목보다 작지만 더 굵어 구분된다.
globalStyle(".side-group-label", {
  paddingInline: tokens.shape.padding.md.interaction,
  marginBottom: tokens.shape.gap.xs,
  fontSize: tokens.text.size.caption,
  fontWeight: tokens.text.weight.semibold,
  letterSpacing: tokens.text.tracking.caption,
  color: tokens.color.ink.base,
});

globalStyle(".side-link", {
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  height: tokens.shape.height.sm.interaction,
  paddingInline: tokens.shape.padding.md.interaction,
  borderRadius: tokens.shape.radius.interaction,
  fontSize: tokens.text.size.body,
  fontWeight: tokens.text.weight.normal,
  letterSpacing: tokens.text.tracking.body,
  color: tokens.color.ink.base,
  textDecoration: "none",
  transition: stateTransition("background"),
});
globalStyle(".side-link:hover", { background: tokens.color.paper.subtle });
globalStyle('.side-link[data-active="true"]', { background: tokens.color.paper.muted });
