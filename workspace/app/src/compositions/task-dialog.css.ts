import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

// The dialog's face is a Surface's (the caller picks it, as Floating says); this sizes and spaces it.
export const dialog = style({ width: 360, maxWidth: "100%", padding: tokens.shape.inset.lg, color: tokens.color.ink.primary });
