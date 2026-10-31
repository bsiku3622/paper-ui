import { controlGeometry } from "../internal/shape";

import { tokens, transition } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// 하나만 고르는 원. 고르면 가운데 점이 앉는다 — 점의 색은 markPaint.radio 가 입힌다.
export const radioRoot = style({
  borderRadius: tokens.shape.radius.full,
  transition: transition("state", "border-color"),
  selectors: {
    "&:checked::after": {
      content: "''",
      borderRadius: tokens.shape.radius.full,
    },
  },
});

// size 3 단 — 점은 변의 절반. 변은 selectionSize 가 Checkbox 와 같이 준다.
export const radioSize = styleVariants(controlGeometry.radio);
