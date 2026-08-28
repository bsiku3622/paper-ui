import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition, CONTROL_SIZES, type ControlSize } from "../tokens";

// 하나만 고르는 원. 고르면 가운데 검정 점(색이 아니라 primary).
// 크기(변·점)는 size 축(radioSize)이 정한다 — Checkbox 와 같은 변 사다리, 점은 변의 절반.
export const radioRoot = style({
  appearance: "none",
  margin: 0,
  flexShrink: 0,
  background: tokens.color.paper.raised,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.strong,
  borderRadius: tokens.shape.constants.pillRadius,
  cursor: "pointer",
  display: "grid",
  placeContent: "center",
  transition: stateTransition("border-color"),
  selectors: {
    "&:checked": { borderColor: tokens.color.primary.base },
    "&:checked::after": {
      content: "''",
      borderRadius: tokens.shape.constants.pillRadius,
      background: tokens.color.primary.base,
    },
    "&:focus-visible": {
      outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.focus.ring}`,
      outlineOffset: tokens.shape.constants.focusRingOffset,
    },
    "&:disabled": { opacity: 0.45, cursor: "not-allowed" },
  },
});

// size 3 단 — Checkbox 와 같은 변(box) 사다리. 채운 점은 변의 절반(= checkbox.mark).
export const radioSize = styleVariants(
  Object.fromEntries(
    CONTROL_SIZES.map((s) => [
      s,
      {
        width: tokens.shape.checkbox[s].box,
        height: tokens.shape.checkbox[s].box,
        selectors: {
          "&:checked::after": {
            width: tokens.shape.checkbox[s].mark,
            height: tokens.shape.checkbox[s].mark,
          },
        },
      },
    ]),
  ) as Record<ControlSize, object>,
);
