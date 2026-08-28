import { style } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

// Field 와 같은 결의 여러 줄 입력. 높이만 자라고, 세로로만 resize.
export const textareaRoot = style({
  width: "100%",
  minHeight: tokens.shape.height.sm.layout,
  paddingBlock: tokens.shape.padding.sm.interaction,
  paddingInline: tokens.shape.padding.md.interaction,
  background: tokens.color.paper.raised,
  borderRadius: tokens.shape.radius.interaction,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
  color: tokens.color.ink.base,
  fontFamily: tokens.text.font.sans,
  fontSize: tokens.text.size.body,
  lineHeight: tokens.text.leading.body,
  resize: "vertical",
  transition: stateTransition("border-color", "box-shadow", "background"),
  selectors: {
    "&::placeholder": { color: tokens.color.ink.faint },
    "&:hover:not(:focus):not(:disabled)": { borderColor: tokens.color.border.strong },
    // 포커스 — 보더 *바깥* 에 파란 링(outline). 전역/Checkbox 와 같은 방식.
    "&:focus": {
      outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.focus.ring}`,
      outlineOffset: tokens.shape.constants.focusRingOffset,
    },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
});
