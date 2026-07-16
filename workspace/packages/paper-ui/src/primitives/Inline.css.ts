import { style, styleVariants } from "@vanilla-extract/css";

export const inlineRoot = style({ display: "flex", flexDirection: "row", minWidth: 0 });

export const inlineAlign = styleVariants({
  start: { alignItems: "flex-start" },
  center: { alignItems: "center" },
  end: { alignItems: "flex-end" },
  baseline: { alignItems: "baseline" },
});

export const inlineJustify = styleVariants({
  start: { justifyContent: "flex-start" },
  center: { justifyContent: "center" },
  end: { justifyContent: "flex-end" },
  between: { justifyContent: "space-between" },
});

export const inlineWrap = style({ flexWrap: "wrap" });
