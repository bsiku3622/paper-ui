// Tokens — 모든 시각 값의 유일한 정의 위치.
//
// `tokens` 객체는 *값이 아니라 var() 참조* 를 든다. 컴포넌트는 이 객체로만 색과
// 크기에 닿는다 — raw hex 도, "var(--pui-...)" 문자열도 직접 쓰지 않는다.
//
//   tokens.color.ink.primary → "var(--pui-color-ink-primary)"
//   tokens.shape.control.height.md → "var(--pui-shape-control-height-md)"
//
// 실제 값은 tokens/variables.css.ts 가 :root 와 테마 스코프에 emit 한다. 두 자리 모두 아래 VALUES
// 트리를 같은 helper 로 걷기 때문에 이름이 어긋날 수 없다.

import { buildVarTree, pathToCssVar } from "./helpers";
import { COLOR, OPACITY_VALUES } from "./colors";
import { SHAPE } from "./shape";
import { TYPOGRAPHY } from "./typography";
import { MOTION_VALUES } from "./motion";
import { LAYOUT } from "./layout";

export const tokens = {
  // opacity 는 역할 옆에 둔다 — palette token 이 아니고 어떤 모드도 바꾸지 않는다.
  color: { ...COLOR, opacity: buildVarTree(OPACITY_VALUES, ["color", "opacity"]) },
  typography: TYPOGRAPHY,
  // Shape은 요소 하나의 형태, Layout은 요소 사이의 관계. 둘 다 역할만 노출한다 (shape.ts · layout.ts).
  shape: SHAPE,
  layout: LAYOUT,
  // motion 은 var 로 굽지 않는다 — 값(duration·easing)을 직접 든다 (motion.ts 참고).
  motion: MOTION_VALUES,
} as const;

// ───── 값 트리 · 타입 재수출 ────────────────────────────────────────────────
// L2 semantic VALUES는 여기와 variables.ts만 조립한다. palette.ts가 OKLCH source를 보유하고
// L1 color-ladder.ts의 순수 생성 함수로 coordinates/HEX를 완성한다. 소비처는 이 barrel만 사용한다.

export * from "./vocabulary";

export { THEME_ATTRIBUTE, THEME_SWAP_ATTRIBUTE, COLOR_MODE_QUERY } from "./color-modes";
export { SOURCE_VARIABLES } from "./variables";

export { ELEVATION_NEST_LIMIT } from "./layout";
export { ELEVATION, elevationStack, elevationCast, elevationStyle } from "./elevation-recipes";

export { STATUS_PALETTE } from "./colors";
export type { AccentToken } from "./colors";

export { CONTROL_ICON } from "./shape";

export { MOTION_VALUES, DURATION, EASING, MOTION, stateTransition } from "./motion";
export type { MotionDuration, MotionEasing, MotionRole } from "./motion";

export { kebab, pathToCssVar, pathToVarRef, walkValues, buildVarTree } from "./helpers";

// styles.css 가 깔렸는가 — Shape 원본 변수는 테마와 무관하게 :root 에 늘 굽힌다(tokens/variables.css.ts).
export const isStylesheetLoaded = (root: Element): boolean =>
  getComputedStyle(root).getPropertyValue(pathToCssVar(["shape", "stroke", "border"])).trim() !== "";
