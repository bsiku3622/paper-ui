import { usePress } from "@react-aria/interactions";
import type { HTMLAttributes, RefObject } from "react";

import type { PressableOptions } from "../../primitives/types";

// React Aria's press, under Paper's names: disabled, cancelOnPointerExit, allowTextSelection. The press the
// hook reports is the transient one; Paper calls it active.
export function useAriaPress(
  { disabled, cancelOnPointerExit, allowTextSelection, ...options }: PressableOptions,
  ref: RefObject<HTMLElement | null>,
): { pressProps: HTMLAttributes<HTMLElement>; isActive: boolean } {
  const { pressProps, isPressed } = usePress({
    ...options,
    isDisabled: disabled,
    shouldCancelOnPointerExit: cancelOnPointerExit,
    allowTextSelectionOnPress: allowTextSelection,
    ref,
  });
  return { pressProps, isActive: isPressed };
}
