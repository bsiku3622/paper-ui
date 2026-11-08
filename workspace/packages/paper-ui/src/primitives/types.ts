import type { FocusEvent, ReactNode } from "react";

import type { Space } from "../tokens";

export type PointerType = "mouse" | "pen" | "touch" | "keyboard" | "virtual";

export type PressEvent = {
  type: "pressstart" | "pressend" | "pressup" | "press";
  pointerType: PointerType;
  target: Element;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  x: number;
  y: number;
  key?: string;
  continuePropagation(): void;
};

export type PressableOptions = {
  disabled?: boolean;
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

export type FocusRingOptions = {
  within?: boolean;
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
  contain?: boolean;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  children?: ReactNode;
};

export type DropOperation = "copy" | "link" | "move" | "cancel";
export type DragItem = Record<string, string>;
export type DragTypes = {
  has(type: string | symbol | Array<string | symbol>): boolean;
};

export type TextDropItem = {
  kind: "text";
  types: Set<string>;
  getText(type: string): Promise<string>;
};
export type FileDropItem = {
  kind: "file";
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

export type Placement =
  | "top" | "top start" | "top end"
  | "bottom" | "bottom start" | "bottom end"
  | "start" | "start top" | "start bottom"
  | "end" | "end top" | "end bottom";

export type PlacementSide = "top" | "bottom" | "start" | "end";
