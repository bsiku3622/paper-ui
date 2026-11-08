// What Paper lacked for the Markdown editor: a Textarea in the mono family (Paper's Textarea has no `family`). The editor's
// textarea takes Paper's own mono face and tracking from here (content/MonoScope.tsx).

import { globalStyle, style } from "@vanilla-extract/css";

import { monoRule } from "@studio-baeks/paper-ui/tokens";

export const mono = style({});

// Only the face and the tracking of Paper's mono; the size stays the field's.
globalStyle(`${mono} textarea`, { fontFamily: monoRule().fontFamily, letterSpacing: monoRule().letterSpacing });
