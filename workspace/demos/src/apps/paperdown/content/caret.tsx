import { forwardRef } from "react";

export const CaretAnchor = forwardRef<HTMLSpanElement, { left: number; top: number; height: number }>(function CaretAnchor({ left, top, height }, ref) {
  return <span ref={ref} aria-hidden style={{ position: "fixed", left, top, width: 0, height, pointerEvents: "none" }} />;
});
