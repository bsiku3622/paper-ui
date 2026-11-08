import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

export const page = style({ display: "grid", gridTemplateRows: "auto auto minmax(0, 1fr)", height: tokens.layout.viewport });

export const apps = style({ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 });

export const onlyNarrow = style({ "@media": { [`screen and (min-width: ${tokens.layout.breakpoint.lg})`]: { display: "none" } } });

export const frame = style({ display: "block", width: "100%", height: "100%", borderStyle: "none", backgroundColor: tokens.color.bg.canvas });
