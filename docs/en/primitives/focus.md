# Focus

The Focus Primitive is the second-order primitive that owns navigation that puts one Tab stop on a group. RovingFocus keeps only one of the registered items as the Tab entry point and moves the real DOM focus with arrow keys. It does not select, so it has neither colour nor selection state. SelectableGroup of [Select](select.md), which binds selections, stands on top of it.

| Component | Hook | Responsibility | Default |
| --- | --- | --- | --- |
| RovingFocus | useRovingFocusItem | as, orientation, dir, loop, disabled, the currentValue family, children (a node or a snapshot function) | horizontal / dir inherited / loop=false. One Tab entry point and DOM focus movement |

## Group focus navigation

RovingFocus keeps only one of the registered items as the Tab entry point. It moves the real DOM focus with arrow keys, and Tab leaves the group. This is a different behaviour from the contain of FocusScope. Item is a native button, and `as` specifies another element or a component that passes the ref. A tag that is not a button is drawn as it is without a role, so whoever uses it gives the role. Components follow the projection of the [shared contract](README.md#shared-contract).

An example that skips disabled items of a toolbar and cycles at both ends.

```tsx
<RovingFocus role="toolbar" aria-label="Formatting" loop>
  <RovingFocus.Item value="bold">Bold</RovingFocus.Item>
  <RovingFocus.Item value="italic" disabled>Italic</RovingFocus.Item>
  <RovingFocus.Item as={Pressable} value="underline">Underline</RovingFocus.Item>
</RovingFocus>
```

| Root option | Default | Contract |
| --- | --- | --- |
| orientation | horizontal | horizontal / vertical / both |
| dir | inherited | ltr / rtl; written to the DOM only when given, and when omitted the horizontal direction is decided by the direction inherited from the page |
| loop | false | Cycle to the opposite side at the end |
| disabled | false | Disables group navigation and the default Item |
| currentValue / defaultCurrentValue | first enabled item | Controlled / uncontrolled Tab entry point |
| onCurrentValueChange | none | Passes the value of the focused item |

The group is a single element. When `as` chooses a layout Primitive such as Inline · Grid, that element lays out the items, and the default is div.

`dir` is written to the DOM only when given, and horizontal arrow keys follow the direction of the place where the item stands: the nearest `dir` attribute (`ltr` · `rtl`), otherwise the computed `direction`, otherwise `ltr`. So under an ancestor with `dir="rtl"` or `<html dir="rtl">`, ArrowLeft goes to the next item even without giving `dir`. An explicit `dir` takes precedence over the inherited direction.

For registration, the item list held by a single RovingFocus root is the only source of truth. When another item arrives with an already registered value, registration is refused (one development error, and the one registered first wins), and the refused item does not become the Tab entry point, so there is always a single Tab stop. Even if the duplicate item is removed, the navigation and selection of the original item stay as they are, and when the one registered first leaves, the refused item inherits that value, so the Tab stop and selection of the remaining items do not disappear. An item whose only change is `disabled` has not left, so it keeps its place. SelectableGroup reads the same list to clean up selected values. The children function receives `{ currentValue, isDisabled }` (`RovingFocusState`).

A value must be unique within the group. Home · End move to the first and last enabled item, and the order follows the current DOM. If the current item is removed or disabled, focus moves to the next neighbour, and if it was the last item, to the previous neighbour. If all disappear, it moves to the root. Focus that has already moved outside is not brought back.

When `currentValue` is changed from outside, only the Tab entry point moves to the new item and the DOM focus stays where it was: it does not take away focus that was on an element outside the group, nor focus that was on an item inside the group.

useRovingFocusItem({ value, disabled }) returns `itemProps` and `isCurrent` inside the root. itemProps contains ref · tabIndex · onFocus · onKeyDown · data-roving-item (the value is the item's value), spread it onto the real focus target, and join it with an external ref using `mergeRefs` and with external handlers using `composeEventHandlers`. isCurrent is true on the item that is the group's Tab entry point. Using it outside a root is a development error. The disabled state is passed to the default Item and to a custom component that receives disabled, and blocking the activation of a custom control such as a plain div is the responsibility of that implementation. Arrow keys and modifier combinations that originate in a descendant input are not intercepted. The Tab entry of an unregistered descendant is not changed. Aria-activedescendant, typeahead and widget-specific selection policies are connected by higher components.
