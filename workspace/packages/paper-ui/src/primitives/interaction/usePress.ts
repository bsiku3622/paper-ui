import { usePress as useAriaPress, type PressHookProps } from "@react-aria/interactions";
import type { RefObject } from "react";

export type PressOptions = Omit<PressHookProps, "isDisabled" | "ref"> & { disabled?: boolean };
export type { PressEvent } from "@react-aria/interactions";
export function usePress({ disabled, ...options }: PressOptions = {}, ref?: RefObject<HTMLElement | null>) {
  return useAriaPress({ ...options, isDisabled: disabled, ref });
}
