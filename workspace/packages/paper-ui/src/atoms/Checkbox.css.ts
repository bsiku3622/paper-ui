import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const checkboxRoot = style({
  appearance: "none",
  width: "1rem",
  height: "1rem",
  margin: 0,
  flexShrink: 0,
  background: tokens.color.paper.base,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.strong,
  borderRadius: "5px",
  cursor: "pointer",
  display: "grid",
  placeContent: "center",
  transition: "background 120ms ease, border-color 120ms ease",
  selectors: {
    "&:checked": { background: tokens.color.primary.base, borderColor: tokens.color.primary.base },
    "&:checked::after": {
      content: "''",
      width: "0.5rem",
      height: "0.25rem",
      borderLeft: `2px solid ${tokens.color.primary.fg}`,
      borderBottom: `2px solid ${tokens.color.primary.fg}`,
      transform: "rotate(-45deg) translate(0.5px, -1px)",
    },
    "&:focus-visible": {
      outline: `2px solid ${tokens.color.focus.ring}`,
      outlineOffset: "2px",
    },
    "&:disabled": { opacity: 0.45, cursor: "not-allowed" },
  },
});
