import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// 옅은 회색 면. 포커스 때만 파란 링 (ChatGPT 의 입력 결).
export const fieldRoot = style({
  height: tokens.shape.height.control,
  width: "100%",
  paddingInline: tokens.shape.space.md,
  background: tokens.color.paper.subtle,
  borderRadius: tokens.shape.radius.sm,
  borderWidth: tokens.shape.borderWidth.base,
  borderStyle: "solid",
  borderColor: "transparent",
  color: tokens.color.ink.base,
  fontFamily: tokens.font.sans,
  fontSize: "0.875rem",
  transition: "border-color 130ms ease, box-shadow 130ms ease, background 130ms ease",
  selectors: {
    "&::placeholder": { color: tokens.color.ink.faint },
    "&:hover:not(:focus):not(:disabled)": { background: tokens.color.paper.muted },
    "&:focus": {
      outline: "none",
      background: tokens.color.paper.base,
      borderColor: tokens.color.focus.ring,
      boxShadow: `0 0 0 3px ${tokens.color.accent.blue.wash}`,
    },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
    "&[aria-invalid='true']": { borderColor: tokens.color.accent.red.solid },
  },
});

// 수치 입력 — sans 그대로 tabular-nums 로 자리만 맞추고 우측정렬. (mono 로 시끄럽게
// 하지 않는다 — 숫자라고 무조건 등폭이 아니다.)
export const fieldNumeric = style({
  fontVariantNumeric: "tabular-nums",
  textAlign: "right",
});
