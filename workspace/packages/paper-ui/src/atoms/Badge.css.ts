import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, SPACE_KEYS, type Space } from "../tokens";

// geometry 만. 색은 resolveColorClassnames("soft", status) 가 붙이는 pui-c-soft-*
// 클래스가 정한다 (옅은 색 면 = soft variant). Badge 는 gate(pui-interactive)를
// 붙이지 않아 hover 색이 뜨지 않는다 — 표시용이지 누르는 자리가 아니다.
// 크기(height·paddingInline·fontSize)는 size 축(badgeSize)이 정한다.
export const badgeRoot = style({
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.shape.gap.xs,
  borderRadius: tokens.shape.radius.interaction,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  fontFamily: tokens.text.font.sans,
  fontWeight: tokens.text.weight.medium,
  letterSpacing: tokens.text.tracking.caption,
  whiteSpace: "nowrap",
});

// size 5 단 — 배지 높이 사다리 + fontSize(라벨 열이라 한 단 낮춰 담백하게).
const BADGE_FONT: Record<Space, string> = {
  xs: tokens.shape.fontSize.xs,
  sm: tokens.shape.fontSize.xs,
  md: tokens.shape.fontSize.sm, // = 12 (기존 label 크기)
  lg: tokens.shape.fontSize.sm,
  xl: tokens.shape.fontSize.md,
};

export const badgeSize = styleVariants(
  Object.fromEntries(
    SPACE_KEYS.map((s) => [
      s,
      {
        height: tokens.shape.badge[s],
        paddingInline: tokens.shape.padding[s].interaction,
        fontSize: BADGE_FONT[s],
      },
    ]),
  ) as Record<Space, { height: string; paddingInline: string; fontSize: string }>,
);
