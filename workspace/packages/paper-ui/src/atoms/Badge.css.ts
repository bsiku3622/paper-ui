import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, CONTROL_SIZES, type ControlSize } from "../tokens";

// geometry 만. 색은 resolveColor(color, variant) 가 붙이는 pui-c-{color}-{variant}
// 클래스가 정한다. Badge 는 gate(pui-interactive)를 안 붙여 hover 색이 뜨지 않는다 —
// 표시용이지 누르는 자리가 아니다. 크기(height·paddingInline·fontSize)는 badgeSize.
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

// 알약 — 모서리를 높이의 절반까지. 배지는 낱말 하나를 담는 라벨이라 알약이 자연스러운
// 자리지만, 기본값은 아니다 — 표 안에서 버튼·입력과 같은 곡선으로 줄을 서야 한다.
// badgeRoot 뒤에 와서 같은 특정도를 순서로 이긴다.
export const badgeRadiusFull = style({ borderRadius: tokens.shape.radius.full });

// 상태 점 — 글자색(currentColor)을 따라 배지와 한 색. em 이라 size 에 비례.
export const badgeDot = style({
  width: "0.5em",
  height: "0.5em",
  borderRadius: tokens.shape.radius.full,
  background: "currentColor",
  flexShrink: 0,
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
