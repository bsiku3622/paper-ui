import { createContext, forwardRef, useContext, type CSSProperties, type ElementType, type ReactNode } from "react";

import { paperError } from "../../internal/errors";
import { joinClass } from "../../internal/joinClass";
import { useMergedRef } from "../../internal/refs";
import { registerPart, targetProps } from "../../internal/render-target";
import { stateAttributes } from "../../tokens";
import { bareButton } from "../bare-button.css";
import { mergeProps } from "../composition";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import type { DraggableOptions, MoveDragOptions, TransferDragOptions } from "../types";
import { dragSurface } from "./drag.css";
import { useDraggable, type DraggableResult } from "./useDraggable";

const DragContext = createContext<DraggableResult | null>(null);
export type DraggableState = Pick<DraggableResult, "position" | "isDragging"> & { isDisabled: boolean };
export type DraggableOwnProps = DraggableOptions & {
  children?: ReactNode | ((state: DraggableState) => ReactNode);
};
export type DraggableProps<As extends ElementType = "div"> = PolymorphicProps<DraggableOwnProps, As>;
// Every option either mode takes, as one optional shape: the props are split into the options and the native attributes.
type OptionBag = Partial<Omit<MoveDragOptions, "mode" | "onDragStart" | "onDragMove" | "onDragEnd"> & Omit<TransferDragOptions, "mode" | "onDragStart" | "onDragMove" | "onDragEnd">> & {
  mode?: DraggableOptions["mode"];
  onDragStart?: (event: never) => void;
  onDragMove?: (event: never) => void;
  onDragEnd?: (event: never) => void;
};
type PropBag = OptionBag & { as?: ElementType; className?: string; style?: CSSProperties; children?: DraggableOwnProps["children"]; [attribute: string]: unknown };
const DraggableImpl = forwardRef<HTMLElement, Omit<DraggableProps, "as" | "ref"> & { as?: ElementType }>(function Draggable(props, forwardedRef) {
  const {
    as, mode = "move", activation = "surface", disabled = false, axis, position, defaultPosition, onPositionChange,
    onDragStart, onDragMove, onDragEnd, onDragCancel, getItems, getAllowedDropOperations,
    children, className, style, ...dom
  } = props as PropBag;
  const Tag = as ?? "div";
  const drag = useDraggable({ mode, activation, disabled, axis, position, defaultPosition, onPositionChange, onDragStart, onDragMove, onDragEnd, onDragCancel, getItems, getAllowedDropOperations } as DraggableOptions);
  const ref = useMergedRef(forwardedRef, drag.dragProps.ref);
  const target = targetProps(Tag, { disabled, type: dom.type as string | undefined, href: dom.href, kind: "control" });
  // The surface is a group, or the one control of a transfer, and takes the Tab stop only when it starts the drag:
  // the element's role and place in the Tab order are the Draggable's. A disabled one stops the drag and nothing
  // else: its content stays live. It says so the way targetProps tells it to; the aria-disabled in dragProps is for
  // a hook's own element.
  delete target.onClickCapture;
  const surface = { ...target, role: mode === "transfer" && activation === "surface" ? "button" : "group", tabIndex: activation === "surface" && !disabled ? 0 : undefined };
  const positionStyle: CSSProperties = mode === "move" ? { translate: `${drag.position.x}px ${drag.position.y}px` } : {};
  return <DragContext.Provider value={drag}>
    <Tag {...mergeProps(surface, dom, { ...drag.dragProps, "aria-disabled": target["aria-disabled"] })} ref={ref}
      className={joinClass(activation === "surface" && dragSurface, className)} style={{ ...positionStyle, ...style }}>
      {typeof children === "function" ? children({ position: drag.position, isDragging: drag.isDragging, isDisabled: disabled }) : children}
    </Tag>
  </DragContext.Provider>;
});
const DraggableRoot = registerPart(DraggableImpl) as PolymorphicComponent<DraggableOwnProps, "div">;

export type DraggableHandleOwnProps = { "aria-label": string; disabled?: boolean };
export type DraggableHandleProps<As extends ElementType = "button"> = PolymorphicProps<DraggableHandleOwnProps, As>;
const HandleImpl = forwardRef<HTMLElement, Omit<DraggableHandleProps, "as" | "ref"> & { as?: ElementType }>(function DraggableHandle({ as, className, disabled = false, ...props }, ref) {
  const drag = useContext(DragContext);
  if (!drag) throw paperError("Draggable.Handle must be used inside <Draggable>.");
  const Tag = as ?? "button";
  const { type, href } = props as { type?: string; href?: string };
  const target = targetProps(Tag, { disabled: disabled || drag.handleProps.disabled, type, href, kind: "control" });
  const handle = { ...drag.handleProps };
  delete handle.disabled;
  // A handle switched off by itself takes no input, though the Draggable around it is live: a browser still sends
  // pointer events to a disabled button, and other tags cannot be disabled natively at all.
  const input = disabled ? stateAttributes({ dragging: drag.isDragging }) : handle;
  return <Tag {...mergeProps(target, props, input)} ref={ref} className={joinClass(Tag === "button" && bareButton, dragSurface, className)} />;
});
const DragHandle = registerPart(HandleImpl) as PolymorphicComponent<DraggableHandleOwnProps, "button">;
export const Draggable = Object.assign(DraggableRoot, { Handle: DragHandle });
