import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// 선이 아니라 옅은 면으로 정의되는 카드. 테두리도 그림자도 없다 —
// surface.subtle 이 흰 캔버스 위에서 카드를 조용히 들어올린다.
export const cardRoot = style({
  background: tokens.color.surface.subtle,
});
