import { globalStyle } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui";

globalStyle(".palette-page", { maxWidth: "100%" });

globalStyle(".palette-grid", {
  display: "grid",
  gap: tokens.shape.space.xs,
  minWidth: 0,
  overflowX: "auto",
  paddingBottom: tokens.layout.padding.xs,
});

globalStyle(".palette-grid--neutral", {
  gridTemplateColumns: "repeat(16, minmax(3.5rem, 1fr))",
});

globalStyle(".palette-grid--accent", {
  gridTemplateColumns: "repeat(14, minmax(3.5rem, 1fr))",
});

globalStyle(".palette-cell", { minWidth: 0 });

globalStyle(".palette-swatch", {
  width: "100%",
  height: tokens.layout.height.xs,
  boxSizing: "border-box",
  flexShrink: 0,
});

globalStyle(".palette-cell > :last-child", {
  overflowWrap: "anywhere",
});

globalStyle(".palette-interaction-grid", {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(8rem, 1fr))",
  gap: tokens.shape.space.lg,
  minWidth: 0,
});
