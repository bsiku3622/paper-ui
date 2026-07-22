import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// geometry·motion 만. 색(background·color·border-color)은 resolveColorClassnames 가
// 붙이는 pui-c-* 클래스가 정한다 — Button 은 어떤 색인지 모른다.
export const buttonRoot = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.shape.gap.sm,
  height: tokens.shape.height.md.interaction,
  paddingInline: tokens.shape.padding.md.interaction,
  borderRadius: tokens.shape.radius.interaction,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  fontFamily: tokens.text.font.sans,
  fontSize: tokens.text.size.body,
  fontWeight: tokens.text.weight.medium,
  letterSpacing: tokens.text.tracking.body,
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "background 130ms ease, border-color 130ms ease, color 130ms ease",
  selectors: {
    "&:disabled": { cursor: "not-allowed", opacity: 0.4 },
  },
});
