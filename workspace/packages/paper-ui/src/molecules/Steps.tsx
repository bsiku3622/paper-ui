// Steps — 실제 순서가 있는 흐름의 현재 위치.

import type { ReactNode } from "react";

import { Badge } from "../atoms";
import { Box, Stack, Text } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { stepButton, stepClickable, stepCopy, stepFuture, stepItem, stepItemHorizontal, stepItemVertical, stepMarker, stepsOrientation, stepsRoot } from "./Steps.css";

export type StepItem = { value: string; label: ReactNode; description?: ReactNode };
export type StepsProps = {
  items: readonly StepItem[];
  current: string;
  orientation?: "horizontal" | "vertical";
  onChange?: (value: string) => void;
  "aria-label"?: string;
  className?: string;
};

export const Steps = ({ items, current, orientation = "horizontal", onChange, "aria-label": ariaLabel = "진행 단계", className }: StepsProps) => {
  const currentIndex = Math.max(0, items.findIndex((item) => item.value === current));
  return (
    <Box as="ol" aria-label={ariaLabel} className={joinClass(stepsRoot, stepsOrientation[orientation], className)}>
      {items.map((item, index) => {
        const state = index < currentIndex ? "complete" : index === currentIndex ? "current" : "future";
        return (
          <Box
            as="li"
            key={item.value}
            aria-current={state === "current" ? "step" : undefined}
            className={joinClass(stepItem, orientation === "horizontal" ? stepItemHorizontal : stepItemVertical)}
          >
            <Box
              as={onChange ? "button" : "div"}
              {...(onChange ? { type: "button" as const, onClick: () => onChange(item.value) } : null)}
              className={joinClass(stepButton, onChange && stepClickable, state === "future" && stepFuture)}
            >
              <Badge
                variant={state === "current" ? "solid" : state === "complete" ? "soft" : "hairline"}
                size="sm"
                shape="pill"
                className={stepMarker}
              >
                {index + 1}
              </Badge>
              <Stack gap="xs" className={stepCopy}>
                <Text as="span" variant="label" ink="inherit">{item.label}</Text>
                {item.description ? <Text as="span" variant="caption" ink={state === "future" ? "faint" : "soft"}>{item.description}</Text> : null}
              </Stack>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
