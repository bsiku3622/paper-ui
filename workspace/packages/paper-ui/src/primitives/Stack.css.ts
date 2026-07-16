import { style, styleVariants } from "@vanilla-extract/css";

export const stackRoot = style({ display: "flex", flexDirection: "column", minWidth: 0 });

export const stackAlign = styleVariants({
  start: { alignItems: "flex-start" },
  center: { alignItems: "center" },
  end: { alignItems: "flex-end" },
  stretch: { alignItems: "stretch" },
});
