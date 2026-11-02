import { tokens } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

// A label, its control and the words under it read as one thing, so the field holds the step between them itself.
export const formField = style({ display: "flex", flexDirection: "column", gap: tokens.layout.gap.xs, minWidth: 0 });
