import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition, SPACE_KEYS, type Space } from "../tokens";
import { sizeLadderRules } from "../internal/sizeLadder";

// geometry·motion 만. 색(background·color·border-color)은 resolveColorClassnames 가
// 붙이는 pui-c-* 클래스가 정한다 — Button 은 어떤 색인지 모른다.
// 크기(height·padding·fontSize·weight)는 size 축(buttonSize) 이 정한다.
export const buttonRoot = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.shape.gap.sm,
  borderRadius: tokens.shape.radius.interaction,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  fontFamily: tokens.text.font.sans,
  letterSpacing: tokens.text.tracking.body,
  lineHeight: "1",
  cursor: "pointer",
  whiteSpace: "nowrap",
  userSelect: "none",
  transition: stateTransition("background", "border-color", "color"),
  selectors: {
    "&:disabled": { cursor: "not-allowed", opacity: 0.4 },
  },
});

// Button 만의 fontWeight ladder — chrome 이 커질수록 텍스트도 무거워져 비례를 회복한다.
// 버튼은 본질적으로 강조 요소라 바닥값이 medium(550): xs~md=medium · lg=semibold · xl=bold.
// (Field 는 입력값 자리라 weight 변동 없음 — size 로 height 만 바뀐다.)
const BUTTON_WEIGHT: Record<Space, string> = {
  xs: tokens.text.weight.medium,
  sm: tokens.text.weight.medium,
  md: tokens.text.weight.medium,
  lg: tokens.text.weight.semibold,
  xl: tokens.text.weight.bold,
};

// size 5 단 — 공통 사다리 + 버튼 weight. IconButton·Field 와 같은 height.interaction.
export const buttonSize = styleVariants(
  Object.fromEntries(
    SPACE_KEYS.map((s) => [s, { ...sizeLadderRules[s], fontWeight: BUTTON_WEIGHT[s] }]),
  ) as Record<Space, (typeof sizeLadderRules)[Space] & { fontWeight: string }>,
);
