// @studio-baeks/paper-ui/tokens — React 와 CSS 없이 값과 어휘만 내보내는 공개 entry.
// 서버 컴포넌트와 stylesheet(.css.ts)가 컴포넌트 런타임을 끌어오지 않고 이 entry 만 import 한다.

export { tokens, stateTransition } from "./index";
export { SYSTEM_COLORS } from "./colors";
export * from "./vocabulary";

// resolver 가 정의하는 어휘 — 타입만 다시 내보내므로 런타임 import 는 생기지 않는다.
export type { Ink } from "../resolvers";
