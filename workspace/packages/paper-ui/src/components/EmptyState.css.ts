import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// EmptyState는 새 카드를 만들지 않는다. 데이터가 없다는 사실이 화면의 여백을 차지하고,
// 다음 행동 하나만 또렷하게 남긴다.
export const emptyStateRoot = style({
  display: "grid",
  placeItems: "center",
  minHeight: tokens.shape.height.lg.layout,
  padding: tokens.shape.padding.xl.layout,
  textAlign: "center",
});

export const emptyStateContent = style({ maxWidth: "28rem" });
