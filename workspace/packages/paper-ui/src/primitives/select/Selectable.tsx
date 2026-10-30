import { forwardRef, type ReactNode } from "react";

import { composeEventHandlers } from "../composition";
import { Pressable, type PressableProps, type PressableState } from "../press/Pressable";
import { useSelectable, type SelectableOptions } from "./useSelectable";

export type SelectableState = PressableState & { isSelected: boolean };
export type SelectableProps = Omit<PressableProps, "children"> & Pick<SelectableOptions, "selected" | "defaultSelected" | "onSelectedChange" | "current"> & {
  children?: ReactNode | ((state: SelectableState) => ReactNode);
};
export const Selectable = forwardRef<HTMLButtonElement, SelectableProps>(function Selectable({ selected, defaultSelected, onSelectedChange, disabled, role, current, onPress, children, ...rest }, ref) {
  const { isSelected, toggle, selectProps } = useSelectable({ selected, defaultSelected, onSelectedChange, disabled, role, current });
  return <Pressable {...rest} {...selectProps} ref={ref} role={role} disabled={disabled} onPress={composeEventHandlers(onPress, toggle)}>
    {(state) => typeof children === "function" ? children({ ...state, isSelected }) : children}
  </Pressable>;
});
