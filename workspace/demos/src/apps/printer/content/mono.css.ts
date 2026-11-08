import { globalStyle, style } from "@vanilla-extract/css";

import { monoRule } from "@studio-baeks/paper-ui/tokens";

export const monoField = style({});
globalStyle(`${monoField} input`, { ...monoRule() });

export const monoArea = style({ ...monoRule(), whiteSpace: "pre", overflowWrap: "normal", tabSize: 4 });

export const monoAreaWrap = style({ ...monoRule(), whiteSpace: "pre-wrap" });
