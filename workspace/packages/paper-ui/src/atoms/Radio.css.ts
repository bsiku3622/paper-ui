import { style } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

// 하나만 고르는 원. 고르면 가운데 검정 점(색이 아니라 primary).
export const radioRoot = style({
  appearance: "none",
  width: tokens.shape.atom.checkbox,
  height: tokens.shape.atom.checkbox,
  margin: 0,
  flexShrink: 0,
  background: tokens.color.paper.base,
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
      width: tokens.shape.atom.radioDot,
      height: tokens.shape.atom.radioDot,
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
