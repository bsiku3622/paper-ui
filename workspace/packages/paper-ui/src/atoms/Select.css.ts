import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// native select. 목록 UI 를 직접 만들면 접근성·키보드·모바일을 전부 다시 짜야 한다.
// 20 개 시스템에서 그건 사치다 — 브라우저가 이미 옳게 한다.
export const selectRoot = style({
  height: tokens.shape.height.control,
  width: "100%",
  paddingInline: tokens.shape.space.md,
  paddingRight: tokens.shape.space.xl,
  background: tokens.color.paper.sunk,
  borderRadius: tokens.shape.radius.base,
  borderWidth: tokens.shape.ruleWidth.base,
  borderStyle: "solid",
  borderColor: tokens.color.rule.base,
  color: tokens.color.ink.base,
  fontFamily: tokens.font.sans,
  fontSize: "0.875rem",
  cursor: "pointer",
  appearance: "none",
  // 화살표 — 잉크색 선 두 개.
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='%236b655c' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.75rem center",
  backgroundSize: "0.625rem",
  selectors: { "&:disabled": { opacity: 0.5, cursor: "not-allowed" } },
});
