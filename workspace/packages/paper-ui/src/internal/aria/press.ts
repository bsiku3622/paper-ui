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
// Enter on a Mac is kept back too, for a plain button: the browser would click it as the key goes down, and a
// click that moves focus (a Floating.Trigger opening its panel) would take the key-up away from the pressed
// element and lose its press. The click follows the press, as it does for Space and on every other platform.
// Ctrl+Enter stays with the browser: it is the Mac's context-menu shortcut.
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
