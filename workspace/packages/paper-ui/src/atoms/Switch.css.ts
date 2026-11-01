import { controlGeometry } from "../internal/shape";

import { tokens, transition, elevationCast, elevationStack } from "../tokens";
import { layered } from "../tokens/layers.css";
import { controlReset } from "./recipes/selection-control.css";

const { style, styleVariants } = layered("components");

// 켬/끔 토글의 몸. 색(트랙·테·손잡이)은 markPaint.switch 가 입힌다. 손잡이(::after)는 트랙 안에서 위아래로 가운데에 앉고,
// 좌우는 inset-inline-start 가 정한다 — 끔은 테(rim), 켬은 테 + 이동. 논리 속성이라 RTL 에서 저절로 뒤집힌다.
// 크기(트랙·손잡이·이동)는 size 축(switchSize)이 정한다.
export const switchRoot = style([controlReset, {
  position: "relative",
  borderRadius: tokens.shape.radius.full,
  transition: transition("state", "background-color", "box-shadow"),
  selectors: {
    "&::after": {
      content: "''",
      position: "absolute",
      insetBlock: 0,
      marginBlock: "auto",
      borderRadius: tokens.shape.radius.full,
      ...elevationStack("lifted"),
      ...elevationCast("lifted"),
      transition: transition("state", "inset-inline-start"),
    },
  },
  // Under forced colours a mark is drawn from system colours alone, so the thumb casts nothing.
  "@media": { "(forced-colors: active)": { selectors: { "&::after": { boxShadow: "none" } } } },
}]);

// size 3 단 — 트랙(w·h) · 손잡이(thumb) · 여백 · 켜짐 이동.
//
// 트랙 높이는 손잡이에 테(rim) 하나를 더한 값이고, 손잡이는 위아래·좌우 같은 테를 두고 앉는다. 그러면 켜짐 이동은
// 손잡이 폭 그대로 떨어진다 — 트랙이나 손잡이를 바꿔도 손잡이가 반대쪽 끝에 정확히 붙는다.
export const switchSize = styleVariants(controlGeometry.switch);

// 트랙 위아래로 보이지 않는 hit area 가 최소 target 까지 넓어진다. 가로는 트랙이 이미 충분하다.
export const switchReach = styleVariants(controlGeometry.switchReach);
