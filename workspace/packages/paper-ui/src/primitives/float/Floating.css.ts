import { createVar, fallbackVar } from "@vanilla-extract/css";
import { tokens, elevationCast, elevationStack } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, styleVariants } = layered("components");

// How many panels of its tier already stand under this one; Floating.tsx writes it where the panel renders.
// createVar returns the var() reference, and the inline style that sets it is keyed by the property inside it.
const rank = createVar();
export const rankProperty = rank.slice("var(".length, -")".length);
const nested = fallbackVar(rank, "0");

// Floating draws its own elevation: the stack and the cast of the tier, never the panel's fill, border or radius.
export const stack = styleVariants({ overlay: elevationStack("overlay", nested), modal: elevationStack("modal", nested) });
export const cast = styleVariants({ overlay: elevationCast("overlay"), modal: elevationCast("modal") });

export const backdrop = style({ position: "fixed", inset: 0, display: "grid", placeItems: "center", padding: tokens.layout.gutter });
export const surface = style({ position: "relative", maxWidth: "100%", maxHeight: "100%", overflow: "auto" });
