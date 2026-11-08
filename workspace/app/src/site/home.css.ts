// 홈 랜딩 전용 스타일 — 이름이 전역에 나가지 않는 scoped class 다. 글자는 Text 역할(헤드라인은 hero)이,
// 색과 간격과 형태는 tokens.* 의 역할이, 움직임은 Motion 의 reveal 역할이 정한다. 이 파일에 남는 길이는 이 화면의
// 치수(데모 창의 높이, 히어로 슬롯의 크기)뿐이다.
//
// 결: HeroUI 의 두 톤 제목과 열리는 슬롯, shadcn 의 실제 컴포넌트 벽, Apple · GPT 의 스크롤에 맞춰 켜지는 문장, 조명 아래에서
// 떠오르는 실제 화면. 스크롤 연출은 view timeline 이라 JS 가 없고, 움직임을 줄인 환경이나 view timeline 이 없는 브라우저에서는
// 모든 장면이 처음부터 제자리에 선다.

import { keyframes, style } from "@vanilla-extract/css";

import { emphasisRule, lineRule, tokens } from "@studio-baeks/paper-ui/tokens";

const BP = tokens.layout.breakpoint;
const narrow = `screen and (max-width: ${BP.md})`;
const NO_PREFERENCE = "(prefers-reduced-motion: no-preference)";
const VIEW_TIMELINE = "(animation-timeline: view())";
const { reveal } = tokens.motion.role;

// ── 칼럼과 hero ──────────────────────────────────────────────────────────────
// 홈의 첫 장면은 자기 칼럼(container.content)을 직접 그린다. isolation 은 목업의 쌓임을 칼럼 안에 가둔다.
export const column = style({ isolation: "isolate" });

// 히어로는 칼럼 가운데에 선다. 띠(band)는 칼럼을 채우고, 그 안의 히어로가 읽기 폭으로 가운데 선다.
export const heroBand = style({ display: "flex", justifyContent: "center" });
// 히어로의 위아래 여백은 뷰포트 높이를 따라 자라는 section 역할이다.
export const hero = style({
  paddingBlock: `${tokens.layout.section.start} ${tokens.layout.section.end}`,
  maxWidth: tokens.shape.measure.xl,
  marginInline: "auto",
  textAlign: "center",
});
// 제목의 두 줄 — 줄마다 자기 상자라 따로 떠오른다. 둘째 줄은 한 단계 물러난 잉크다.
export const heroLine = style({ display: "block" });
export const heroQuiet = style({ color: tokens.color.ink.secondary });

// 둘째 줄에서 단어 사이가 벌어지고 그 틈에 종이 한 장(흰 면)이 들어앉는다. 그 위의 Switch 는 진짜다 — 누르면 화면이 다크로 바뀐다.
// 폭이 0 에서 자라며 단어를 밀어내고, 다 열린 뒤에야 면이 또렷해진다.
const slotOpen = keyframes({ from: { width: 0, marginInline: 0, opacity: 0 } });
export const heroSlot = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.3em",
  height: "0.82em",
  marginInline: tokens.layout.gap.md,
  verticalAlign: "middle",
  overflow: "hidden",
  "@media": {
    [NO_PREFERENCE]: { animationName: slotOpen, animationDuration: reveal.duration, animationTimingFunction: reveal.easing, animationFillMode: "both" },
  },
});

// A quiet link of the footer: the Link Atom, in the footer's own ink.
export const footerLink = style({ color: tokens.color.ink.secondary });

export const sub = style({
  marginTop: tokens.layout.gap.lg,
  marginInline: "auto",
  maxWidth: tokens.shape.measure.md,
});

// 히어로 위의 한 줄과 CTA 줄의 바깥 간격.
export const heroMeta = style({ marginBottom: tokens.layout.gap.lg });
export const heroActions = style({ marginTop: tokens.layout.gap.xl });

// ── 장면의 머리 — 두 톤 제목과 한 문단 ─────────────────────────────────────────
// 머리는 왼쪽에 두 톤 제목, 오른쪽에 그 장면을 말하는 한 문단이다. 좁은 폭에서는 위아래로 선다.
export const sceneHead = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
  alignItems: "end",
  gap: tokens.layout.gap.xl,
  marginBottom: tokens.layout.gap["3xl"],
  "@media": { [narrow]: { gridTemplateColumns: "minmax(0, 1fr)" } },
});
export const sceneHeadCentered = style({ textAlign: "center", maxWidth: tokens.shape.measure.xl, marginInline: "auto", marginBottom: tokens.layout.gap["3xl"] });
export const eyebrow = style({ marginBottom: tokens.layout.gap.md });

// ── 문장 — 스크롤에 맞춰 한 줄씩 켜진다 ─────────────────────────────────────
// 낱말마다 자기 view timeline 을 따라, 화면 아래에서 들어와 가운데에 닿을 때까지 물러난 잉크에서 본문 잉크로 켜진다. 같은 줄의 낱말은
// 함께 오르므로 줄 단위로 켜진다. view timeline 이 없거나 움직임을 줄였으면 처음부터 켜져 있다.
export const statement = style({ paddingBlock: `${tokens.layout.section.start} ${tokens.layout.section.end}` });
export const statementText = style({ maxWidth: tokens.shape.measure.xl, marginInline: "auto" });
const lightUp = keyframes({ from: { color: tokens.color.ink.tertiary } });
export const statementWord = style({
  display: "inline-block",
  "@media": {
    [NO_PREFERENCE]: {
      "@supports": {
        [VIEW_TIMELINE]: { animationName: lightUp, animationTimingFunction: reveal.easing, animationFillMode: "both", animationTimeline: "view()", animationRange: "cover 0% cover 50%" },
      },
    },
  },
});

// ── 무대 — 조명 아래에서 실제 화면이 떠오른다 ──────────────────────────────
// 무대는 페이지와 같은 테마다. 따로 칠한 면 없이 위에서 비추는 흰 빛(bg.raised 의 타원)만 깔고, 목업은 다른 장면처럼 reveal.scroll 로
// 떠오른다 — 폭을 바꾸면 표가 매 프레임 다시 배치되며 출렁이므로, 크기는 그대로 둔다.
export const stageSection = style({ paddingInline: tokens.layout.gutter });
export const stage = style({
  paddingBlockStart: tokens.layout.section.start,
  paddingInline: tokens.layout.gap["2xl"],
  // farthest-side: the light is gone by the time it reaches the sides and the foot, so the stage shows no edge of its own.
  backgroundImage: `radial-gradient(ellipse farthest-side at top, ${tokens.color.bg.raised}, transparent)`,
  "@media": { [narrow]: { paddingInline: 0 } },
});
// 목업과 그 캡션을 하나로 묶는 figure — 브라우저 기본 margin 을 걷고 무대 가운데 선다.
export const stageFigure = style({
  width: "100%",
  maxWidth: tokens.layout.container.content,
  marginBlock: 0,
  marginInline: "auto",
});

// ── 원칙 넷 ──────────────────────────────────────────────────────────────────
export const principlesSection = style({ paddingBlock: `${tokens.layout.section.start} 0` });
export const principles = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: tokens.layout.gap.xl,
  "@media": {
    [`screen and (max-width: ${BP.lg})`]: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
    [`screen and (max-width: ${BP.sm})`]: { gridTemplateColumns: "minmax(0, 1fr)" },
  },
});
export const principleMark = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: tokens.shape.control.height.md,
  height: tokens.shape.control.height.md,
  borderRadius: tokens.shape.radius.control.md,
});

// ── 마무리 — 설치 한 줄과 다음 걸음 ──────────────────────────────────────────
export const closing = style({ paddingBlock: `${tokens.layout.section.start} ${tokens.layout.section.end}`, textAlign: "center" });
export const install = style({
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.layout.gap.sm,
  marginBlock: tokens.layout.gap.xl,
  paddingInlineStart: tokens.shape.inset.lg,
  paddingInlineEnd: tokens.shape.inset.xs,
  paddingBlock: tokens.shape.inset.xs,
});

// ── 무대의 창 — 데모를 띄운 frame ────────────────────────────────────────────
// 창은 흰 면에 선과 그림자이고, 모서리 밖으로 frame 이 나가지 않게 자른다. frame 의 높이는 이 화면의 치수다 — 데모의 첫 화면
// (머리 막대 · 제목 · 숫자 띠 · 첫 패널)이 들어오는 높이.
export const demoWindow = style({ overflow: "hidden" });
export const demoFrame = style({ display: "block", width: "100%", height: "40rem", border: 0 });

// ── 캡션과 푸터 ──────────────────────────────────────────────────────────────
// "데모 열기" 링크의 굵기와, 그 뒤 화살표.
export const demoLink = style({ ...emphasisRule("medium") });
export const demoArrow = style({ verticalAlign: "text-bottom", marginInlineStart: tokens.layout.gap.xs });

export const footer = style({
  ...lineRule({ side: "top" }),
  marginTop: tokens.layout.gap.lg,
  paddingBlock: `${tokens.shape.inset.xl} ${tokens.shape.inset["2xl"]}`,
});
// 푸터 로고는 잉크보다 한 걸음 물러난다.
export const footerLogo = style({ opacity: tokens.color.opacity.subdued });
