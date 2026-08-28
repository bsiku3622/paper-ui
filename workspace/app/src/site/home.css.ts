// 홈 랜딩 전용 스타일. 사이트 나머지는 site.css.ts 의 "raw 값 없음" 규칙을 지키지만,
// 랜딩은 예외 자리다 — 초대형 clamp 타이포처럼 토큰으로 표현되지 않는 표현적 값을
// 여기서만 허용한다. 색·간격은 여전히 tokens.* 로 참조한다.
//
// 결: shadcn/ui 랜딩 전략 — 정제된 헤드라인 + 아래 "완전한 앱 목업 하나"로 컴포넌트가
// 실제 화면에서 함께 서는 모습을 증명한다(개별 카드 나열 아님). paper 정체성인
// "갤러리가 아니라 실제 화면으로 검증" 과 같은 결.

import { globalStyle } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui";

const BP = tokens.layout.breakpoint;

// ── hero ─────────────────────────────────────────────────────────────────────
globalStyle(".home-hero", {
  paddingBlock: "clamp(3rem, 8vh, 5.5rem) clamp(2rem, 5vh, 3rem)",
  maxWidth: "46rem",
});

globalStyle(".home-headline", {
  margin: 0,
  fontFamily: tokens.text.font.sans,
  fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
  lineHeight: 1.04,
  letterSpacing: "-0.035em",
  fontWeight: tokens.text.weight.bold,
  color: tokens.color.ink.base,
});

globalStyle(".home-sub", {
  marginTop: tokens.shape.gap.lg,
  maxWidth: "38rem",
});

// 헤드라인 끝 마침표만 파란 잉크 한 점 — "색은 의미 있는 자리에만" 을 시그니처로.
globalStyle(".home-dot", {
  color: tokens.color.accent.info.solid,
});

// ── 완전한 앱 목업 — 랜딩의 주인공 ────────────────────────────────────────────
globalStyle(".home-mockup", {
  borderRadius: tokens.shape.radius.layout.lg,
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  overflow: "hidden",
  background: tokens.color.paper.raised,
  // 제품 목업은 지면 위로 살짝 떠 있다(원칙 4 의 overlay 자리). 카드가 아니라 화면.
  boxShadow: tokens.shape.shadow.overlay,
});

// 창 머리
globalStyle(".home-mockup-bar", {
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  height: "2.6rem",
  paddingInline: tokens.shape.padding.md.interaction,
  borderBottom: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  background: tokens.color.paper.sunken,
});

// 사이드바 + 메인
globalStyle(".home-mockup-body", {
  display: "grid",
  gridTemplateColumns: "13.5rem minmax(0, 1fr)",
  minHeight: "27rem",
  "@media": {
    [`screen and (max-width: ${BP.md})`]: { gridTemplateColumns: "minmax(0, 1fr)" },
  },
});

globalStyle(".home-mockup-side", {
  display: "flex",
  flexDirection: "column",
  gap: tokens.shape.gap.md,
  padding: tokens.shape.padding.md.interaction,
  borderRight: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  // 사이드바는 well 로 가라앉는다 — 흰 본문과 대비해 ChatGPT 결(흰 메인 · 회색 사이드바).
  background: tokens.color.paper.sunken,
  "@media": {
    [`screen and (max-width: ${BP.md})`]: { display: "none" },
  },
});

globalStyle(".home-mockup-main", {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});

// 사이드바 네비 항목
globalStyle(".home-nav", {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
});

globalStyle(".home-navitem", {
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  height: tokens.shape.height.sm.interaction,
  paddingInline: tokens.shape.padding.sm.interaction,
  borderRadius: tokens.shape.radius.interaction,
  fontSize: tokens.text.size.body,
  color: tokens.color.ink.soft,
});

globalStyle(".home-navitem[data-active='true']", {
  background: tokens.color.interaction.selected,
  color: tokens.color.ink.base,
  fontWeight: tokens.text.weight.medium,
});

// 하단 요약 한 줄 — 카드 나열이 아니라 인라인 사실들.
globalStyle(".home-facts", {
  display: "flex",
  flexWrap: "wrap",
  gap: tokens.shape.gap.md,
  alignItems: "baseline",
});
