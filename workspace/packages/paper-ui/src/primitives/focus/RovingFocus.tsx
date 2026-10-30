import { createContext, forwardRef, useCallback, useContext, useLayoutEffect, useRef, useState, type ComponentPropsWithoutRef, type ElementType, type HTMLAttributes, type KeyboardEvent, type ReactElement, type Ref, type RefCallback } from "react";
import { paperError } from "../../internal/errors";
import { useMergedRef } from "../../internal/refs";
import { useControllableState } from "../../internal/useControllableState";
import { MARKER_ATTRIBUTE, VALUE_ATTRIBUTE, type Orientation } from "../../tokens";
import { composeEventHandlers } from "../composition";

type Entry = { value: string; element: HTMLElement; disabled: boolean };
const sortEntries = (entries: Entry[]) => entries.filter((entry) => !entry.disabled && entry.element.isConnected)
  .sort((a, b) => a.element === b.element ? 0 : a.element.compareDocumentPosition(b.element) & 2 ? 1 : -1);
export type RovingFocusProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: Orientation | "both";
  dir?: "ltr" | "rtl";
  loop?: boolean;
  disabled?: boolean;
  currentValue?: string | null;
  defaultCurrentValue?: string;
  onCurrentValueChange?: (value: string) => void;
};
type Context = {
  current: string | undefined;
  disabled: boolean;
  register: (entry: Entry) => () => void;
  activate: (value: string) => void;
  navigate: (event: KeyboardEvent<HTMLElement>, value: string) => void;
};
const RovingContext = createContext<Context | null>(null);

export const RovingFocusRoot = forwardRef<HTMLDivElement, RovingFocusProps>(function RovingFocus({
  orientation = "horizontal", dir = "ltr", loop = false, disabled = false,
  currentValue, defaultCurrentValue, onCurrentValueChange, children, ...props
}, forwardedRef) {
  const root = useRef<HTMLDivElement>(null);
  const rootRef = useMergedRef(root, forwardedRef);
  const [entries, setEntries] = useState<Entry[]>([]);
  const registry = useRef<Entry[]>([]);
  const [requested, setRequested] = useControllableState<string | null | undefined>({
    value: currentValue,
    defaultValue: defaultCurrentValue,
    onChange: (value) => { if (value) onCurrentValueChange?.(value); },
  });
  const mounted = useRef(false);
  const restore = useRef<number | null>(null);
  const focused = useRef<{ value: string; index: number } | null>(null);
  const ordered = sortEntries(entries);
  const current = ordered.find((entry) => entry.value === requested)?.value ?? ordered[0]?.value;
  const activate = (value: string) => {
    focused.current = { value, index: sortEntries(registry.current).findIndex((entry) => entry.value === value) };
    setRequested(value);
  };
  const register = useCallback((entry: Entry) => {
    registry.current = [...registry.current.filter((item) => item.value !== entry.value), entry];
    setEntries(registry.current);
    return () => {
      if (focused.current?.value === entry.value) {
        restore.current = focused.current.index;
      }
      registry.current = registry.current.filter((item) => item !== entry);
      setEntries(registry.current);
    };
  }, []);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useLayoutEffect(() => {
    if (restore.current === null || !mounted.current) {
      if (focused.current) focused.current.index = sortEntries(registry.current).findIndex((entry) => entry.value === focused.current?.value);
      return;
    }
    const index = restore.current;
    restore.current = null;
    const active = root.current?.ownerDocument.activeElement;
    if (active && active !== root.current?.ownerDocument.body && !root.current?.contains(active)) return;
    const items = sortEntries(registry.current);
    focused.current = null;
    (items[Math.max(0, Math.min(index, items.length - 1))]?.element ?? root.current)?.focus();
  });
  const navigate = (event: KeyboardEvent<HTMLElement>, value: string) => {
    if (disabled || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target !== event.currentTarget) return;
    let step = 0;
    if (orientation !== "vertical") {
      if (event.key === "ArrowRight") step = dir === "rtl" ? -1 : 1;
      if (event.key === "ArrowLeft") step = dir === "rtl" ? 1 : -1;
    }
    if (orientation !== "horizontal") {
      if (event.key === "ArrowDown") step = 1;
      if (event.key === "ArrowUp") step = -1;
    }
    if (!step && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    event.stopPropagation();
    const items = sortEntries(registry.current);
    const index = items.findIndex((entry) => entry.value === value);
    let next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : index + step;
    next = loop ? (next + items.length) % items.length : Math.max(0, Math.min(next, items.length - 1));
    const target = items[next];
    target?.element.focus();
  };
  return <RovingContext.Provider value={{ current, disabled, register, activate, navigate }}>
    <div tabIndex={-1} {...props} ref={rootRef} dir={dir} {...{ [VALUE_ATTRIBUTE.orientation]: orientation }}
      onBlur={(event) => {
        props.onBlur?.(event);
        if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget as Node)) focused.current = null;
      }}>{children}</div>
  </RovingContext.Provider>;
});

export type RovingFocusItemOptions = { value: string; disabled?: boolean };
export type RovingFocusItemResult<Element extends HTMLElement = HTMLElement> = {
  /** Spread on the item. Carries its own ref, its place in the Tab order and the keys that move focus. */
  itemProps: {
    ref: RefCallback<Element>;
    tabIndex: number;
    onFocus: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  } & Record<typeof MARKER_ATTRIBUTE.rovingItem, string>;
  /** The item that holds the group's Tab stop. */
  isCurrent: boolean;
};
export function useRovingFocusItem<Element extends HTMLElement = HTMLElement>({ value, disabled = false }: RovingFocusItemOptions): RovingFocusItemResult<Element> {
  const context = useContext(RovingContext);
  if (!context) throw paperError("useRovingFocusItem must be used inside <RovingFocus>.");
  const [element, setElement] = useState<Element | null>(null);
  const ref = useCallback((node: Element | null) => setElement(node), []);
  const { register } = context;
  const isDisabled = disabled || context.disabled;
  useLayoutEffect(() => element ? register({ value, element, disabled: isDisabled }) : undefined, [element, value, isDisabled, register]);
  const isCurrent = !isDisabled && context.current === value;
  return {
    itemProps: {
      ref,
      tabIndex: isCurrent ? 0 : -1,
      [MARKER_ATTRIBUTE.rovingItem]: value,
      onFocus: () => { if (!isDisabled) context.activate(value); },
      onKeyDown: (event) => context.navigate(event, value),
    },
    isCurrent,
  };
}

export type RovingFocusItemProps<As extends ElementType = "button"> = RovingFocusItemOptions & {
  as?: As;
  ref?: Ref<HTMLElement>;
} & Omit<ComponentPropsWithoutRef<As>, keyof RovingFocusItemOptions | "as" | "ref" | "tabIndex">;
const Item = forwardRef<HTMLElement, RovingFocusItemProps<ElementType>>(function RovingFocusItem({ as, value, disabled, onFocus, onKeyDown, ...props }, ref) {
  const context = useContext(RovingContext);
  const isDisabled = disabled || context?.disabled;
  const { itemProps } = useRovingFocusItem({ value, disabled });
  const mergedRef = useMergedRef(itemProps.ref, ref);
  const Tag = as ?? "button";
  const nativeDisabled = typeof Tag !== "string" || ["button", "input", "select", "textarea"].includes(Tag);
  return <Tag {...props} {...itemProps} ref={mergedRef}
    type={Tag === "button" ? props.type ?? "button" : props.type}
    disabled={nativeDisabled ? isDisabled : undefined} aria-disabled={isDisabled || undefined}
    onFocus={composeEventHandlers(onFocus, itemProps.onFocus)} onKeyDown={composeEventHandlers(onKeyDown, itemProps.onKeyDown)} />;
}) as <As extends ElementType = "button">(props: RovingFocusItemProps<As>) => ReactElement;

export const RovingFocus = Object.assign(RovingFocusRoot, { Item });
