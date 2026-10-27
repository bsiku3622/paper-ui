import { forwardRef, useRef, type HTMLAttributes, type ReactNode } from "react";
import { mergeProps, mergeRefs } from "@react-aria/utils";
import { useDrop, type DropOptions } from "./useDrop";

export type DroppableProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onDrop" | "onDropEnter" | "onDropMove" | "onDropExit"> & DropOptions & {
  children?: ReactNode | ((state: { isDropTarget: boolean }) => ReactNode);
};
export const Droppable = forwardRef<HTMLDivElement, DroppableProps>(function Droppable({
  disabled, getDropOperation, getDropOperationForPoint, onDrop, onDropEnter, onDropExit, onDropMove, onDropActivate, children, ...props
}, forwardedRef) {
  const ref = useRef<HTMLDivElement>(null);
  const { dropProps, isDropTarget } = useDrop({ disabled, getDropOperation, getDropOperationForPoint, onDrop, onDropEnter, onDropExit, onDropMove, onDropActivate }, ref);
  return <div {...mergeProps({ role: "button", tabIndex: disabled ? -1 : 0 }, props, dropProps)} ref={mergeRefs(ref, forwardedRef)}>
    {typeof children === "function" ? children({ isDropTarget }) : children}
  </div>;
});
