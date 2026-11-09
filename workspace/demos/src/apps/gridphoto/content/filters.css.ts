import { styleVariants } from "@vanilla-extract/css";

export const photoFilter = styleVariants({
  original: {},
  scan: { filter: "contrast(1.12) brightness(1.05) saturate(0.9)" },
  bw: { filter: "grayscale(1) brightness(0.96) contrast(1.6)" },
});
