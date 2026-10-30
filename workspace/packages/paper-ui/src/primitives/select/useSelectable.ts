import { useControllableState } from "../../internal/useControllableState";
import { stateAttributes, type StateAttributes } from "../../tokens";

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
  /** Spread on the selectable element: one aria attribute chosen by the role, and `data-selected` while selected. */
  selectProps: {
    "aria-pressed"?: boolean;
    "aria-checked"?: boolean;
    "aria-selected"?: boolean;
    "aria-current"?: SelectableCurrent;
  } & StateAttributes<"selected">;
};

// The one aria attribute that announces selection depends on the role the element plays.
const CHECKED_ROLES: readonly string[] = ["radio", "checkbox", "switch", "menuitemradio", "menuitemcheckbox"];
const SELECTED_ROLES: readonly string[] = ["tab", "option", "gridcell", "row", "treeitem"];

export function useSelectable({ selected, defaultSelected = false, onSelectedChange, disabled, role, current }: SelectableOptions = {}): SelectableResult {
  const [isSelected, set, read] = useControllableState({ value: selected, defaultValue: defaultSelected, onChange: onSelectedChange });
  const setSelected = (next: boolean) => { if (!disabled) set(next); };
  const announce = current !== undefined ? { "aria-current": isSelected ? current : undefined }
    : role !== undefined && CHECKED_ROLES.includes(role) ? { "aria-checked": isSelected }
    : role !== undefined && SELECTED_ROLES.includes(role) ? { "aria-selected": isSelected }
    : { "aria-pressed": isSelected };
  return { isSelected, setSelected, toggle: () => setSelected(!read()), selectProps: { ...announce, ...stateAttributes({ selected: isSelected }) } };
}
