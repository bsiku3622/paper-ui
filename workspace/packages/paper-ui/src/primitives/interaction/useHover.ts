import { useHover as useAriaHover, type HoverProps } from "@react-aria/interactions";
export type HoverOptions = Omit<HoverProps, "isDisabled"> & { disabled?: boolean };
export type { HoverEvent } from "@react-aria/interactions";
export function useHover({ disabled, ...options }: HoverOptions = {}) {
  return useAriaHover({ ...options, isDisabled: disabled });
}
