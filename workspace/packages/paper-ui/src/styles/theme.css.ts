// theme.css.ts — 토큰 값을 CSS 로 굽는 유일한 자리.
//
// 여기가 raw hex 를 import 하는 *유일한* 모듈이다 (절대 규칙 4). 다른 모든
// 파일은 tokens 객체의 var() 참조만 본다.

import { globalStyle } from "@vanilla-extract/css";

import { COLOR_VALUES, COLOR_VALUES_DARK } from "../tokens/colors";
import { SHAPE_VALUES, SHADOW_DARK } from "../tokens/shape";
import { LAYOUT_VALUES } from "../tokens/layout";
import { TEXT_VALUES, TEXT_SPEC, TEXT_INK, TEXT_VARIANTS } from "../tokens/text";
import { walkValues, pathToCssVar } from "../tokens/helpers";
import { tokens } from "../tokens";

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 1 — :root vars                                                      │
// ╰──────────────────────────────────────────────────────────────────────────╯

// 축 목록을 손으로 나열하지 않는다 — 트리를 통째로 걷는다.
// (나열하면 축이 늘 때 조용히 누락되고, var 가 없으면 그 속성은 에러 없이
//  초기값으로 떨어져 토큰 축 하나가 죽은 채 살아있는 것처럼 읽힌다.)
//
// 색만 테마에 따라 갈린다 — shape·layout·text 는 테마 불변이라 :root 한 번만 굽고,
// 색은 light/dark 두 세트를 나눠 담아 스코프 셀렉터로 교체한다. var 이름은 동일해
// 소비처는 그대로고, 스코프(html[data-theme] 이나 subtree ThemeScope)만 바뀌면
// 값이 바뀐다.
const baseVars: Record<string, string> = {}; // shape · layout · text (테마 불변)
const lightVars: Record<string, string> = {};
const darkVars: Record<string, string> = {};

walkValues(SHAPE_VALUES, ["shape"], (path, value) => {
  baseVars[pathToCssVar(path)] = value;
});
walkValues(LAYOUT_VALUES, ["layout"], (path, value) => {
  baseVars[pathToCssVar(path)] = value;
});
walkValues(TEXT_VALUES, [], (path, value) => {
  baseVars[pathToCssVar(path)] = value;
});
walkValues(COLOR_VALUES, ["color"], (path, value) => {
  lightVars[pathToCssVar(path)] = value;
});
walkValues(COLOR_VALUES_DARK, ["color"], (path, value) => {
  darkVars[pathToCssVar(path)] = value;
});
// 그림자는 shape 축이지만 다크에선 값이 달라져야 한다(near-black 은 어두운 면 위에서
// 사라짐). 색과 함께 dark 스코프에 shadow var 만 덮어쓴다 — 나머지 shape 는 불변.
walkValues(SHADOW_DARK, ["shape", "shadow"], (path, value) => {
  darkVars[pathToCssVar(path)] = value;
});

// :root — 테마 불변 축 + light 색(기본값). Provider 없이도 라이트로 바로 선다.
globalStyle(":root", { vars: { ...baseVars, ...lightVars } });

// 테마 스코프 — 색 세트만 교체한다. :root[...] 를 겹쳐 root 레벨(html)에서 특정도로
// 확실히 이기고, 뒤 홑 [data-theme] 셀렉터가 중첩 div(ThemeScope · Box inverse)를 잡는다.
globalStyle(':root[data-theme="light"], [data-theme="light"]', { vars: lightVars });
globalStyle(':root[data-theme="dark"], [data-theme="dark"]', { vars: darkVars });

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 2 — 캔버스 (body)                                                   │
// ╰──────────────────────────────────────────────────────────────────────────╯

globalStyle("body", {
  margin: 0,
  background: tokens.color.paper.canvas,
  color: tokens.color.ink.base,
  fontFamily: tokens.text.font.sans,
  fontSize: tokens.text.size.body,
  lineHeight: tokens.text.leading.body,
  letterSpacing: tokens.text.tracking.body,
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
});

globalStyle("*", { boxSizing: "border-box" });

// 포커스는 파란 링 하나로 통일 (Apple · Atlassian 시그니처). 색이 가장 작게,
// 가장 자주 등장하는 포인트 자리.
globalStyle(":focus-visible", {
  outline: `2px solid ${tokens.color.focus.ring}`,
  outlineOffset: "2px",
  borderRadius: tokens.shape.radius.interaction,
});

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 3 — text variant classes                                            │
// ╰──────────────────────────────────────────────────────────────────────────╯

// mono 는 같은 px 에서 sans(Pretendard)보다 크게 읽힌다 — D2Coding·SF Mono 의
// x-height·advance 가 커서. variant 크기에 비례해 살짝 줄여 sans 와 시각 크기를 맞춘다.
const MONO_SCALE = 0.95;

for (const v of TEXT_VARIANTS) {
  const spec = TEXT_SPEC[v];
  globalStyle(`.pui-text-${v}`, {
    // size · leading · tracking 은 :root var 를 참조 — 값은 Pass 1 한 곳에서만.
    fontFamily: tokens.text.font.sans,
    fontSize: tokens.text.size[v],
    fontWeight: spec.weight, // weight 는 variant→굵기 매핑이라 spec 의 raw 어휘값
    lineHeight: tokens.text.leading[v],
    letterSpacing: tokens.text.tracking[v],
    color: tokens.color.ink[TEXT_INK[v]],
    margin: 0,
  });
  // mono 일 때만 — variant px 를 MONO_SCALE 로 줄인다. 두 클래스라 .pui-text-* 를 이긴다.
  globalStyle(`.pui-text-${v}.pui-mono`, {
    fontSize: `calc(${tokens.text.size[v]} * ${MONO_SCALE})`,
  });
}

// family=mono — variant 위에 교차하는 모디파이어. 서체를 등폭으로 바꾸고 mono 전용
// 자간을 준다. sans 의 per-variant tracking(display -0.03em 등)을 그대로 얹으면 큰
// 크기 mono 가 짓눌리므로 버리고, 대신 단일 값 -0.04em — SF Mono·D2Coding 은 advance 가
// 넓어 UI 에서 벌어져 보여 조인다 (균일 적용이라 tabular 정렬은 유지). letter-spacing 은
// 요소당 하나라 영어·한글을 한 런에서 따로 못 준다 — 코드·토큰(영어) 기준 단일값.
// loop 뒤에 와서 같은 특정도의 .pui-text-* 를 순서로 이긴다.
globalStyle(".pui-mono", {
  fontFamily: tokens.text.font.mono,
  letterSpacing: "-0.04em",
});

// mono 는 half-step 이 필요 없다. half-step(450·550)은 작은 *sans* 가 Retina 에서
// 힘 빠지는 걸 잡으려는 보정인데, mono 는 획이 균일해 그 문제가 없다. 게다가 정적
// 시스템 mono(SF Mono 등)는 450 을 500 으로 반올림해 되레 무거워진다. Text variant
// 중 half-step 을 쓰는 건 body·caption 뿐이라, 이 둘의 mono 만 whole-step 400 으로
// 내린다 (title·heading 등은 이미 whole-step 600·700 이라 그대로). 두 클래스 셀렉터라
// 특정도가 높아 .pui-text-* 를 이긴다.
globalStyle(".pui-text-body.pui-mono, .pui-text-caption.pui-mono", {
  fontWeight: "400",
});

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
