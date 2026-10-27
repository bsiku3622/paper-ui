import { createVar, fallbackVar, style } from "@vanilla-extract/css";
import { tokens } from "../../tokens";

export const layerDepth = createVar();
const step = `(${tokens.layout.z.modal} - ${tokens.layout.z.overlay})`;
export const backdrop = style({ position: "fixed", inset: 0, zIndex: `calc(${tokens.layout.z.modal} + ${fallbackVar(layerDepth, "0")} * ${step})`, display: "grid", placeItems: "center", background: tokens.color.overlay.scrim, padding: tokens.shape.space.lg });
export const surface = style({ position: "relative", maxWidth: "100%", maxHeight: "100%", overflow: "auto" });
export const floating = style({ zIndex: `calc(${tokens.layout.z.overlay} + ${fallbackVar(layerDepth, "0")} * ${step})` });
