// paper-ui exports layout primitives and individual controls.
// Values and vocabulary come from "@studio-baeks/paper-ui/tokens"; styles load only through
// "@studio-baeks/paper-ui/styles.css". This file is the one public list of the entry: every name is spelled
// here, from the file that defines it.

// The Primitives, in two orders. The first order is the ground: its members do not lean on each other.
// The second order is Box plus one capability; Atoms bundle them through hooks and class functions.
// primitives/orders.test.ts pins the edges between the folders.

// ───── First order ─────────────────────────────────────────────────────────────

// Element — the box: as, ref, padding, size, overflow. No paint of any kind.
export { Box, type BoxProps, type BoxWidth, type BoxHeight, type BoxLayoutProps } from "./primitives/Box";

// Content — Text and Icon keep their own ink, the one documented colour exception.
export { Text, type TextProps } from "./primitives/Text";
export { Icon, type IconProps } from "./primitives/Icon";

// A11y — relations for assistive technology and keyboard users; none has a geometry of its own.
export { FocusScope, useFocusRing, useFocusWithin, type FocusRingResult, type FocusWithinResult } from "./primitives/a11y/focus";
export { VisuallyHidden, type VisuallyHiddenProps } from "./primitives/a11y/VisuallyHidden";
export { Portal, type PortalProps } from "./primitives/a11y/Portal";
export { LiveRegion, announce, clearAnnouncements, type LiveRegionProps, type LivePoliteness, type AnnounceOptions } from "./primitives/a11y/LiveRegion";

// ───── Second order ────────────────────────────────────────────────────────────

// Paint — all colour: fill, border, radius, elevation, theme; accent × variant.
export { Surface, surfaceClass, type SurfaceProps } from "./primitives/paint/Surface";
export { Paint, paintClass, type PaintProps } from "./primitives/paint/Paint";

// Press — semantics, cursor, disabled look. No colour.
export { Pressable, type PressableProps, type PressableState } from "./primitives/press/Pressable";
export { usePressable, type PressableResult } from "./primitives/press/usePressable";

// Select — selection state and its aria. No colour.
export { Selectable, type SelectableProps, type SelectableState } from "./primitives/select/Selectable";
export { useSelectable, type SelectableOptions, type SelectableResult, type SelectableCurrent } from "./primitives/select/useSelectable";
export { SelectableGroup, useSelectableGroup, type SelectableGroupProps, type SelectableGroupItemProps, type SelectableGroupOptions, type SelectableGroupResult, type SelectableGroupState } from "./primitives/select/SelectableGroup";

// Float — position, z, dismissal.
export { Floating, useFloating, useFloatingContext, type FloatingProps, type FloatingOptions, type FloatingResult, type FloatingTriggerProps, type FloatingContentProps, type FloatingPopoverProps, type FloatingModalProps, type FloatingPresentation, type FloatingContentState, type FloatingCloseProps } from "./primitives/float/Floating";

// Drag — move and transfer drag, and the drop target.
export { Draggable, type DraggableProps, type DraggableHandleProps, type DraggableState } from "./primitives/drag/Draggable";
export { Droppable, type DroppableProps, type DroppableState } from "./primitives/drag/Droppable";
export { useDraggable, type DraggableResult } from "./primitives/drag/useDraggable";
export { useDroppable, type DroppableResult } from "./primitives/drag/useDroppable";

// Focus — one Tab stop for a group, and the arrow keys inside it.
export { RovingFocus, useRovingFocusItem, type RovingFocusProps, type RovingFocusState, type RovingFocusItemProps, type RovingFocusItemOptions, type RovingFocusItemResult } from "./primitives/focus/RovingFocus";

// Field — a control's label, description and error, tied together by id; the control reads them with useFormFieldControl.
export { FormField, useFormField, useFormFieldControl, type FormFieldProps, type FormFieldOptions, type FormFieldResult, type FormFieldState, type FormFieldControlOptions, type FormFieldControlResult } from "./primitives/field/FormField";

// Layout — arrangement only.
export { Stack, type StackProps } from "./primitives/layout/Stack";
export { Inline, type InlineProps } from "./primitives/layout/Inline";
export { Grid, type GridProps } from "./primitives/layout/Grid";

// Composition — the tools the second order is built from.
export { mergeProps, mergeRefs, composeEventHandlers } from "./primitives/composition";

// The event and option types the Interaction and A11y primitives are declared with.
export type {
  PointerType, PressEvent, PressableOptions, FocusRingOptions, FocusWithinOptions, FocusScopeProps, Placement, PlacementSide,
  DropOperation, DragItem, DragTypes, TextDropItem, FileDropItem, DirectoryDropItem, DropItem,
  DropEvent, DropEnterEvent, DropMoveEvent, DropExitEvent, DropActivateEvent, DroppableOptions, TransferDragEvent,
  DragPosition, MoveDragEvent, MoveDragOptions, TransferDragOptions, DraggableOptions,
} from "./primitives/types";

// Atoms
export { Button, type ButtonProps } from "./atoms/Button";
export { IconButton, type IconButtonProps } from "./atoms/IconButton";
export { Field, type FieldProps } from "./atoms/Field";
export { Label, type LabelProps } from "./atoms/Label";
export { Badge, type BadgeProps } from "./atoms/Badge";
export { Checkbox, type CheckboxProps } from "./atoms/Checkbox";
export { Divider, type DividerProps } from "./atoms/Divider";
export { Link, type LinkProps } from "./atoms/Link";
export { Marker, type MarkerProps } from "./atoms/Marker";
export { Select, type SelectProps, type SelectOptionProps, type SelectGroupProps } from "./atoms/Select";
export { Textarea, type TextareaProps } from "./atoms/Textarea";
export { Switch, type SwitchProps } from "./atoms/Switch";
export { Radio, type RadioProps } from "./atoms/Radio";
export { Spinner, type SpinnerProps } from "./atoms/Spinner";

// Class maps — class names for what a stylesheet cannot reach. elevation is one class per tier: position, z and shadow together.
// presence is the enter and exit of a surface or a scrim, keyed on data-presence; loop is a repeating animation (spin, pulse).
export { elevation } from "./styles/elevation.css";
export { presence, loop } from "./styles/motion.css";

// Theme — the Provider and the hooks; the boot script is the entry "theme-boot"
export { PaperProvider, type PaperProviderProps } from "./theme/PaperProvider";
export { useTheme, useResolvedTheme, type ThemeControl } from "./theme/context";
export type { PaperMessages } from "./internal/messages";

// Inventory — every name above by category and order, as data
export { INVENTORY, PRIMITIVE_ORDERS, PRIMITIVE_GROUPS } from "./inventory";
export type { PrimitiveOrder, PrimitiveGroup } from "./inventory";
