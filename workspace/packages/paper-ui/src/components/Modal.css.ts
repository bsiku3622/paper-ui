import { style, keyframes } from "@vanilla-extract/css";

import { tokens } from "../tokens";

const fade = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const rise = keyframes({
  from: { opacity: 0, transform: "translateY(6px) scale(0.99)" },
  to: { opacity: 1, transform: "translateY(0) scale(1)" },
});

export const modalBackdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: tokens.shape.z.modal,
  display: "grid",
  placeItems: "center",
  padding: tokens.shape.space.xl,
  background: "rgba(24, 25, 28, 0.32)",
  animation: `${fade} 130ms ease`,
});

export const modalPanel = style({
  width: "100%",
  maxWidth: "27rem",
  animation: `${rise} 150ms cubic-bezier(0.22, 1, 0.36, 1)`,
});
