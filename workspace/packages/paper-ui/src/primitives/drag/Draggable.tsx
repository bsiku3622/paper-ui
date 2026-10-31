import { createContext, forwardRef, useContext, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { paperError } from "../../internal/errors";
import { joinClass } from "../../internal/joinClass";
import { useMergedRef } from "../../internal/refs";
import { bareButton } from "../bare-button.css";
import { mergeProps } from "../composition";
import type { DraggableOptions, MoveDragOptions, TransferDragOptions } from "../types";
import { dragSurface } from "./drag.css";
import { useDraggable, type DraggableResult } from "./useDraggable";

const DragContext = createContext<DraggableResult | null>(null);
export type DraggableState = Pick<DraggableResult, "position" | "isDragging">;
export type DraggableProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onDragStart" | "onDragEnd" | "onDragMove"> & DraggableOptions & {
  children?: ReactNode | ((state: DraggableState) => ReactNode);
};
// Every option either mode takes, as one optional shape: the props are split into the options and the native attributes.
type OptionBag = Partial<Omit<MoveDragOptions, "mode" | "onDragStart" | "onDragMove" | "onDragEnd"> & Omit<TransferDragOptions, "mode" | "onDragStart" | "onDragMove" | "onDragEnd">> & {
  mode?: DraggableOptions["mode"];
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
  const drag = useDraggable({ mode, activation, disabled, axis, position, defaultPosition, onPositionChange, onDragStart, onDragMove, onDragEnd, onDragCancel, getItems, getAllowedDropOperations } as DraggableOptions);
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
