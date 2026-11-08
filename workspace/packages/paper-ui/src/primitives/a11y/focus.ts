import { useState, type HTMLAttributes } from "react";

import { useAriaFocusRing, useAriaFocusWithin } from "../../internal/aria/focus";
import { stateAttributes, type StateAttributes } from "../../tokens";
import type { FocusRingOptions, FocusWithinOptions } from "../types";

export { FocusScope } from "../../internal/aria/focus";

export type FocusRingResult = {
  focusProps: HTMLAttributes<HTMLElement> & StateAttributes<"focused" | "focusVisible">;
  isFocused: boolean;
  isFocusVisible: boolean;
};
export function useFocusRing(options: FocusRingOptions = {}): FocusRingResult {
  const { focusProps, isFocused, isFocusVisible } = useAriaFocusRing(options);
  return { focusProps: { ...focusProps, ...stateAttributes({ focused: isFocused, focusVisible: isFocusVisible }) }, isFocused, isFocusVisible };
}

export type FocusWithinResult = {
  focusWithinProps: HTMLAttributes<HTMLElement> & StateAttributes<"focusWithin">;
  isFocusWithin: boolean;
};
export function useFocusWithin({ onFocusWithinChange, ...options }: FocusWithinOptions = {}): FocusWithinResult {
  const [isFocusWithin, setFocusWithin] = useState(false);
  const { focusWithinProps } = useAriaFocusWithin({ ...options, onFocusWithinChange: (value) => { setFocusWithin(value); onFocusWithinChange?.(value); } });
  return { focusWithinProps: { ...focusWithinProps, ...stateAttributes({ focusWithin: isFocusWithin }) }, isFocusWithin };
}
