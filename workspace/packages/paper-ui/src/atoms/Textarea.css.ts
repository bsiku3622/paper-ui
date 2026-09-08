import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition, CONTROL_SIZES, type ControlSize } from "../tokens";

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

// size 3 단 — 여백 두 축 + 글자. **height 는 빼고 가져온다.** 공통 사다리(sizeLadderRules)
// 는 height 를 박는데 Textarea 는 줄 수만큼 자라야 해서, 그 자리를 controlPaddingY 가
// 대신 든다((height − 테두리 2 − 줄상자 21) / 2 라, 첫 줄이 같은 size 의 Field 와 같은
// 자리에서 시작한다 — Field 가 34 짜리 상자 안에 21 짜리 줄상자를 가운데 두는 그 자리다).
//
// ⚠ 예전엔 이 축이 아예 없었다 — 여백이 Box 사다리(12 · 8)에서 오고 글자는 text.size.body
// 를 봤다. 값이 우연히 14 로 같았을 뿐 컨트롤 축과 연결되지 않아, 컨트롤 글자를 바꿔도
// Textarea 만 안 따라오고 가로 여백은 Field 보다 1px 좁았다.
export const textareaSize = styleVariants(
  Object.fromEntries(
    CONTROL_SIZES.map((s) => [
      s,
      {
        paddingBlock: tokens.shape.controlPaddingY[s],
        paddingInline: tokens.shape.controlPaddingX[s],
        fontSize: tokens.shape.controlFontSize[s],
      },
    ]),
  ) as Record<ControlSize, { paddingBlock: string; paddingInline: string; fontSize: string }>,
);
