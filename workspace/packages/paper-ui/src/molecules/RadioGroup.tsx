// RadioGroup — Radio + Label을 JSX item으로 조합한다.

import { createContext, useContext, useId, type ReactNode } from "react";

import { Box, Inline, Text } from "../primitives";
import { Radio } from "../atoms";
import type { ControlSize } from "../tokens";
import { joinClass } from "../internal/joinClass";
import { useControllableState } from "../internal/useControllableState";
import { radioGroupOrientation } from "./RadioGroup.css";

export type RadioGroupOrientation = "vertical" | "horizontal";
type RadioGroupContextValue = { value?: string; onValueChange?: (value: string) => void; name: string; size: ControlSize };
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);
export type RadioGroupProps = { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; name?: string; size?: ControlSize; orientation?: RadioGroupOrientation; "aria-label"?: string; "aria-labelledby"?: string; className?: string; children: ReactNode };
const RadioGroupRoot = ({ value: controlledValue, defaultValue = "", onValueChange, name, size = "md", orientation = "vertical", "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, className, children }: RadioGroupProps) => {
  const auto = useId();
  const [value, setValue] = useControllableState({ value: controlledValue, defaultValue, onValueChange });
  return <RadioGroupContext.Provider value={{ value, onValueChange: setValue, name: name ?? auto, size }}><Box role="radiogroup" aria-label={ariaLabel} aria-labelledby={ariaLabelledby} className={joinClass(radioGroupOrientation[orientation], className)}>{children}</Box></RadioGroupContext.Provider>;
};
export type RadioGroupItemProps = { value: string; disabled?: boolean; children: ReactNode };
export const RadioGroupItem = ({ value, disabled, children }: RadioGroupItemProps) => {
  const context = useContext(RadioGroupContext);
  if (!context) throw new Error("RadioGroup.Item must be used inside RadioGroup");
  return <Inline as="label" gap="sm" align="center"><Radio name={context.name} value={value} checked={context.value === value} disabled={disabled} size={context.size} onChange={() => context.onValueChange?.(value)} /><Text variant="body" as="span" ink={disabled ? "faint" : "base"}>{children}</Text></Inline>;
};
export const RadioGroup = Object.assign(RadioGroupRoot, { Item: RadioGroupItem });
