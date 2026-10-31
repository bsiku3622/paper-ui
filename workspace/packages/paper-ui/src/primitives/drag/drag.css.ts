import { stateSelector } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, globalStyle } = layered("components");

// The grab affordance of a draggable surface. The class carries no declarations of its own: they sit under :where(),
// so any appearance class wins whatever the order of the stylesheets.
export const dragSurface = style({});
globalStyle(`:where(${dragSurface})`, { touchAction: "none", cursor: "grab" });
globalStyle(`:where(${dragSurface}${stateSelector("dragging")})`, { cursor: "grabbing" });
globalStyle(`:where(${dragSurface}${stateSelector("disabled")})`, { cursor: "not-allowed" });

// A drop target has no affordance of its own while it is enabled; a disabled one shows that it takes nothing.
export const dropSurface = style({});
globalStyle(`:where(${dropSurface}${stateSelector("disabled")})`, { cursor: "not-allowed" });
