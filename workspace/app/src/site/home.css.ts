// 홈 랜딩 전용 스타일. 초대형 clamp 타이포처럼 토큰으로 표현되지 않는 표현적 글자 값은
// 여기서만 쓴다. 색·간격·형태는 사이트 나머지와 같이 tokens.* 로 참조한다 — 히어로의
// 유동 여백도 scale 단계 사이를 뷰포트 높이로 오간다.
//
// 결: shadcn/ui 랜딩 전략 — 정제된 헤드라인 + 아래 "완전한 앱 목업 하나"로 컴포넌트가
// 실제 화면에서 함께 서는 모습을 증명한다(개별 카드 나열 아님). paper 정체성인
// "갤러리가 아니라 실제 화면으로 검증" 과 같은 결.

import { globalStyle } from "@vanilla-extract/css";

import { emphasisRule, stateSelector, tokens } from "@studio-baeks/paper-ui/tokens";

const BP = tokens.layout.breakpoint;

// ── hero ─────────────────────────────────────────────────────────────────────
globalStyle(".home-hero", {
  paddingBlock: `clamp(${tokens.shape.inset["3xl"]}, 8vh, calc(${tokens.shape.inset["3xl"]} * 2)) clamp(${tokens.shape.inset["2xl"]}, 5vh, ${tokens.shape.inset["3xl"]})`,
  maxWidth: "46rem",
});

globalStyle(".home-headline", {
  margin: 0,
  fontFamily: tokens.typography.palette.family.sans,
  fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
  lineHeight: 1.04,
  letterSpacing: "-0.035em",
  fontWeight: tokens.typography.palette.weight.bold,
  color: tokens.color.ink.primary,
});

globalStyle(".home-sub", {
  marginTop: tokens.layout.gap.lg,
  maxWidth: "38rem",
});

// 헤드라인 끝 마침표만 파란 잉크 한 점 — "색은 의미 있는 자리에만" 을 시그니처로.
globalStyle(".home-dot", {
  color: tokens.color.accent.info.ink,
});

// ── 완전한 앱 목업 — 랜딩의 주인공 ────────────────────────────────────────────
globalStyle(".home-mockup", {
  borderRadius: tokens.shape.radius.surface.lg,
  border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`,
  overflow: "hidden",
  background: tokens.color.bg.raised,
});

// 창 머리
globalStyle(".home-mockup-bar", {
  display: "flex",
  alignItems: "center",
  gap: tokens.layout.gap.sm,
  height: "2.6rem",
  paddingInline: tokens.shape.inset.md,
  // 선 없음 — 면이 이미 나눈다. sunken 인 창 머리와 raised 인 본문 사이엔 톤 차이가 있고,
  // 같은 sunken 인 사이드바와는 애초에 이어져야 하는 자리다.
  background: tokens.color.bg.sunken,
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
  gap: tokens.layout.gap.md,
  padding: tokens.shape.inset.md,
  // 사이드바는 sunken 으로 가라앉는다 — 흰 본문과 대비해 ChatGPT 결(흰 메인 · 회색 사이드바).
  //
  // ⚠ 선을 두르지 않는다. **면이 이미 나눈 자리에 선을 더하면 같은 말을 두 번 한다.**
  // 원칙 2("회색은 카드를 감싸지 않고 받친다")가 여기서도 그대로다 — 받치는 면은 자기
  // 톤으로 경계를 만들고, 괘선은 톤이 같은 것끼리 나눌 때만 나선다.
  background: tokens.color.bg.sunken,
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
  gap: tokens.layout.gap.xs,
});

globalStyle(".home-navitem", {
  display: "flex",
  alignItems: "center",
  gap: tokens.layout.gap.sm,
  height: tokens.shape.control.height.sm,
  paddingInline: tokens.shape.inset.sm,
  borderRadius: tokens.shape.radius.control,
  fontSize: tokens.typography.role.body.size,
  // 목업 안의 비활성 항목은 본문 굵기가 아니라 가볍게 — 활성 항목이 굵기로 도드라진다.
  ...emphasisRule("regular"),
  color: tokens.color.ink.secondary,
});

/* 필터 행·머리말의 크기. Home.tsx 인라인에 있던 것을 옮겼다 — 사이드바 치수를 한곳에
   모아 두면 shape 이 통째로 바꿀 수 있다. */
globalStyle(".home-filterrow", {
  height: "1.75rem",
  paddingInline: tokens.shape.inset.sm,
});

globalStyle(".home-filterhead", {
  paddingInline: tokens.shape.inset.sm,
});

globalStyle(`.home-navitem${stateSelector("selected")}`, {
  background: tokens.color.interaction.selected,
  color: tokens.color.ink.primary,
  ...emphasisRule("medium"),
});

// 하단 요약 한 줄 — 카드 나열이 아니라 인라인 사실들.
globalStyle(".home-facts", {
  display: "flex",
  flexWrap: "wrap",
  gap: tokens.layout.gap.md,
  alignItems: "baseline",
});
