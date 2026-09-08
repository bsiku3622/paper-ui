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
  // ⚠ **굵기·자간을 명시한다.** 예전엔 fontFamily 만 정하고 둘을 안 줘서, 브라우저 기본값
  // (400 · normal)으로 떨어져 있었다. 이 시스템의 `normal` 은 **450** 이다 — 작은 sans 가
  // Retina 에서 힘이 빠지는 걸 잡으려고 half-step 을 얹은 값인데(tokens/text.ts), 정작
  // 사람이 글자를 *써 넣는* 자리만 그 보정을 못 받고 있었다. 옆의 Button(550)과 나란히
  // 두면 입력 글자가 눈에 띄게 얇고, 그게 "크기가 다른가?" 로 읽힌다(크기는 둘 다 14다).
  //
  // 자간은 body 다 — 입력칸에 든 건 UI 라벨이 아니라 사람이 쓴 *내용* 이라, Button 의
  // label 자간(+0.01em)이 아니라 본문 자간(−0.006em)을 따른다.
  fontWeight: tokens.text.weight.normal,
  letterSpacing: tokens.text.tracking.body,
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
//
// ⚠ 자간은 `font: inherit` 로 안 따라온다. `font` 단축 속성은 font-* 만 다시 세우고
// letter-spacing 은 안 건드리는데, 브라우저 기본 스타일시트가 폼 컨트롤에 letter-spacing:
// normal 을 **명시** 해 두어 상속이 거기서 끊긴다. 그래서 따로 이어 붙인다 — 안 그러면
// 래퍼(−0.006em)와 안쪽 글자(0)의 자간이 갈려 placeholder 와 입력값이 미세하게 다르게 앉는다.
export const fieldInput = style({
  flex: 1,
  minWidth: 0,
  border: "none",
  background: "transparent",
  outline: "none",
  font: "inherit",
  letterSpacing: "inherit",
  color: "inherit",
  padding: 0,
  margin: 0,
  selectors: { "&::placeholder": { color: tokens.color.ink.faint } },
});

// size 3 단 — 공통 사다리 그대로(height × paddingInline × fontSize).
//
// ⚠ 한때 가로만 따로 뺐다(높이에서 유도한 7 · 9 · 12). 세로 여백과 값을 맞추려던 건데,
// **34 짜리 상자에 14 짜리 글자면 세로로 남는 게 9 뿐이라** 그 9 를 가로로 옮기는 순간
// 답답해졌다. 정사각의 기준점이 화면에서 가장 좁은 값이었던 셈이다.
//
// 여기 세로는 애초에 여백이 아니라 **높이 안의 중앙 정렬**이다 — 한 줄짜리 값이 상자
// 가운데 앉는 걸 여백으로 읽는 사람은 없다. 그래서 맞출 대상이 아니고, 가로는 라벨의
// 비율(10 · 13 · 17)을 그대로 쓴다. 정사각이 뜻을 갖는 건 글이 여러 줄로 흐르는
// Textarea 뿐이고, 거기서는 **가로를 기준으로 세로를 계산한다**(tokens 의 textareaPaddingY).
export const fieldSize = styleVariants(ladderRules());

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
