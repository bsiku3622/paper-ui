import { stateSelector } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, globalStyle } = layered("reset");

// Under :where() in the reset layer, below every layer an appearance class lives in, so any of them wins whatever the stylesheet order.
export const bareButton = style({});
globalStyle(`:where(${bareButton})`, {
  appearance: "none", margin: 0, padding: 0, border: "none", background: "none",
  color: "inherit", font: "inherit", letterSpacing: "inherit", textAlign: "inherit",
  cursor: "pointer",
});
globalStyle(`:where(${bareButton}${stateSelector("disabled")})`, { cursor: "not-allowed" });
