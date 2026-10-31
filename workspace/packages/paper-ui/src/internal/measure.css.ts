import { tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { styleVariants } = layered("components");

// A probe takes no room and is never seen: all that is read of it is the width its step resolves to where it stands.
const probe = { position: "absolute", visibility: "hidden", pointerEvents: "none", blockSize: 0 } as const;

export const stepProbe = styleVariants({ ...tokens.layout.gap, gutter: tokens.layout.gutter }, (inlineSize) => ({ ...probe, inlineSize }));
