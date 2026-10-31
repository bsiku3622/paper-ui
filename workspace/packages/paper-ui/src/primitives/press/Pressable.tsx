import { forwardRef, type ElementType, type ReactNode } from "react";

import { useMergedRef } from "../../internal/refs";
import { useFocusRing } from "../a11y/focus";
import { bareButton } from "../bare-button.css";
import { mergeProps } from "../composition";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import type { PressableOptions } from "../types";
import { usePressable } from "./usePressable";

export type PressableState = { isActive: boolean; isFocused: boolean; isFocusVisible: boolean; isDisabled: boolean };
export type PressableOwnProps = PressableOptions & {
  children?: ReactNode | ((state: PressableState) => ReactNode);
};
// `as` names a part (<Pressable as={Selectable}>) to give it the press machinery, or another tag. Only a button
// gets the bare reset and `type="button"`: a part sets its own.
export type PressableProps<As extends ElementType = "button"> = PolymorphicProps<PressableOwnProps, As>;

const PressableImpl = forwardRef<HTMLElement, Omit<PressableProps, "as" | "ref"> & { as?: ElementType }>(function Pressable({
  as, disabled = false, onPress, onPressStart, onPressEnd, onPressUp, onPressChange,
  preventFocusOnPress, cancelOnPointerExit, allowTextSelection, children, ...rest
}, forwardedRef) {
  const Tag = as ?? "button";
  const { pressProps, isActive } = usePressable({ disabled, onPress, onPressStart, onPressEnd, onPressUp, onPressChange, preventFocusOnPress, cancelOnPointerExit, allowTextSelection });
  const { focusProps, isFocused, isFocusVisible } = useFocusRing();
  const ref = useMergedRef(forwardedRef, pressProps.ref);
  const state = { isActive, isFocused, isFocusVisible, isDisabled: disabled };
  const bare = Tag === "button" ? { className: bareButton, type: "button" } : undefined;
  return <Tag {...mergeProps(bare, rest, pressProps, focusProps)} ref={ref} disabled={disabled}>
    {typeof children === "function" ? children(state) : children}
  </Tag>;
});

export const Pressable = PressableImpl as PolymorphicComponent<PressableOwnProps, "button">;
