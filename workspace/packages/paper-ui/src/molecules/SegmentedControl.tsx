// SegmentedControl — 닫힌 track 안에서 값 하나를 고르는 compact control.

import { Children, createContext, isValidElement, useContext, type KeyboardEvent, type ReactElement, type ReactNode } from "react";

import { Box, Inline, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { resolveControlTypography } from "../resolvers";
import { useControllableState } from "../internal/useControllableState";
import type { ControlSize } from "../tokens";
import { segmentedItem, segmentedItemActive, segmentedItemShape, segmentedItemSize, segmentedRoot, segmentedRootShape } from "./SegmentedControl.css";

type SegmentedContextValue = { value: string; onValueChange: (value: string) => void; size: ControlSize; shape: "rounded" | "pill" };
const SegmentedContext = createContext<SegmentedContextValue | null>(null);
export type SegmentedControlProps = Omit<BoxProps<"div">, "as" | "children"> & { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; size?: ControlSize; shape?: "rounded" | "pill"; children: ReactNode };

const SegmentedControlRoot = ({ value: controlledValue, defaultValue, onValueChange, size = "sm", shape = "pill", className, children, onKeyDown, ...rest }: SegmentedControlProps) => {
  const firstValue = Children.toArray(children).find((child): child is ReactElement<SegmentedControlItemProps> => isValidElement(child))?.props.value ?? "";
  const [value, setValue] = useControllableState({ value: controlledValue, defaultValue: defaultValue ?? firstValue, onValueChange });
  return <SegmentedContext.Provider value={{ value, onValueChange: setValue, size, shape }}><Inline {...rest} role="radiogroup" className={joinClass(segmentedRoot, segmentedRootShape[shape], className)} onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event); if (event.defaultPrevented) return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
    const current = items.indexOf(document.activeElement as HTMLElement); let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % items.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0; else if (event.key === "End") next = items.length - 1; else return;
    event.preventDefault(); items[next]?.click(); items[next]?.focus();
  }}>{children}</Inline></SegmentedContext.Provider>;
};

export type SegmentedControlItemProps = Omit<BoxProps<"button">, "as" | "value"> & { value: string };
export const SegmentedControlItem = ({ value, className, onClick, ...rest }: SegmentedControlItemProps) => {
  const context = useContext(SegmentedContext); if (!context) throw new Error("SegmentedControl.Item must be used inside SegmentedControl"); const selected = value === context.value;
  return <Box {...rest} as="button" type="button" role="radio" aria-checked={selected} tabIndex={selected ? 0 : -1} className={joinClass(segmentedItem, segmentedItemSize[context.size], resolveControlTypography("button", "md", "regular"), segmentedItemShape[context.shape], selected && segmentedItemActive, className)} onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) context.onValueChange(value); }} />;
};

export const SegmentedControl = Object.assign(SegmentedControlRoot, { Item: SegmentedControlItem });
