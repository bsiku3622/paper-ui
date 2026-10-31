// The Primitives, in two orders. The first order is the ground: its members do not lean on each other.
// The second order is Box plus one capability; Atoms bundle them through hooks and class functions.
// primitives/orders.test.ts pins the edges between the folders.

// ───── First order ─────────────────────────────────────────────────────────────

// Element — the box: as, ref, padding, size, overflow. No paint of any kind.
export { Box, type BoxProps, type BoxWidth, type BoxHeight, type BoxLayoutProps } from "./Box";

// Content — Text and Icon keep their own ink, the one documented colour exception.
export { Text, type TextProps } from "./Text";
export { Icon, type IconProps } from "./Icon";

// A11y — relations for assistive technology and keyboard users; none has a geometry of its own.
export { FocusScope, useFocusRing, useFocusWithin, type FocusRingResult, type FocusWithinResult } from "./a11y/focus";
export { VisuallyHidden, type VisuallyHiddenProps } from "./a11y/VisuallyHidden";
export { Portal, type PortalProps } from "./a11y/Portal";
export { LiveRegion, announce, clearAnnouncements, type LiveRegionProps, type LivePoliteness, type AnnounceOptions } from "./a11y/LiveRegion";

// ───── Second order ────────────────────────────────────────────────────────────

// Paint — all colour: fill, border, radius, elevation, theme; accent × variant.
export { Surface, surfaceClass, type SurfaceProps } from "./paint/Surface";
export { Paint, paintClass, type PaintProps } from "./paint/Paint";

// Press — semantics, cursor, disabled look. No colour.
export { Pressable, type PressableProps, type PressableState } from "./press/Pressable";
export { usePressable, type PressableResult } from "./press/usePressable";

// Select — selection state and its aria. No colour.
export { Selectable, type SelectableProps, type SelectableState } from "./select/Selectable";
export { useSelectable, type SelectableOptions, type SelectableResult, type SelectableCurrent } from "./select/useSelectable";
export { SelectableGroup, useSelectableGroup, type SelectableGroupProps, type SelectableGroupItemProps, type SelectableGroupOptions, type SelectableGroupResult, type SelectableGroupState } from "./select/SelectableGroup";

// Float — position, z, dismissal.
export { Floating, useFloating, useFloatingContext, type FloatingProps, type FloatingOptions, type FloatingResult, type FloatingTriggerProps, type FloatingContentProps, type FloatingContentState, type FloatingCloseProps } from "./float/Floating";

// Drag — move and transfer drag, and the drop target.
export { Draggable, type DraggableProps, type DraggableHandleProps, type DraggableState } from "./drag/Draggable";
export { Droppable, type DroppableProps, type DroppableState } from "./drag/Droppable";
export { useDraggable, type DraggableResult } from "./drag/useDraggable";
export { useDroppable, type DroppableResult } from "./drag/useDroppable";

// Focus — one Tab stop for a group, and the arrow keys inside it.
export { RovingFocus, useRovingFocusItem, type RovingFocusProps, type RovingFocusState, type RovingFocusItemProps, type RovingFocusItemOptions, type RovingFocusItemResult } from "./focus/RovingFocus";

// Field — a control's label, description and error, tied together by id; the control reads them with useFormFieldControl.
export { FormField, useFormField, useFormFieldControl, type FormFieldProps, type FormFieldOptions, type FormFieldResult, type FormFieldState, type FormFieldControlOptions, type FormFieldControlResult } from "./field/FormField";

// Layout — arrangement only.
export { Stack, type StackProps } from "./layout/Stack";
export { Inline, type InlineProps } from "./layout/Inline";
export { Grid, type GridProps } from "./layout/Grid";

// Composition — the tools the second order is built from.
export { mergeProps, mergeRefs, composeEventHandlers } from "./composition";

// The event and option types the Interaction and A11y primitives are declared with.
export type {
  PointerType, PressEvent, PressableOptions, FocusRingOptions, FocusWithinOptions, FocusScopeProps, Placement,
  DropOperation, DragItem, DragTypes, TextDropItem, FileDropItem, DirectoryDropItem, DropItem,
  DropEvent, DropEnterEvent, DropMoveEvent, DropExitEvent, DropActivateEvent, DroppableOptions, TransferDragEvent,
  DragPosition, MoveDragEvent, MoveDragOptions, TransferDragOptions, DraggableOptions,
} from "./types";
