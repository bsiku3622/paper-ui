export const PRIMITIVE_ORDERS = {
  first: ["Element", "Content", "A11y"],
  second: ["Paint", "Control", "Press", "Select", "Float", "Drag", "Focus", "Field", "Layout"],
} as const;
export type PrimitiveOrder = keyof typeof PRIMITIVE_ORDERS;
export const PRIMITIVE_GROUPS = [...PRIMITIVE_ORDERS.first, ...PRIMITIVE_ORDERS.second] as const;
export type PrimitiveGroup = (typeof PRIMITIVE_GROUPS)[number];

export const INVENTORY = {
  primitives: {
    Element: { components: ["Box"], hooks: [] },
    Content: { components: ["Text", "Icon"], hooks: [] },
    A11y: { components: ["FocusScope", "VisuallyHidden", "Portal", "LiveRegion"], hooks: ["useFocusRing", "useFocusWithin"], functions: ["announce", "clearAnnouncements"] },
    Paint: { components: ["Surface", "Paint"], hooks: [] },
    Control: { components: ["Control"], hooks: [] },
    Press: { components: ["Pressable"], hooks: ["usePressable"] },
    Select: { components: ["Selectable", "SelectableGroup"], hooks: ["useSelectable", "useSelectableGroup"] },
    Float: { components: ["Floating"], hooks: ["useFloating", "useFloatingContext"] },
    Drag: { components: ["Draggable", "Droppable"], hooks: ["useDraggable", "useDroppable"] },
    Focus: { components: ["RovingFocus"], hooks: ["useRovingFocusItem"] },
    Field: { components: ["FormField"], hooks: ["useFormField", "useFormFieldControl"] },
    Layout: { components: ["Stack", "Inline", "Grid"], hooks: [] },
  },
  atoms: ["Button", "IconButton", "Field", "Textarea", "Select", "Checkbox", "Switch", "Radio", "Label", "Badge", "Spinner", "Divider", "Link", "Marker", "SegmentControl", "Slider"],
  anatomy: { Select: ["Option", "Group"], SegmentControl: ["Item"] },
  utilities: {
    Composition: ["mergeProps", "mergeRefs", "composeEventHandlers"],
    Theme: ["PaperProvider", "useTheme", "useResolvedTheme"],
  },
  classes: ["surfaceClass", "paintClass", "controlClass", "elevation", "presence", "loop", "reveal", "revealAfter"],
  foundations: [
    "tokens", "transition", "MOTION_CONSUMERS", "FONT_STYLESHEETS",
    "typographyRule", "monoRule", "codeRule", "presetRule", "emphasisRule", "lineRule", "nestedRadius",
    "STATUSES", "CHOICE_STATUSES", "ACCENTS", "ACCENT_TONES", "VARIANTS", "SELECTABLE_VARIANTS", "FILLABLE_VARIANTS", "INPUT_VARIANTS", "SEGMENT_VARIANTS", "SURFACE_FILLS", "INK_LEVELS", "INKS", "BORDER_LEVELS", "DIVIDER_LEVELS", "DEPTHS",
    "COLOR_MODES", "THEME_PREFERENCES", "SURFACE_THEMES", "SYSTEM_COLORS",
    "TEXT_VARIANTS", "TEXT_FAMILIES", "CONTROL_SIZES", "CONTROL_ANATOMIES", "CONTROL_FONT_SIZES", "CONTROL_PRESETS", "EMPHASES", "LINK_UNDERLINES",
    "STATE_NAMES", "stateSelector", "PREVIEW_STATES", "previewAttributes", "focusRing", "stateStyle", "linkStyle", "STATE_TINT", "STATE_TINT_PROPERTY",
    "SPACES", "DIMENSIONS", "MEASURES", "ICON_SIZES", "CONTROL_SHAPES", "SURFACE_RADII", "LINE_SIDES", "LINE_STYLES", "LINE_WEIGHTS",
    "ELEVATIONS", "BREAKPOINTS", "CONTAINERS", "ALIGNS", "JUSTIFIES", "JUSTIFY_ITEMS", "ORIENTATIONS",
    "MOTION_ROLES",
    "sourceVars",
  ],
  polymorphic: [
    "Box", "Surface", "Paint", "Control", "Stack", "Inline", "Grid", "Text", "VisuallyHidden",
    "Pressable", "Selectable", "SelectableGroup", "SelectableGroup.Item", "Floating.Trigger", "Floating.Content", "Floating.Close", "Draggable", "Draggable.Handle", "Droppable", "RovingFocus", "RovingFocus.Item",
    "Button", "IconButton", "Link",
  ],
} as const;
