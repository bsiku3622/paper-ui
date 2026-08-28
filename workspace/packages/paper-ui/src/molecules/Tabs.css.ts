import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition, CONTROL_SIZES, type ControlSize } from "../tokens";
import { sizeLadderRules } from "../internal/sizeLadder";

export const tabsList = style({
  display: "inline-flex",
  gap: tokens.shape.atom.tabsTrackGap,
  padding: tokens.shape.atom.tabsTrackPad,
  background: tokens.color.paper.well,
  borderRadius: tokens.shape.radius.layout.md,
});

// 크기(height·paddingInline·fontSize)는 size 축(tabItemSize)이 정한다 — Button·Field 와
// 같은 공통 사다리. 세그먼트는 컴팩트해서 기본 sm.
export const tabItem = style({
  appearance: "none",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  borderRadius: tokens.shape.radius.interaction,
  fontFamily: tokens.text.font.sans,
  fontWeight: tokens.text.weight.medium,
  color: tokens.color.ink.soft,
  transition: stateTransition("background", "color"),
  // 비활성 탭 hover — interaction 오버레이(backgroundImage)로 트랙 위에서 살짝 어둡게.
  // 활성 pill(흰 면)에 얹혀도 backgroundImage 라 base 흰색을 유지한 채 틴트만 더한다.
  selectors: {
    "&:hover": {
      color: tokens.color.ink.base,
      backgroundImage: `linear-gradient(0deg, ${tokens.color.interaction.hover}, ${tokens.color.interaction.hover})`,
    },
  },
});

export const tabItemSize = styleVariants(
  Object.fromEntries(CONTROL_SIZES.map((s) => [s, sizeLadderRules[s]])) as Record<ControlSize, (typeof sizeLadderRules)[ControlSize]>,
);

// 선택 = 흰 pill. muted 트랙 위 흰색 대비만으로 또렷하다 — 그림자 없음.
// (탭은 overlay 가 아니므로 뜨지 않는다. 원칙 3.)
export const tabItemActive = style({
  background: tokens.color.paper.raised,
  color: tokens.color.ink.base,
});
