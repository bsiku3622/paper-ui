import { globalStyle, style } from "@vanilla-extract/css";

import { monoRule } from "@studio-baeks/paper-ui/tokens";

export const mono = style({});

globalStyle(`${mono} textarea`, { fontFamily: monoRule().fontFamily, letterSpacing: monoRule().letterSpacing });
