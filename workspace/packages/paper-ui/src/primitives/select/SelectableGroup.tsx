import { createContext, forwardRef, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";

import { paperError } from "../../internal/errors";
import { useMergedRef } from "../../internal/refs";
import { useControllableState } from "../../internal/useControllableState";
import { composeEventHandlers } from "../composition";
import { RovingFocus, useRovingFocusItem, type RovingFocusProps } from "../focus/RovingFocus";
import { Selectable, type SelectableProps } from "./Selectable";

export type SelectableGroupOptions = {
  selectionMode?: "single" | "multiple";
  selectedValues?: readonly string[];
  defaultSelectedValues?: readonly string[];
  onSelectedValuesChange?: (values: string[]) => void;
  selectionRequired?: boolean;
  disabled?: boolean;
  /** Available keys, when items can be removed. */
  values?: readonly string[];
};
export type SelectableGroupResult = {
  selectedValues: string[];
  isValueSelected: (value: string) => boolean;
  setValueSelected: (value: string, selected: boolean) => void;
  toggleValue: (value: string) => void;
};

const sameMembers = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((value, index) => value === b[index]);

export function useSelectableGroup({ selectionMode = "single", selectedValues, defaultSelectedValues = [], onSelectedValuesChange, selectionRequired = false, disabled = false, values }: SelectableGroupOptions = {}): SelectableGroupResult {
  const [source, setSource] = useControllableState<readonly string[]>({
    value: selectedValues,
    defaultValue: defaultSelectedValues,
    onChange: (next) => onSelectedValuesChange?.([...next]),
    equals: sameMembers,
  });
  const selected = [...new Set(source)].filter((value) => !values || values.includes(value));
  const normalized = selectionMode === "single" ? selected.slice(0, 1) : selected;
  const signature = JSON.stringify(normalized);
  const sourceSignature = JSON.stringify(source);
  const lastPrune = useRef<string | null>(null);
  useEffect(() => {
    if (signature === sourceSignature) { lastPrune.current = null; return; }
    const request = `${sourceSignature}:${signature}`;
    if (lastPrune.current === request) return;
    lastPrune.current = request;
    setSource(JSON.parse(signature) as string[]);
  }, [signature, sourceSignature, setSource]);
  const current = useRef(normalized);
  current.current = normalized;
  const setValueSelected = (value: string, next: boolean) => {
    if (disabled || (values && !values.includes(value))) return;
    const previous = current.current;
    if (previous.includes(value) === next || (!next && selectionRequired && previous.length === 1)) return;
    const result = next ? selectionMode === "single" ? [value] : [...previous, value] : previous.filter((key) => key !== value);
    if (selectedValues === undefined) current.current = result;
    setSource(result);
  };
  return { selectedValues: normalized, isValueSelected: (value) => normalized.includes(value), setValueSelected, toggleValue: (value) => setValueSelected(value, !current.current.includes(value)) };
}
type GroupContext = SelectableGroupResult & { disabled: boolean; register: (value: string) => () => void };
const Context = createContext<GroupContext | null>(null);
export type SelectableGroupProps = Omit<RovingFocusProps, "onChange"> & Omit<SelectableGroupOptions, "values">;
const Root = forwardRef<HTMLDivElement, SelectableGroupProps>(function SelectableGroup({ selectionMode, selectedValues, defaultSelectedValues, onSelectedValuesChange, selectionRequired, disabled = false, children, ...props }, ref) {
  const [values, setValues] = useState<string[] | undefined>();
  const register = useRef((value: string) => {
    setValues((previous) => [...new Set([...(previous ?? []), value])]);
    return () => setValues((previous) => previous?.filter((item) => item !== value));
  }).current;
  const state = useSelectableGroup({ selectionMode, selectedValues, defaultSelectedValues, onSelectedValuesChange, selectionRequired, disabled, values });
  return <Context.Provider value={{ ...state, disabled, register }}>
    <RovingFocus {...props} ref={ref} role={props.role ?? "group"} disabled={disabled}
      defaultCurrentValue={props.defaultCurrentValue ?? (selectedValues ?? defaultSelectedValues)?.[0]}>{children}</RovingFocus>
  </Context.Provider>;
});
export type SelectableGroupItemProps = Omit<SelectableProps, "selected" | "defaultSelected" | "onSelectedChange" | "tabIndex"> & { value: string };
const Item = forwardRef<HTMLButtonElement, SelectableGroupItemProps>(function SelectableGroupItem({ value, disabled, onFocus, onKeyDown, ...props }, ref) {
  const context = useContext(Context);
  if (!context) throw paperError("SelectableGroup.Item must be used inside <SelectableGroup>.");
  const isDisabled = disabled || context.disabled;
  const { register } = context;
  useLayoutEffect(() => register(value), [register, value]);
  const { itemProps } = useRovingFocusItem<HTMLButtonElement>({ value, disabled: isDisabled });
  const mergedRef = useMergedRef(itemProps.ref, ref);
  return <Selectable {...props} {...itemProps} ref={mergedRef} disabled={isDisabled}
    selected={context.isValueSelected(value)} onSelectedChange={(next) => context.setValueSelected(value, next)}
    onFocus={composeEventHandlers(onFocus, itemProps.onFocus)} onKeyDown={composeEventHandlers(onKeyDown, itemProps.onKeyDown)} />;
});
export const SelectableGroup = Object.assign(Root, { Item });
