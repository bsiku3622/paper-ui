import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition, TEXT_VARIANTS, type TextVariant } from "../tokens";
import { ladderRules } from "../internal/sizeLadder";

// 크기(height·좌우 padding)는 size 축(selectSize)이 정한다 — Button·Field 와
// 같은 사다리를 그대로 가져온다. 오른쪽만 화살표 자리라 size 무관하게 넉넉히 고정.
export const selectRoot = style({
  width: "100%",
  background: tokens.color.bg.raised,
  borderRadius: tokens.shape.radius.interaction,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
  color: tokens.color.ink.primary,
  cursor: "pointer",
  appearance: "none",
  // 드롭다운 화살표는 background-image data-URI 라 currentColor 를 못 물려받는다(배경
  // SVG 의 알려진 한계). 그래서 stroke 색을 ink.soft 로 박되, 다크에선 아래 selector 로
  // 다크 ink.soft 색 이미지로 통째 교체한다(테마마다 한 장씩). 빈 value option 이 선택된
  // 동안에는 글자와 같이 ink.faint 로 낮춘다.
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='%2371717a' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: `right ${tokens.shape.padding.md.interaction} center`,
  backgroundSize: tokens.shape.atom.selectArrow,
  transition: stateTransition("border-color", "box-shadow", "background-color"),
  selectors: {
    // native select 에는 placeholder 속성이 없으므로, value="" option 이 선택된 상태가
    // 곧 placeholder 상태다. :has()로 option의 실제 선택 상태를 읽어 controlled·uncontrolled
    // 양쪽에서 별도 상태 관리 없이 같은 색을 쓴다.
    "&:has(option[value=\"\"]:checked)": {
      color: tokens.color.ink.tertiary,
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='%23a1a1aa' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
    },
    "&:hover:not(:focus)": { borderColor: tokens.color.border.hover },
    "&[data-pui-pointer-focus]:focus": { borderColor: tokens.color.ink.secondary },
    // keyboard focus만 바깥 ring으로 알린다. 클릭은 native open state와 edge로 충분하다.
    "&:focus-visible:not([data-pui-pointer-focus])": {
      outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.interaction.focus}`,
      outlineOffset: tokens.shape.constants.focusRingOffset,
    },
    // text-like native controls can still match :focus-visible after a click. Override the
    // global focus rule while pointer focus is active.
    "&[data-pui-pointer-focus]:focus-visible": { outline: "none" },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
    // 다크 — 화살표 stroke 를 다크 ink.soft(#a1a1aa)로. 어두운 필드 위 대비 회복.
    ':where([data-theme="dark"]) &': {
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='%23a1a1aa' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
    },
    ':where([data-theme="dark"]) &:has(option[value=""]:checked)': {
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='%238b8b92' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
    },
  },
});

// size 3 단 — 가로는 Field 와 같은 입력칸 여백으로 갈아 끼우고, 오른쪽만 화살표 자리로
// 한 번 더 덮는다. Select 는 값을 *고르는* 상자라 값을 *쓰는* 상자와 같은 열에 서야 한다.
//
// ⚠ 예전엔 사다리를 손으로 베껴 쓰면서 좌우 여백만 Box 사다리(`padding[s].interaction`
// = 8·12·16)에서 가져왔다. 주석은 "Button·Field 와 같은 공통 사다리" 라고 말하는데 실제
// 값은 매 단 1~2px 어긋나 있었다. **사다리를 베끼면 언젠가 갈라진다 — 통로로 나간다.**
//
// paddingInlineEnd 가 paddingInline 뒤에 와서 오른쪽만 덮어쓴다(같은 규칙 안에서는 나중
// 선언이 이긴다). 둘 다 논리 속성이라 RTL 에서도 화살표 쪽이 열린다.
export const selectSize = styleVariants(
  ladderRules((s) => ({
    paddingInline: tokens.shape.inputPaddingX[s],
    paddingInlineEnd: tokens.shape.padding.xl.interaction,
  })),
);

export const selectFontSize = styleVariants(
  Object.fromEntries(TEXT_VARIANTS.map((variant) => [variant, { fontSize: tokens.text.style[variant].size }])) as Record<TextVariant, { fontSize: string }>,
);

// 알약 — Field 와 같은 어휘. 화살표는 오른쪽 여백 24 안에 앉아 곡선과 안 부딪친다
// (곡선이 가장 많이 파고드는 건 위아래고, 화살표는 세로 중앙이다).
// selectRoot 뒤에 와서 같은 특정도를 순서로 이긴다.
export const selectPill = style({ borderRadius: tokens.shape.radius.full });
