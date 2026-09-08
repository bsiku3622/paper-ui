import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";
import { ladderRules } from "../internal/sizeLadder";

// 트랙 — 그릇. 곡선은 shape 축(tabsListShape)이 정한다.
export const tabsList = style({
  display: "inline-flex",
  gap: tokens.shape.atom.tabsTrackGap,
  padding: tokens.shape.atom.tabsTrackPad,
  background: tokens.color.paper.well,
});

// 크기(height·paddingInline·fontSize)는 size 축(tabItemSize)이 정한다 — Button·Field 와
// 같은 공통 사다리. 세그먼트는 컴팩트해서 기본 sm.
//
// ⚠ 여기서 paddingInline 을 따로 주지 않는다. 예전엔 tabsItemPadX(9px)를 박아 뒀는데
// tabItemSize 가 뒤에 와서 사다리 값(10 · 13 · 17)으로 덮고 있었다 — 값이 살아 있는 척만
// 하고 실제로는 죽은 자리였다. 탭도 컨트롤이라 사다리를 그대로 진다.
export const tabItem = style({
  appearance: "none",
  background: "transparent",
  border: "none",
  cursor: "pointer",
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

// 탭 항목은 버튼과 같은 자리다 — 라벨이 상자를 정의하므로 베이스를 그대로 쓴다.
export const tabItemSize = styleVariants(ladderRules());

// 선택 = 흰 면. well 트랙 위 흰색 대비만으로 또렷하다 — 그림자 없음.
// (탭은 overlay 가 아니므로 뜨지 않는다. 원칙 3.)
export const tabItemActive = style({
  background: tokens.color.paper.raised,
  color: tokens.color.ink.base,
});

// ───── shape — 실루엣 축 (Button·Badge·Field·Select 와 같은 어휘) ───────────
//
// 탭은 그릇과 알맹이가 겹쳐 있어 한 축이 두 곡선을 함께 정한다. 그릇만 각지고 안쪽이
// 둥글면 곡선과 직각 사이에 초승달 빈틈이 생기고, 반대면 활성 면이 트랙 밖으로 삐져
// 나온다 — **둘은 같은 shape 을 함께 입어야 한다.**
//
// default 의 안쪽 반경은 **동심(concentric)** 으로 계산한다: 바깥 반경 − 트랙 여백.
// 두 곡선의 중심이 같아야 사이 간격이 어디서나 일정하다(모서리에서만 벌어지지 않는다).
// 그래서 상수 3 을 박지 않고 calc 로 둔다 — 트랙 여백이 바뀌면 안쪽도 따라 움직인다.
//
// pill 은 계산이 필요 없다. 999 는 크기가 아니라 "높이의 절반" 이라, 그릇이든 알맹이든
// 각자 자기 높이의 절반이 되어 저절로 동심이 된다.
//
// 여백은 shape 이 안 건드린다 — Field·Select 와 같은 규칙이다(실루엣 축이지 밀도 축이
// 아니다). 두 shape 의 탭은 곡선만 다르고 글자 시작점이 같다.
export const tabsListShape = styleVariants({
  default: { borderRadius: tokens.shape.radius.interaction },
  pill: { borderRadius: tokens.shape.radius.full },
});

export const tabItemShape = styleVariants({
  default: {
    borderRadius: `calc(${tokens.shape.radius.interaction} - ${tokens.shape.atom.tabsTrackPad})`,
  },
  pill: { borderRadius: tokens.shape.radius.full },
});
