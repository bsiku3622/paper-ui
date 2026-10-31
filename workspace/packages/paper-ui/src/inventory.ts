// The inventory of the package: which names exist, in which category, in which order. The docs, the
// Playground and the app's site map read this list, and inventory.test.ts holds it to the real exports.
// It imports nothing, so a script or the app's site map can read it without loading a component.

// The two orders of the Primitives. The first is the ground: its members do not lean on each other. The second
// is Box plus one capability, and Atoms bundle them. A group belongs to the order that lists it.
export const PRIMITIVE_ORDERS = {
  first: ["Element", "Content", "A11y"],
  second: ["Paint", "Press", "Select", "Float", "Drag", "Focus", "Field", "Layout"],
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
    Press: { components: ["Pressable"], hooks: ["usePressable"] },
    Select: { components: ["Selectable", "SelectableGroup"], hooks: ["useSelectable", "useSelectableGroup"] },
    Float: { components: ["Floating"], hooks: ["useFloating", "useFloatingContext"] },
    Drag: { components: ["Draggable", "Droppable"], hooks: ["useDraggable", "useDroppable"] },
    Focus: { components: ["RovingFocus"], hooks: ["useRovingFocusItem"] },
    Field: { components: ["FormField"], hooks: ["useFormField", "useFormFieldControl"] },
    Layout: { components: ["Stack", "Inline", "Grid"], hooks: [] },
  },
  atoms: ["Button", "IconButton", "Field", "Textarea", "Select", "Checkbox", "Switch", "Radio", "Label", "Badge", "Spinner", "Divider", "Link"],
  anatomy: { Select: ["Option", "Group"] },
  utilities: {
    Composition: ["mergeProps", "mergeRefs", "composeEventHandlers"],
    Theme: ["PaperProvider", "useTheme", "useResolvedTheme"],
  },
  classes: ["surfaceClass", "paintClass", "elevation", "presence", "loop"],
  foundations: [
    "tokens", "transition", "MOTION_CONSUMERS", "FONT_STYLESHEETS",
    "typographyRule", "monoRule", "codeRule", "presetRule", "emphasisRule",
    "STATUSES", "CHOICE_STATUSES", "ACCENTS", "ACCENT_TONES", "VARIANTS", "SELECTABLE_VARIANTS", "SURFACE_FILLS", "INK_LEVELS", "INKS", "BORDER_LEVELS", "DIVIDER_LEVELS", "DEPTHS",
    "COLOR_MODES", "THEME_PREFERENCES", "SURFACE_THEMES", "SYSTEM_COLORS",
    "TEXT_VARIANTS", "TEXT_FAMILIES", "CONTROL_SIZES", "CONTROL_FONT_SIZES", "CONTROL_PRESETS", "EMPHASES", "LINK_UNDERLINES",
    "STATE_NAMES", "stateSelector", "focusRing", "stateStyle", "linkStyle", "STATE_TINT", "STATE_TINT_PROPERTY",
    "SPACES", "DIMENSIONS", "MEASURES", "ICON_SIZES", "CONTROL_SHAPES", "SURFACE_RADII",
    "ELEVATIONS", "BREAKPOINTS", "CONTAINERS", "ALIGNS", "JUSTIFIES", "JUSTIFY_ITEMS", "ORIENTATIONS",
    "MOTION_ROLES",
  ],
  polymorphic: [
    "Box", "Surface", "Paint", "Stack", "Inline", "Grid", "Text", "VisuallyHidden",
    "Pressable", "Selectable", "SelectableGroup.Item", "Floating.Trigger", "Floating.Close", "Draggable", "Draggable.Handle", "Droppable", "RovingFocus.Item",
    "Button", "IconButton", "Link",
  ],
} as const;
