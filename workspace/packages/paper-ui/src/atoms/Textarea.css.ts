import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition, TEXT_VARIANTS, type TextVariant } from "../tokens";
import { ladderRules } from "../internal/sizeLadder";

// Field 와 같은 결의 여러 줄 입력. 높이만 자라고, 세로로만 resize.
// 크기(padding·fontSize)는 size 축(textareaSize)이 정한다 — 컨트롤 높이·글자 사다리를
// 공유하고, 여러 줄 입력에 필요한 세로 여백만 별도 축으로 보정한다.
export const textareaRoot = style({
  width: "100%",
  // 줄 수가 높이를 정하므로(rows) 여기서 잡는 건 바닥뿐이다.
  minHeight: tokens.shape.height.sm.layout,
  background: tokens.color.bg.raised,
  borderRadius: tokens.shape.radius.interaction,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
  color: tokens.color.ink.primary,
  resize: "vertical",
  transition: stateTransition("border-color", "box-shadow", "background"),
  selectors: {
    "&::placeholder": { color: tokens.color.ink.tertiary },
    '&[data-pui-status="default"]:hover:not(:focus):not(:disabled)': {
      borderColor: tokens.color.border.hover,
    },
    '&[data-pui-status="default"][data-pui-pointer-focus]:focus': {
      borderColor: tokens.color.ink.secondary,
    },
    // keyboard focus만 바깥 ring으로 알린다. 클릭은 caret과 edge만 남긴다.
    "&:focus-visible:not([data-pui-pointer-focus])": {
      outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.interaction.focus}`,
      outlineOffset: tokens.shape.constants.focusRingOffset,
    },
    "&[data-pui-pointer-focus]:focus-visible": { outline: "none" },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
});

// size 3 단 — 베이스에서 **height 를 빼고**(줄 수가 정한다) 세로 여백을 더한다.
// 가로와 글자는 베이스 그대로다.
//
// **잉크가 사방 같은 거리에 앉는다** — 여기서는 정사각이 뜻을 갖는다. 글이 여러 줄로
// 흐르면 위·아래·좌·우가 다 보이기 때문이다(한 줄짜리 Field 는 좌우만 보인다).
//
// 세로 선언값(5.75)이 가로(9)보다 작은 건 재는 대상이 달라서다 — 줄상자에 이미 반 줄
// 여백 3.25가 들어 있어, 1 + 5.75 + 3.25 = 10으로 가로(1 + 9)와 같은 자리가 된다. 선언값을
// 정사각으로 맞추면 되레 첫 줄이 왼쪽 여백보다 3.25 내려간다 — 눈이 읽는 건 선언값이
// 아니라 잉크의 자리다.
export const textareaSize = styleVariants(
  ladderRules((s) => ({
    height: null, // 줄 수(rows)가 정한다 — 이 축만 베이스에서 뺀다
    paddingInline: tokens.shape.inputPaddingX[s],
    paddingBlock: tokens.shape.textareaPaddingY[s],
  })),
);

export const textareaFontSize = styleVariants(
  Object.fromEntries(TEXT_VARIANTS.map((variant) => [variant, { fontSize: tokens.text.style[variant].size }])) as Record<TextVariant, { fontSize: string }>,
);
