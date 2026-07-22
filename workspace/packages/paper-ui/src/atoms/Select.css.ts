import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition, SPACE_KEYS, type Space } from "../tokens";

// 크기(height·fontSize·왼쪽 padding)는 size 축(selectSize)이 정한다 — Button·Field 와
// 같은 사다리. 오른쪽 padding 은 화살표 자리라 size 무관하게 넉넉히 고정.
export const selectRoot = style({
  width: "100%",
  background: tokens.color.paper.base,
  borderRadius: tokens.shape.radius.interaction,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
  color: tokens.color.ink.base,
  fontFamily: tokens.text.font.sans,
  cursor: "pointer",
  appearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='%2371717a' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: `right ${tokens.shape.padding.md.interaction} center`,
  backgroundSize: tokens.shape.atom.selectArrow,
  transition: stateTransition("border-color", "box-shadow", "background-color"),
  selectors: {
    "&:hover:not(:focus)": { borderColor: tokens.color.border.strong },
    "&:focus": {
      outline: "none",
      borderColor: tokens.color.focus.ring,
      boxShadow: `0 0 0 3px ${tokens.color.accent.blue.wash}`,
    },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
});

// size 5 단 — Button·Field 와 같은 공통 사다리. 오른쪽은 화살표 자리라 xl 고정.
export const selectSize = styleVariants(
  Object.fromEntries(
    SPACE_KEYS.map((s) => [
      s,
      {
        height: tokens.shape.height[s].interaction,
        fontSize: tokens.shape.fontSize[s],
        paddingLeft: tokens.shape.padding[s].interaction,
        paddingRight: tokens.shape.padding.xl.interaction,
      },
    ]),
  ) as Record<Space, { height: string; fontSize: string; paddingLeft: string; paddingRight: string }>,
);
