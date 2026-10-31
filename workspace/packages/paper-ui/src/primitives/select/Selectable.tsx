import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { bareButton } from "../bare-button.css";
import { composeEventHandlers, mergeProps } from "../composition";
import { useSelectable, type SelectableOptions } from "./useSelectable";

export type SelectableState = { isSelected: boolean; isDisabled: boolean };
export type SelectableProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & Pick<SelectableOptions, "selected" | "defaultSelected" | "onSelectedChange" | "current"> & {
  children?: ReactNode | ((state: SelectableState) => ReactNode);
};
// A native button that toggles on click. `<Pressable as={Selectable}>` adds the press machinery to it.
export const Selectable = forwardRef<HTMLButtonElement, SelectableProps>(function Selectable({ selected, defaultSelected, onSelectedChange, disabled = false, role, current, onClick, children, ...rest }, ref) {
  const { isSelected, toggle, selectProps } = useSelectable({ selected, defaultSelected, onSelectedChange, disabled, role, current });
  return <button {...mergeProps({ className: bareButton, type: "button" }, rest, selectProps)} ref={ref} role={role} disabled={disabled} onClick={composeEventHandlers(onClick, toggle)}>
    {typeof children === "function" ? children({ isSelected, isDisabled: disabled }) : children}
  </button>;
});
