// @studio-baeks/paper-ui/tokens — React 와 CSS 없이 값과 어휘만 내보내는 공개 entry.
// 서버 컴포넌트와 stylesheet(.css.ts)가 컴포넌트 런타임을 끌어오지 않고 이 entry 만 import 한다.

export { tokens, stateTransition } from "./index";
export { SYSTEM_COLORS } from "./colors";
export { FONT_STYLESHEETS } from "./typography";
export { typographyRule, monoRule, codeRule, presetRule, emphasisRule } from "./typography-recipes";
export type { CodeKind, ButtonWeight } from "./typography-recipes";
export * from "./vocabulary";
