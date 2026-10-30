import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { useMergedRef } from "../../internal/refs";
import { mergeProps } from "../composition";
import type { DropOptions } from "../types";
import { useDrop } from "./useDrop";

export type DroppableProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onDrop" | "onDropEnter" | "onDropMove" | "onDropExit"> & DropOptions & {
  children?: ReactNode | ((state: { isDropTarget: boolean }) => ReactNode);
};
export const Droppable = forwardRef<HTMLDivElement, DroppableProps>(function Droppable({
  disabled, getDropOperation, getDropOperationForPoint, onDrop, onDropEnter, onDropExit, onDropMove, onDropActivate, children, ...props
}, forwardedRef) {
  const { dropProps, isDropTarget } = useDrop({ disabled, getDropOperation, getDropOperationForPoint, onDrop, onDropEnter, onDropExit, onDropMove, onDropActivate });
  const ref = useMergedRef(forwardedRef, dropProps.ref);
  return <div {...mergeProps({ role: "button", tabIndex: disabled ? -1 : 0 }, props, dropProps)} ref={ref}>
    {typeof children === "function" ? children({ isDropTarget }) : children}
  </div>;
});
