// Authored lengths, independent of UI roles. rem lengths scale with the root font;
// edge strokes stay in CSS px. Optical corrections remain private recipe values.
const rem = (px: number) => `${px / 16}rem`;

export const SHAPE_PALETTE = {
  space: {
    4: rem(4), 6: rem(6), 7: rem(7), 8: rem(8), 10: rem(10), 11: rem(11),
    12: rem(12), 14: rem(14), 16: rem(16), 20: rem(20), 24: rem(24), 32: rem(32),
  },
  size: {
    10: rem(10), 14: rem(14), 15: rem(15),
    16: rem(16), 18: rem(18), 20: rem(20), 22: rem(22), 24: rem(24),
    30: rem(30), 32: rem(32), 36: rem(36), 44: rem(44),
    64: rem(64), 72: rem(72), 96: rem(96), 108: rem(108), 144: rem(144),
    160: rem(160), 216: rem(216), 240: rem(240), 320: rem(320), 360: rem(360),
  },
  radius: { 2.5: rem(2.5), 3: rem(3), 3.5: rem(3.5), 4: rem(4), 6: rem(6), 8: rem(8), full: "999px" },
  stroke: { 1: "1px", 2: "2px", icon: "1.75" },
  measure: { 28: "28rem", 32: "32rem", 38: "38rem", 42: "42rem", 46: "46rem" },
} as const;
