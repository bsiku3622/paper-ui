import { forwardRef, type ElementType, type ReactNode } from "react";

import { registerPart, targetProps } from "../../internal/render-target";
import { useMergedRef } from "../../internal/refs";
import { useFocusRing } from "../a11y/focus";
import { bareButton } from "../bare-button.css";
import { mergeProps } from "../composition";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import type { PressableOptions } from "../types";
import { usePressable } from "./usePressable";

export type PressableState = { isActive: boolean; isFocused: boolean; isFocusVisible: boolean; isDisabled: boolean };
type PressableOwnProps = PressableOptions & {
  /** A disabled target stays in the Tab order and says so with aria-disabled, as a Button that is loading does. */
  focusable?: boolean;
  children?: ReactNode | ((state: PressableState) => ReactNode);
};
// `as` names a part (<Pressable as={Selectable}>) to give it the press machinery, or another tag. Only a button
// gets the bare reset; what disabled means for the target comes from targetProps.
export type PressableProps<As extends ElementType = "button"> = PolymorphicProps<PressableOwnProps, As>;

const PressableImpl = forwardRef<HTMLElement, Omit<PressableProps, "as" | "ref"> & { as?: ElementType }>(function Pressable({
  as, disabled = false, focusable = false, motion, onPress, onPressStart, onPressEnd, onPressUp, onPressChange,
  preventFocusOnPress, cancelOnPointerExit, allowTextSelection, children, ...rest
}, forwardedRef) {
  const Tag = as ?? "button";
  const { pressProps, isActive } = usePressable({ disabled, motion, onPress, onPressStart, onPressEnd, onPressUp, onPressChange, preventFocusOnPress, cancelOnPointerExit, allowTextSelection });
  const { focusProps, isFocused, isFocusVisible } = useFocusRing();
  const ref = useMergedRef(forwardedRef, pressProps.ref);
  const state = { isActive, isFocused, isFocusVisible, isDisabled: disabled };
  const { type, href } = rest as { type?: string; href?: string };
  const target = targetProps(Tag, { disabled, focusable, type, href, kind: "control" });
  const bare = Tag === "button" ? { className: bareButton } : undefined;
  return <Tag {...mergeProps(bare, target, rest, pressProps, focusProps)} ref={ref}>
    {typeof children === "function" ? children(state) : children}
  </Tag>;
});

export const Pressable = registerPart(PressableImpl) as PolymorphicComponent<PressableOwnProps, "button">;
