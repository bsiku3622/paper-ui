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

// size 3 단 — 베이스에서 **height 를 빼고**(줄 수가 정한다) 여백 두 축을 갈아 끼운다.
// fontSize 는 베이스 그대로 14 다.
//
// 두 축의 값이 다른 건 **재는 대상이 달라서**다. 가로는 inputPaddingX(7 · 9 · 12) —
// 테두리에서 글자까지의 거리다. 세로는 controlPaddingY(3.5 · 5.5 · 8.5) — 테두리에서
// *줄상자* 까지의 거리이고, 줄상자에는 위아래로 반 줄 여백(21 − 14) / 2 = 3.5 가 이미
// 들어 있다. 그래서 3.5 + 5.5 = 9 — **잉크는 사방 같은 9 에 앉는다.**
//
// 선언값을 정사각(9 / 9)으로 맞추면 첫 줄이 왼쪽 여백보다 3.5 아래에서 시작해 되레
// 어긋나 보인다(시안 비교로 확인). 눈이 읽는 건 선언값이 아니라 잉크의 자리다.
//
// ⚠ 예전엔 이 축이 아예 없었다 — 여백이 Box 사다리(12 · 8)에서 오고 글자는 text.size.body
// 를 봤다. 값이 우연히 14 로 같았을 뿐 컨트롤 축과 연결되지 않았다.
export const textareaSize = styleVariants(
  ladderRules((s) => ({
    height: null, // 줄 수(rows)가 정한다 — 이 축만 베이스에서 뺀다
    paddingBlock: tokens.shape.controlPaddingY[s],
    paddingInline: tokens.shape.inputPaddingX[s],
  })),
);
