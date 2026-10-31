import { controlGeometry, geometry } from "../internal/shape";

import { transition } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// 체크와 대시의 모양. 색은 markPaint.checkbox 가 입힌다. 둘 다 box 가운데에 앉는 ::after 이고, 크기는 size 축(checkboxSize)이 정한다.
export const checkboxRoot = style({
  borderRadius: geometry.checkbox.radius,
  transition: transition("state", "background-color", "border-color"),
  selectors: {
    "&:checked::after": {
      content: "''",
      borderStyle: "solid",
      borderWidth: `0 0 ${geometry.checkbox.stroke} ${geometry.checkbox.stroke}`,
      transform: geometry.checkbox.markTransform,
    },
    // indeterminate — 부분 선택. 체크 대신 가로 대시. 길이는 size 축(checkboxSize)이 체크의 긴 변으로 준다.
    "&:indeterminate::after": {
      content: "''",
      height: geometry.checkbox.dash.height,
      borderRadius: geometry.checkbox.dash.radius,
    },
  },
});

// size 3 단 — 틱(mark 긴변·short 짧은변, 2:1)과 대시 길이. 변은 selectionSize 가 Radio 와 같이 준다. 모서리는 크기와 무관한 한 값.
export const checkboxSize = styleVariants(controlGeometry.checkbox);
