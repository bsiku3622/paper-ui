// theme.css.ts — 문서 바탕(body · 포커스 링 · Text 역할 class · reduced motion).
//
// 변수는 tokens/variables.css.ts 가 굽는다. 여기는 그 변수를 읽어 문서에 얹는 규칙만 둔다.
// component · resolver · app 은 tokens var() 만 본다.

import { TEXT_INK, TEXT_VARIANTS } from "../tokens/typography";
import { THEME_ATTRIBUTE, THEME_SWAP_ATTRIBUTE, tokens } from "../tokens";
import { focusRing } from "../internal/shape";
import { layered } from "../tokens/layers.css";

// 문서 바탕(body · 포커스 링 · reduced motion)과 Text 역할 class 는 pui.base, box-sizing 과 body margin 은
// 맨 앞의 pui.reset 에 든다. Text 역할이 base 에 있어서, 같은 요소에 붙는 ink class(pui.utilities)가
// 출력 순서와 무관하게 역할의 기본 잉크를 이긴다.
const reset = layered("reset");
const base = layered("base");

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 1 — 캔버스 (body)                                                   │
// ╰──────────────────────────────────────────────────────────────────────────╯

reset.globalStyle("body", { margin: 0 });
base.globalStyle("body", {
  background: tokens.color.bg.canvas,
  color: tokens.color.ink.primary,
  fontFamily: tokens.typography.palette.family.sans,
  fontSize: tokens.typography.role.body.size,
  lineHeight: tokens.typography.role.body.leading,
  letterSpacing: tokens.typography.role.body.tracking,
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
});

reset.globalStyle("*", { boxSizing: "border-box" });

// 상속되는 글자색은 스코프마다 다시 선언한다 — Box theme · Overlay portal 안의 글자가 페이지의
// 모드가 아니라 스코프 자신의 모드 잉크를 받는다. 특정도 0이라 class 가 정한 색은 그대로 이긴다.
base.globalStyle(`:where([${THEME_ATTRIBUTE}])`, { color: tokens.color.ink.primary });

// 모드가 바뀌는 동안 <html> 이 swap 속성을 달고, 그 사이 모든 전이는 Motion 의 theme 역할(즉시)로 끝난다.
// 컨트롤이 페이지보다 늦게 따라 바뀌지 않는다. !important 라 컴포넌트의 transition 보다 앞선다.
const swapping = `:root[${THEME_SWAP_ATTRIBUTE}]`;
base.globalStyle(`${swapping} *, ${swapping} *::before, ${swapping} *::after`, {
  transitionDuration: `${tokens.motion.role.theme.duration} !important`,
  transitionDelay: `${tokens.motion.duration.instant} !important`,
});

// 포커스는 interaction.focus로 통일 (Apple · Atlassian 시그니처). 색이 가장 작게,
// 가장 자주 등장하는 포인트 자리.
base.globalStyle(":focus-visible", {
  ...focusRing,
  borderRadius: tokens.shape.radius.control,
});

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 2 — text variant classes                                            │
// ╰──────────────────────────────────────────────────────────────────────────╯

for (const v of TEXT_VARIANTS) {
  const spec = tokens.typography.role[v];
  base.globalStyle(`.pui-text-${v}`, {
    // size · leading · tracking 은 :root var 를 참조 — 값은 tokens/variables.css.ts 한 곳에서만.
    fontFamily: tokens.typography.palette.family.sans,
    fontSize: spec.size,
    fontWeight: spec.weight,
    lineHeight: spec.leading,
    letterSpacing: spec.tracking,
    color: tokens.color.ink[TEXT_INK[v]],
    margin: 0,
  });
  // mono 일 때만 — variant px 를 MONO_SCALE 로 줄인다. 두 클래스라 .pui-text-* 를 이긴다.
  base.globalStyle(`.pui-text-${v}.pui-mono`, {
    fontSize: `calc(${tokens.typography.role[v].size} * ${tokens.typography.palette.monoSizeScale})`,
  });
}

// family=mono — variant 위에 교차하는 모디파이어. 서체를 등폭으로 바꾸고 mono 전용
// 자간을 준다. sans 의 per-variant tracking(display -0.03em 등)을 그대로 얹으면 큰
// 크기 mono 가 짓눌리므로 버리고, 대신 단일 값 -0.04em — SF Mono·D2Coding 은 advance 가
// 넓어 UI 에서 벌어져 보여 조인다 (균일 적용이라 tabular 정렬은 유지). letter-spacing 은
// 요소당 하나라 영어·한글을 한 런에서 따로 못 준다 — 코드·토큰(영어) 기준 단일값.
// loop 뒤에 와서 같은 특정도의 .pui-text-* 를 순서로 이긴다.
base.globalStyle(".pui-mono", {
  fontFamily: tokens.typography.palette.family.mono,
  letterSpacing: tokens.typography.palette.tracking.mono,
});

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 3 — reduced motion                                                  │
// ╰──────────────────────────────────────────────────────────────────────────╯

base.globalStyle("*", {
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: `${tokens.motion.duration.reduced} !important`,
      animationDuration: `${tokens.motion.duration.reduced} !important`,
    },
  },
});
