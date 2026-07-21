// theme.css.ts — 토큰 값을 CSS 로 굽는 유일한 자리.
//
// 여기가 raw hex 를 import 하는 *유일한* 모듈이다 (절대 규칙 4). 다른 모든
// 파일은 tokens 객체의 var() 참조만 본다.

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
// │ Pass 2 — 캔버스 (body)                                                   │
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
  MozOsxFontSmoothing: "grayscale",
});

globalStyle("*", { boxSizing: "border-box" });

// 포커스는 파란 링 하나로 통일 (Apple · Atlassian 시그니처). 색이 가장 작게,
// 가장 자주 등장하는 포인트 자리.
globalStyle(":focus-visible", {
  outline: `2px solid ${tokens.color.focus.ring}`,
  outlineOffset: "2px",
  borderRadius: tokens.shape.radius.sm,
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
    ...("tabular" in spec && spec.tabular ? { fontVariantNumeric: "tabular-nums" } : {}),
    margin: 0,
  });
}

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 4 — reduced motion                                                  │
// ╰──────────────────────────────────────────────────────────────────────────╯

globalStyle("*", {
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: "0.01ms !important",
      animationDuration: "0.01ms !important",
    },
  },
});
