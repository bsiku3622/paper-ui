import { tokens } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

export const formField = style({ display: "flex", flexDirection: "column", gap: tokens.layout.gap.xs, minWidth: 0 });
