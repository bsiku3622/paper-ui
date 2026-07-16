import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// 탭 줄 자체가 괘선이다 — 아래 선 위에 탭이 앉는다.
export const tabsList = style({
  borderBottomWidth: tokens.shape.ruleWidth.base,
  borderBottomStyle: "solid",
  borderBottomColor: tokens.color.rule.base,
});

export const tabItem = style({
  appearance: "none",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: `${tokens.shape.space.sm} 0`,
  fontFamily: tokens.font.sans,
  fontSize: "0.875rem",
  fontWeight: "500",
  color: tokens.color.ink.soft,
  // 선택 표시는 밑줄 — 잉크로 그은 획.
  borderBottomWidth: "2px",
  borderBottomStyle: "solid",
  borderBottomColor: "transparent",
  marginBottom: `calc(-1 * ${tokens.shape.ruleWidth.base})`,
  selectors: { "&:hover": { color: tokens.color.ink.base } },
});

export const tabItemActive = style({
  color: tokens.color.ink.base,
  borderBottomColor: tokens.color.ink.base,
});
