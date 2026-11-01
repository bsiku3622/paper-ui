import { controlGeometry, geometry } from "../internal/shape";
import { loop } from "../styles/motion.css";

import { tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// 도는 원. 옅은 링에 한 조각만 진해 회전으로 읽힌다(색은 primitives/paint/recipes.css.ts 의 spinnerPaint). 회전은 Motion 의
// loop.spin 을 합성한다. 크기는 size 축이 정한다 — Icon 과 같은 icon 사다리이거나, 글줄 안에서는 글자만큼.
// 속이 빈 링이라 같은 지름의 채운 사각형(Checkbox)보다 가볍게 읽히는데, 그건 스피너가 지고 가는 성질이라 지름으로 보정하지 않는다.
export const spinnerRoot = style([loop.spin, {
  display: "inline-block",
  flexShrink: 0,
  borderRadius: tokens.shape.radius.full,
  borderWidth: geometry.spinner.stroke,
  borderStyle: "solid",
}]);

export const spinnerSize = styleVariants(controlGeometry.spinner);

export const spinnerInline = style(controlGeometry.spinnerInline);
