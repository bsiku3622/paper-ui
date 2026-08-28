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
  background: tokens.color.scrim, // 테마 인식 — 다크에선 더 짙어져 앞면을 띄운다
  animation: `${fade} ${tokens.motion.duration.base} ${tokens.motion.easing.standard}`,
});

export const modalPanel = style({
  width: "100%",
  maxWidth: tokens.shape.atom.modalWidth,
  animation: `${rise} ${enter.duration} ${enter.easing}`,
  // 열릴 때 포커스가 패널로 들어오지만(트랩 진입점) 컨테이너라 링은 안 보인다 —
  // 링은 안쪽 컨트롤에만. (전역 :focus-visible 을 이긴다: &:focus 가 더 구체적)
  selectors: {
    "&:focus, &:focus-visible": { outline: "none" },
  },
});
