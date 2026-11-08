import { style, styleVariants } from "@vanilla-extract/css";

import { STATUSES, SYSTEM_COLORS, tokens, type Status } from "@studio-baeks/paper-ui/tokens";

export const status = styleVariants(
  Object.fromEntries(STATUSES.map((name) => [name, { backgroundColor: tokens.color.accent[name].solid }])) as Record<Status, { backgroundColor: string }>,
);
export const ink = styleVariants(tokens.color.ink, (color) => ({ color, backgroundColor: "currentColor" }));

// Declared after the two rules above so it wins by order.
export const forced = style({ "@media": { "(forced-colors: active)": { forcedColorAdjust: "none", backgroundColor: SYSTEM_COLORS.canvasText } } });

export const size = styleVariants({
  xs: { width: "0.4rem", height: "0.4rem" },
  sm: { width: "0.55rem", height: "0.55rem" },
  md: { width: "1rem", height: "1rem" },
});
