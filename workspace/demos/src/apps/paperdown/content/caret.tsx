// Content: a point at the caret. Floating's popover stands beside an element (`anchorRef`), and a caret in a paper is not
// one, so the slash menu is anchored to this invisible point put where the caret is.

import { forwardRef } from "react";

export const CaretAnchor = forwardRef<HTMLSpanElement, { left: number; top: number; height: number }>(function CaretAnchor({ left, top, height }, ref) {
  return <span ref={ref} aria-hidden style={{ position: "fixed", left, top, width: 0, height, pointerEvents: "none" }} />;
});
