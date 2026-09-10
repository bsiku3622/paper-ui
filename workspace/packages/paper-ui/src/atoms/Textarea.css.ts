import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";
import { ladderRules } from "../internal/sizeLadder";

// Field 와 같은 결의 여러 줄 입력. 높이만 자라고, 세로로만 resize.
// 크기(padding·fontSize)는 size 축(textareaSize)이 정한다 — Button·Field·Select 와 같은
// 컨트롤 여백을 쓴다.
export const textareaRoot = style({
  width: "100%",
  // 줄 수가 높이를 정하므로(rows) 여기서 잡는 건 바닥뿐이다.
  minHeight: tokens.shape.height.sm.layout,
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
  lineHeight: tokens.text.leading.body,
  resize: "vertical",
  transition: stateTransition("border-color", "box-shadow", "background"),
  selectors: {
    "&::placeholder": { color: tokens.color.ink.faint },
    "&:hover:not(:focus):not(:disabled)": { borderColor: tokens.color.border.strong },
    // 포커스 — 보더 *바깥* 에 파란 링(outline). 전역/Checkbox 와 같은 방식.
    "&:focus": {
      outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.focus.ring}`,
      outlineOffset: tokens.shape.constants.focusRingOffset,
    },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
});

// size 3 단 — 베이스에서 **height 를 빼고**(줄 수가 정한다) 세로 여백을 더한다.
// 가로와 글자는 베이스 그대로다.
//
// **잉크가 사방 같은 거리에 앉는다** — 여기서는 정사각이 뜻을 갖는다. 글이 여러 줄로
// 흐르면 위·아래·좌·우가 다 보이기 때문이다(한 줄짜리 Field 는 좌우만 보인다).
//
// 세로 선언값(8.5)이 가로(12)보다 작은 건 재는 대상이 달라서다 — 줄상자에 이미 반 줄
// 여백 3.5 가 들어 있어, 1 + 8.5 + 3.5 = 13 으로 가로(1 + 12)와 같은 자리가 된다. 선언값을
// 정사각으로 맞추면 되레 첫 줄이 왼쪽 여백보다 3.5 내려간다 — 눈이 읽는 건 선언값이
// 아니라 잉크의 자리다.
//
// ⚠ 기준은 **가로** 다. 세로에서 가로를 유도하던 시절엔 (34 − 2 − 14) / 2 = 9 가 나와
// 가로가 9 로 좁아졌고, 여러 줄은 줄마다 오른쪽 벽에 닿아 눈에 띄게 답답했다.
export const textareaSize = styleVariants(
  ladderRules((s) => ({
    height: null, // 줄 수(rows)가 정한다 — 이 축만 베이스에서 뺀다
    paddingInline: tokens.shape.inputPaddingX[s],
    paddingBlock: tokens.shape.textareaPaddingY[s],
  })),
);
