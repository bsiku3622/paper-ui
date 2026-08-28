import { style, styleVariants, keyframes } from "@vanilla-extract/css";

import { tokens, stateTransition, CONTROL_SIZES, type ControlSize } from "../tokens";
import { sizeLadderRules } from "../internal/sizeLadder";

// geometry·motion 만. 색(background·color·border-color)은 resolveColor 가 붙이는 pui-c-*
// 클래스가 정한다 — Button 은 어떤 색인지 모른다.
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
  // 버튼 라벨은 UI 라벨이다 — 읽는 본문(tracking.body 음수)이 아니라 label 결(양수)로
  // 벌려 짧은 라벨을 또렷하게. body 음수 자간은 짧은 중앙 라벨을 답답하게 만든다.
  letterSpacing: tokens.text.tracking.label,
  lineHeight: "1",
  cursor: "pointer",
  whiteSpace: "nowrap",
  userSelect: "none",
  transition: stateTransition("background", "border-color", "color", "transform"),
  selectors: {
    // 눌림 — 살짝 들어가는 촉각 피드백. 색 오버레이 대신 scale 이라 테마·variant 무관.
    "&:active:not(:disabled)": { transform: "scale(0.97)" },
    "&:disabled": { cursor: "not-allowed", opacity: 0.5 },
  },
});

const spin = keyframes({ to: { transform: "rotate(360deg)" } });

// 로딩 스피너 — currentColor C-링이라 어느 variant(검정 solid·색·투명) 위에서도 글자색을
// 따라 보인다. 크기는 em 이라 버튼 글자에 맞춰 스케일된다.
export const buttonSpinner = style({
  display: "inline-block",
  flexShrink: 0,
  width: "0.95em",
  height: "0.95em",
  borderRadius: tokens.shape.constants.pillRadius,
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "currentColor",
  borderTopColor: "transparent",
  animation: `${spin} ${tokens.motion.loop.spin} linear infinite`,
});

// 아이콘 전용 — 정사각(높이=너비), 좌우 패딩 제거. aria-label 은 필수(호출부 책임).
export const buttonIconOnly = style({ paddingInline: 0, aspectRatio: "1" });

// 가로 꽉 — 폼·모바일. 나란한 형제와 같은 폭.
export const buttonFull = style({ width: "100%" });

// Button 만의 fontWeight ladder — lg(CTA)에서 텍스트도 무거워져 강조를 회복한다.
// sm·md=medium · lg=semibold. (Field 는 입력값 자리라 weight 변동 없음.)
const BUTTON_WEIGHT: Record<ControlSize, string> = {
  sm: tokens.text.weight.medium,
  md: tokens.text.weight.medium,
  lg: tokens.text.weight.semibold,
};

// size 3 단 — 공통 사다리 + 버튼 weight. Field·Select 와 같은 height.interaction.
export const buttonSize = styleVariants(
  Object.fromEntries(
    CONTROL_SIZES.map((s) => [s, { ...sizeLadderRules[s], fontWeight: BUTTON_WEIGHT[s] }]),
  ) as Record<ControlSize, (typeof sizeLadderRules)[ControlSize] & { fontWeight: string }>,
);
