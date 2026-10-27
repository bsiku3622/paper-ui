import { style } from "@vanilla-extract/css";

import { geometry } from "../internal/shape";

import { tokens } from "../tokens";

// 링크는 파랑 — 이 시스템에서 색이 등장하는 작은 자리 중 하나.
export const linkRoot = style({
  color: tokens.color.accent.info.ink,
  textDecoration: "none",
  cursor: "pointer",
  selectors: {
    "&:hover": { textDecoration: "underline", textUnderlineOffset: geometry.link.underlineOffset },
  },
});
