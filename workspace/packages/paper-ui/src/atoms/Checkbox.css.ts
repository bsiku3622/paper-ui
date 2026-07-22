import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition, SPACE_KEYS, type Space } from "../tokens";

// 크기(변·틱·radius)는 size 축(checkboxSize)이 정한다. 색·틱 모양은 여기 고정.
export const checkboxRoot = style({
  appearance: "none",
  margin: 0,
  flexShrink: 0,
  background: tokens.color.paper.base,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.strong,
  cursor: "pointer",
  display: "grid",
  placeContent: "center",
  transition: stateTransition("background", "border-color"),
  selectors: {
    "&:checked": { background: tokens.color.primary.base, borderColor: tokens.color.primary.base },
    "&:checked::after": {
      content: "''",
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

// size 5 단 — 변(box)·모서리(radius) + 틱(mark 긴변·short 짧은변, 2:1).
export const checkboxSize = styleVariants(
  Object.fromEntries(
    SPACE_KEYS.map((s) => [
      s,
      {
        width: tokens.shape.checkbox[s].box,
        height: tokens.shape.checkbox[s].box,
        borderRadius: tokens.shape.checkbox[s].radius,
        selectors: {
          "&:checked::after": {
            width: tokens.shape.checkbox[s].mark,
            height: tokens.shape.checkbox[s].short,
          },
        },
      },
    ]),
  ) as Record<Space, object>,
);
