import { controlGeometry, geometry } from "../internal/shape";

import { tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// geometry 만. 색은 Paint 가 붙이는 accentVariantClass 가 정한다. Badge 는 hoverable 을
// 안 줘 hover 색이 뜨지 않는다 — 표시용이지 누르는 자리가 아니다. 크기(height·paddingInline)는 badgeSize.
export const badgeRoot = style({
  display: "inline-flex",
  alignItems: "center",
  gap: geometry.badge.gap,
  borderRadius: tokens.shape.radius.control,
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
});

// 알약 — 모서리를 높이의 절반까지. 배지는 낱말 하나를 담는 라벨이라 알약이 자연스러운
// 자리지만, 기본값은 아니다 — 표 안에서 버튼·입력과 같은 곡선으로 줄을 서야 한다.
// badgeRoot 뒤에 와서 같은 특정도를 순서로 이긴다.
export const badgePill = style({ borderRadius: tokens.shape.radius.full });

// 상태 점 — 글자색(currentColor)을 따라 배지와 한 색. em 이라 size 에 비례.
export const badgeDot = style({
  width: geometry.badge.dot,
  height: geometry.badge.dot,
  borderRadius: tokens.shape.radius.full,
  background: "currentColor",
  flexShrink: 0,
});

// size 3 단 — 높이와 여백만 움직인다.
//
// **글자는 고정이다.** 배지도 컨트롤과 같은 규칙을 진다 — 밀도(height)와 가독성
// (fontSize)은 다른 축이라, 배지가 작아진다고 글자가 따라 내려가지 않는다. 컨트롤의
// 글자가 preset으로 고정되는 것과 같은 이유고, 배지도 badge preset이 글자를 정한다
// (control preset과 badge preset은 각자 자기 앵커를 하나씩 든다).
//
// ⚠ 글자가 높이를 따라가면 가장 작은 배지는 시스템이 세운 가독성 하한 아래로 내려가고, 가장 큰
// 배지는 버튼 라벨만큼 크게 읽혀 "표식"이라는 역할을 넘는다.
// 가로 여백은 controlGeometry.badge — 높이 사다리와 같은 보폭으로 움직여 세 크기가 한 실루엣의
// 축소·확대로 읽힌다. Box 여백 사다리를 빌리면 두 배 빨리 벌어져 작은 배지는 답답하고 큰 배지는 헐거워진다.
export const badgeSize = styleVariants(controlGeometry.badge);
