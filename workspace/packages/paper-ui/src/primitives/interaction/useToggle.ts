import { useRef, useState, type RefObject } from "react";
import type { PressResult } from "@react-aria/interactions";
import { usePress, type PressOptions } from "./usePress";

export type ToggleOptions = PressOptions & {
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
};
export function useToggleState({ selected, defaultSelected = false, onSelectedChange, disabled }: Pick<ToggleOptions, "selected" | "defaultSelected" | "onSelectedChange" | "disabled">) {
  const [internal, setInternal] = useState(defaultSelected);
  const isSelected = selected ?? internal;
  const current = useRef(isSelected);
  current.current = isSelected;
  const setSelected = (next: boolean) => {
    if (disabled || next === current.current) return;
    if (selected === undefined) { current.current = next; setInternal(next); }
    onSelectedChange?.(next);
  };
  return { isSelected, setSelected, toggle: () => setSelected(!current.current) };
}
export type ToggleResult = PressResult & {
  isSelected: boolean;
  setSelected: (selected: boolean) => void;
  toggle: () => void;
  toggleProps: PressResult["pressProps"] & { "aria-pressed": boolean; "data-selected": true | undefined };
};
export function useToggle({ selected, defaultSelected, onSelectedChange, onPress, ...options }: ToggleOptions = {}, ref?: RefObject<HTMLElement | null>): ToggleResult {
  const state = useToggleState({ selected, defaultSelected, onSelectedChange, disabled: options.disabled });
  const press = usePress({ ...options, onPress: (event) => { state.toggle(); onPress?.(event); } }, ref);
  return { ...press, ...state,
    toggleProps: { ...press.pressProps, "aria-pressed": state.isSelected, "data-selected": state.isSelected || undefined } };
}
