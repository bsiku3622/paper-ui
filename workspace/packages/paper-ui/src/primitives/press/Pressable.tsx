import { forwardRef, type ElementType, type ReactNode } from "react";

import { registerPart, targetProps } from "../../internal/render-target";
import { useMergedRef } from "../../internal/refs";
import { useFocusRing } from "../a11y/focus";
import { bareButton } from "../bare-button.css";
import { mergeProps } from "../composition";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import type { PressableOptions } from "../types";
import { pressRing } from "./press.css";
import { usePressable } from "./usePressable";

export type PressableState = { isActive: boolean; isFocused: boolean; isFocusVisible: boolean; isDisabled: boolean };
type PressableOwnProps = PressableOptions & {
  focusable?: boolean;
  children?: ReactNode | ((state: PressableState) => ReactNode);
};
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
  return <Tag {...mergeProps(bare, { className: pressRing }, target, rest, pressProps, focusProps)} ref={ref}>
    {typeof children === "function" ? children(state) : children}
  </Tag>;
});

export const Pressable = registerPart(PressableImpl) as PolymorphicComponent<PressableOwnProps, "button">;
