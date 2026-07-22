import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, STATUS, STATUS_ACCENT, stateTransition, CONTROL_SIZES, type ControlSize } from "../tokens";
import type { StatusName } from "../tokens";
import { sizeLadderRules } from "../internal/sizeLadder";

// 흰 면 + 옅은 괘선. 어떤 바탕(흰 캔버스 · 흰 카드) 위에서도 입력칸이 보이도록 흰색
// 으로 한 단 띄우고, 테두리는 옅은 border.base(hover 때만 border.strong). 포커스 때만
// 파란 링. 크기(height·padding·fontSize)는 size 축(fieldSize)이 정한다 — Button 과
// 같은 사다리라 나란히 두면 높이가 맞는다.
export const fieldRoot = style({
  width: "100%",
  background: tokens.color.paper.base,
  borderRadius: tokens.shape.radius.interaction,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
  color: tokens.color.ink.base,
  fontFamily: tokens.text.font.sans,
  transition: stateTransition("border-color", "box-shadow", "background"),
  selectors: {
    "&::placeholder": { color: tokens.color.ink.faint },
    // hover 는 배경을 흔들지 않고 테두리만 한 단 또렷하게 (흰 면 유지)
    "&:hover:not(:focus):not(:disabled)": { borderColor: tokens.color.border.strong },
    "&:focus": {
      outline: "none",
      borderColor: tokens.color.focus.ring,
      boxShadow: `0 0 0 3px ${tokens.color.accent.blue.wash}`,
    },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
});

// size 3 단 — Button 과 같은 공통 사다리 (height × paddingInline × fontSize).
export const fieldSize = styleVariants(
  Object.fromEntries(CONTROL_SIZES.map((s) => [s, sizeLadderRules[s]])) as Record<ControlSize, (typeof sizeLadderRules)[ControlSize]>,
);

// status — 상태 색 테두리. 포커스(파란 링)보다 약해, 포커스하면 파란 링이 이긴다.
// (:focus 셀렉터가 뒤에 오는 fieldRoot 와 특정도 동일 → 소스 순서상 focus 우선)
export const fieldStatus = styleVariants(
  Object.fromEntries(
    STATUS.map((s) => [s, { borderColor: tokens.color.accent[STATUS_ACCENT[s]].solid }]),
  ) as Record<StatusName, { borderColor: string }>,
);

// 수치 입력 — sans 그대로 tabular-nums 로 자리만 맞추고 우측정렬. (mono 로 시끄럽게
// 하지 않는다 — 숫자라고 무조건 등폭이 아니다.)
export const fieldNumeric = style({
  fontVariantNumeric: "tabular-nums",
  textAlign: "right",
});
