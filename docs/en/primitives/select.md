# Select

The Select Primitive is the second-order primitive that owns selection state and the aria that announces it. It provides a button that has a selection (Selectable), a group that binds selections (SelectableGroup) and their hooks. It handles only state and aria and puts on no colour: the selected look is drawn by the stylesheet of whoever reads `data-selected`. Selectable is a native button and changes selection with `onClick`, so it holds no press inside. SelectableGroup has a single Tab stop, so it stands on RovingFocus of [Focus](focus.md).

| Component | Hook | Responsibility | Default |
| --- | --- | --- | --- |
| Selectable | useSelectable | selected / defaultSelected / onSelectedChange, role, current + onClick of a native button | false, one aria attribute chosen by the role and data-selected |
| SelectableGroup | useSelectableGroup | selectionMode, the selectedValues family, selectionRequired, disabled | single / empty selection. Focus and selection are separate |

## Selectable

Selectable connects a persistent boolean selection state to a native button. With selected it is controlled, with defaultSelected it is uncontrolled, and the default is false. A change request is delivered by onSelectedChange(boolean). When disabled, it blocks input and state changes.

useSelectable accepts SelectableOptions and returns isSelected · setSelected(boolean) · toggle() · selectProps. Press is not inside: the caller connects toggle to its own click or press. Selectable is a component that binds `useSelectable` and `<button type="button">`, and changes selection in `onClick`. The children function receives `{ isSelected, isDisabled }` (`SelectableState`). The caller's `onClick` runs first, then the selection changes and `onSelectedChange` is called, and if the caller calls `preventDefault()` in `onClick`, the selection does not change ([Composition tools](README.md#composition-tools)). Selection is announced by one aria attribute chosen by the role and by `data-selected`. With `current`, only `aria-current` is set while selected.

| role | Attribute that announces selection |
| --- | --- |
| radio · checkbox · switch · menuitemradio · menuitemcheckbox | `aria-checked` |
| tab · option · gridcell · row · treeitem | `aria-selected` |
| any other role, or no role | `aria-pressed` |
| `current` (`page` · `step` · `location` · `date` · `time` · `true`) | `aria-current` only |

An example that builds a controlled selectable.

```tsx
<Selectable selected={selected} onSelectedChange={setSelected}>
  {({ isSelected }) => isSelected ? "Selected" : "Not selected"}
</Selectable>
```

`as` can choose another target and it follows the projection of the [shared contract](README.md#shared-contract). `<Selectable as="div">` gets `role="button"`, tabIndex 0 and `aria-pressed`, and can also be pressed with Enter · Space. When disabled, `data-disabled` is set on the target, and a target that cannot be blocked natively receives neither clicks nor keys.

Selectable is a native button that receives only clicks, so it has no `onPress`, `data-active` or `data-focus-visible`, and in Safari no focus after mouse and touch either. When these are needed, lift it onto the Pressable of [Press](press.md) with `as`.

```tsx
<Pressable as={Selectable} onPress={log} defaultSelected>
  {({ isActive }) => isActive ? "Pressing" : "Select"}
</Pressable>
```

There is one element and one press mechanism. Selectable receives the click Pressable emitted and changes the selection just once (one press is always one click). The children function of Pressable receives only `PressableState`, so selection state is read from `data-selected`, `aria-*`, or the `selected` of the controlling side. `disabled` is passed down to the native button of Selectable.

An example that connects selection to an element implemented directly.

```tsx
const { selectProps, isSelected, toggle } = useSelectable({ role: "tab" });
const { pressProps } = usePressable({ onPress: toggle });

return <button {...pressProps} {...selectProps} role="tab" type="button">Home</button>;
```

This base only changes the role and does not replace the semantics of a widget. A widget with a native input, like Checkbox · Radio · Switch, keeps the native semantics and uses only the `useFocusRing` · `useFormFieldControl` hooks. The group selection policy is connected by [SelectableGroup](#selectablegroup) or a higher component. Select does not put on the colour of selection: whoever reads `data-selected` does.

## SelectableGroup

SelectableGroup connects the selection state of Selectables with [RovingFocus](focus.md). The item list is the single RovingFocus registry, so SelectableGroup keeps no list of its own, and for items of the same value only the one registered first is recognised ([Focus](focus.md#group-focus-navigation)). children is either a node or a function that receives `{ selectedValues, isDisabled }` (`SelectableGroupState`). An Item is a Selectable, so when given a role (`role="radio"` and so on) it announces selection with that role's aria attribute, and when not, it is a button with aria-pressed. Arrow keys only move focus, and selection is changed by click. The semantics of Radio · Tab · Option are the responsibility of whoever gives the role.

An example that builds a controlled single-selection group.

```tsx
<SelectableGroup aria-label="Alignment" selectedValues={alignment}
  onSelectedValuesChange={setAlignment} selectionRequired>
  <SelectableGroup.Item value="left">Left</SelectableGroup.Item>
  <SelectableGroup.Item value="center">Center</SelectableGroup.Item>
</SelectableGroup>
```

The group is a single element. When `as` chooses a layout Primitive such as Inline · Grid, that element lays out the items (`<SelectableGroup as={Inline} gap="xs">`) and no extra line is put inside. The default is div, and the role and focus behaviour are the same on any element.

selectionMode is single / multiple and the default is single. selectedValues/defaultSelectedValues are string arrays, and onSelectedValuesChange receives the next array. Single selects at most one. selectionRequired keeps the user from clearing the last selection and does not select an initial item automatically. If the selected item itself is removed, an empty selection is allowed too.

Root disabled blocks all input and change, and Item disabled blocks only that button. Disabled does not clear the existing selection. A removed value is cleaned up and, in the controlled state, a change is requested. Duplicate values are not used (this is a development error and only one item is recognised). The orientation · dir · loop · currentValue contract of the Root is the same as [RovingFocus](focus.md#group-focus-navigation).

useSelectableGroup accepts the same state options and an optional values list and returns selectedValues · isValueSelected(value) · setValueSelected(value, boolean) · toggleValue(value). The same state also exists on a single element (`useSelectable`), so the names were separated. When values are provided, missing keys are cleaned up. The hook itself creates no DOM, role or focus.
