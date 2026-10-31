import { forwardRef, type ElementType, type ReactNode } from "react";

import { joinClass } from "../../internal/joinClass";
import { useMergedRef } from "../../internal/refs";
import { registerPart, targetProps } from "../../internal/render-target";
import { mergeProps } from "../composition";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import type { DroppableOptions } from "../types";
import { dropSurface } from "./drag.css";
import { useDroppable } from "./useDroppable";

export type DroppableState = { isDropTarget: boolean; isDisabled: boolean };
export type DroppableOwnProps = DroppableOptions & {
  children?: ReactNode | ((state: DroppableState) => ReactNode);
};
export type DroppableProps<As extends ElementType = "div"> = PolymorphicProps<DroppableOwnProps, As>;
const DroppableImpl = forwardRef<HTMLElement, Omit<DroppableProps, "as" | "ref"> & { as?: ElementType }>(function Droppable({
  as, disabled = false, getDropOperation, getDropOperationForPoint, onDrop, onDropEnter, onDropExit, onDropMove, onDropActivate, children, className, ...props
}, forwardedRef) {
  const { dropProps, isDropTarget } = useDroppable({ disabled, getDropOperation, getDropOperationForPoint, onDrop, onDropEnter, onDropExit, onDropMove, onDropActivate });
  const ref = useMergedRef(forwardedRef, dropProps.ref);
  const Tag = as ?? "div";
  const { type, href } = props as { type?: string; href?: string };
  const target = targetProps(Tag, { disabled, type, href, kind: "control" });
  // A disabled one takes no drop and nothing else: its content stays live. The target says it is disabled the way
  // targetProps tells it to; the aria-disabled in dropProps is for a hook's own element.
  delete target.onClickCapture;
  delete target.onAuxClickCapture;
  return <Tag {...mergeProps(target, props, { ...dropProps, "aria-disabled": target["aria-disabled"] })} ref={ref} className={joinClass(dropSurface, className)}>
    {typeof children === "function" ? children({ isDropTarget, isDisabled: disabled }) : children}
  </Tag>;
});
export const Droppable = registerPart(DroppableImpl) as PolymorphicComponent<DroppableOwnProps, "div">;
