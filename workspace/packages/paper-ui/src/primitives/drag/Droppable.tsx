import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { useMergedRef } from "../../internal/refs";
import { mergeProps } from "../composition";
import type { DroppableOptions } from "../types";
import { useDroppable } from "./useDroppable";

export type DroppableProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onDrop" | "onDropEnter" | "onDropMove" | "onDropExit"> & DroppableOptions & {
  children?: ReactNode | ((state: { isDropTarget: boolean }) => ReactNode);
};
export const Droppable = forwardRef<HTMLDivElement, DroppableProps>(function Droppable({
  disabled, getDropOperation, getDropOperationForPoint, onDrop, onDropEnter, onDropExit, onDropMove, onDropActivate, children, ...props
}, forwardedRef) {
  const { dropProps, isDropTarget } = useDroppable({ disabled, getDropOperation, getDropOperationForPoint, onDrop, onDropEnter, onDropExit, onDropMove, onDropActivate });
  const ref = useMergedRef(forwardedRef, dropProps.ref);
  return <div {...mergeProps({ role: "button", tabIndex: disabled ? -1 : 0 }, props, dropProps)} ref={ref}>
    {typeof children === "function" ? children({ isDropTarget }) : children}
  </div>;
});
