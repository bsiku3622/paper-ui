import { useCallback, useRef, type HTMLAttributes, type RefCallback } from "react";

import { useAriaDrop } from "../../internal/aria/dnd";
import { stateAttributes, type StateAttributes } from "../../tokens";
import type { DroppableOptions } from "../types";

export type DroppableResult = {
  dropProps: HTMLAttributes<HTMLElement> & { ref: RefCallback<HTMLElement> } & StateAttributes<"dropTarget" | "disabled">;
  isDropTarget: boolean;
};

export function useDroppable(options: DroppableOptions = {}): DroppableResult {
  const target = useRef<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => { target.current = node; }, []);
  const { dropProps, isDropTarget } = useAriaDrop(options, target);
  return {
    dropProps: { ...dropProps, ref, "aria-disabled": options.disabled || undefined, ...stateAttributes({ dropTarget: isDropTarget, disabled: options.disabled }) },
    isDropTarget,
  };
}
