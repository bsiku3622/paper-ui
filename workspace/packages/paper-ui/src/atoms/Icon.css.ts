import { style } from "@vanilla-extract/css";

export const iconRoot = style({
  display: "inline-block",
  flexShrink: 0,
  width: "1rem",
  height: "1rem",
  // 잉크색을 그대로 물려받는다 — 아이콘은 글자의 일부다.
  stroke: "currentColor",
  fill: "none",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});
