// theme.css.ts — 토큰 값을 CSS 로 굽는 유일한 자리.
//
// 여기와 tokens/index.ts가 L2 semantic VALUES를 CSS variable로 emit한다. OKLCH source와
// generated HEX는 각 private layer에 격리하고, component·resolver·app은 tokens var()만 본다.

import { globalStyle } from "@vanilla-extract/css";

import { COLOR_VALUES, COLOR_VALUES_DARK } from "../tokens/colors";
import { SHAPE_VALUES } from "../tokens/shape";
import { ELEVATIONS, LAYOUT_VALUES, elevationShadow, elevationShadowPath } from "../tokens/layout";
import { TEXT_VALUES, TEXT_CONTENT, TEXT_VARIANTS } from "../tokens/text";
import { walkValues, pathToCssVar } from "../tokens/helpers";
import { tokens } from "../tokens";
import { focusRing } from "../internal/shape";

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

// Shape·Layout은 원본(source)만 변수로 굽는다. 역할은 그 변수의 별칭이거나 소비 요소에서
// 계산되는 calc() 라 따로 굽지 않는다 (tokens/shape.ts).
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
// Elevation shadow — geometry는 Layout, 색은 Color의 shadow tint. 테마마다 둘 다 바뀌므로
// 조립된 값을 테마 스코프가 통째로 교체한다.
for (const [theme, target] of [["light", lightVars], ["dark", darkVars]] as const) {
  for (const level of ELEVATIONS) {
    target[pathToCssVar(elevationShadowPath(level))] = elevationShadow(level, theme, (tint) => tokens.color.shadow[tint]);
  }
}

// :root — 테마 불변 축 + light 색(기본값). Provider 없이도 라이트로 바로 선다.
globalStyle(":root", { colorScheme: "light", vars: { ...baseVars, ...lightVars } });

// 테마 스코프 — 색 세트만 교체한다. :root[...] 를 겹쳐 root 레벨(html)에서 특정도로
// 확실히 이기고, 뒤 홑 [data-theme] 셀렉터가 중첩 div(ThemeScope · Box inverse)를 잡는다.
globalStyle(':root[data-theme="light"], [data-theme="light"]', { colorScheme: "light", vars: lightVars });
globalStyle(':root[data-theme="dark"], [data-theme="dark"]', { colorScheme: "dark", vars: darkVars });

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 2 — 캔버스 (body)                                                   │
// ╰──────────────────────────────────────────────────────────────────────────╯

globalStyle("body", {
  margin: 0,
  background: tokens.color.bg.canvas,
  color: tokens.color.ink.primary,
  fontFamily: tokens.text.palette.family.sans,
  fontSize: tokens.text.style.body.size,
  lineHeight: tokens.text.style.body.leading,
  letterSpacing: tokens.text.style.body.tracking,
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
});

globalStyle("*", { boxSizing: "border-box" });

// 포커스는 interaction.focus로 통일 (Apple · Atlassian 시그니처). 색이 가장 작게,
// 가장 자주 등장하는 포인트 자리.
globalStyle(":focus-visible", {
  ...focusRing,
  borderRadius: tokens.shape.radius.control,
});

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 3 — text variant classes                                            │
// ╰──────────────────────────────────────────────────────────────────────────╯

for (const v of TEXT_VARIANTS) {
  const spec = tokens.text.style[v];
  globalStyle(`.pui-text-${v}`, {
    // size · leading · tracking 은 :root var 를 참조 — 값은 Pass 1 한 곳에서만.
    fontFamily: tokens.text.palette.family.sans,
    fontSize: spec.size,
    fontWeight: spec.weight,
    lineHeight: spec.leading,
    letterSpacing: spec.tracking,
    color: tokens.color.ink[TEXT_CONTENT[v]],
    margin: 0,
  });
  // mono 일 때만 — variant px 를 MONO_SCALE 로 줄인다. 두 클래스라 .pui-text-* 를 이긴다.
  globalStyle(`.pui-text-${v}.pui-mono`, {
    fontSize: `calc(${tokens.text.style[v].size} * ${tokens.text.palette.monoSizeScale})`,
  });
}

// family=mono — variant 위에 교차하는 모디파이어. 서체를 등폭으로 바꾸고 mono 전용
// 자간을 준다. sans 의 per-variant tracking(display -0.03em 등)을 그대로 얹으면 큰
// 크기 mono 가 짓눌리므로 버리고, 대신 단일 값 -0.04em — SF Mono·D2Coding 은 advance 가
// 넓어 UI 에서 벌어져 보여 조인다 (균일 적용이라 tabular 정렬은 유지). letter-spacing 은
// 요소당 하나라 영어·한글을 한 런에서 따로 못 준다 — 코드·토큰(영어) 기준 단일값.
// loop 뒤에 와서 같은 특정도의 .pui-text-* 를 순서로 이긴다.
globalStyle(".pui-mono", {
  fontFamily: tokens.text.palette.family.mono,
  letterSpacing: tokens.text.palette.tracking.mono,
});

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Pass 4 — reduced motion                                                  │
// ╰──────────────────────────────────────────────────────────────────────────╯

globalStyle("*", {
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: `${tokens.motion.duration.reduced} !important`,
      animationDuration: `${tokens.motion.duration.reduced} !important`,
    },
  },
});
