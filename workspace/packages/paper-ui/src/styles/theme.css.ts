// theme.css.ts — 토큰 값을 CSS 로 굽는 유일한 자리.
//
// 여기가 raw hex 를 import 하는 *유일한* 모듈이다 (절대 규칙 4). 다른 모든
// 파일은 tokens 객체의 var() 참조만 본다.
//
// 출력 (개념):
//   :root {
//     --paper-color-paper-base: #fbf9f5;
//     --paper-color-ink-base:   #1a1917;
//     --paper-shape-line-base:  2.75rem;
//     ...
//   }
//   .paper-text-body    { font: ... }
//   .paper-ink-soft     { color: var(--paper-color-ink-soft) }
//   .paper-rules        { background-image: repeating-linear-gradient(...) }

import { globalStyle } from "@vanilla-extract/css";

import { COLOR_VALUES } from "../tokens/colors";
import { SHAPE_VALUES } from "../tokens/shape";
import { TEXT_VALUES, TEXT_SPEC, TEXT_INK, TEXT_VARIANTS } from "../tokens/text";
import { walkValues, pathToCssVar } from "../tokens/helpers";
import { tokens } from "../tokens";

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 1 — :root vars                                                      │
// ╰──────────────────────────────────────────────────────────────────────────╯

const rootVars: Record<string, string> = {};

// 축 목록을 손으로 나열하지 않는다 — 트리를 통째로 걷는다.
// (나열하면 축이 늘 때 조용히 누락되고, var 가 없으면 그 속성은 에러 없이
//  초기값으로 떨어져 토큰 축 하나가 죽은 채 살아있는 것처럼 읽힌다.)
walkValues(COLOR_VALUES, ["color"], (path, value) => {
  rootVars[pathToCssVar(path)] = value;
});
walkValues(SHAPE_VALUES, ["shape"], (path, value) => {
  rootVars[pathToCssVar(path)] = value;
});
walkValues(TEXT_VALUES, [], (path, value) => {
  rootVars[pathToCssVar(path)] = value;
});

globalStyle(":root", { vars: rootVars });

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 2 — 지면 (body)                                                     │
// ╰──────────────────────────────────────────────────────────────────────────╯

globalStyle("body", {
  margin: 0,
  background: tokens.color.paper.base,
  color: tokens.color.ink.base,
  fontFamily: tokens.font.sans,
  fontSize: TEXT_SPEC.body.size,
  lineHeight: TEXT_SPEC.body.lineHeight,
  letterSpacing: TEXT_SPEC.body.tracking,
  WebkitFontSmoothing: "antialiased",
});

globalStyle("*", { boxSizing: "border-box" });

globalStyle(":focus-visible", {
  outline: `2px solid ${tokens.color.ink.base}`,
  outlineOffset: "2px",
});

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 3 — text variant classes                                            │
// ╰──────────────────────────────────────────────────────────────────────────╯

for (const v of TEXT_VARIANTS) {
  const spec = TEXT_SPEC[v];
  globalStyle(`.paper-text-${v}`, {
    fontFamily: spec.family === "mono" ? tokens.font.mono : tokens.font.sans,
    fontSize: spec.size,
    fontWeight: spec.weight,
    lineHeight: spec.lineHeight,
    letterSpacing: spec.tracking,
    color: tokens.color.ink[TEXT_INK[v]],
    ...("transform" in spec && spec.transform ? { textTransform: spec.transform } : {}),
    ...("tabular" in spec && spec.tabular ? { fontVariantNumeric: "tabular-nums" } : {}),
    margin: 0,
  });
}

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 4 — 괘선지 (rules)                                                  │
// ╰──────────────────────────────────────────────────────────────────────────╯
//
// 이 시스템의 시그니처. 배경에 line 간격으로 가로줄을 긋는다. Row 의 높이가
// 같은 line 이므로 항목이 선 *위에* 앉는다 — 이게 종이로 읽히는 이유다.

globalStyle(".paper-rules", {
  backgroundImage: `repeating-linear-gradient(
    to bottom,
    transparent,
    transparent calc(${tokens.shape.line.base} - ${tokens.shape.ruleWidth.base}),
    ${tokens.color.rule.base} calc(${tokens.shape.line.base} - ${tokens.shape.ruleWidth.base}),
    ${tokens.color.rule.base} ${tokens.shape.line.base}
  )`,
});

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 5 — 종이 결                                                         │
// ╰──────────────────────────────────────────────────────────────────────────╯
//
// 아주 옅은 noise 를 화면 전체에 곱한다. 없어도 되지만, 있으면 #fbf9f5 가
// "밝은 회색" 이 아니라 "종이" 로 읽힌다. data URI 라 네트워크 요청 0.

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.32'/%3E%3C/svg%3E\")";

globalStyle(".paper-grain::before", {
  content: "''",
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  pointerEvents: "none",
  opacity: 0.45,
  mixBlendMode: "multiply",
  backgroundImage: GRAIN,
});

globalStyle("*", {
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: "0.01ms !important",
      animationDuration: "0.01ms !important",
    },
  },
});
