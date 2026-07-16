import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// 입력 칸은 *파인다*. 종이에 눌린 자리 — 떠오르지 않는다.
export const fieldRoot = style({
  height: tokens.shape.height.control,
  width: "100%",
  paddingInline: tokens.shape.space.md,
  background: tokens.color.paper.sunk,
  borderRadius: tokens.shape.radius.base,
  borderWidth: tokens.shape.ruleWidth.base,
  borderStyle: "solid",
  borderColor: tokens.color.rule.base,
  color: tokens.color.ink.base,
  fontFamily: tokens.font.sans,
  fontSize: "0.875rem",
  selectors: {
    "&::placeholder": { color: tokens.color.ink.faint },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
    "&[aria-invalid='true']": { borderColor: tokens.color.accent.red.ink },
  },
});

// 금액 입력은 mono·우측정렬 — 장부의 숫자 열.
export const fieldNumeric = style({
  fontFamily: tokens.font.mono,
  fontVariantNumeric: "tabular-nums",
  textAlign: "right",
});
