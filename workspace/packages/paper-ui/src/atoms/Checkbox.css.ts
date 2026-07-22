import { style } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

export const checkboxRoot = style({
  appearance: "none",
  width: tokens.shape.atom.checkbox,
  height: tokens.shape.atom.checkbox,
  margin: 0,
  flexShrink: 0,
  background: tokens.color.paper.base,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.strong,
  borderRadius: tokens.shape.atom.checkboxRadius,
  cursor: "pointer",
  display: "grid",
  placeContent: "center",
  transition: stateTransition("background", "border-color"),
  selectors: {
    "&:checked": { background: tokens.color.primary.base, borderColor: tokens.color.primary.base },
    "&:checked::after": {
      content: "''",
      width: tokens.shape.atom.checkMark, //  8px — 긴 변
      height: tokens.shape.gap.xs, //          4px — 짧은 변 (2:1 틱 비율)
      borderLeft: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.primary.fg}`,
      borderBottom: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.primary.fg}`,
      transform: "rotate(-45deg) translate(0.5px, -1px)",
    },
    "&:focus-visible": {
      outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.focus.ring}`,
      outlineOffset: tokens.shape.constants.focusRingOffset,
    },
    "&:disabled": { opacity: 0.45, cursor: "not-allowed" },
  },
});
