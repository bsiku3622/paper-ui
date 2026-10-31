// 홈 랜딩 전용 스타일 — 이름이 전역에 나가지 않는 scoped class 다. 글자는 Text 역할(헤드라인은 hero)이,
// 색과 간격과 형태는 tokens.* 의 역할이 정한다. 이 파일에 남는 길이는 이 화면의 치수(목업의 열 폭과 높이)뿐이다.
//
// 결: shadcn/ui 랜딩 전략 — 정제된 헤드라인 + 아래 "완전한 앱 목업 하나"로 컴포넌트가
// 실제 화면에서 함께 서는 모습을 증명한다(개별 카드 나열 아님). paper 정체성인
// "갤러리가 아니라 실제 화면으로 검증" 과 같은 결.

import { style } from "@vanilla-extract/css";

import { emphasisRule, stateSelector, tokens } from "@studio-baeks/paper-ui/tokens";

const BP = tokens.layout.breakpoint;
const narrow = `screen and (max-width: ${BP.md})`;
const line = `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`;

// ── 칼럼과 hero ──────────────────────────────────────────────────────────────
// 홈은 자기 칼럼(container.content)을 직접 그린다 — 풀블리드 랜딩이다. isolation 은 목업의 쌓임을 칼럼 안에 가둔다.
export const column = style({ marginInline: "auto", isolation: "isolate" });

// 히어로의 위아래 여백은 뷰포트 높이를 따라 자라는 section 역할이다.
export const hero = style({
  paddingBlock: `${tokens.layout.section.start} ${tokens.layout.section.end}`,
  maxWidth: tokens.shape.measure.xl,
});
export const sub = style({
  marginTop: tokens.layout.gap.lg,
  maxWidth: tokens.shape.measure.md,
});

// 히어로 위의 한 줄과 CTA 줄의 바깥 간격.
export const heroMeta = style({ marginBottom: tokens.layout.gap.lg });
export const heroActions = style({ marginTop: tokens.layout.gap.xl });

// ── 완전한 앱 목업 — 랜딩의 주인공 ────────────────────────────────────────────
export const mockup = style({ overflow: "hidden" });

// 창 머리. 선 없음 — 면이 이미 나눈다. sunken 인 창 머리와 raised 인 본문 사이엔 톤 차이가 있고,
// 같은 sunken 인 사이드바와는 애초에 이어져야 하는 자리다.
export const mockupBar = style({ height: "2.6rem" });
export const urlPill = style({ marginInline: "auto" });

// 사이드바 + 메인
export const mockupBody = style({
  display: "grid",
  gridTemplateColumns: "13.5rem minmax(0, 1fr)",
  minHeight: "27rem",
  "@media": { [narrow]: { gridTemplateColumns: "minmax(0, 1fr)" } },
});

// 사이드바는 sunken 으로 가라앉는다 — 흰 본문과 대비해 ChatGPT 결(흰 메인 · 회색 사이드바).
//
// ⚠ 선을 두르지 않는다. **면이 이미 나눈 자리에 선을 더하면 같은 말을 두 번 한다.**
// 원칙 2("회색은 카드를 감싸지 않고 받친다")가 여기서도 그대로다 — 받치는 면은 자기
// 톤으로 경계를 만들고, 괘선은 톤이 같은 것끼리 나눌 때만 나선다.
export const mockupSide = style({ "@media": { [narrow]: { display: "none" } } });
export const mockupMain = style({ minWidth: 0 });

// 필터 탭 — SelectableGroup 의 알약 Button 들이 나란히 선다.
export const tabs = style({ display: "flex", gap: tokens.layout.gap.xs });

// 사이드바 로고 칸. 마크는 accent.primary 의 solid 면과 wash 글자(Paint)다.
export const brandMark = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.5rem",
  height: "1.5rem",
  borderRadius: tokens.shape.radius.control,
});
export const brandInitial = style({ ...emphasisRule("bold") });

// 사이드바 네비 항목. 목업의 항목은 누를 수 없어 hover 도 눌림도 없고, 현재 항목만 data-selected 의 선택 면(interaction.selected)을 입는다.
// 목업 안의 비활성 항목은 본문 굵기가 아니라 가볍게 — 활성 항목이 굵기로 도드라진다.
export const navItem = style({
  display: "flex",
  alignItems: "center",
  gap: tokens.layout.gap.sm,
  height: tokens.shape.control.height.sm,
  paddingInline: tokens.shape.inset.sm,
  borderRadius: tokens.shape.radius.control,
  ...emphasisRule("regular"),
  color: tokens.color.ink.secondary,
  selectors: {
    [`&${stateSelector("selected")}`]: { background: tokens.color.interaction.selected, color: tokens.color.ink.primary, ...emphasisRule("medium") },
  },
});

// 필터 행·머리말의 크기 — 사이드바 치수를 한곳에 모아 두면 shape 이 통째로 바꿀 수 있다.
export const filterRow = style({ height: "1.75rem", paddingInline: tokens.shape.inset.sm });
export const filterHead = style({ paddingInline: tokens.shape.inset.sm });

// 목업 이슈 표.
export const table = style({ width: "100%", borderCollapse: "collapse", textAlign: "left" });
export const cell = style({ padding: tokens.shape.inset.sm, borderBottom: line });
export const headCell = style([cell, { color: tokens.color.ink.tertiary }]);

// ── 캡션과 푸터 ──────────────────────────────────────────────────────────────
// 목업과 그 캡션을 하나로 묶는 figure — 브라우저 기본 margin 을 걷는다.
export const figure = style({ margin: 0 });

// "데모 열기" 링크의 굵기와, 그 뒤 화살표.
export const demoLink = style({ ...emphasisRule("medium") });
export const demoArrow = style({ verticalAlign: "text-bottom", marginInlineStart: tokens.layout.gap.xs });

export const footer = style({
  borderTop: line,
  marginTop: tokens.layout.gap.lg,
  paddingBlock: `${tokens.shape.inset.xl} ${tokens.shape.inset["2xl"]}`,
});
// 푸터 로고는 잉크보다 한 걸음 물러난다.
export const footerLogo = style({ opacity: tokens.color.opacity.subdued });
