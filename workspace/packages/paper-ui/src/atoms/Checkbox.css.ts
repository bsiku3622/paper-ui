import { controlVars } from "../primitives/control/Control.css";
import { SHAPE_RECIPES, markParts, transition } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

const { checkbox } = SHAPE_RECIPES;
const parts = markParts(controlVars.mark);

// 체크와 대시의 모양. 색은 markPaint.checkbox 가 입힌다. 둘 다 box 가운데에 앉는 ::after 이다. 모서리는 크기와 무관한 한 값이다.
export const checkboxRoot = style({
  borderRadius: checkbox.radius,
  transition: transition("state", "background-color", "border-color"),
  selectors: {
    "&:checked::after": {
      content: "''",
      borderStyle: "solid",
      borderWidth: `0 0 ${checkbox.stroke} ${checkbox.stroke}`,
      transform: checkbox.markTransform,
    },
    // indeterminate — 부분 선택. 체크 대신 가로 대시.
    "&:indeterminate::after": {
      content: "''",
      height: checkbox.dash.height,
      borderRadius: checkbox.dash.radius,
    },
  },
});

// 틱(긴 변 · 짧은 변, 2:1)과 대시 길이. 상자의 변은 Control 이 정한다. 위의 규칙 뒤에 와서 같은 특정도를 순서로 이긴다.
export const checkboxMark = style({
  selectors: {
    "&:checked::after": { width: parts.half, height: parts.short },
    "&:indeterminate::after": { width: parts.half },
  },
});
