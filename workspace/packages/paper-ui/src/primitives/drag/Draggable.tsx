import { createContext, forwardRef, useContext, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { mergeProps, mergeRefs } from "@react-aria/utils";
import { useDrag, type DragOptions } from "./useDrag";
import { bareButton } from "../press/press.css";
import { dragSurface } from "./drag.css";
import { joinClass } from "../../internal/joinClass";

type DragResult = ReturnType<typeof useDrag>;
const DragContext = createContext<DragResult | null>(null);
export type DraggableState = Pick<DragResult, "position" | "isDragging">;
export type DraggableProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onDragStart" | "onDragEnd" | "onDragMove"> & DragOptions & {
  children?: ReactNode | ((state: DraggableState) => ReactNode);
};
const customKeys = ["axis", "position", "defaultPosition", "onPositionChange", "onDragStart", "onDragMove", "onDragEnd", "onDragCancel", "getItems", "getAllowedDropOperations"];
const DraggableRoot = forwardRef<HTMLDivElement, DraggableProps>(function Draggable({ children, className, style, ...props }, ref) {
  const { mode = "move", activation = "surface", disabled, ...rest } = props;
  const drag = useDrag(props);
  const dom = Object.fromEntries(Object.entries(rest).filter(([name]) => !customKeys.includes(name)));
  const surfaceProps = { role: mode === "transfer" && activation === "surface" ? "button" : "group", tabIndex: activation === "surface" && !disabled ? 0 : undefined };
  const positionStyle: CSSProperties = mode === "move" ? { translate: `${drag.position.x}px ${drag.position.y}px` } : {};
  return <DragContext.Provider value={drag}>
    <div {...mergeProps(surfaceProps, dom, drag.draggableProps)} ref={mergeRefs(drag.targetRef, ref)}
      className={joinClass(activation === "surface" && dragSurface, className)} style={{ ...positionStyle, ...style }}>
      {typeof children === "function" ? children({ position: drag.position, isDragging: drag.isDragging }) : children}
    </div>
  </DragContext.Provider>;
});
export type DragHandleProps = ButtonHTMLAttributes<HTMLButtonElement> & { "aria-label": string };
const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(function DragHandle({ className, type = "button", disabled, ...props }, ref) {
  const drag = useContext(DragContext);
  if (!drag) throw new Error("Draggable.Handle must be inside Draggable.");
  return <button {...mergeProps(props, drag.handleProps)} ref={mergeRefs(drag.handleRef, ref)} type={type}
    disabled={disabled || drag.handleProps.disabled} className={joinClass(bareButton, dragSurface, className)} />;
});
export const Draggable = Object.assign(DraggableRoot, { Handle: DragHandle });
