import { stateSelector } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, globalStyle } = layered("components");

export const dragSurface = style({});
globalStyle(`:where(${dragSurface})`, { touchAction: "none", cursor: "grab" });
globalStyle(`:where(${dragSurface}${stateSelector("dragging")})`, { cursor: "grabbing" });
globalStyle(`:where(${dragSurface}${stateSelector("disabled")})`, { cursor: "not-allowed" });

export const dropSurface = style({});
globalStyle(`:where(${dropSurface}${stateSelector("disabled")})`, { cursor: "not-allowed" });
