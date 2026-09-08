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
export const badgePill = style({ borderRadius: tokens.shape.radius.full });

// 상태 점 — 글자색(currentColor)을 따라 배지와 한 색. em 이라 size 에 비례.
export const badgeDot = style({
  width: "0.5em",
  height: "0.5em",
  borderRadius: tokens.shape.radius.full,
  background: "currentColor",
  flexShrink: 0,
});

// size 3 단 — 높이와 여백만 움직인다.
//
// **글자는 12 고정이다.** 배지도 컨트롤과 같은 규칙을 진다 — 밀도(height)와 가독성
// (fontSize)은 다른 축이라, 배지가 작아진다고 글자가 따라 내려가지 않는다. 컨트롤이
// 14 고정인 것과 같은 이유고, 12 인 것은 배지가 버튼 라벨보다 한 단 낮은 표식이라서다
// (control 은 14, 배지는 12 — 각자 자기 tier 의 앵커를 하나씩 든다).
//
// ⚠ 예전엔 11 · 12 · 14 로 높이를 그대로 따라갔다. sm 의 11 은 시스템이 스스로 세운
// 가독성 하한 아래였고, lg 의 14 는 배지를 버튼 라벨만큼 크게 읽히게 해 "표식" 이라는
// 역할을 넘겼다. 높이 사다리(20·22·24)가 14 를 못 담는 게 원인이었는데, 컨트롤은 같은
// 문제를 sm 높이를 28 → 30 으로 올려 풀었지 글자를 내려서 풀지 않았다.
const BADGE_FONT = tokens.shape.fontSize.sm; // 12 — size 무관
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
        fontSize: BADGE_FONT,
      },
    ]),
  ) as Record<ControlSize, { height: string; paddingInline: string; fontSize: string }>,
);
