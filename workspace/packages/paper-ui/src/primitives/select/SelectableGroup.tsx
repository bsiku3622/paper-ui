import { createContext, forwardRef, useContext, useEffect, useRef, type ElementType, type ReactNode } from "react";

import { paperError } from "../../internal/errors";
import { registerPart } from "../../internal/render-target";
import { useMergedRef } from "../../internal/refs";
import { useControllableState } from "../../internal/useControllableState";
import { composeEventHandlers } from "../composition";
import { RovingFocus, useRovingFocusItem, useRovingValues, type RovingFocusOwnProps } from "../focus/RovingFocus";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import { Selectable, type SelectableOwnProps } from "./Selectable";

export type SelectableGroupOptions = {
  selectionMode?: "single" | "multiple";
  selectedValues?: readonly string[];
  defaultSelectedValues?: readonly string[];
  onSelectedValuesChange?: (values: string[]) => void;
  selectionRequired?: boolean;
  disabled?: boolean;
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
type GroupContext = SelectableGroupResult & { disabled: boolean };
const Context = createContext<GroupContext | null>(null);
export type SelectableGroupState = { selectedValues: string[]; isDisabled: boolean };
export type SelectableGroupOwnProps = Omit<RovingFocusOwnProps, "children"> & Omit<SelectableGroupOptions, "values"> & {
  onChange?: never;
  children?: ReactNode | ((state: SelectableGroupState) => ReactNode);
};
export type SelectableGroupProps<As extends ElementType = "div"> = PolymorphicProps<SelectableGroupOwnProps, As>;
const Roving = RovingFocus as ElementType;
function GroupState({ children, ...options }: Omit<SelectableGroupOptions, "values"> & { disabled: boolean; children: SelectableGroupOwnProps["children"] }) {
  const state = useSelectableGroup({ ...options, values: useRovingValues() });
  return <Context.Provider value={{ ...state, disabled: options.disabled }}>
    {typeof children === "function" ? children({ selectedValues: state.selectedValues, isDisabled: options.disabled }) : children}
  </Context.Provider>;
}
const Root = forwardRef<HTMLElement, Omit<SelectableGroupProps, "as" | "ref"> & { as?: ElementType }>(function SelectableGroup({ selectionMode, selectedValues, defaultSelectedValues, onSelectedValuesChange, selectionRequired, disabled = false, children, ...props }, ref) {
  return <Roving {...props} ref={ref} role={props.role ?? "group"} disabled={disabled}
    defaultCurrentValue={props.defaultCurrentValue ?? (selectedValues ?? defaultSelectedValues)?.[0]}>
    <GroupState {...{ selectionMode, selectedValues, defaultSelectedValues, onSelectedValuesChange, selectionRequired, disabled }}>{children}</GroupState>
  </Roving>;
});
export type SelectableGroupItemOwnProps = Omit<SelectableOwnProps, "selected" | "defaultSelected" | "onSelectedChange"> & { value: string };
export type SelectableGroupItemProps<As extends ElementType = "button"> = PolymorphicProps<SelectableGroupItemOwnProps, As>;
const Part = Selectable as ElementType;
const ItemImpl = forwardRef<HTMLElement, Omit<SelectableGroupItemProps, "as" | "ref"> & { as?: ElementType }>(function SelectableGroupItem({ value, disabled, onFocus, onKeyDown, ...props }, ref) {
  const context = useContext(Context);
  if (!context) throw paperError("SelectableGroup.Item must be used inside <SelectableGroup>.");
  const isDisabled = disabled || context.disabled;
  const { itemProps } = useRovingFocusItem({ value, disabled: isDisabled });
  const mergedRef = useMergedRef(itemProps.ref, ref);
  return <Part {...props} {...itemProps} ref={mergedRef} disabled={isDisabled}
    selected={context.isValueSelected(value)} onSelectedChange={(next: boolean) => context.setValueSelected(value, next)}
    onFocus={composeEventHandlers(onFocus, itemProps.onFocus)} onKeyDown={composeEventHandlers(onKeyDown, itemProps.onKeyDown)} />;
});
const Item = registerPart(ItemImpl) as PolymorphicComponent<SelectableGroupItemOwnProps, "button">;
export const SelectableGroup = Object.assign(Root as PolymorphicComponent<SelectableGroupOwnProps, "div">, { Item });
