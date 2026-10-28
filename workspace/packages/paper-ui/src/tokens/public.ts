// @studio-baeks/paper-ui/tokens — React 와 CSS 없이 값과 어휘만 내보내는 공개 entry.
// 서버 컴포넌트와 stylesheet(.css.ts)가 컴포넌트 런타임을 끌어오지 않고 이 entry 만 import 한다.

export { tokens, stateTransition, SPACE_KEYS, DIMENSION_KEYS, CONTROL_SIZES, ICON_SIZES, ELEVATIONS } from "./index";
export type { AccentName, StatusName, TextVariant, Space, ControlSize, IconSize, Elevation } from "./index";

// resolver 가 정의하는 어휘 — 타입만 다시 내보내므로 런타임 import 는 생기지 않는다.
export type { Surface, Accent, Variant, Ink, Tone } from "../resolvers";
