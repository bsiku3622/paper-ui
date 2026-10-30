import { useRef, useState } from "react";

// State and aria only: the caller connects `toggle` to a press (Selectable does, with Pressable).
export type SelectableCurrent = "page" | "step" | "location" | "date" | "time" | true;
export type SelectableOptions = {
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  disabled?: boolean;
  role?: string;
  current?: SelectableCurrent;
};
export type SelectableResult = {
  isSelected: boolean;
  setSelected: (selected: boolean) => void;
  toggle: () => void;
  selectProps: {
    "aria-pressed"?: boolean;
    "aria-checked"?: boolean;
    "aria-selected"?: boolean;
    "aria-current"?: SelectableCurrent;
    "data-selected"?: true;
  };
};

// The one aria attribute that announces selection depends on the role the element plays.
const CHECKED_ROLES: readonly string[] = ["radio", "checkbox", "switch", "menuitemradio", "menuitemcheckbox"];
const SELECTED_ROLES: readonly string[] = ["tab", "option", "gridcell", "row", "treeitem"];

export function useSelectable({ selected, defaultSelected = false, onSelectedChange, disabled, role, current }: SelectableOptions = {}): SelectableResult {
  const [internal, setInternal] = useState(defaultSelected);
  const isSelected = selected ?? internal;
  const latest = useRef(isSelected);
  latest.current = isSelected;
  const setSelected = (next: boolean) => {
    if (disabled || next === latest.current) return;
    if (selected === undefined) { latest.current = next; setInternal(next); }
    onSelectedChange?.(next);
  };
  const announce = current !== undefined ? { "aria-current": isSelected ? current : undefined }
    : role !== undefined && CHECKED_ROLES.includes(role) ? { "aria-checked": isSelected }
    : role !== undefined && SELECTED_ROLES.includes(role) ? { "aria-selected": isSelected }
    : { "aria-pressed": isSelected };
  return { isSelected, setSelected, toggle: () => setSelected(!latest.current), selectProps: { ...announce, "data-selected": isSelected || undefined } };
}
