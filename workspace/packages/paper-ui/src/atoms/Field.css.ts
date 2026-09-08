import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, STATUS, STATUS_ACCENT, stateTransition } from "../tokens";
import type { StatusName } from "../tokens";
import { ladderRules } from "../internal/sizeLadder";

// Field 는 input group — 래퍼가 면·테두리·포커스링·상태·크기를 지고, 안쪽 input 은
// 투명·무테로 값만 담는다. leading/trailing 어도먼트(아이콘·$·단위·clear·비밀번호)가
// input 양옆에 앉는다. 크기(height·paddingInline·fontSize)는 fieldSize 가 래퍼에 준다.
export const fieldWrap = style({
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  width: "100%",
  background: tokens.color.paper.raised,
  borderRadius: tokens.shape.radius.interaction,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
  color: tokens.color.ink.base,
  fontFamily: tokens.text.font.sans,
  cursor: "text",
  transition: stateTransition("border-color", "box-shadow", "background"),
  selectors: {
    // hover 는 배경을 흔들지 않고 테두리만 한 단 또렷하게 (흰 면 유지)
    "&:hover:not(:focus-within):has(input:enabled)": { borderColor: tokens.color.border.strong },
    // 포커스 — 안쪽 input 이 포커스되면 래퍼 *바깥* 에 파란 링(outline). 전역 :focus-visible·
    // Checkbox·Switch 와 같은 outside-the-border 방식 — 보더 위가 아니라 보더 밖에 뜬다.
    "&:focus-within": {
      outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.focus.ring}`,
      outlineOffset: tokens.shape.constants.focusRingOffset,
    },
    "&:has(input:disabled)": { opacity: 0.5, cursor: "not-allowed" },
  },
});

// 안쪽 input — 면·테두리·아웃라인 없음. 폰트·색은 래퍼에서 상속.
export const fieldInput = style({
  flex: 1,
  minWidth: 0,
  border: "none",
  background: "transparent",
  outline: "none",
  font: "inherit",
  color: "inherit",
  padding: 0,
  margin: 0,
  selectors: { "&::placeholder": { color: tokens.color.ink.faint } },
});

// size 3 단 — 공통 사다리에서 **가로 여백만** 갈아 끼운다.
//
// height 와 fontSize 는 베이스 그대로다(폼 한 줄에서 버튼과 같은 높이에 선다). 가로만
// inputPaddingX(7 · 9 · 12)로 나가는데, 그 값이 (height − 테두리 2 − 글자 14) / 2 라
// **글자가 테두리에서 사방 같은 거리에 앉는다.** 컨트롤 사다리의 10 · 13 · 17 은 버튼
// 라벨의 비율이라, 입력칸에 쓰면 세로 9 에 가로 13 이 되어 글자가 눌린 것처럼 보인다.
export const fieldSize = styleVariants(
  ladderRules((s) => ({ paddingInline: tokens.shape.inputPaddingX[s] })),
);

// status — 래퍼 테두리 색. 포커스 링은 이제 바깥 outline 이라 status 테두리와 겹치지 않고
// 공존한다 (빨간 error 테두리 + 그 밖의 파란 포커스 링).
export const fieldStatus = styleVariants(
  Object.fromEntries(
    STATUS.map((s) => [s, { borderColor: tokens.color.accent[STATUS_ACCENT[s]].solid }]),
  ) as Record<StatusName, { borderColor: string }>,
);

// 어도먼트 — leading/trailing 슬롯(아이콘·$·단위). 흐린 잉크, 축소 안 됨.
export const fieldAdornment = style({
  display: "inline-flex",
  alignItems: "center",
  color: tokens.color.ink.soft,
  flexShrink: 0,
});

// 액션 버튼 — clear(×)·비밀번호 보기(👁). 흐린 잉크, hover 때 또렷.
export const fieldAction = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  appearance: "none",
  border: "none",
  background: "none",
  padding: 0,
  margin: 0,
  cursor: "pointer",
  color: tokens.color.ink.faint,
  transition: stateTransition("color"),
  selectors: {
    "&:hover": { color: tokens.color.ink.base },
    "&:focus-visible": {
      outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.focus.ring}`,
      outlineOffset: tokens.shape.constants.focusRingOffset,
      borderRadius: tokens.shape.radius.interaction,
    },
  },
});

// 수치 표기 — sans 그대로 숫자 글리프만 등폭(tabular-nums). 정렬은 안 건드린다 — align 이 따로. (input 에.)
export const fieldNumeric = style({
  fontVariantNumeric: "tabular-nums",
});

// 정렬 축 — numeric 과 직교. 논리값(start·center·end)이라 RTL 도 따라간다. 우측정렬 숫자열 = numeric + end.
export const fieldAlign = styleVariants({
  start: { textAlign: "start" },
  center: { textAlign: "center" },
  end: { textAlign: "end" },
});

// 알약 — 모서리를 높이의 절반까지. 검색창이 이 어휘의 본진이다(아이콘 + 둥근 입력).
// 반경은 래퍼 하나에만 있고 포커스 링이 outline 이라, 링이 곡선을 저절로 따라간다.
//
// 여백은 안 건드린다. shape 은 실루엣 축이지 밀도 축이 아니라, 알약이라고 해서 컨트롤
// 사다리(10·13·17)를 벗어나면 같은 size 의 형제와 글자 시작점이 갈린다.
//
// fieldWrap 뒤에 와서 같은 특정도를 순서로 이긴다(반경을 정하는 건 fieldWrap 뿐 —
// fieldSize 는 height·padding·font 만, fieldStatus 는 borderColor 만 정한다).
export const fieldPill = style({ borderRadius: tokens.shape.radius.full });
