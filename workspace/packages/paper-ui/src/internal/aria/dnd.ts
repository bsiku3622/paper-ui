import { useDrag, useDrop } from "@react-aria/dnd";
import { usePress } from "@react-aria/interactions";
import type { HTMLAttributes, RefObject } from "react";

import type { DragItem, DropOperation, DroppableOptions, TransferDragEvent } from "../../primitives/types";

// Native drag and drop, with the keyboard path React Aria builds for it. The keyboard path starts from a button the
// caller renders, and buttonProps carries its press and its description. The press is React Aria's own, with no
// click after it: the drag that press starts takes a click on the dragged element for a cancel.
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
  isDragging: boolean;
} {
  const { handle, ...rest } = options;
  const { dragProps, dragButtonProps, isDragging } = useDrag({ ...rest, isDisabled: disabled, hasDragButton: handle });
  const { onPress, ...description } = dragButtonProps;
  const { pressProps } = usePress({ isDisabled: disabled, onPress });
  return { dragProps, buttonProps: { ...(description as HTMLAttributes<HTMLElement>), ...pressProps }, isDragging };
}

export function useAriaDrop({ disabled, ...options }: DroppableOptions, ref: RefObject<HTMLElement | null>): { dropProps: HTMLAttributes<HTMLElement>; isDropTarget: boolean } {
  const { dropProps, isDropTarget } = useDrop({ ...options, isDisabled: disabled, ref });
  return { dropProps, isDropTarget };
}
