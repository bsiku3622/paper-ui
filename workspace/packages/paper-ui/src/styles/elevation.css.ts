// elevation.css — 높이 축의 tier 가 가리키는 class 의 실체. class 하나가 position · z · 그림자를 통째로 붙이므로
// tier 를 반쪽만 적용할 수 없다. Surface 의 `elevation` prop 이 이 지도이고, Surface 가 아닌 요소는 class 를 직접 받는다.

import { ELEVATIONS, elevationStyle, tokens, type Elevation } from "../tokens";
import { layered } from "../tokens/layers.css";

const { styleVariants } = layered("utilities");

export const elevation = styleVariants(
  Object.fromEntries(ELEVATIONS.map((tier) => [tier, elevationStyle(tier)])) as Record<Elevation, ReturnType<typeof elevationStyle>>,
);

// sticky 면이 멈추는 자리. 위에 둔 만큼 아래에도 두어 창 안에 선다 — 더 긴 내용은 면 안에서 스크롤한다(Box 의 overflowY).
const STICKY_TOPS = { none: "0px", ...tokens.layout.gap };
export type StickyTop = keyof typeof STICKY_TOPS;
export const stickyTop = styleVariants(STICKY_TOPS, (top) => ({ top, maxHeight: `calc(${tokens.layout.viewport} - ${top} - ${top})` }));
