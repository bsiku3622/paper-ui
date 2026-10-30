import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

export const dragSurface = style({ touchAction: "none", cursor: "grab", selectors: { '&[data-dragging="true"]': { cursor: "grabbing" }, '&[aria-disabled="true"]': { cursor: "default" } } });
