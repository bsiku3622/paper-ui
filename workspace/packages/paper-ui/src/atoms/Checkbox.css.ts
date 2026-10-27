import { style, styleVariants } from "@vanilla-extract/css";

import { focusRing, geometry } from "../internal/shape";

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
      borderLeft: `${geometry.checkbox.stroke} solid ${tokens.color.accent.primary.wash}`,
      borderBottom: `${geometry.checkbox.stroke} solid ${tokens.color.accent.primary.wash}`,
      transform: geometry.checkbox.markTransform,
    },
    // indeterminate — 부분 선택. 체크 대신 가로 대시. 길이는 size 축(checkboxSize)이 체크의 긴 변으로 준다.
    "&:indeterminate": { background: tokens.color.accent.primary.solid, borderColor: tokens.color.accent.primary.solid },
    "&:indeterminate::after": {
      content: "''",
      height: geometry.checkbox.dash.height,
      borderRadius: geometry.checkbox.dash.radius,
      background: tokens.color.accent.primary.wash,
    },
    "&:focus-visible": focusRing,
    "&:disabled": { opacity: 0.45, cursor: "not-allowed" },
  },
});

// size 3 단 — 변(box) + 틱(mark 긴변·short 짧은변, 2:1)과 대시 길이. 모서리는 크기와 무관한 한 값.
export const checkboxSize = styleVariants(
  Object.fromEntries(
    CONTROL_SIZES.map((s) => [
      s,
      {
        width: tokens.shape.selection.size[s],
        height: tokens.shape.selection.size[s],
        borderRadius: geometry.checkbox.radius,
        selectors: {
          "&:checked::after": {
            width: geometry.checkbox.mark[s],
            height: geometry.checkbox.short[s],
          },
          "&:indeterminate::after": { width: geometry.checkbox.dash.width[s] },
        },
      },
    ]),
  ) as Record<ControlSize, object>,
);
