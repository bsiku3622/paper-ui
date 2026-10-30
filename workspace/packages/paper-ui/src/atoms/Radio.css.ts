import { focusRing, geometry } from "../internal/shape";

import { tokens, transition, CONTROL_SIZES, type ControlSize } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// 하나만 고르는 원. 고르면 가운데 검정 점(색이 아니라 primary).
// 크기(변·점)는 size 축(radioSize)이 정한다 — Checkbox 와 같은 변 사다리, 점은 변의 절반.
export const radioRoot = style({
  appearance: "none",
  margin: 0,
  flexShrink: 0,
  background: tokens.color.bg.raised,
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
  borderColor: tokens.color.border.strong,
  borderRadius: tokens.shape.radius.full,
  cursor: "pointer",
  display: "grid",
  placeContent: "center",
  transition: transition("state", "border-color"),
  selectors: {
    "&:checked": { borderColor: tokens.color.accent.primary.solid },
    "&:checked::after": {
      content: "''",
      borderRadius: tokens.shape.radius.full,
      background: tokens.color.accent.primary.solid,
    },
    "&:focus-visible": focusRing,
    "&:disabled": { opacity: 0.45, cursor: "not-allowed" },
  },
});

// size 3 단 — 공통 selection 크기. 점은 Radio recipe가 독립적으로 정한다.
export const radioSize = styleVariants(
  Object.fromEntries(
    CONTROL_SIZES.map((s) => [
      s,
      {
        width: tokens.shape.selection.size[s],
        height: tokens.shape.selection.size[s],
        selectors: {
          "&:checked::after": {
            width: geometry.radio.dot[s],
            height: geometry.radio.dot[s],
          },
        },
      },
    ]),
  ) as Record<ControlSize, object>,
);
