// What /demo needs that Paper's props do not say: a page as high as the window whose frame takes what the bars leave, the frame
// itself, and the app list that takes the free width of its row.

import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

export const page = style({ display: "grid", gridTemplateRows: "auto auto minmax(0, 1fr)", height: tokens.layout.viewport });

export const apps = style({ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 });

// Below lg the list of apps is a select; from lg up the row of tabs stands in its place.
export const onlyNarrow = style({ "@media": { [`screen and (min-width: ${tokens.layout.breakpoint.lg})`]: { display: "none" } } });

export const frame = style({ display: "block", width: "100%", height: "100%", borderStyle: "none", backgroundColor: tokens.color.bg.canvas });
