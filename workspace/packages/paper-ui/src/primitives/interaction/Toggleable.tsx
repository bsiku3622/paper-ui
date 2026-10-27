import { forwardRef, type ReactNode } from "react";
import { Pressable, type PressableProps, type PressableState } from "./Pressable";
import { useToggleState, type ToggleOptions } from "./useToggle";

export type ToggleableState = PressableState & { isSelected: boolean };
export type ToggleableProps = Omit<PressableProps, "children"> & Pick<ToggleOptions, "selected" | "defaultSelected" | "onSelectedChange"> & {
  children?: ReactNode | ((state: ToggleableState) => ReactNode);
};
export const Toggleable = forwardRef<HTMLButtonElement, ToggleableProps>(function Toggleable({ selected, defaultSelected, onSelectedChange, disabled, onPress, children, ...rest }, ref) {
  const { isSelected, toggle } = useToggleState({ selected, defaultSelected, onSelectedChange, disabled });
  return <Pressable {...rest} ref={ref} disabled={disabled} aria-pressed={isSelected} data-selected={isSelected || undefined}
    onPress={(event) => { toggle(); onPress?.(event); }}>
    {(state) => typeof children === "function" ? children({ ...state, isSelected }) : children}
  </Pressable>;
});
