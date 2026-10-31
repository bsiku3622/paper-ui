import { useCallback, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type RefCallback } from "react";

import { useAriaDrag } from "../../internal/aria/dnd";
import { useAriaMove } from "../../internal/aria/move";
import { useControllableState } from "../../internal/useControllableState";
import { MARKER_ATTRIBUTE, stateAttributes, type StateAttributes } from "../../tokens";
import { mergeProps } from "../composition";
import type { DraggableOptions, DragPosition, MoveDragOptions } from "../types";

export type DraggableResult = {
  /** Spread on the element that moves, or that is dragged. Carries its own ref, `data-dragging` and `data-disabled`. */
  dragProps: HTMLAttributes<HTMLElement> & { ref: RefCallback<HTMLElement> } & StateAttributes<"dragging" | "disabled">;
  /** Spread on the handle, when `activation` is "handle". Carries `data-dragging` and `data-disabled`. */
  handleProps: ButtonHTMLAttributes<HTMLButtonElement> & StateAttributes<"dragging" | "disabled">;
  position: DragPosition;
  isDragging: boolean;
  /** Ends a move in progress and returns to where it began. */
  cancel: () => void;
};

const samePoint = (a: DragPosition, b: DragPosition) => a.x === b.x && a.y === b.y;

// Inputs on child controls must keep text editing, navigation and button behavior.
const isChildControl = (event: { target: EventTarget | null; currentTarget: EventTarget | null }) => {
  if (!(event.target instanceof Element) || !(event.currentTarget instanceof Element)) return false;
  const control = event.target.closest(`button, input, textarea, select, a[href], [contenteditable]:not([contenteditable=false]), [${MARKER_ATTRIBUTE.dragIgnore}]`);
  return !!control && control !== event.currentTarget && event.currentTarget.contains(control);
};

export function useDraggable(options: DraggableOptions = {}): DraggableResult {
  const mode = options.mode ?? "move";
  const activation = options.activation ?? "surface";
  const disabled = options.disabled ?? false;
  const movement: MoveDragOptions = options.mode === "transfer" ? {} : options;
  const transfer = options.mode === "transfer" ? options : null;
  const target = useRef<HTMLElement | null>(null);
  const targetRef = useCallback((node: HTMLElement | null) => { target.current = node; }, []);
  const [position, set] = useControllableState({
    value: movement.position,
    defaultValue: movement.defaultPosition ?? { x: 0, y: 0 },
    onChange: movement.onPositionChange,
    equals: samePoint,
  });
  const current = useRef(position);
  const origin = useRef(position);
  const distance = useRef({ x: 0, y: 0 });
  const active = useRef(false);
  const pointerType = useRef("mouse");
  const [isMoving, setMoving] = useState(false);
  current.current = position;
  const setPosition = useCallback((next: DragPosition) => {
    current.current = next;
    set(next);
  }, [set]);
  const { onDragCancel } = movement;
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
  const { moveProps } = useAriaMove({
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
    getItems: transfer?.getItems ?? (() => []),
    getAllowedDropOperations: transfer?.getAllowedDropOperations,
    onDragStart: transfer?.onDragStart,
    onDragMove: transfer?.onDragMove,
    onDragEnd: transfer?.onDragEnd,
    disabled: disabled || mode !== "transfer",
    handle: activation === "handle",
  });
  const moveInput: HTMLAttributes<HTMLElement> = disabled ? {} : {
    ...moveProps,
    onPointerDown(e) { if (!isChildControl(e)) moveProps.onPointerDown?.(e); },
    onMouseDown(e) { if (!isChildControl(e)) moveProps.onMouseDown?.(e); },
    onTouchStart(e) { if (!isChildControl(e)) moveProps.onTouchStart?.(e); },
    onKeyDown(e) { if (e.target === e.currentTarget) moveProps.onKeyDown?.(e); },
  };
  const transferInput = mergeProps(native.dragProps, native.buttonProps, {
    onDragStart(e: React.DragEvent<HTMLElement>) {
      if (target.current && e.dataTransfer) e.dataTransfer.setDragImage(target.current, 0, 0);
    },
  });
  const inputProps: HTMLAttributes<HTMLElement> = mode === "move" ? moveInput : transferInput;
  const isDragging = mode === "move" ? isMoving : native.isDragging;
  const states = stateAttributes({ dragging: isDragging, disabled });
  return {
    dragProps: mergeProps(activation === "surface" ? inputProps : null, { ref: targetRef, "aria-disabled": disabled || undefined, ...states }),
    handleProps: mergeProps(activation === "handle" ? inputProps : null, { disabled, ...states }),
    position,
    isDragging,
    cancel,
  };
}
