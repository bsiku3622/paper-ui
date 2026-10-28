// The inventory of the package: which names exist, in which category, in which order. The docs, the
// Playground and the app's site map read this list, and inventory.test.ts holds it to the real exports.
// It imports nothing, so a script or the app's site map can read it without loading a component.

export const PRIMITIVE_GROUPS = ["Layout", "Content", "Interaction", "A11y"] as const;
export type PrimitiveGroup = (typeof PRIMITIVE_GROUPS)[number];

export const INVENTORY = {
  primitives: {
    Layout: { components: ["Box", "Stack", "Inline", "Grid"], hooks: [] },
    Content: { components: ["Text", "Icon"], hooks: [] },
    Interaction: {
      components: ["Pressable", "Hoverable", "Toggleable", "Draggable", "Droppable", "ToggleGroup", "Overlay"],
      hooks: ["usePress", "useHover", "useToggle", "useDrag", "useDrop", "useToggleGroup", "useOverlay"],
    },
    A11y: {
      components: ["FocusScope", "VisuallyHidden", "RovingFocus", "FormField"],
      hooks: ["useFocusRing", "useFocusWithin", "useRovingFocusItem", "useField"],
    },
  },
  atoms: ["Button", "IconButton", "Field", "Textarea", "Select", "Checkbox", "Switch", "Radio", "Label", "Badge", "Spinner", "Divider", "Link"],
  anatomy: { Select: ["SelectOption", "SelectGroup"] },
  utilities: {
    Composition: ["mergeProps", "mergeRefs", "composeEventHandlers"],
    Theme: ["PaperProvider", "ThemeScope", "useTheme", "useResolvedTheme"],
    Typography: ["resolveControlTypography"],
  },
  classes: [],
  foundations: ["tokens", "stateTransition", "SPACE_KEYS", "DIMENSION_KEYS", "CONTROL_SIZES", "ICON_SIZES", "ELEVATIONS"],
  polymorphic: ["Box", "Stack", "Inline", "Grid", "Text", "Hoverable", "RovingFocus.Item", "Button"],
} as const;
