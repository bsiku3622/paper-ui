import { style, keyframes } from "@vanilla-extract/css";

import { tokens } from "../tokens";

const fade = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const rise = keyframes({
  from: { opacity: 0, transform: "translateY(4px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

export const modalBackdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: tokens.shape.z.modal,
  display: "grid",
  placeItems: "center",
  padding: tokens.shape.space.lg,
  // 종이를 덮는 건 검정이 아니라 잉크의 옅은 층.
  background: "rgba(26, 25, 23, 0.28)",
  animation: `${fade} 120ms ease`,
});

export const modalPanel = style({
  width: "100%",
  maxWidth: "26rem",
  animation: `${rise} 140ms ease`,
});
