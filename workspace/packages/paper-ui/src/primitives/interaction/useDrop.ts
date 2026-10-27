import { useRef, type RefObject } from "react";
import { useDrop as useAriaDrop, type DropOptions as AriaDropOptions, type DropResult as AriaDropResult } from "@react-aria/dnd";

export type DropOptions = Omit<AriaDropOptions, "ref" | "isDisabled" | "hasDropButton"> & { disabled?: boolean };
export type { DropEvent, DropItem, DragItem, DropOperation } from "@react-aria/dnd";
export type DropResult = Omit<AriaDropResult, "dropProps"> & {
  ref: RefObject<HTMLElement | null>;
  dropProps: AriaDropResult["dropProps"] & { ref: RefObject<HTMLElement | null>; "data-drop-target": true | undefined; "aria-disabled": true | undefined };
};
export function useDrop({ disabled, ...options }: DropOptions = {}, externalRef?: RefObject<HTMLElement | null>): DropResult {
  const internalRef = useRef<HTMLElement>(null);
  const ref = externalRef ?? internalRef;
  const result = useAriaDrop({ ...options, isDisabled: disabled, ref });
  return { ...result, ref, dropProps: { ...result.dropProps, ref, "data-drop-target": result.isDropTarget || undefined, "aria-disabled": disabled || undefined } };
}
