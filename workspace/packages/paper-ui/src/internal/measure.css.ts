import { tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { styleVariants } = layered("components");

const probe = { position: "absolute", visibility: "hidden", pointerEvents: "none", blockSize: 0 } as const;

export const stepProbe = styleVariants({ ...tokens.layout.gap, gutter: tokens.layout.gutter }, (inlineSize) => ({ ...probe, inlineSize }));
