// theme.css.ts — 문서 바탕(body · 포커스 링 · reduced motion).
//
// 변수는 tokens/variables.css.ts 가 굽는다. 여기는 그 변수를 읽어 문서에 얹는 규칙만 둔다.
// component · resolver · app 은 tokens var() 만 본다.

import { THEME_ATTRIBUTE, THEME_SWAP_ATTRIBUTE, tokens } from "../tokens";
import { focusRing } from "../internal/shape";
import { layered } from "../tokens/layers.css";
import { typographyRule } from "../tokens/typography-recipes";

// 문서 바탕(body · 포커스 링 · reduced motion)은 pui.base, box-sizing 과 body margin 은
// 맨 앞의 pui.reset 에 든다.
const reset = layered("reset");
const base = layered("base");

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 1 — 캔버스 (body)                                                   │
// ╰──────────────────────────────────────────────────────────────────────────╯

reset.globalStyle("body", { margin: 0 });
base.globalStyle("body", {
  background: tokens.color.bg.canvas,
  color: tokens.color.ink.primary,
  // 문서의 기본 글자는 body 역할 전체다 — 굵기와 줄바꿈까지, Text 밖의 글자도 같은 글자를 받는다.
  ...typographyRule("body"),
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
// │ Pass 2 — reduced motion                                                  │
// ╰──────────────────────────────────────────────────────────────────────────╯

base.globalStyle("*", {
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: `${tokens.motion.duration.reduced} !important`,
      animationDuration: `${tokens.motion.duration.reduced} !important`,
    },
  },
});
