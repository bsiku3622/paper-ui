// State — the one module that spells a state, value or marker attribute. A hook emits its attributes
// through stateAttributes, and a stylesheet selects on them through stateSelector or the selectors below, so
// the names a component writes and the names a rule reads cannot drift apart. Nothing here imports.

// A state is boolean: present while it holds. `active` is the transient press (hover is CSS and has no
// attribute); `pressed` means aria-pressed only and has no name here.
export const STATE_ATTRIBUTE = {
  active: "data-active",
  focused: "data-focused",
  focusVisible: "data-focus-visible",
  focusWithin: "data-focus-within",
  selected: "data-selected",
  disabled: "data-disabled",
  invalid: "data-invalid",
  required: "data-required",
  dragging: "data-dragging",
  dropTarget: "data-drop-target",
} as const;

export const STATE_NAMES: readonly StateName[] = Object.keys(STATE_ATTRIBUTE) as StateName[];
export type StateName = keyof typeof STATE_ATTRIBUTE;

export const stateSelector = (name: StateName): string => `[${STATE_ATTRIBUTE[name]}]`;

// A selected item: the attribute a Selectable writes, or the current item of a navigation.
export const SELECTED_SELECTOR = `:is([${STATE_ATTRIBUTE.selected}], [aria-current]:not([aria-current=false]))`;
// A target that can take input: hover and press colour bind to it, so a blocked target never reacts.
export const ENABLED_SELECTOR = `:not(:disabled):not([aria-disabled=true]):not([${STATE_ATTRIBUTE.disabled}])`;

// A value attribute carries one of a closed set of words rather than a boolean.
export const VALUE_ATTRIBUTE = {
  status: "data-status",
  presence: "data-presence",
  presentation: "data-presentation",
  placement: "data-placement",
  part: "data-part",
  orientation: "data-orientation",
} as const;

// A marker names a part for the code that walks the DOM, not for a stylesheet.
export const MARKER_ATTRIBUTE = {
  rovingItem: "data-roving-item",
  dragIgnore: "data-drag-ignore",
} as const;

// The attributes for a snapshot of states: "true" while a state holds, absent otherwise.
export type StateAttributes<Names extends StateName = StateName> = { [Name in Names as (typeof STATE_ATTRIBUTE)[Name]]?: "true" };

export const stateAttributes = <Snapshot extends Partial<Record<StateName, boolean | undefined>>>(
  snapshot: Snapshot,
): StateAttributes<keyof Snapshot & StateName> => {
  const attributes: Record<string, "true" | undefined> = {};
  for (const name of Object.keys(snapshot) as StateName[]) attributes[STATE_ATTRIBUTE[name]] = snapshot[name] ? "true" : undefined;
  return attributes as StateAttributes<keyof Snapshot & StateName>;
};
