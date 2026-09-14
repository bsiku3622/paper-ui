// Steps — 실제 순서를 JSX item으로 드러내는 compound flow.

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

import { Badge } from "../atoms";
import { Box, Stack, Text } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { useControllableState } from "../internal/useControllableState";
import { stepButton, stepClickable, stepCopy, stepFuture, stepItem, stepItemHorizontal, stepItemVertical, stepMarker, stepsOrientation, stepsRoot } from "./Steps.css";

export type StepsProps = { value?: string; defaultValue?: string; orientation?: "horizontal" | "vertical"; onValueChange?: (value: string) => void; "aria-label"?: string; className?: string; children: ReactNode };
export type StepItemProps = { value: string; description?: ReactNode; children: ReactNode };
type InternalStepItemProps = StepItemProps & { __index?: number; __currentIndex?: number; __orientation?: "horizontal" | "vertical"; __onValueChange?: (value: string) => void };

const StepItemImpl = ({ value, description, children, __index = 0, __currentIndex = 0, __orientation = "horizontal", __onValueChange }: InternalStepItemProps) => {
  const state = __index < __currentIndex ? "complete" : __index === __currentIndex ? "current" : "future";
  return <Box as="li" aria-current={state === "current" ? "step" : undefined} className={joinClass(stepItem, __orientation === "horizontal" ? stepItemHorizontal : stepItemVertical)}>
    <Box as={__onValueChange ? "button" : "div"} {...(__onValueChange ? { type: "button" as const, onClick: () => __onValueChange(value) } : null)} className={joinClass(stepButton, __onValueChange && stepClickable, state === "future" && stepFuture)}>
      <Badge variant={state === "current" ? "solid" : state === "complete" ? "soft" : "hairline"} size="sm" shape="pill" className={stepMarker}>{__index + 1}</Badge>
      <Stack gap="xs" className={stepCopy}><Text as="span" variant="label" ink="inherit">{children}</Text>{description ? <Text as="span" variant="caption" ink={state === "future" ? "faint" : "soft"}>{description}</Text> : null}</Stack>
    </Box>
  </Box>;
};
export const StepItem = StepItemImpl as (props: StepItemProps) => ReactElement;

const StepsRoot = ({ value: controlledValue, defaultValue, orientation = "horizontal", onValueChange, "aria-label": ariaLabel = "진행 단계", className, children }: StepsProps) => {
  const items = Children.toArray(children).filter((child): child is ReactElement<InternalStepItemProps> => isValidElement(child));
  const [value, setValue] = useControllableState({ value: controlledValue, defaultValue: defaultValue ?? items[0]?.props.value ?? "", onValueChange });
  const interactive = onValueChange !== undefined || defaultValue !== undefined;
  const currentIndex = Math.max(0, items.findIndex((item) => item.props.value === value));
  return <Box as="ol" aria-label={ariaLabel} className={joinClass(stepsRoot, stepsOrientation[orientation], className)}>
    {items.map((item, index) => cloneElement(item, { __index: index, __currentIndex: currentIndex, __orientation: orientation, __onValueChange: interactive ? setValue : undefined }))}
  </Box>;
};
export const Steps = Object.assign(StepsRoot, { Item: StepItem });
