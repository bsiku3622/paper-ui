import { globalStyle } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui";

globalStyle(".palette-page", { maxWidth: "100%" });

globalStyle(".palette-grid", {
  display: "grid",
  gap: tokens.shape.gap.xs,
  minWidth: 0,
  overflowX: "auto",
  paddingBottom: tokens.shape.padding.xs.layout,
});

globalStyle(".palette-grid--neutral", {
  gridTemplateColumns: "repeat(14, minmax(3.5rem, 1fr))",
});

globalStyle(".palette-grid--accent", {
  gridTemplateColumns: "repeat(13, minmax(3.5rem, 1fr))",
});

globalStyle(".palette-cell", { minWidth: 0 });

globalStyle(".palette-swatch", {
  width: "100%",
  height: tokens.shape.height.xs.layout,
  boxSizing: "border-box",
  flexShrink: 0,
});

globalStyle(".palette-cell > :last-child", {
  overflowWrap: "anywhere",
});

globalStyle(".palette-interaction-grid", {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(8rem, 1fr))",
  gap: tokens.shape.gap.lg,
  minWidth: 0,
});
