import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition, TEXT_VARIANTS, type TextVariant } from "../tokens";
import { outlinedControlProfile, outlinedControlHover } from "../styles/color-profile";
import { controlGeometry, geometry } from "../internal/shape";

// Field 와 같은 결의 여러 줄 입력. 높이만 자라고, 세로로만 resize.
// 크기(padding·fontSize)는 size 축(textareaSize)이 정한다 — 컨트롤 높이·글자 사다리를
// 공유하고, 여러 줄 입력에 필요한 세로 여백만 별도 축으로 보정한다.
export const textareaRoot = style({
  ...outlinedControlProfile,
  width: "100%",
  // 줄 수가 높이를 정하므로(rows) 여기서 잡는 건 바닥뿐이다.
  minHeight: geometry.textarea.minHeight,
  borderRadius: tokens.shape.radius.control,
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
  resize: "vertical",
  transition: stateTransition("border-color", "box-shadow", "background"),
  selectors: {
    "&::placeholder": { color: tokens.color.ink.tertiary },
    '&[data-pui-status="default"]:hover:not(:disabled)': {
      ...outlinedControlHover,
    },
    // keyboard focus만 바깥 ring으로 알린다. 클릭은 caret과 edge만 남긴다.
    "&:focus-visible:not([data-pui-pointer-focus])": {
      outline: `${tokens.shape.focus.width} solid ${tokens.color.interaction.focus}`,
      outlineOffset: tokens.shape.focus.offset,
    },
    "&[data-pui-pointer-focus]:focus-visible": { outline: "none" },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
});

// Block inset accounts for the textarea preset’s leading and font size.
export const textareaSize = styleVariants(
  controlGeometry.textarea,
);

export const textareaFontSize = styleVariants(
  Object.fromEntries(TEXT_VARIANTS.map((variant) => [variant, { fontSize: tokens.text.style[variant].size }])) as Record<TextVariant, { fontSize: string }>,
);
