import { useDrag, useDrop } from "@react-aria/dnd";
import type { HTMLAttributes, RefObject } from "react";

import type { DragItem, DropOperation, DroppableOptions, PressEvent, TransferDragEvent } from "../../primitives/types";

// Native drag and drop, with the keyboard path React Aria builds for it. The keyboard path starts from a button the
// caller renders: startFromKeyboard is its press handler and buttonProps its description.
export function useAriaDrag({ disabled, ...options }: {
  disabled: boolean;
  handle: boolean;
  getItems: () => DragItem[];
  getAllowedDropOperations?: () => DropOperation[];
  onDragStart?: (event: TransferDragEvent) => void;
  onDragMove?: (event: TransferDragEvent) => void;
  onDragEnd?: (event: TransferDragEvent) => void;
}): {
  dragProps: HTMLAttributes<HTMLElement>;
  buttonProps: HTMLAttributes<HTMLElement>;
  startFromKeyboard: ((event: PressEvent) => void) | undefined;
  isDragging: boolean;
} {
  const { handle, ...rest } = options;
  const { dragProps, dragButtonProps, isDragging } = useDrag({ ...rest, isDisabled: disabled, hasDragButton: handle });
  const { onPress, ...buttonProps } = dragButtonProps;
  return { dragProps, buttonProps: buttonProps as HTMLAttributes<HTMLElement>, startFromKeyboard: onPress as ((event: PressEvent) => void) | undefined, isDragging };
}

export function useAriaDrop({ disabled, ...options }: DroppableOptions, ref: RefObject<HTMLElement | null>): { dropProps: HTMLAttributes<HTMLElement>; isDropTarget: boolean } {
  const { dropProps, isDropTarget } = useDrop({ ...options, isDisabled: disabled, ref });
  return { dropProps, isDropTarget };
}
