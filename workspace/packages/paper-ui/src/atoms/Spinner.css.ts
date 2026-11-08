import { loop } from "../styles/motion.css";

import { SHAPE_RECIPES, tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

const edge = `calc(100% - ${SHAPE_RECIPES.spinner.stroke})`;

// 도는 원. 꼬리가 옅어지는 호라 회전으로 읽힌다(색은 primitives/paint/recipes.css.ts 의 spinnerPaint). 면을 칠하고 mask 가 가운데를 도려내
// 고리를 남긴다. mask 의 색은 불투명하기만 하면 된다. 회전은 Motion 의 loop.spin 을 합성한다. 지름은 Control 의 spinner anatomy 가 정한다.
export const spinnerRoot = style([loop.spin, {
  display: "inline-block",
  flexShrink: 0,
  borderRadius: tokens.shape.radius.full,
  mask: `radial-gradient(farthest-side, transparent ${edge}, currentColor ${edge})`,
}]);

// 글줄 안에서는 글자만큼이라, 컨트롤의 크기 사다리를 읽지 않는다.
export const spinnerInline = style({ width: SHAPE_RECIPES.spinner.inline, height: SHAPE_RECIPES.spinner.inline });
