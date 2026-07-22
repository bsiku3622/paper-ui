import { style } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

// Field 와 같은 결의 여러 줄 입력. 높이만 자라고, 세로로만 resize.
export const textareaRoot = style({
  width: "100%",
  minHeight: tokens.shape.height.sm.layout,
  paddingBlock: tokens.shape.padding.sm.interaction,
  paddingInline: tokens.shape.padding.md.interaction,
  background: tokens.color.paper.subtle,
  borderRadius: tokens.shape.radius.interaction,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: "transparent",
  color: tokens.color.ink.base,
  fontFamily: tokens.text.font.sans,
  fontSize: tokens.text.size.body,
  lineHeight: tokens.text.leading.body,
  resize: "vertical",
  transition: stateTransition("border-color", "box-shadow", "background"),
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
  },
});
