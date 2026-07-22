import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, CONTROL_SIZES, type ControlSize } from "../tokens";

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

// size 3 단 — 배지 높이 + fontSize·padding(라벨 열이라 control 보다 한 단 낮춰 담백하게).
const BADGE_FONT: Record<ControlSize, string> = {
  sm: tokens.shape.fontSize.xs, // 11
  md: tokens.shape.fontSize.sm, // 12 (anchor)
  lg: tokens.shape.fontSize.md, // 14
};
const BADGE_PAD: Record<ControlSize, string> = {
  sm: tokens.shape.padding.xs.interaction, // 4
  md: tokens.shape.padding.sm.interaction, // 8 (anchor)
  lg: tokens.shape.padding.md.interaction, // 12
};

export const badgeSize = styleVariants(
  Object.fromEntries(
    CONTROL_SIZES.map((s) => [
      s,
      {
        height: tokens.shape.badge[s],
        paddingInline: BADGE_PAD[s],
        fontSize: BADGE_FONT[s],
      },
    ]),
  ) as Record<ControlSize, { height: string; paddingInline: string; fontSize: string }>,
);
