import { styleVariants } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const radioGroupOrientation = styleVariants({
  vertical: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: tokens.shape.gap.sm,
  },
  horizontal: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: tokens.shape.gap.lg,
    rowGap: tokens.shape.gap.sm,
  },
});
