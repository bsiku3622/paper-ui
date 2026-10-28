import { tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

// 링크는 파랑 — 이 시스템에서 색이 등장하는 작은 자리 중 하나.
export const linkRoot = style({
  color: tokens.color.interaction.link,
  textDecoration: "none",
  cursor: "pointer",
  selectors: {
    "&:hover": { textDecoration: "underline", textUnderlineOffset: tokens.typography.palette.decoration.underlineOffset },
  },
});
