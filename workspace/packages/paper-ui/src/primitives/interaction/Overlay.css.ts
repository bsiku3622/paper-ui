import { createVar, fallbackVar, style } from "@vanilla-extract/css";
import { tokens } from "../../tokens";

export const layerDepth = createVar();
const { overlay, modal } = tokens.layout.elevation;
const step = `(${modal.z} - ${overlay.z})`;
export const backdrop = style({ position: "fixed", inset: 0, zIndex: `calc(${modal.z} + ${fallbackVar(layerDepth, "0")} * ${step})`, display: "grid", placeItems: "center", background: tokens.color.overlay.scrim, padding: tokens.layout.gutter });
export const surface = style({ position: "relative", maxWidth: "100%", maxHeight: "100%", overflow: "auto" });
export const floating = style({ zIndex: `calc(${overlay.z} + ${fallbackVar(layerDepth, "0")} * ${step})` });
