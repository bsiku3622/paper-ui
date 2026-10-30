import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

// Geometry and color are added by consumers; layers make their classes win. Native button semantics stay intact.
export const bareButton = style({
  appearance: "none", margin: 0, padding: 0, border: "none", background: "none",
  color: "inherit", font: "inherit", letterSpacing: "inherit", textAlign: "inherit",
  cursor: "pointer", selectors: { "&:disabled": { cursor: "not-allowed" } },
});
