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
  background: tokens.color.paper.canvas,
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

// nav item — 활성은 면이 아니라 **글자**로 표시한다(라이브러리 Navbar 와 같은 방식).
// 면으로 표시하면 nav 하나가 화면에서 가장 눈에 띄는 덩어리가 되는데, nav 는 지금
// 어디인지 알려줄 뿐 주인공이 아니다. 배경은 hover 에만 — 그건 포인터에 답하는
// 것이라 사라질 표시다.
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
globalStyle(".gnb-link:hover", { background: tokens.color.interaction.hover, color: tokens.color.ink.base });
globalStyle('.gnb-link[data-active="true"]', { color: tokens.color.ink.base, fontWeight: tokens.text.weight.medium });

// 테마 토글 — GNB 우측 정사각 버튼. 라이브러리 useTheme 로 light→dark→system 순환.
// 색은 전부 토큰이라 스코프가 바뀌면 버튼 자신도 다크로 따라온다.
globalStyle(".gnb-theme", {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: tokens.shape.height.md.interaction,
  height: tokens.shape.height.md.interaction,
  padding: 0,
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  borderRadius: tokens.shape.radius.interaction,
  background: tokens.color.paper.raised,
  color: tokens.color.ink.soft,
  cursor: "pointer",
  fontSize: tokens.text.size.subheading,
  lineHeight: 1,
  transition: stateTransition("background", "color"),
});
globalStyle(".gnb-theme:hover", { background: tokens.color.interaction.hover, color: tokens.color.ink.base });

// ── 사이드바 ─────────────────────────────────────────────────────────────────
// 흰 지면 위 리스트. 편안한 밀도 — 항목은 28px 높이에 넉넉한 좌우 여백, active 는
// 굵기를 바꾸지 않고 옅은 회색 pill 로만 구분(ChatGPT 결).
globalStyle(".side-nav", {
  alignSelf: "start",
  position: "sticky",
  background: tokens.color.paper.canvas,
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
  color: tokens.color.ink.soft,
  textDecoration: "none",
  transition: stateTransition("background", "color"),
});
globalStyle(".side-link:hover", { background: tokens.color.interaction.hover, color: tokens.color.ink.base });
// active — 여기는 GNB 와 다르다. 가로 GNB 는 항목이 서넛뿐이라 글자만으로 충분하지만,
// 세로 사이드바는 수십 줄을 훑는 자리라 눈이 걸릴 면이 필요하다. rest 를 ink.soft 로
// 낮춰야 활성 한 줄이 굵기만으로도 떠오른다.
globalStyle('.side-link[data-active="true"]', {
  background: tokens.color.interaction.selected,
  color: tokens.color.ink.base,
  fontWeight: tokens.text.weight.medium,
});
