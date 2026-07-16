import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// 밑줄이 기본이다. 색으로 링크를 표시하려면 색이 필요한데, 이 시스템엔 색이 없다.
export const linkRoot = style({
  color: tokens.color.ink.base,
  textDecoration: "underline",
  textDecorationColor: tokens.color.rule.strong,
  textUnderlineOffset: "0.2em",
  cursor: "pointer",
  selectors: {
    "&:hover": { textDecorationColor: tokens.color.ink.base },
  },
});
