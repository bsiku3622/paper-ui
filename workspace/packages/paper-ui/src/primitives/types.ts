// The event and option types of the Interaction and A11y primitives, declared by Paper. React Aria does the work
// behind internal/aria, and its types never reach this surface: the adapters take these shapes and return them.

import type { FocusEvent, ReactNode } from "react";

import type { Space } from "../tokens";

// ───── Press ──────────────────────────────────────────────────────────────────

export type PointerType = "mouse" | "pen" | "touch" | "keyboard" | "virtual";

export type PressEvent = {
  type: "pressstart" | "pressend" | "pressup" | "press";
  pointerType: PointerType;
  target: Element;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  /** Relative to the target. */
  x: number;
  y: number;
  /** The key that triggered a keyboard press. */
  key?: string;
  /** A press stops at the element that handles it; a handler that declines it lets a parent take it. */
  continuePropagation(): void;
};

export type PressableOptions = {
  disabled?: boolean;
  /** `press` makes the 1px press of a button, with its pointer cursor and the look of a target that cannot be used. */
  motion?: "none" | "press";
  onPress?: (event: PressEvent) => void;
  onPressStart?: (event: PressEvent) => void;
  onPressEnd?: (event: PressEvent) => void;
  onPressUp?: (event: PressEvent) => void;
  onPressChange?: (isActive: boolean) => void;
  preventFocusOnPress?: boolean;
  cancelOnPointerExit?: boolean;
  allowTextSelection?: boolean;
};

// ───── Focus ──────────────────────────────────────────────────────────────────

export type FocusRingOptions = {
  /** Include the focus of descendants. */
  within?: boolean;
  /** The element is a text input, which shows its ring for every kind of focus. */
  textInput?: boolean;
  autoFocus?: boolean;
};

export type FocusWithinOptions = {
  disabled?: boolean;
  onFocusWithin?: (event: FocusEvent) => void;
  onBlurWithin?: (event: FocusEvent) => void;
  onFocusWithinChange?: (isFocusWithin: boolean) => void;
};

export type FocusScopeProps = {
  /** Keep Tab inside the scope. */
  contain?: boolean;
  /** Return focus to the element that had it when the scope mounted. */
  restoreFocus?: boolean;
  /** Move focus into the scope when it mounts. */
  autoFocus?: boolean;
  children?: ReactNode;
};

// ───── Drag and drop ──────────────────────────────────────────────────────────

export type DropOperation = "copy" | "link" | "move" | "cancel";
/** A dragged item: one string per type, the types usually being MIME types. */
export type DragItem = Record<string, string>;
export type DragTypes = {
  /** Whether the drag carries data of the type (or of every type in a list). */
  has(type: string | symbol | Array<string | symbol>): boolean;
};

export type TextDropItem = {
  kind: "text";
  types: Set<string>;
  getText(type: string): Promise<string>;
};
export type FileDropItem = {
  kind: "file";
  /** Usually a MIME type. */
  type: string;
  name: string;
  getFile(): Promise<File>;
  getText(): Promise<string>;
};
export type DirectoryDropItem = {
  kind: "directory";
  name: string;
  getEntries(): AsyncIterable<FileDropItem | DirectoryDropItem>;
};
export type DropItem = TextDropItem | FileDropItem | DirectoryDropItem;

/** Coordinates are relative to the target element. */
type DragPoint = { x: number; y: number };
export type DropEnterEvent = DragPoint & { type: "dropenter" };
export type DropMoveEvent = DragPoint & { type: "dropmove" };
export type DropExitEvent = DragPoint & { type: "dropexit" };
export type DropActivateEvent = DragPoint & { type: "dropactivate" };
export type DropEvent = DragPoint & { type: "drop"; dropOperation: DropOperation; items: DropItem[] };

export type DroppableOptions = {
  disabled?: boolean;
  getDropOperation?: (types: DragTypes, allowedOperations: DropOperation[]) => DropOperation;
  getDropOperationForPoint?: (types: DragTypes, allowedOperations: DropOperation[], x: number, y: number) => DropOperation;
  onDropEnter?: (event: DropEnterEvent) => void;
  onDropMove?: (event: DropMoveEvent) => void;
  onDropExit?: (event: DropExitEvent) => void;
  onDropActivate?: (event: DropActivateEvent) => void;
  onDrop?: (event: DropEvent) => void;
};

export type TransferDragEvent = DragPoint & {
  type: "dragstart" | "dragmove" | "dragend";
  /** What the drop did, on dragend. */
  dropOperation?: DropOperation;
};

export type DragPosition = { x: number; y: number };
export type MoveDragEvent = { position: DragPosition; delta: DragPosition; pointerType: string };

type CommonDragOptions = { disabled?: boolean; activation?: "surface" | "handle" };
export type MoveDragOptions = CommonDragOptions & {
  mode?: "move";
  position?: DragPosition;
  defaultPosition?: DragPosition;
  onPositionChange?: (position: DragPosition) => void;
  axis?: "both" | "x" | "y";
  /** How far an arrow key moves the box: a step of the gap scale, measured where the box stands. */
  keyboardStep?: Space;
  onDragStart?: (event: MoveDragEvent) => void;
  onDragMove?: (event: MoveDragEvent) => void;
  onDragEnd?: (event: MoveDragEvent) => void;
  onDragCancel?: (event: MoveDragEvent) => void;
};
export type TransferDragOptions = CommonDragOptions & {
  mode: "transfer";
  getItems: () => DragItem[];
  getAllowedDropOperations?: () => DropOperation[];
  onDragStart?: (event: TransferDragEvent) => void;
  onDragMove?: (event: TransferDragEvent) => void;
  onDragEnd?: (event: TransferDragEvent) => void;
};
export type DraggableOptions = MoveDragOptions | TransferDragOptions;

// ───── Float ──────────────────────────────────────────────────────────────────

// Where a floating panel stands against its anchor: a side, and where along it. Logical, so a right-to-left
// page mirrors it.
export type Placement =
  | "top" | "top start" | "top end"
  | "bottom" | "bottom start" | "bottom end"
  | "start" | "start top" | "start bottom"
  | "end" | "end top" | "end bottom";

// The side of its anchor a floating panel settled on, start and end by the anchor's direction.
export type PlacementSide = "top" | "bottom" | "start" | "end";
