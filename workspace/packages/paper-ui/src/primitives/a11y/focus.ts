import { useState } from "react";
import { useFocusWithin as useAriaFocusWithin, type FocusWithinProps, type FocusWithinResult as AriaFocusWithinResult } from "@react-aria/interactions";
export { FocusScope, useFocusRing } from "@react-aria/focus";
export type { FocusScopeProps, AriaFocusRingProps as FocusRingOptions } from "@react-aria/focus";
export type FocusWithinOptions = Omit<FocusWithinProps, "isDisabled"> & { disabled?: boolean };
export type FocusWithinResult = AriaFocusWithinResult & { isFocusWithin: boolean };
export function useFocusWithin({ disabled, onFocusWithinChange, ...options }: FocusWithinOptions = {}): FocusWithinResult {
  const [isFocusWithin, setFocusWithin] = useState(false);
  const result = useAriaFocusWithin({ ...options, isDisabled: disabled, onFocusWithinChange: (value) => { setFocusWithin(value); onFocusWithinChange?.(value); } });
  return { ...result, isFocusWithin };
}
