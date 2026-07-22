import { style, keyframes } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// enter 모션의 등장 변위(offset·scale)를 motion.enter 에서 읽어 keyframe 에 인라인.
const { enter } = tokens.motion.role;
const fade = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const rise = keyframes({
  from: { opacity: 0, transform: `translateY(${enter.offset}) scale(${enter.scale})` },
  to: { opacity: 1, transform: "translateY(0) scale(1)" },
});

export const modalBackdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: tokens.layout.z.modal,
  display: "grid",
  placeItems: "center",
  padding: tokens.shape.padding.xl.interaction,
  background: "rgba(24, 25, 28, 0.32)",
  animation: `${fade} ${tokens.motion.duration.base} ${tokens.motion.easing.standard}`,
});

export const modalPanel = style({
  width: "100%",
  maxWidth: tokens.shape.atom.modalWidth,
  animation: `${rise} ${enter.duration} ${enter.easing}`,
});
