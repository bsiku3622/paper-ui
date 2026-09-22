import { keyframes, style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";
import { ladderRules } from "../internal/sizeLadder";

const revealPanel = keyframes({
  from: { opacity: 0, transform: "translateY(2px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

export const tabsRoot = style({ display: "block", minWidth: 0 });
export const tabsList = style({ display: "inline-flex", gap: 0, padding: 0, background: "transparent", borderBottomWidth: tokens.shape.constants.borderWidth, borderBottomStyle: "solid", borderBottomColor: tokens.color.border.base });
export const tabItem = style({ appearance: "none", background: "transparent", border: "none", borderRadius: 0, borderBottomWidth: tokens.shape.constants.focusRingWidth, borderBottomStyle: "solid", borderBottomColor: "transparent", marginBottom: `calc(${tokens.shape.constants.borderWidth} * -1)`, cursor: "pointer", fontFamily: tokens.text.font.sans, fontWeight: tokens.text.weight.medium, color: tokens.color.content.secondary, transition: stateTransition("color", "border-color"), selectors: { "&:hover": { color: tokens.color.content.primary } } });
export const tabItemSize = styleVariants(ladderRules());
export const tabItemActive = style({ color: tokens.color.content.primary, borderBottomColor: tokens.color.action.primary.base });
// Content는 surface를 강제하지 않는다. Tabs는 page 안의 구역을 전환하는 navigation이라
// panel마다 면을 씌우면 소비처의 layout과 충돌한다. 대신 trigger와 본문 사이의 리듬,
// 키보드로 진입할 수 있는 panel box, 짧은 상태 전환만 시스템이 책임진다.
export const tabContent = style({
  width: "100%",
  minWidth: 0,
  paddingBlockStart: tokens.shape.gap.md,
  animation: `${revealPanel} ${tokens.motion.role.state.duration} ${tokens.motion.role.state.easing}`,
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});
