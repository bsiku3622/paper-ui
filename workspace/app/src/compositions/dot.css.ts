import { styleVariants } from "@vanilla-extract/css";

import { STATUSES, tokens, type Status } from "@studio-baeks/paper-ui/tokens";

// A status dot is filled with the accent's solid; an ink dot takes the ink as its colour and paints with it.
export const status = styleVariants(
  Object.fromEntries(STATUSES.map((name) => [name, { backgroundColor: tokens.color.accent[name].solid }])) as Record<Status, { backgroundColor: string }>,
);
export const ink = styleVariants(tokens.color.ink, (color) => ({ color, backgroundColor: "currentColor" }));

export const size = styleVariants({
  xs: { width: "0.4rem", height: "0.4rem" },
  sm: { width: "0.55rem", height: "0.55rem" },
  md: { width: "1rem", height: "1rem" },
});
