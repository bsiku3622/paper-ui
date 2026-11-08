import { controlVars } from "../primitives/control/Control.css";
import { markParts, tokens, transition } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

const { dot } = markParts(controlVars.mark);

// 하나만 고르는 원. 고르면 검은 면 가운데 흰 점이 앉는다 — 색은 markPaint.radio 가 입히고, 점의 크기는 원본 anatomy 의 비율이다.
export const radioRoot = style({
  borderRadius: tokens.shape.radius.full,
  transition: transition("state", "background-color", "border-color"),
  selectors: {
    "&:checked::after": {
      content: "''",
      width: dot,
      height: dot,
      borderRadius: tokens.shape.radius.full,
    },
  },
});
