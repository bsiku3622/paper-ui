// @studio-baeks/paper-ui/tokens — React 와 CSS 없이 값과 어휘만 내보내는 공개 entry.
// 서버 컴포넌트와 stylesheet(.css.ts)가 컴포넌트 런타임을 끌어오지 않고 이 entry 만 import 한다.

export { tokens, transition, MOTION_CONSUMERS, SYSTEM_COLORS, focusRing, stateStyle, linkStyle, STATE_TINT, STATE_TINT_PROPERTY, typographyRule, monoRule, codeRule, presetRule, emphasisRule } from "./index";
export type { CodeKind, ButtonWeight } from "./index";
export { FONT_STYLESHEETS } from "./typography";
export { stateSelector } from "./state";
export { sourceVars } from "./overrides";
export type { SourceOverrides } from "./overrides";
export * from "./vocabulary";
