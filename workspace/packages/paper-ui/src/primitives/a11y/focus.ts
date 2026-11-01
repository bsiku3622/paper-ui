import { useState, type HTMLAttributes } from "react";

import { useAriaFocusRing, useAriaFocusWithin } from "../../internal/aria/focus";
import { stateAttributes, type StateAttributes } from "../../tokens";
import type { FocusRingOptions, FocusWithinOptions } from "../types";

export { FocusScope } from "../../internal/aria/focus";

export type FocusRingResult = {
  /** Spread on the element that shows the ring. Carries `data-focused` and `data-focus-visible`. */
  focusProps: HTMLAttributes<HTMLElement> & StateAttributes<"focused" | "focusVisible">;
  isFocused: boolean;
  /** Focus by keyboard, or any focus on a text input: where a ring should show. */
  isFocusVisible: boolean;
};
export function useFocusRing(options: FocusRingOptions = {}): FocusRingResult {
  const { focusProps, isFocused, isFocusVisible } = useAriaFocusRing(options);
  return { focusProps: { ...focusProps, ...stateAttributes({ focused: isFocused, focusVisible: isFocusVisible }) }, isFocused, isFocusVisible };
}

export type FocusWithinResult = {
  /** Spread on the element that holds the focus somewhere inside. Carries `data-focus-within`. */
  focusWithinProps: HTMLAttributes<HTMLElement> & StateAttributes<"focusWithin">;
  isFocusWithin: boolean;
};
export function useFocusWithin({ onFocusWithinChange, ...options }: FocusWithinOptions = {}): FocusWithinResult {
  const [isFocusWithin, setFocusWithin] = useState(false);
  const { focusWithinProps } = useAriaFocusWithin({ ...options, onFocusWithinChange: (value) => { setFocusWithin(value); onFocusWithinChange?.(value); } });
  return { focusWithinProps: { ...focusWithinProps, ...stateAttributes({ focusWithin: isFocusWithin }) }, isFocusWithin };
}
