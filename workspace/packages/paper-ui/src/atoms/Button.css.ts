import { style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const buttonRoot = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.shape.space.sm,
  height: tokens.shape.height.control,
  paddingInline: tokens.shape.space.md,
  borderRadius: tokens.shape.radius.base,
  borderWidth: tokens.shape.ruleWidth.base,
  borderStyle: "solid",
  fontFamily: tokens.font.sans,
  fontSize: "0.875rem",
  fontWeight: "500",
  letterSpacing: "-0.01em",
  cursor: "pointer",
  transition: "background 120ms ease, border-color 120ms ease",
  selectors: {
    "&:disabled": { cursor: "not-allowed", opacity: 0.45 },
  },
});

// 3 종뿐이다. 장부에 필요한 버튼의 무게는 이게 전부.
//   solid   — 1 차 액션. 이 시스템에서 면이 잉크로 꽉 차는 유일한 자리.
//   outline — 2 차. 괘선만.
//   quiet   — 3 차. 선도 면도 없다.
export const buttonKind = styleVariants({
  solid: {
    background: tokens.color.ink.base,
    borderColor: tokens.color.ink.base,
    color: tokens.color.paper.base,
    selectors: { "&:hover:not(:disabled)": { background: tokens.color.ink.soft, borderColor: tokens.color.ink.soft } },
  },
  outline: {
    background: "transparent",
    borderColor: tokens.color.rule.strong,
    color: tokens.color.ink.base,
    selectors: { "&:hover:not(:disabled)": { background: tokens.color.paper.sunk } },
  },
  quiet: {
    background: "transparent",
    borderColor: "transparent",
    color: tokens.color.ink.soft,
    selectors: { "&:hover:not(:disabled)": { background: tokens.color.paper.sunk, color: tokens.color.ink.base } },
  },
});

// danger 만 색을 입는다 — 되돌릴 수 없는 액션은 잉크가 달라야 한다.
export const buttonDanger = style({
  background: tokens.color.accent.red.ink,
  borderColor: tokens.color.accent.red.ink,
  color: tokens.color.paper.base,
  selectors: { "&:hover:not(:disabled)": { opacity: 0.88 } },
});
