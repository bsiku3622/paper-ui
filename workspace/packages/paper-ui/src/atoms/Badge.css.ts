import { SHAPE_RECIPES, tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

// 상태 점의 형태. 색은 dotPaint 가 입힌다. em 이라 size 에 비례. 상자의 크기와 글자는 Control, 색과 선은 Paint 가 정한다. Badge 는 hoverable 을
// 안 줘 hover 색이 뜨지 않는다 — 표시용이지 누르는 자리가 아니다.
export const badgeDot = style({
  width: SHAPE_RECIPES.badge.dot,
  height: SHAPE_RECIPES.badge.dot,
  borderRadius: tokens.shape.radius.full,
  flexShrink: 0,
});
