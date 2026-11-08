import { usePress } from "@react-aria/interactions";
import { useRef, type HTMLAttributes, type RefObject } from "react";

import type { PressableOptions } from "../../primitives/types";

const ACTIVATION_KEYS: readonly string[] = ["Enter", " "];
const CLICKS_BY_ITSELF = "button, input, a[href], area[href], summary";

// React Aria keeps the browser from clicking on the keys it handles, so the click is made here and one press is one click.
// Enter on a Mac is kept back too: a click that moves focus would take the key-up from the pressed element and lose its press.
export function useAriaPress(
  { disabled, cancelOnPointerExit, allowTextSelection, onPress, ...options }: PressableOptions,
  ref: RefObject<HTMLElement | null>,
): { pressProps: HTMLAttributes<HTMLElement>; isActive: boolean } {
  const clickKeptBack = useRef(false);
  const { pressProps, isPressed } = usePress({
    ...options,
    onPress: (event) => {
      onPress?.(event);
      if (event.pointerType === "keyboard" && (clickKeptBack.current || !event.target.matches(CLICKS_BY_ITSELF))) (event.target as HTMLElement).click();
    },
    isDisabled: disabled,
    shouldCancelOnPointerExit: cancelOnPointerExit,
    allowTextSelectionOnPress: allowTextSelection,
    ref,
  });
  return {
    pressProps: {
      ...pressProps,
      onKeyDown: (event) => {
        pressProps.onKeyDown?.(event);
        const target = event.currentTarget;
        if (event.key === "Enter" && !event.defaultPrevented && !event.ctrlKey && event.target === target && target.tagName === "BUTTON" && (target as HTMLButtonElement).type === "button") event.preventDefault();
        if (ACTIVATION_KEYS.includes(event.key)) clickKeptBack.current = event.defaultPrevented;
      },
    },
    isActive: isPressed,
  };
}
