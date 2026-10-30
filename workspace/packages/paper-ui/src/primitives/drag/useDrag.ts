import { useCallback, useEffect, useRef, useState, type HTMLAttributes } from "react";
import { useMove } from "@react-aria/interactions";
import { useDrag as useAriaDrag, type DragOptions as AriaDragOptions } from "@react-aria/dnd";
import { mergeProps } from "@react-aria/utils";
import { usePressable } from "../press/usePressable";

export type DragPosition = { x: number; y: number };
export type MoveDragEvent = { position: DragPosition; delta: DragPosition; pointerType: string };
type CommonDragOptions = { disabled?: boolean; activation?: "surface" | "handle" };
export type MoveDragOptions = CommonDragOptions & {
  mode?: "move";
  position?: DragPosition;
  defaultPosition?: DragPosition;
  onPositionChange?: (position: DragPosition) => void;
  axis?: "both" | "x" | "y";
  onDragStart?: (event: MoveDragEvent) => void;
  onDragMove?: (event: MoveDragEvent) => void;
  onDragEnd?: (event: MoveDragEvent) => void;
  onDragCancel?: (event: MoveDragEvent) => void;
};
export type TransferDragOptions = CommonDragOptions & Omit<AriaDragOptions, "isDisabled" | "hasDragButton" | "preview"> & { mode: "transfer" };
export type DragOptions = MoveDragOptions | TransferDragOptions;

// Inputs on child controls must keep text editing, navigation and button behavior.
const isChildControl = (event: { target: EventTarget | null; currentTarget: EventTarget | null }) => {
  if (!(event.target instanceof Element) || !(event.currentTarget instanceof Element)) return false;
  const control = event.target.closest("button, input, textarea, select, a[href], [contenteditable]:not([contenteditable=false]), [data-drag-ignore]");
  return !!control && control !== event.currentTarget && event.currentTarget.contains(control);
};

export function useDrag(options: DragOptions = {}) {
  const mode = options.mode ?? "move";
  const activation = options.activation ?? "surface";
  const disabled = options.disabled ?? false;
  const movement: MoveDragOptions = options.mode === "transfer" ? {} : options;
  const { onPositionChange, onDragCancel, position: controlledPosition } = movement;
  const transfer = options.mode === "transfer" ? options : null;
  const targetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const [internal, setInternal] = useState(movement.defaultPosition ?? { x: 0, y: 0 });
  const position = movement.position ?? internal;
  const current = useRef(position);
  const origin = useRef(position);
  const distance = useRef({ x: 0, y: 0 });
  const active = useRef(false);
  const pointerType = useRef("mouse");
  const [isMoving, setMoving] = useState(false);
  current.current = position;
  const setPosition = useCallback((next: DragPosition) => {
    current.current = next;
    if (controlledPosition === undefined) setInternal(next);
    onPositionChange?.(next);
  }, [controlledPosition, onPositionChange]);
  const event = () => ({ position: current.current, delta: { x: current.current.x - origin.current.x, y: current.current.y - origin.current.y }, pointerType: pointerType.current });
  const cancel = useCallback(() => {
    if (!active.current) return;
    const cancelled = { position: current.current, delta: { x: current.current.x - origin.current.x, y: current.current.y - origin.current.y }, pointerType: pointerType.current };
    active.current = false;
    setPosition(origin.current);
    setMoving(false);
    onDragCancel?.(cancelled);
  }, [setPosition, onDragCancel]);
  useEffect(() => {
    if (disabled || mode !== "move") cancel();
  }, [disabled, mode, cancel]);
  useEffect(() => {
    if (!isMoving) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); cancel(); } };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isMoving, cancel]);
  const { moveProps } = useMove({
    onMoveStart(e) {
      if (disabled || mode !== "move") return;
      origin.current = current.current;
      distance.current = { x: 0, y: 0 };
      pointerType.current = e.pointerType;
      active.current = true;
      setMoving(true);
      movement.onDragStart?.(event());
    },
    onMove(e) {
      if (!active.current || disabled) return;
      distance.current = { x: distance.current.x + (movement.axis === "y" ? 0 : e.deltaX), y: distance.current.y + (movement.axis === "x" ? 0 : e.deltaY) };
      const next = { x: origin.current.x + distance.current.x, y: origin.current.y + distance.current.y };
      setPosition(next);
      movement.onDragMove?.(event());
    },
    onMoveEnd() {
      if (!active.current) return;
      active.current = false;
      setMoving(false);
      movement.onDragEnd?.(event());
    },
  });
  const native = useAriaDrag({
    ...transfer,
    getItems: transfer?.getItems ?? (() => []),
    isDisabled: disabled || mode !== "transfer",
    hasDragButton: activation === "handle",
  });
  const { onPress: keyboardPress, ...dragButtonDOM } = native.dragButtonProps;
  const dragButton = usePressable({ disabled: disabled || mode !== "transfer", onPress: keyboardPress }, activation === "handle" ? handleRef : undefined);
  const moveInput: HTMLAttributes<HTMLElement> = disabled ? {} : {
    ...moveProps,
    onPointerDown(e) { if (!isChildControl(e)) moveProps.onPointerDown?.(e); },
    onMouseDown(e) { if (!isChildControl(e)) moveProps.onMouseDown?.(e); },
    onTouchStart(e) { if (!isChildControl(e)) moveProps.onTouchStart?.(e); },
    onKeyDown(e) { if (e.target === e.currentTarget) moveProps.onKeyDown?.(e); },
  };
  const transferInput = mergeProps(native.dragProps, dragButtonDOM, dragButton.pressProps, {
    onDragStart(e: React.DragEvent<HTMLElement>) {
      if (targetRef.current && e.dataTransfer) e.dataTransfer.setDragImage(targetRef.current, 0, 0);
    },
  });
  const inputProps = mode === "move" ? moveInput : transferInput;
  const isDragging = mode === "move" ? isMoving : native.isDragging;
  return {
    targetRef, handleRef, position, isDragging, cancel,
    draggableProps: { ...(activation === "surface" ? inputProps : {}), ref: targetRef, "data-dragging": isDragging || undefined, "aria-disabled": disabled || undefined },
    handleProps: { ...(activation === "handle" ? inputProps : {}), ref: handleRef, disabled, "data-dragging": isDragging || undefined },
  };
}
