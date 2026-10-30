// elevation.css — 높이 축의 tier 가 가리키는 class 의 실체. class 하나가 position · z · 그림자를 통째로 붙이므로
// tier 를 반쪽만 적용할 수 없다. Surface 의 `elevation` prop 이 이 지도이고, Surface 가 아닌 요소는 class 를 직접 받는다.

import { ELEVATIONS, elevationStyle, type Elevation } from "../tokens";
import { layered } from "../tokens/layers.css";

const { styleVariants } = layered("utilities");

export const elevation = styleVariants(
  Object.fromEntries(ELEVATIONS.map((tier) => [tier, elevationStyle(tier)])) as Record<Elevation, ReturnType<typeof elevationStyle>>,
);
