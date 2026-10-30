import { useCallback, useRef, type HTMLAttributes, type RefCallback } from "react";

import { useAriaDrop } from "../../internal/aria/dnd";
import { stateAttributes, type StateAttributes } from "../../tokens";
import type { DropOptions } from "../types";

export type DropResult = {
  /** Spread on the drop target. Carries its own ref, `data-drop-target` while a drag is over it and `data-disabled` while disabled. */
  dropProps: HTMLAttributes<HTMLElement> & { ref: RefCallback<HTMLElement> } & StateAttributes<"dropTarget" | "disabled">;
  isDropTarget: boolean;
};

export function useDrop(options: DropOptions = {}): DropResult {
  const target = useRef<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => { target.current = node; }, []);
  const { dropProps, isDropTarget } = useAriaDrop(options, target);
  return {
    dropProps: { ...dropProps, ref, "aria-disabled": options.disabled || undefined, ...stateAttributes({ dropTarget: isDropTarget, disabled: options.disabled }) },
    isDropTarget,
  };
}
