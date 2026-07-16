import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const checkboxRoot = style({
  appearance: "none",
  width: "1rem",
  height: "1rem",
  margin: 0,
  flexShrink: 0,
  background: tokens.color.paper.sunk,
  borderWidth: tokens.shape.ruleWidth.base,
  borderStyle: "solid",
  borderColor: tokens.color.rule.strong,
  borderRadius: "3px",
  cursor: "pointer",
  display: "grid",
  placeContent: "center",
  selectors: {
    "&:checked": { background: tokens.color.ink.base, borderColor: tokens.color.ink.base },
    // 체크 표시 — 손으로 그은 획처럼.
    "&:checked::after": {
      content: "''",
      width: "0.5rem",
      height: "0.25rem",
      borderLeft: `2px solid ${tokens.color.paper.base}`,
      borderBottom: `2px solid ${tokens.color.paper.base}`,
      transform: "rotate(-45deg) translate(0.5px, -1px)",
    },
    "&:disabled": { opacity: 0.45, cursor: "not-allowed" },
  },
});
