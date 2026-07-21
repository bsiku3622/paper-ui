// Tokens — 모든 시각 값의 유일한 정의 위치.
//
// `tokens` 객체는 *값이 아니라 var() 참조* 를 든다. 컴포넌트는 이 객체로만 색과
// 크기에 닿는다 — raw hex 도, "var(--pui-...)" 문자열도 직접 쓰지 않는다.
//
//   tokens.color.ink.base        → "var(--pui-color-ink-base)"
//   tokens.shape.height.control  → "var(--pui-shape-height-control)"
//
// 실제 값은 styles/theme.css.ts 가 :root 에 emit 한다. 두 자리 모두 아래 VALUES
// 트리를 같은 helper 로 걷기 때문에 이름이 어긋날 수 없다.

import { buildVarTree } from "./helpers";
import { COLOR_VALUES } from "./colors";
import { SHAPE_VALUES } from "./shape";
import { TEXT_VALUES } from "./text";

export const tokens = {
  color: buildVarTree(COLOR_VALUES, ["color"]),
  shape: buildVarTree(SHAPE_VALUES, ["shape"]),
  ...buildVarTree(TEXT_VALUES, []),
} as const;

// ───── 값 트리 · 타입 재수출 ────────────────────────────────────────────────
// VALUES 자체(raw hex) 는 theme.css.ts 만 import 한다 — 절대 규칙 4.

export { COLOR_VALUES, ACCENT_NAMES, STATUS, STATUS_ACCENT } from "./colors";
export type { AccentName, StatusName } from "./colors";

export { SHAPE_VALUES, SPACE_KEYS } from "./shape";
export type { Space } from "./shape";

export { TEXT_VALUES, TEXT_VARIANTS, TEXT_SPEC, TEXT_INK, WEIGHT } from "./text";
export type { TextVariant, WeightKey } from "./text";

export { kebab, pathToCssVar, pathToVarRef, walkValues, buildVarTree } from "./helpers";
