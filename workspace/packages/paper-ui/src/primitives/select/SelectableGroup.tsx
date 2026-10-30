import { createContext, forwardRef, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { RovingFocus, useRovingFocusItem, type RovingFocusProps } from "../focus/RovingFocus";
import { composeEventHandlers, mergeRefs } from "../composition";
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
export function useSelectableGroup({ selectionMode = "single", selectedValues, defaultSelectedValues = [], onSelectedValuesChange, selectionRequired = false, disabled = false, values }: SelectableGroupOptions = {}) {
  const [internal, setInternal] = useState(defaultSelectedValues);
  const source = selectedValues ?? internal;
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
    const next = JSON.parse(signature) as string[];
    if (selectedValues === undefined) setInternal(next);
    onSelectedValuesChange?.(next);
  }, [signature, sourceSignature, selectedValues, onSelectedValuesChange]);
  const current = useRef(normalized);
  current.current = normalized;
  const setSelected = (value: string, next: boolean) => {
    if (disabled || (values && !values.includes(value))) return;
    const previous = current.current;
    if (previous.includes(value) === next || (!next && selectionRequired && previous.length === 1)) return;
    const result = next ? selectionMode === "single" ? [value] : [...previous, value] : previous.filter((key) => key !== value);
    if (selectedValues === undefined) { current.current = result; setInternal(result); }
    onSelectedValuesChange?.(result);
  };
  return { selectedValues: normalized, isSelected: (value: string) => normalized.includes(value), setSelected, toggle: (value: string) => setSelected(value, !current.current.includes(value)) };
}
type GroupContext = ReturnType<typeof useSelectableGroup> & { disabled: boolean; register: (value: string) => () => void };
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
  if (!context) throw new Error("SelectableGroup.Item must be used inside SelectableGroup");
  const isDisabled = disabled || context.disabled;
  const { register } = context;
  useLayoutEffect(() => register(value), [register, value]);
  const item = useRovingFocusItem<HTMLButtonElement>({ value, disabled: isDisabled });
  return <Selectable {...props} {...item} ref={mergeRefs(item.ref, ref)} disabled={isDisabled}
    selected={context.isSelected(value)} onSelectedChange={(next) => context.setSelected(value, next)}
    onFocus={composeEventHandlers(onFocus, item.onFocus)} onKeyDown={composeEventHandlers(onKeyDown, item.onKeyDown)} />;
});
export const SelectableGroup = Object.assign(Root, { Item });
export type SelectableGroupResult = ReturnType<typeof useSelectableGroup>;
