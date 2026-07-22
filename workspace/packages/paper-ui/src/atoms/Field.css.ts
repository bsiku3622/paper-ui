import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, STATUS, STATUS_ACCENT, stateTransition } from "../tokens";
import type { StatusName } from "../tokens";

// 옅은 회색 면. 포커스 때만 파란 링 (ChatGPT 의 입력 결).
export const fieldRoot = style({
  height: tokens.shape.height.md.interaction,
  width: "100%",
  paddingInline: tokens.shape.padding.md.interaction,
  background: tokens.color.paper.subtle,
  borderRadius: tokens.shape.radius.interaction,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: "transparent",
  color: tokens.color.ink.base,
  fontFamily: tokens.text.font.sans,
  fontSize: tokens.text.size.body,
  transition: stateTransition("border-color", "box-shadow", "background"),
  selectors: {
    "&::placeholder": { color: tokens.color.ink.faint },
    "&:hover:not(:focus):not(:disabled)": { background: tokens.color.paper.muted },
    "&:focus": {
      outline: "none",
      background: tokens.color.paper.base,
      borderColor: tokens.color.focus.ring,
      boxShadow: `0 0 0 3px ${tokens.color.accent.blue.wash}`,
    },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
});

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
