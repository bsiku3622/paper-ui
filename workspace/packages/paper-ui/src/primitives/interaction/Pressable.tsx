import { forwardRef, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { mergeProps, mergeRefs } from "@react-aria/utils";
import { useFocusRing } from "../a11y/focus";
import { usePress, type PressOptions } from "./usePress";
import { useHover } from "./useHover";
import { bareButton } from "./interaction.css";

export type PressableState = { isPressed: boolean; isHovered: boolean; isFocused: boolean; isFocusVisible: boolean; isDisabled: boolean };
export type PressableProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & PressOptions & {
  children?: ReactNode | ((state: PressableState) => ReactNode);
};
export const Pressable = forwardRef<HTMLButtonElement, PressableProps>(function Pressable({
  disabled = false, onPress, onPressStart, onPressEnd, onPressUp, onPressChange, isPressed: controlledPressed,
  preventFocusOnPress, shouldCancelOnPointerExit, allowTextSelectionOnPress, children, type = "button", ...rest
}, forwardedRef) {
  const ref = useRef<HTMLButtonElement>(null);
  const { pressProps, isPressed } = usePress({ disabled, onPress, onPressStart, onPressEnd, onPressUp, onPressChange, isPressed: controlledPressed, preventFocusOnPress, shouldCancelOnPointerExit, allowTextSelectionOnPress }, ref);
  const { hoverProps, isHovered } = useHover({ disabled });
  const { focusProps, isFocused, isFocusVisible } = useFocusRing();
  const state = { isPressed, isHovered, isFocused, isFocusVisible, isDisabled: disabled };
  return <button {...mergeProps({ className: bareButton }, rest, pressProps, hoverProps, focusProps)} ref={mergeRefs(ref, forwardedRef)} type={type} disabled={disabled}
    data-pressed={isPressed || undefined} data-hovered={isHovered || undefined} data-focused={isFocused || undefined} data-focus-visible={isFocusVisible || undefined}>
    {typeof children === "function" ? children(state) : children}
  </button>;
});
