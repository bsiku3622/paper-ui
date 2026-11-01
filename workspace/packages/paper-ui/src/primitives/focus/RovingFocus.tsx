import { createContext, forwardRef, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ComponentPropsWithoutRef, type ElementType, type HTMLAttributes, type KeyboardEvent, type ReactElement, type ReactNode, type Ref, type RefCallback } from "react";
import { directionOf } from "../../internal/direction";
import { paperError } from "../../internal/errors";
import { registerPart, targetProps } from "../../internal/render-target";
import { useMergedRef } from "../../internal/refs";
import { useControllableState } from "../../internal/useControllableState";
import { MARKER_ATTRIBUTE, VALUE_ATTRIBUTE, type Orientation } from "../../tokens";
import { composeEventHandlers, mergeProps } from "../composition";

type Entry = { value: string; element: HTMLElement; disabled: boolean };
const inDocumentOrder = (a: Entry, b: Entry) => a.element === b.element ? 0 : a.element.compareDocumentPosition(b.element) & 2 ? 1 : -1;
// Every item that is still in the document, in document order; the ones a key can land on are the enabled among them.
const connected = (entries: readonly Entry[]) => entries.filter((entry) => entry.element.isConnected).sort(inDocumentOrder);
const enabled = (entries: readonly Entry[]) => connected(entries).filter((entry) => !entry.disabled);
// The one item per value the registry holds, of the items in the order they arrived: the first that is on the page.
const registered = (claims: readonly Entry[]) => {
  const held = new Set<string>();
  return claims.filter((entry) => {
    if (held.has(entry.value)) return false;
    if (entry.element.isConnected) held.add(entry.value);
    return true;
  });
};

export type RovingFocusState = { currentValue: string | undefined; isDisabled: boolean };
export type RovingFocusProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "dir"> & {
  orientation?: Orientation | "both";
  /** Written to the element only when given; without it the group reads the direction it inherits. */
  dir?: "ltr" | "rtl";
  loop?: boolean;
  disabled?: boolean;
  currentValue?: string | null;
  defaultCurrentValue?: string;
  onCurrentValueChange?: (value: string) => void;
  children?: ReactNode | ((state: RovingFocusState) => ReactNode);
};
type Context = {
  current: string | undefined;
  disabled: boolean;
  /** Every registered item, or undefined until the first one registers. */
  entries: readonly Entry[] | undefined;
  /** The registry is the only list of items; a second item with a value already registered is refused until the first leaves. */
  register: (entry: Entry) => () => void;
  activate: (value: string) => void;
  navigate: (event: KeyboardEvent<HTMLElement>, value: string) => void;
};
const RovingContext = createContext<Context | null>(null);

/** The values of every item in the group, in document order, disabled ones included; undefined before any item has registered. */
export function useRovingValues(): readonly string[] | undefined {
  const context = useContext(RovingContext);
  if (!context) throw paperError("RovingFocus values must be read inside <RovingFocus>.");
  const { entries } = context;
  return useMemo(() => entries && [...new Set(connected(entries).map((entry) => entry.value))], [entries]);
}

export const RovingFocusRoot = forwardRef<HTMLDivElement, RovingFocusProps>(function RovingFocus({
  orientation = "horizontal", dir, loop = false, disabled = false,
  currentValue, defaultCurrentValue, onCurrentValueChange, children, ...props
}, forwardedRef) {
  const root = useRef<HTMLDivElement>(null);
  const rootRef = useMergedRef(root, forwardedRef);
  const [entries, setEntries] = useState<readonly Entry[] | undefined>();
  const registry = useRef<readonly Entry[]>([]);
  // Every item that asked, the refused ones too, so a refused one takes over when the one it lost to leaves.
  const claims = useRef<readonly Entry[]>([]);
  // The order elements first arrived in: an item that registers again because its disabled changed keeps its place, and its value.
  const arrival = useRef({ next: 0, of: new WeakMap<HTMLElement, number>() });
  const reported = useRef(new Set<string>());
  const [requested, setRequested] = useControllableState<string | null | undefined>({
    value: currentValue,
    defaultValue: defaultCurrentValue,
    onChange: (value) => { if (value) onCurrentValueChange?.(value); },
  });
  const mounted = useRef(false);
  const restore = useRef<number | null>(null);
  const focused = useRef<{ value: string; index: number } | null>(null);
  const reachable = enabled(entries ?? []);
  const current = reachable.find((entry) => entry.value === requested)?.value ?? reachable[0]?.value;
  const activate = (value: string) => {
    focused.current = { value, index: enabled(registry.current).findIndex((entry) => entry.value === value) };
    setRequested(value);
  };
  const register = useCallback((entry: Entry) => {
    const { of: places } = arrival.current;
    if (!places.has(entry.element)) places.set(entry.element, arrival.current.next++);
    const settle = () => {
      const next = registered(claims.current);
      if (next.length === registry.current.length && next.every((item, index) => item === registry.current[index])) return;
      registry.current = next;
      setEntries(next);
    };
    claims.current = [...claims.current, entry].sort((a, b) => places.get(a.element)! - places.get(b.element)!);
    settle();
    if (!registry.current.includes(entry) && process.env.NODE_ENV !== "production" && !reported.current.has(entry.value)) {
      reported.current.add(entry.value);
      console.error(paperError(`RovingFocus value '${entry.value}' is registered twice.`).message);
    }
    return () => {
      if (focused.current?.value === entry.value && registry.current.includes(entry)) {
        restore.current = focused.current.index;
      }
      claims.current = claims.current.filter((item) => item !== entry);
      settle();
    };
  }, []);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useLayoutEffect(() => {
    if (restore.current === null || !mounted.current) {
      if (focused.current) focused.current.index = enabled(registry.current).findIndex((entry) => entry.value === focused.current?.value);
      return;
    }
    const index = restore.current;
    restore.current = null;
    const active = root.current?.ownerDocument.activeElement;
    if (active && active !== root.current?.ownerDocument.body && !root.current?.contains(active)) return;
    const items = enabled(registry.current);
    focused.current = null;
    (items[Math.max(0, Math.min(index, items.length - 1))]?.element ?? root.current)?.focus();
  });
  const navigate = (event: KeyboardEvent<HTMLElement>, value: string) => {
    if (disabled || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target !== event.currentTarget) return;
    const rtl = directionOf(event.currentTarget) === "rtl";
    let step = 0;
    if (orientation !== "vertical") {
      if (event.key === "ArrowRight") step = rtl ? -1 : 1;
      if (event.key === "ArrowLeft") step = rtl ? 1 : -1;
    }
    if (orientation !== "horizontal") {
      if (event.key === "ArrowDown") step = 1;
      if (event.key === "ArrowUp") step = -1;
    }
    if (!step && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    event.stopPropagation();
    const items = enabled(registry.current);
    const index = items.findIndex((entry) => entry.value === value);
    let next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : index + step;
    next = loop ? (next + items.length) % items.length : Math.max(0, Math.min(next, items.length - 1));
    const target = items[next];
    target?.element.focus();
  };
  return <RovingContext.Provider value={{ current, disabled, entries, register, activate, navigate }}>
    <div tabIndex={-1} {...props} ref={rootRef} dir={dir} {...{ [VALUE_ATTRIBUTE.orientation]: orientation }}
      onBlur={(event) => {
        props.onBlur?.(event);
        if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget as Node)) focused.current = null;
      }}>{typeof children === "function" ? children({ currentValue: current, isDisabled: disabled }) : children}</div>
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
  const entry = useMemo<Entry | null>(() => element && { value, element, disabled: isDisabled }, [element, value, isDisabled]);
  useLayoutEffect(() => entry ? register(entry) : undefined, [entry, register]);
  // An item the registry refuses (a second one with the same value) is not the Tab stop, so the group keeps one.
  const isCurrent = !isDisabled && entry !== null && context.entries?.includes(entry) === true && context.current === value;
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
// A native button by default. Another tag is rendered as it is, without a role: a roving item that is not a button
// takes its role from the caller. A component goes through targetProps, as every `as` does.
const Item = forwardRef<HTMLElement, RovingFocusItemProps<ElementType>>(function RovingFocusItem({ as, value, disabled, onFocus, onKeyDown, ...props }, ref) {
  const context = useContext(RovingContext);
  const isDisabled = disabled || context?.disabled || false;
  const { itemProps } = useRovingFocusItem({ value, disabled });
  const mergedRef = useMergedRef(itemProps.ref, ref);
  const Tag = as ?? "button";
  const { type, href } = props as { type?: string; href?: string };
  const target = targetProps(Tag, { disabled: isDisabled, type, href, kind: "control" });
  delete target.role;
  return <Tag {...mergeProps(target, props, itemProps)} ref={mergedRef}
    onFocus={composeEventHandlers(onFocus, itemProps.onFocus)} onKeyDown={composeEventHandlers(onKeyDown, itemProps.onKeyDown)} />;
}) as <As extends ElementType = "button">(props: RovingFocusItemProps<As>) => ReactElement;

export const RovingFocus = Object.assign(RovingFocusRoot, { Item: registerPart(Item) });
