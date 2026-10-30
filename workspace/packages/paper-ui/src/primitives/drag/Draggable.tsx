import { createContext, forwardRef, useContext, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { paperError } from "../../internal/errors";
import { joinClass } from "../../internal/joinClass";
import { useMergedRef } from "../../internal/refs";
import { mergeProps } from "../composition";
import { bareButton } from "../press/press.css";
import type { DragOptions, MoveDragOptions, TransferDragOptions } from "../types";
import { dragSurface } from "./drag.css";
import { useDrag, type DragResult } from "./useDrag";

const DragContext = createContext<DragResult | null>(null);
export type DraggableState = Pick<DragResult, "position" | "isDragging">;
export type DraggableProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onDragStart" | "onDragEnd" | "onDragMove"> & DragOptions & {
  children?: ReactNode | ((state: DraggableState) => ReactNode);
};
// Every option either mode takes, as one optional shape: the props are split into the options and the native attributes.
type OptionBag = Partial<Omit<MoveDragOptions, "mode" | "onDragStart" | "onDragMove" | "onDragEnd"> & Omit<TransferDragOptions, "mode" | "onDragStart" | "onDragMove" | "onDragEnd">> & {
  mode?: DragOptions["mode"];
  onDragStart?: (event: never) => void;
  onDragMove?: (event: never) => void;
  onDragEnd?: (event: never) => void;
};
type PropBag = OptionBag & Omit<HTMLAttributes<HTMLDivElement>, keyof OptionBag | "children"> & Pick<DraggableProps, "children">;
const DraggableRoot = forwardRef<HTMLDivElement, DraggableProps>(function Draggable(props, forwardedRef) {
  const {
    mode = "move", activation = "surface", disabled, axis, position, defaultPosition, onPositionChange,
    onDragStart, onDragMove, onDragEnd, onDragCancel, getItems, getAllowedDropOperations,
    children, className, style, ...dom
  } = props as PropBag;
  const drag = useDrag({ mode, activation, disabled, axis, position, defaultPosition, onPositionChange, onDragStart, onDragMove, onDragEnd, onDragCancel, getItems, getAllowedDropOperations } as DragOptions);
  const ref = useMergedRef(forwardedRef, drag.dragProps.ref);
  const surfaceProps = { role: mode === "transfer" && activation === "surface" ? "button" : "group", tabIndex: activation === "surface" && !disabled ? 0 : undefined };
  const positionStyle: CSSProperties = mode === "move" ? { translate: `${drag.position.x}px ${drag.position.y}px` } : {};
  return <DragContext.Provider value={drag}>
    <div {...mergeProps(surfaceProps, dom, drag.dragProps)} ref={ref}
      className={joinClass(activation === "surface" && dragSurface, className)} style={{ ...positionStyle, ...style }}>
      {typeof children === "function" ? children({ position: drag.position, isDragging: drag.isDragging }) : children}
    </div>
  </DragContext.Provider>;
});
export type DraggableHandleProps = ButtonHTMLAttributes<HTMLButtonElement> & { "aria-label": string };
const DragHandle = forwardRef<HTMLButtonElement, DraggableHandleProps>(function DraggableHandle({ className, type = "button", disabled, ...props }, ref) {
  const drag = useContext(DragContext);
  if (!drag) throw paperError("Draggable.Handle must be used inside <Draggable>.");
  return <button {...mergeProps(props, drag.handleProps)} ref={ref} type={type}
    disabled={disabled || drag.handleProps.disabled} className={joinClass(bareButton, dragSurface, className)} />;
});
export const Draggable = Object.assign(DraggableRoot, { Handle: DragHandle });
