import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

// The portal root takes no box of its own: the panel inside lays out as if it stood in the container.
export const portalRoot = style({ display: "contents" });
