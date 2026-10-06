// Tokens — 모든 시각 값의 유일한 정의 위치.
//
// `tokens` 객체는 *값이 아니라 var() 참조* 를 든다. 컴포넌트는 이 객체로만 색과
// 크기에 닿는다 — raw hex 도, "var(--pui-...)" 문자열도 직접 쓰지 않는다.
//
//   tokens.color.ink.primary → "var(--pui-color-ink-primary)"
//   tokens.shape.height.control  → "var(--pui-shape-height-control)"
//
// 실제 값은 styles/theme.css.ts 가 :root 에 emit 한다. 두 자리 모두 아래 VALUES
// 트리를 같은 helper 로 걷기 때문에 이름이 어긋날 수 없다.

import { buildVarTree, pathToVarRef } from "./helpers";
import { COLOR_VALUES } from "./colors";
import { SHAPE_VALUES, SHADOW_GEOMETRY } from "./shape";
import { CONTROL_SPEC, TEXT_SPEC, TEXT_VALUES } from "./text";
import { MOTION_VALUES } from "./motion";
import { LAYOUT_VALUES, LAYOUT_CONST } from "./layout";

const textPaletteTokens = buildVarTree(TEXT_VALUES, []);
type StyleKeys = { size: string; weight: string; leading: string; tracking: string };
type StyleRefTree<T> = T extends StyleKeys
  ? StyleKeys
  : T extends Record<string, unknown>
    ? { [K in keyof T]: StyleRefTree<T[K]> }
    : never;
const styleRefs = <T extends Record<string, unknown>>(specs: T): StyleRefTree<T> =>
  Object.fromEntries(Object.entries(specs).map(([name, spec]) => {
    if (typeof spec === "object" && spec !== null && "size" in spec && "weight" in spec && "leading" in spec && "tracking" in spec) {
      const style = spec as StyleKeys;
      return [name, {
        size: pathToVarRef(["text", "palette", "fontSize", style.size]),
        weight: pathToVarRef(["text", "palette", "weight", style.weight]),
        leading: pathToVarRef(["text", "palette", "leading", style.leading]),
        tracking: pathToVarRef(["text", "palette", "tracking", style.tracking]),
      }];
    }
    return [name, styleRefs(spec as Record<string, unknown>)];
  })) as StyleRefTree<T>;

export const tokens = {
  color: buildVarTree(COLOR_VALUES, ["color"]),
  shape: {
    ...buildVarTree(SHAPE_VALUES, ["shape"]),
    shadow: Object.fromEntries(
      Object.keys(SHADOW_GEOMETRY.light).map((name) => [name, pathToVarRef(["shape", "shadow", name])]),
    ),
  },
  // z 는 var, breakpoint·sizeIntent·inset 은 값(어휘). layout.ts 참고.
  layout: { ...buildVarTree(LAYOUT_VALUES, ["layout"]), ...LAYOUT_CONST },
  // motion 은 var 로 굽지 않는다 — 값(duration·easing)을 직접 든다 (motion.ts 참고).
  motion: MOTION_VALUES,
  text: {
    ...textPaletteTokens.text,
    style: styleRefs(TEXT_SPEC),
    control: styleRefs(CONTROL_SPEC),
  },
} as const;

// ───── 값 트리 · 타입 재수출 ────────────────────────────────────────────────
// L2 semantic VALUES는 여기와 theme.css.ts만 조립한다. palette.ts가 OKLCH source를 보유하고
// L1 color-ladder.ts의 순수 생성 함수로 coordinates/HEX를 완성한다. 소비처는 이 barrel만 사용한다.

export { COLOR_VALUES, ACCENTS, STATUS, STATUS_PALETTE } from "./colors";
export type { AccentName, AccentToken, StatusName } from "./colors";

export { SHAPE_VALUES, SHADOW_GEOMETRY, SHAPE_SIZES, SPACE_KEYS, CONTROL_SIZES, SHAPE_ICON_TEXT_SIZE } from "./shape";
export type { ShapeSize, Space, ControlSize } from "./shape";

export { TEXT_VALUES, TEXT_VARIANTS, TEXT_SPEC, CONTROL_SPEC, TEXT_CONTENT, TYPOGRAPHY_PALETTE, WEIGHT } from "./text";
export type { TextVariant, WeightKey } from "./text";

export { MOTION_VALUES, DURATION, EASING, MOTION, stateTransition } from "./motion";
export type { MotionDuration, MotionEasing, MotionRole } from "./motion";

export { LAYOUT_VALUES, LAYOUT_CONST, Z, BREAKPOINT, SIZE_INTENT, POSITIONS, INSET } from "./layout";
export type { ZTier, Breakpoint, SizeIntent, Position, InsetSize } from "./layout";

export { kebab, pathToCssVar, pathToVarRef, walkValues, buildVarTree } from "./helpers";
