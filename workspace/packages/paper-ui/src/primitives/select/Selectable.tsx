import { forwardRef, type ElementType, type ReactNode } from "react";

import { registerPart, targetProps } from "../../internal/render-target";
import { bareButton } from "../bare-button.css";
import { composeEventHandlers, mergeProps } from "../composition";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import { useSelectable, type SelectableOptions } from "./useSelectable";

export type SelectableState = { isSelected: boolean; isDisabled: boolean };
export type SelectableOwnProps = Pick<SelectableOptions, "selected" | "defaultSelected" | "onSelectedChange" | "disabled" | "role" | "current"> & {
  children?: ReactNode | ((state: SelectableState) => ReactNode);
};
// A native button that toggles on click. `as` names another target, which targetProps makes a control, with a button's
// keys, or hands the disabled to. `<Pressable as={Selectable}>` adds the press machinery.
export type SelectableProps<As extends ElementType = "button"> = PolymorphicProps<SelectableOwnProps, As>;

const SelectableImpl = forwardRef<HTMLElement, Omit<SelectableProps, "as" | "ref"> & { as?: ElementType }>(function Selectable({
  as, selected, defaultSelected, onSelectedChange, disabled = false, role, current, onClick, onKeyDown, children, ...rest
}, ref) {
  const Tag = as ?? "button";
  const { isSelected, toggle, selectProps } = useSelectable({ selected, defaultSelected, onSelectedChange, disabled, role, current });
  const { type, href } = rest as { type?: string; href?: string };
  const target = targetProps(Tag, { disabled, type, href, activateOnKey: true, kind: "control" });
  const bare = Tag === "button" ? { className: bareButton } : undefined;
  return <Tag {...mergeProps(bare, target, rest, { role }, selectProps)} ref={ref} onClick={composeEventHandlers(onClick, toggle)} onKeyDown={composeEventHandlers(onKeyDown, target.onKeyDown)}>
    {typeof children === "function" ? children({ isSelected, isDisabled: disabled }) : children}
  </Tag>;
});

export const Selectable = registerPart(SelectableImpl) as PolymorphicComponent<SelectableOwnProps, "button">;
