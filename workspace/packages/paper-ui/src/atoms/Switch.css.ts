import { controlVars } from "../primitives/control/Control.css";
import { SHAPE_RECIPES, markParts, tokens, transition, elevationCast, elevationStack } from "../tokens";
import { layered } from "../tokens/layers.css";
import { markReset } from "./recipes/mark.css";

const { style } = layered("components");

const { thumb, thumbWidth, travel, trackReach } = markParts(controlVars.mark);
const { inset } = SHAPE_RECIPES.switch;

// 켬/끔 토글의 몸. 색(트랙·손잡이)은 markPaint.switch 가 입히고, 트랙의 크기는 Control 이 정한다. 손잡이(::after)는 트랙 안에서 위아래로
// 가운데에 앉고, 좌우는 inset-inline-start 가 정한다 — 끔은 테(rim), 켬은 테 + 이동. 논리 속성이라 RTL 에서 저절로 뒤집힌다.
//
// 트랙은 높이의 1.5배로 짧고 뚱뚱하며, 손잡이는 위아래·좌우 같은 테를 두고 앉는 원이다. 켜짐 이동은 트랙에서 손잡이와 양쪽 테를
// 뺀 만큼이다 — 트랙이나 손잡이를 바꿔도 손잡이가 반대쪽 끝에 정확히 붙는다.
export const switchRoot = style([markReset, {
  position: "relative",
  borderRadius: tokens.shape.radius.full,
  transition: transition("state", "background-color", "box-shadow"),
  selectors: {
    "&::after": {
      content: "''",
      position: "absolute",
      insetBlock: 0,
      insetInlineStart: inset,
      marginBlock: "auto",
      width: thumbWidth,
      height: thumb,
      borderRadius: tokens.shape.radius.full,
      ...elevationStack("lifted"),
      ...elevationCast("lifted"),
      transition: transition("state", "inset-inline-start"),
    },
    "&:checked::after": { insetInlineStart: `calc(${inset} + ${travel})` },
    // 트랙 위아래로 보이지 않는 hit area 가 최소 target 까지 넓어진다. 가로는 트랙이 이미 충분하다.
    "&::before": { content: "''", position: "absolute", insetBlock: trackReach, insetInline: 0 },
  },
  // Under forced colours a mark is drawn from system colours alone, so the thumb casts nothing.
  "@media": { "(forced-colors: active)": { selectors: { "&::after": { boxShadow: "none" } } } },
}]);
