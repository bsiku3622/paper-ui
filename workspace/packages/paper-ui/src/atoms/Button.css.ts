import { style, styleVariants, keyframes } from "@vanilla-extract/css";

import { tokens, stateTransition, type ControlSize } from "../tokens";
import { ladderRules } from "../internal/sizeLadder";

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
    // `as` 로 <a> 가 된 버튼은 `:disabled` 가 안 걸린다 — 링크엔 disabled 속성이
    // 없어서다. 같은 자리를 aria-disabled 로 받고, 포인터까지 끊어 실제로 못 누르게
    // 한다(속성만 걸어두면 링크는 그대로 이동한다).
    '&[aria-disabled="true"]': { cursor: "not-allowed", opacity: 0.5, pointerEvents: "none" },
  },
});

// 알약 — 모서리를 높이의 절반까지. 기본 곡선은 시스템이 정하지만(radius.interaction),
// "이 버튼은 가장 중요한 행동" 이라는 뜻은 색만으로 다 못 실을 때가 있다 — hero CTA 가
// 그 자리다. 고르는 건 shape 이지 곡선의 크기가 아니라, 앱이 자기 반경을 들일 틈은 없다.
// buttonRoot 뒤에 와서 같은 특정도를 순서로 이긴다.
export const buttonPill = style({ borderRadius: tokens.shape.radius.full });

const spin = keyframes({ to: { transform: "rotate(360deg)" } });

// 로딩 스피너 — currentColor C-링이라 어느 variant(검정 solid·색·투명) 위에서도 글자색을
// 따라 보인다. 크기는 em 이라 버튼 글자에 맞춰 스케일된다.
export const buttonSpinner = style({
  display: "inline-block",
  flexShrink: 0,
  width: "0.95em",
  height: "0.95em",
  borderRadius: tokens.shape.radius.full,
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "currentColor",
  borderTopColor: "transparent",
  animation: `${spin} ${tokens.motion.loop.spin} linear infinite`,
});

// 가로 꽉 — 폼·모바일. 나란한 형제와 같은 폭.
export const buttonFull = style({ width: "100%" });

// Button 만의 fontWeight ladder — lg(CTA)에서 텍스트도 무거워져 강조를 회복한다.
// sm·md=medium · lg=semibold. (Field 는 입력값 자리라 weight 변동 없음.)
const BUTTON_WEIGHT: Record<ControlSize, string> = {
  sm: tokens.text.weight.medium,
  md: tokens.text.weight.medium,
  lg: tokens.text.weight.semibold,
};

// size 3 단 — 공통 사다리 + 버튼 weight. 가로 여백은 베이스 그대로(10 · 13 · 17)다.
// 버튼은 라벨이 상자를 정의하는 자리라 좌우가 넉넉해야 형태가 산다 — 입력류는 반대로
// 상자가 먼저 있고 글자가 그 안에 놓여서, 가로를 더 좁게 가져간다(inputPaddingX).
// height 와 fontSize 는 양쪽이 계속 공유한다 — 폼 한 줄에서 같은 높이에 서는 건 별개 문제.
export const buttonSize = styleVariants(
  ladderRules((s) => ({ fontWeight: BUTTON_WEIGHT[s] })),
);

// 아이콘 전용 — 정사각(높이=너비), 좌우 패딩 제거. aria-label 은 필수(호출부 책임).
//
// ⚠ **buttonSize 뒤에 와야 한다.** 사다리도 paddingInline 을 정하는데 둘은 특정도가
// 같아 소스 순서로만 갈린다. 위에 두었더니 사다리의 13px 이 이겨서 md 아이콘 버튼이
// 34 가 아니라 44 로 그려지고 있었다 — aspect-ratio 는 붙어 있는데 콘텐츠 폭이 그걸
// 넘겨 정사각이 깨진 채였다.
export const buttonIconOnly = style({ paddingInline: 0, aspectRatio: "1" });
