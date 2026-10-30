import { forwardRef, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { mergeProps, mergeRefs } from "@react-aria/utils";
import { useFocusRing } from "../a11y/focus";
import { usePressable, type PressableOptions } from "./usePressable";
import { bareButton } from "./press.css";

export type PressableState = { isPressed: boolean; isFocused: boolean; isFocusVisible: boolean; isDisabled: boolean };
export type PressableProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & PressableOptions & {
  children?: ReactNode | ((state: PressableState) => ReactNode);
};
export const Pressable = forwardRef<HTMLButtonElement, PressableProps>(function Pressable({
  disabled = false, onPress, onPressStart, onPressEnd, onPressUp, onPressChange, isPressed: controlledPressed,
  preventFocusOnPress, shouldCancelOnPointerExit, allowTextSelectionOnPress, children, type = "button", ...rest
}, forwardedRef) {
  const ref = useRef<HTMLButtonElement>(null);
  const { pressProps, isPressed } = usePressable({ disabled, onPress, onPressStart, onPressEnd, onPressUp, onPressChange, isPressed: controlledPressed, preventFocusOnPress, shouldCancelOnPointerExit, allowTextSelectionOnPress }, ref);
  const { focusProps, isFocused, isFocusVisible } = useFocusRing();
  const state = { isPressed, isFocused, isFocusVisible, isDisabled: disabled };
  return <button {...mergeProps({ className: bareButton }, rest, pressProps, focusProps)} ref={mergeRefs(ref, forwardedRef)} type={type} disabled={disabled}
    data-pressed={isPressed || undefined} data-focused={isFocused || undefined} data-focus-visible={isFocusVisible || undefined}>
    {typeof children === "function" ? children(state) : children}
  </button>;
});
