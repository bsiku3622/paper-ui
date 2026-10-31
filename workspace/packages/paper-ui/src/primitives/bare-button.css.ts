import { stateSelector } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, globalStyle } = layered("components");

// Geometry and color are added by consumers. The class carries no declarations of its own: they sit under :where(),
// so any appearance class wins whatever the order of the stylesheets. Native button semantics stay intact.
export const bareButton = style({});
globalStyle(`:where(${bareButton})`, {
  appearance: "none", margin: 0, padding: 0, border: "none", background: "none",
  color: "inherit", font: "inherit", letterSpacing: "inherit", textAlign: "inherit",
  cursor: "pointer",
});
globalStyle(`:where(${bareButton}${stateSelector("disabled")})`, { cursor: "not-allowed" });
