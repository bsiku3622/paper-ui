import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { useMergedRef } from "../../internal/refs";
import { useFocusRing } from "../a11y/focus";
import { mergeProps } from "../composition";
import type { PressableOptions } from "../types";
import { bareButton } from "./press.css";
import { usePressable } from "./usePressable";

export type PressableState = { isActive: boolean; isFocused: boolean; isFocusVisible: boolean; isDisabled: boolean };
export type PressableProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & PressableOptions & {
  children?: ReactNode | ((state: PressableState) => ReactNode);
};
export const Pressable = forwardRef<HTMLButtonElement, PressableProps>(function Pressable({
  disabled = false, onPress, onPressStart, onPressEnd, onPressUp, onPressChange,
  preventFocusOnPress, cancelOnPointerExit, allowTextSelection, children, type = "button", ...rest
}, forwardedRef) {
  const { pressProps, isActive } = usePressable({ disabled, onPress, onPressStart, onPressEnd, onPressUp, onPressChange, preventFocusOnPress, cancelOnPointerExit, allowTextSelection });
  const { focusProps, isFocused, isFocusVisible } = useFocusRing();
  const ref = useMergedRef(forwardedRef, pressProps.ref);
  const state = { isActive, isFocused, isFocusVisible, isDisabled: disabled };
  return <button {...mergeProps({ className: bareButton }, rest, pressProps, focusProps)} ref={ref} type={type} disabled={disabled}>
    {typeof children === "function" ? children(state) : children}
  </button>;
});
