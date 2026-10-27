import { style, styleVariants } from "@vanilla-extract/css";

import { geometry } from "../internal/shape";

import { tokens, stateTransition, CONTROL_SIZES, type ControlSize } from "../tokens";

// 크기(변·틱·radius)는 size 축(checkboxSize)이 정한다. 색·틱 모양은 여기 고정.
export const checkboxRoot = style({
  appearance: "none",
  margin: 0,
  flexShrink: 0,
  background: tokens.color.bg.raised,
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
  borderColor: tokens.color.border.strong,
  cursor: "pointer",
  display: "grid",
  placeContent: "center",
  transition: stateTransition("background", "border-color"),
  selectors: {
    "&:checked": { background: tokens.color.accent.primary.solid, borderColor: tokens.color.accent.primary.solid },
    "&:checked::after": {
      content: "''",
      borderLeft: `${geometry.checkbox.markStroke} solid ${tokens.color.accent.primary.wash}`,
      borderBottom: `${geometry.checkbox.markStroke} solid ${tokens.color.accent.primary.wash}`,
      transform: geometry.checkbox.markTransform,
    },
    // indeterminate — 부분 선택. 체크 대신 가로 대시. width % 라 size 를 자동으로 따른다.
    "&:indeterminate": { background: tokens.color.accent.primary.solid, borderColor: tokens.color.accent.primary.solid },
    "&:indeterminate::after": {
      content: "''",
      width: geometry.checkbox.dashWidth,
      height: geometry.checkbox.markStroke,
      borderRadius: geometry.checkbox.dashRadius,
      background: tokens.color.accent.primary.wash,
    },
    "&:focus-visible": {
      outline: `${tokens.shape.focus.width} solid ${tokens.color.interaction.focus}`,
      outlineOffset: tokens.shape.focus.offset,
    },
    "&:disabled": { opacity: 0.45, cursor: "not-allowed" },
  },
});

// size 3 단 — 변(box)·모서리(radius) + 틱(mark 긴변·short 짧은변, 2:1).
export const checkboxSize = styleVariants(
  Object.fromEntries(
    CONTROL_SIZES.map((s) => [
      s,
      {
        width: tokens.shape.selection.size[s],
        height: tokens.shape.selection.size[s],
        borderRadius: geometry.checkbox.radius[s],
        selectors: {
          "&:checked::after": {
            width: geometry.checkbox.mark[s],
            height: geometry.checkbox.short[s],
          },
        },
      },
    ]),
  ) as Record<ControlSize, object>,
);
