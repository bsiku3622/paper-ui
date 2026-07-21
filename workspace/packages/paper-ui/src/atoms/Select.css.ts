import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const selectRoot = style({
  height: tokens.shape.height.control,
  width: "100%",
  paddingInline: tokens.shape.space.md,
  paddingRight: tokens.shape.space.xl,
  background: tokens.color.paper.subtle,
  borderRadius: tokens.shape.radius.sm,
  borderWidth: tokens.shape.borderWidth.base,
  borderStyle: "solid",
  borderColor: "transparent",
  color: tokens.color.ink.base,
  fontFamily: tokens.text.font.sans,
  fontSize: tokens.text.size.body,
  cursor: "pointer",
  appearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='%2371717a' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.75rem center",
  backgroundSize: "0.625rem",
  transition: "border-color 130ms ease, box-shadow 130ms ease, background-color 130ms ease",
  selectors: {
    "&:hover:not(:focus)": { backgroundColor: tokens.color.paper.muted },
    "&:focus": {
      outline: "none",
      backgroundColor: tokens.color.paper.base,
      borderColor: tokens.color.focus.ring,
      boxShadow: `0 0 0 3px ${tokens.color.accent.blue.wash}`,
    },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
});
