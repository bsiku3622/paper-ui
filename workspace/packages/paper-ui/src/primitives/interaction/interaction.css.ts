import { style } from "@vanilla-extract/css";

// Geometry and color are added by consumers. Native button semantics stay intact.
export const bareButton = style({
  appearance: "none", margin: 0, padding: 0, border: "none", background: "none",
  color: "inherit", font: "inherit", letterSpacing: "inherit", textAlign: "inherit",
  cursor: "pointer", selectors: { "&:disabled": { cursor: "not-allowed" } },
});
export const dragSurface = style({ touchAction: "none", cursor: "grab", selectors: { '&[data-dragging="true"]': { cursor: "grabbing" }, '&[aria-disabled="true"]': { cursor: "default" } } });
