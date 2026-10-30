import { usePress, type PressHookProps } from "@react-aria/interactions";
import type { RefObject } from "react";

export type PressableOptions = Omit<PressHookProps, "isDisabled" | "ref"> & { disabled?: boolean };
export type { PressEvent } from "@react-aria/interactions";
export function usePressable({ disabled, ...options }: PressableOptions = {}, ref?: RefObject<HTMLElement | null>) {
  return usePress({ ...options, isDisabled: disabled, ref });
}
export type PressableResult = ReturnType<typeof usePressable>;
