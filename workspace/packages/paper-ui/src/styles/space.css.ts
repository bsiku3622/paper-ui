import { tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { styleVariants } = layered("utilities");

// Declaration order is cascade order: padding yields to paddingX and paddingY, gap to rowGap and columnGap.
export const spaceClass = {
  padding: styleVariants(tokens.shape.inset, (inset) => ({ padding: inset })),
  paddingX: styleVariants(tokens.shape.inset, (inset) => ({ paddingInline: inset })),
  paddingY: styleVariants(tokens.shape.inset, (inset) => ({ paddingBlock: inset })),
  gap: styleVariants(tokens.layout.gap, (gap) => ({ gap })),
  rowGap: styleVariants(tokens.layout.gap, (gap) => ({ rowGap: gap })),
  columnGap: styleVariants(tokens.layout.gap, (gap) => ({ columnGap: gap })),
} as const;
