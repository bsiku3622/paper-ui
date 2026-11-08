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

export const PREVIEW_ATTRIBUTE = "data-pui-preview";
export const PREVIEW_STATES = ["hover", "active", "focus"] as const;
export type PreviewState = (typeof PREVIEW_STATES)[number];
// It stands inside :is() or :where() beside the real state and weighs one attribute, as that state does, so the order of states holds.
export const previewSelector = (state: PreviewState): string => `:is([${PREVIEW_ATTRIBUTE}~="${state}"], [${PREVIEW_ATTRIBUTE}~="${state}"] *)`;
export const previewAttributes = (...states: readonly PreviewState[]): Record<typeof PREVIEW_ATTRIBUTE, string | undefined> => ({
  [PREVIEW_ATTRIBUTE]: states.length > 0 ? states.join(" ") : undefined,
});
export const SELECTED_SELECTOR = `:is([${STATE_ATTRIBUTE.selected}], [aria-current]:not([aria-current=false]))`;
export const ENABLED_SELECTOR = `:not(:disabled):not([aria-disabled=true]):not([${STATE_ATTRIBUTE.disabled}])`;

export const VALUE_ATTRIBUTE = {
  status: "data-status",
  presence: "data-presence",
  presentation: "data-presentation",
  placement: "data-placement",
  part: "data-part",
  orientation: "data-orientation",
} as const;

export const MARKER_ATTRIBUTE = {
  rovingItem: "data-roving-item",
  dragIgnore: "data-drag-ignore",
} as const;

export type StateAttributes<Names extends StateName = StateName> = { [Name in Names as (typeof STATE_ATTRIBUTE)[Name]]?: "true" };

export const stateAttributes = <Snapshot extends Partial<Record<StateName, boolean | undefined>>>(
  snapshot: Snapshot,
): StateAttributes<keyof Snapshot & StateName> => {
  const attributes: Record<string, "true" | undefined> = {};
  for (const name of Object.keys(snapshot) as StateName[]) attributes[STATE_ATTRIBUTE[name]] = snapshot[name] ? "true" : undefined;
  return attributes as StateAttributes<keyof Snapshot & StateName>;
};
