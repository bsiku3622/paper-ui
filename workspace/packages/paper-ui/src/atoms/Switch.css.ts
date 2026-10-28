import { focusRing, geometry } from "../internal/shape";

import { tokens, stateTransition, CONTROL_SIZES, type ControlSize } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// 켬/끔 토글. control.track 위 raised 손잡이, 켜지면 primary 트랙.
// 크기(트랙·손잡이·켜짐 이동)는 size 축(switchSize)이 정한다.
export const switchRoot = style({
  appearance: "none",
  position: "relative",
  flexShrink: 0,
  margin: 0,
  borderRadius: tokens.shape.radius.full,
  background: tokens.color.control.track,
  cursor: "pointer",
  transition: stateTransition("background"),
  selectors: {
    // 손잡이의 좌우 여백은 size 축이 (트랙 − 손잡이) / 2 로 준다 — 위아래 여백과 같은
    // 값이라 손잡이가 트랙 안에서 사방 같은 간격으로 앉는다. 예전엔 좌우만 borderWidth
    // (1px)를 빌려 써서 위아래 2 · 좌우 1 로 어긋나 있었다(스위치엔 테두리도 없다).
    "&::after": {
      content: "''",
      position: "absolute",
      top: "50%",
      transform: "translate(0, -50%)",
      borderRadius: tokens.shape.radius.full,
      background: tokens.color.bg.raised,
      boxShadow: tokens.layout.elevation.raised.shadow,
      transition: `transform ${tokens.motion.duration.base} ${tokens.motion.easing.standard}`,
    },
    "&:checked": { background: tokens.color.accent.primary.solid },
    "&:focus-visible": focusRing,
    "&:disabled": { opacity: 0.45, cursor: "not-allowed" },
  },
});

// size 3 단 — 트랙(w·h) · 손잡이(thumb) · 여백 · 켜짐 이동.
//
// 여백은 (h − thumb) / 2 한 값이 사방에 걸린다. 그러면 켜짐 이동은 **w − h** 로 떨어진다:
//   이동 = w − 여백 2 개 − thumb = w − (h − thumb) − thumb = w − h
// 값 셋을 따로 계산하지 않고 항등식 하나로 두는 게 요점이다 — 트랙이나 손잡이를 바꿔도
// 손잡이가 반대쪽 끝에 정확히 붙는다. recipe는 트랙 폭을 컨트롤 높이(= 선택 상자 × 2)로 두므로
// 여백은 손잡이 둘레의 테(rim) 하나, 이동은 손잡이 폭 그대로다.
export const switchSize = styleVariants(
  Object.fromEntries(
    CONTROL_SIZES.map((s) => {
      const sw = geometry.switch;
      return [
        s,
        {
          width: sw.width[s],
          height: sw.height[s],
          selectors: {
            "&::after": { width: sw.thumb[s], height: sw.thumb[s], insetInlineStart: sw.inset },
            "&:checked::after": { transform: `translate(${sw.travel[s]}, -50%)` },
            "&:dir(rtl):checked::after": { transform: `translate(calc(${sw.travel[s]} * -1), -50%)` },
          },
        },
      ];
    }),
  ) as Record<ControlSize, object>,
);
