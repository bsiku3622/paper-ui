import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition, CONTROL_SIZES, type ControlSize } from "../tokens";

// 크기(height·fontSize·왼쪽 padding)는 size 축(selectSize)이 정한다 — Button·Field 와
// 같은 사다리. 오른쪽 padding 은 화살표 자리라 size 무관하게 넉넉히 고정.
export const selectRoot = style({
  width: "100%",
  background: tokens.color.paper.raised,
  borderRadius: tokens.shape.radius.interaction,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
  color: tokens.color.ink.base,
  fontFamily: tokens.text.font.sans,
  cursor: "pointer",
  appearance: "none",
  // 드롭다운 화살표는 background-image data-URI 라 currentColor 를 못 물려받는다(배경
  // SVG 의 알려진 한계). 그래서 stroke 색을 ink.soft 로 박되, 다크에선 아래 selector 로
  // 다크 ink.soft 색 이미지로 통째 교체한다(테마마다 한 장씩).
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='%2371717a' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: `right ${tokens.shape.padding.md.interaction} center`,
  backgroundSize: tokens.shape.atom.selectArrow,
  transition: stateTransition("border-color", "box-shadow", "background-color"),
  selectors: {
    "&:hover:not(:focus)": { borderColor: tokens.color.border.strong },
    // 포커스 — 보더 *바깥* 에 파란 링(outline). 전역/Checkbox 와 같은 방식.
    "&:focus": {
      outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.focus.ring}`,
      outlineOffset: tokens.shape.constants.focusRingOffset,
    },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
    // 다크 — 화살표 stroke 를 다크 ink.soft(#a1a1aa)로. 어두운 필드 위 대비 회복.
    ':where([data-theme="dark"]) &': {
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='%23a1a1aa' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
    },
  },
});

// size 3 단 — Button·Field 와 같은 공통 사다리(fontSize 는 controlFontSize 로 분리).
// 오른쪽은 화살표 자리라 넉넉히 고정.
export const selectSize = styleVariants(
  Object.fromEntries(
    CONTROL_SIZES.map((s) => [
      s,
      {
        height: tokens.shape.height[s].interaction,
        fontSize: tokens.shape.controlFontSize[s],
        paddingLeft: tokens.shape.padding[s].interaction,
        paddingRight: tokens.shape.padding.xl.interaction,
      },
    ]),
  ) as Record<ControlSize, { height: string; fontSize: string; paddingLeft: string; paddingRight: string }>,
);
