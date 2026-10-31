import { usePress } from "@react-aria/interactions";
import { useRef, type HTMLAttributes, type RefObject } from "react";

import type { PressableOptions } from "../../primitives/types";

const ACTIVATION_KEYS: readonly string[] = ["Enter", " "];
// The elements a browser clicks by itself when a key activates them.
const CLICKS_BY_ITSELF = "button, input, a[href], area[href], summary";

// React Aria's press, under Paper's names: disabled, cancelOnPointerExit, allowTextSelection. The press the
// hook reports is the transient one; Paper calls it active.
// React Aria keeps the browser from clicking on the keys it handles, unless it leaves the click to the browser: a
// submit button, a link, an input, Enter on a Mac. The click it kept back, and the one an element with no key
// activation of its own never gets, is made here. So one press is one click whatever the input and the platform,
// and a handler on the target needs no press of its own.
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
        if (ACTIVATION_KEYS.includes(event.key)) clickKeptBack.current = event.defaultPrevented;
      },
    },
    isActive: isPressed,
  };
}
