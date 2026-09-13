import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, STATUS, STATUS_ACCENT, semanticFormHoverShadow, stateTransition } from "../tokens";
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
    // neutral hover는 배경을 흔들지 않고 primary solid 선으로 형태를 확실히 세운다.
    '&[data-pui-status="default"]:hover:not(:focus-within):has(input:enabled)': {
      borderColor: tokens.color.primary.base,
    },
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

// size 3 단 — 베이스에서 **가로 여백만** inputPaddingX(7 · 9 · 12)로 갈아 끼운다.
// height 와 글자는 베이스 그대로라 폼 한 줄에서 버튼과 같은 높이에 선다.
//
// md의 세로 잉크는 (34 − 14) / 2 = 10이고, 가로는 border 1 + padding 9 = 10이다.
// Field·Select·Textarea가 같은 form geometry를 공유한다. 자세한 계산은 tokens/shape.ts.
export const fieldSize = styleVariants(
  ladderRules((s) => ({ paddingInline: tokens.shape.inputPaddingX[s] })),
);

// status — semantic Form은 처음부터 solid 선으로 상태를 분명히 보이고, hover에서는 선을 더
// 바꾸는 대신 같은 pigment를 중앙 halo로 번지게 한다. 포커스 때는 shadow를 끄고 바깥의
// 파란 outline만 남겨 keyboard focus와 pointer hover가 겹치지 않게 한다.
export const fieldStatus = styleVariants(
  Object.fromEntries(
    STATUS.map((s) => {
      const accent = tokens.color.accent[STATUS_ACCENT[s]];
      return [
        s,
        {
          borderColor: accent.solid,
          selectors: {
            "&:hover:not(:focus):not(:focus-within):not(:disabled):not(:has(input:disabled))": {
              boxShadow: semanticFormHoverShadow(accent.solid),
            },
          },
        },
      ];
    }),
  ) as unknown as Record<StatusName, { borderColor: string; selectors: Record<string, { boxShadow: string }> }>,
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
