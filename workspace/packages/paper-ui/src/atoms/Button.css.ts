import { style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const buttonRoot = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.shape.space.sm,
  height: tokens.shape.height.control,
  paddingInline: tokens.shape.space.md,
  borderRadius: tokens.shape.radius.sm,
  borderWidth: tokens.shape.borderWidth.base,
  borderStyle: "solid",
  borderColor: "transparent",
  fontFamily: tokens.font.sans,
  fontSize: "0.875rem",
  fontWeight: "550", // 500 은 채운 버튼 위에서 살짝 얇다 — 반 단계 무겁게
  letterSpacing: "-0.006em",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "background 130ms ease, border-color 130ms ease, color 130ms ease",
  selectors: {
    "&:disabled": { cursor: "not-allowed", opacity: 0.4 },
  },
});

// 3 종. solid 만 면을 채우고(검정), 나머지는 조용하다.
export const buttonKind = styleVariants({
  solid: {
    background: tokens.color.primary.base,
    color: tokens.color.primary.fg,
    selectors: { "&:hover:not(:disabled)": { background: tokens.color.primary.hover } },
  },
  // 옅은 면. 테두리는 거의 안 보이고 hover 때 배경만 조용히 회색.
  outline: {
    background: tokens.color.surface.base,
    borderColor: tokens.color.border.base,
    color: tokens.color.ink.base,
    selectors: { "&:hover:not(:disabled)": { background: tokens.color.surface.muted } },
  },
  // 선도 면도 없음. hover 때만 회색.
  quiet: {
    background: "transparent",
    color: tokens.color.ink.soft,
    selectors: {
      "&:hover:not(:disabled)": { background: tokens.color.surface.muted, color: tokens.color.ink.base },
    },
  },
});

// 되돌릴 수 없는 액션만 색을 입는다 (red). solid 자리에서만.
export const buttonDanger = style({
  background: tokens.color.accent.red.solid,
  color: tokens.color.primary.fg,
  selectors: { "&:hover:not(:disabled)": { background: tokens.color.accent.red.ink } },
});
