// space.css — 간격 축의 이름이 가리키는 class 의 실체. 안쪽 여백은 Shape inset, 형제 사이는 Layout gap 이고,
// 같은 단계면 같은 길이다. 축마다 지도 하나이고 키는 Space 어휘를 돈다.
//
// 선언 순서가 곧 cascade 순서다: padding 은 paddingX · paddingY 에, gap 은 rowGap · columnGap 에 진다.

import { tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { styleVariants } = layered("utilities");

export const spaceClass = {
  padding: styleVariants(tokens.shape.inset, (inset) => ({ padding: inset })),
  paddingX: styleVariants(tokens.shape.inset, (inset) => ({ paddingInline: inset })),
  paddingY: styleVariants(tokens.shape.inset, (inset) => ({ paddingBlock: inset })),
  gap: styleVariants(tokens.layout.gap, (gap) => ({ gap })),
  rowGap: styleVariants(tokens.layout.gap, (gap) => ({ rowGap: gap })),
  columnGap: styleVariants(tokens.layout.gap, (gap) => ({ columnGap: gap })),
} as const;
