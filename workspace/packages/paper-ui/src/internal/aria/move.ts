import { useMove } from "@react-aria/interactions";
import type { HTMLAttributes } from "react";

// Pointer and arrow-key movement as deltas. The caller turns them into a position.
export function useAriaMove(events: {
  onMoveStart?: (input: { pointerType: string }) => void;
  onMove?: (input: { deltaX: number; deltaY: number }) => void;
  onMoveEnd?: () => void;
}): { moveProps: HTMLAttributes<HTMLElement> } {
  const { moveProps } = useMove(events);
  return { moveProps };
}
