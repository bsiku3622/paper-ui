# Overview

Primitives are the first components that carry Foundations values into screen structure. They provide surfaces and layout, text and icons, input behaviour and accessibility relations without opinions, and Atoms and app screens are composed on top of them. Components and hooks are imported from `@studio-baeks/paper-ui`; Foundations values and vocabulary (`tokens` · `Space` · `ControlSize` …) are imported from `@studio-baeks/paper-ui/tokens`.

## First and second order

Primitives come in two orders. The **first order** is the base: Box · Text · Icon · A11y, which do not lean on each other. The **second order** is a Box plus one capability, and each takes exactly one of colour (Paint), size (Control), pressing (Press), selection (Select), floating layers (Float), dragging (Drag), group navigation (Focus), input wiring (Field) and layout (Layout). Atoms combine the two with hooks and class functions. Second-order primitives do not lean on each other (the only exceptions are the two below), and combining them is the Atom's job. A part never holds pressing inside itself: the parts (Selectable · SelectableGroup.Item · Floating.Trigger · Floating.Close · RovingFocus.Item) are native buttons that take `onClick`, and when a press mechanism is needed it is added from outside with `<Pressable as={part}>`.

First-order files do not import the second-order folders.

Second-order folders do not lean on each other. The exceptions approved by the owner are the two below, and any second-order folder may import a first-order primitive. Atoms may import every Primitive.

- Select → Focus: SelectableGroup has a single Tab stop, so it stands on RovingFocus.
- Float → Paint: only `scrimPaint`, which the modal backdrop uses.

Nothing except Atoms and callers reaches Press. When a part needs press, the caller lifts it with `<Pressable as={Selectable}>`; one press is always one click ([Press](press.md)), so that element has exactly one press mechanism.

Colour rules live only in the [Paint](paint.md) layer (`primitives/paint/`). Under `primitives/`, the only stylesheets that read `tokens.color` are that folder and the ink of Icon; the stylesheet of Box does not read it either. The stylesheets of Atoms (`atoms/` and their recipes) do not read it, and the colours of selection marks, dots, lines, links and spinners are borrowed from that folder's `recipes.css.ts` (`markPaint` · `dotPaint` · `linePaint` · `linkPaint` · `spinnerPaint`).

| Category | Order | Components | Hooks | Docs |
| --- | --- | --- | --- | --- |
| Element | First | Box | — | [Element](element.md) |
| Content | First | Text · Icon | — | [Content](content.md) |
| A11y | First | FocusScope · VisuallyHidden · Portal · LiveRegion | useFocusRing · useFocusWithin (functions announce · clearAnnouncements) | [A11y](a11y.md) |
| Paint | Second | Surface · Paint | — (class functions surfaceClass · paintClass, class maps elevation · reveal · revealAfter) | [Paint](paint.md) |
| Control | Second | Control | — (class function controlClass) | [Control](control.md) |
| Press | Second | Pressable | usePressable | [Press](press.md) |
| Select | Second | Selectable · SelectableGroup | useSelectable · useSelectableGroup | [Select](select.md) |
| Float | Second | Floating | useFloating · useFloatingContext | [Float](float.md) |
| Drag | Second | Draggable · Droppable | useDraggable · useDroppable | [Drag](drag.md) |
| Focus | Second | RovingFocus | useRovingFocusItem | [Focus](focus.md) |
| Field | Second | FormField | useFormField · useFormFieldControl | [Field](field.md) |
| Layout | Second | Stack · Inline · Grid | — | [Layout](layout.md) |
| Composition tools (outside the categories) | — | — | mergeProps · mergeRefs · composeEventHandlers | [Composition tools](#composition-tools) |

`Draggable.Handle` is part of Draggable's anatomy and is not counted separately. The composition tools and `announce` · `clearAnnouncements` are not components, so they sit outside the twelve categories above. The total is 21.

## Shared contract

The components that choose what to render with `as` are Box · Surface · Paint · Control · Stack · Inline · Grid · Text · VisuallyHidden · Pressable · Selectable · SelectableGroup · SelectableGroup.Item · Floating.Trigger · Floating.Content · Floating.Close · Draggable · Draggable.Handle · Droppable · RovingFocus · RovingFocus.Item · Button · IconButton · Link. Native props and the ref are passed to the same element. The `as` of Pressable may also take a part (`<Pressable as={Selectable}>`). The parts (Pressable · Selectable · SelectableGroup.Item · Floating.Trigger · Floating.Close · RovingFocus.Item · Draggable · Draggable.Handle · Droppable) and VisuallyHidden also accept `as`. The default tag is button for Pressable · Selectable · Floating.Trigger · Floating.Close · Draggable.Handle · RovingFocus.Item, div for Draggable and Droppable, and span for VisuallyHidden. Icon also passes the SVG ref and native SVG props. None of them adds a nested wrapper. The `as` of every part moves `disabled` onto its target by the same rule (`targetProps` in `internal/render-target.ts` is the only projection).

Targets are of two kinds. A **control** is a target that takes input (Pressable · Selectable · Floating.Trigger · Floating.Close · Draggable · Draggable.Handle · Droppable · RovingFocus.Item), and a **region** is a target that only occupies space (VisuallyHidden). Disabled always sets `data-disabled`, so every case is styled with the same selector, and the rest depends on what the target is.

| Target | control: enabled | control: disabled | region: disabled |
| --- | --- | --- | --- |
| button | `type="button"` (the given `type` if one is passed) | native `disabled` | native `disabled` |
| input · select · textarea · fieldset · optgroup · option | none | native `disabled` | native `disabled` |
| a[href] | tabIndex 0 | `aria-disabled`, tabIndex −1, click blocked | `data-disabled` only |
| other tags (div …) | `role="button"`, tabIndex 0 | `aria-disabled`, tabIndex −1, click blocked | `data-disabled` only |
| Paper part · pressable Atom | `type` only when given | `disabled` | `disabled` |
| other components | `type` only when given | `aria-disabled`, tabIndex −1, click blocked | `disabled` |

With `focusable`, a disabled control stays in the Tab order. A button gets `aria-disabled` instead of native `disabled`, other tags and components keep tabIndex 0, and a Paper part is blocked by `aria-disabled` and click blocking instead of receiving `disabled` (for targets that must not lose focus, such as a loading Button). Native input and select always take native `disabled`. Click blocking stops the click before the target's `onClick` and the handlers of its ancestors can hear it, and it also blocks a middle-button click, so a disabled link component does not navigate. It cannot block "Open in new tab" in the browser's context menu. A `role` or `tabIndex` given by the caller wins over the projection. Hover is CSS and does not appear on a disabled target; there is no switch that turns off hover alone. The way to give a part the look of an Atom is `<Button as={part}>`. The reverse, giving Button or IconButton to the `as` of a part or of Pressable (`<Floating.Trigger as={Button}>`), would put two press mechanisms on one element, so it raises a development-mode error once and points to the form where Button takes the part.

Selectable · SelectableGroup.Item · Floating.Trigger · Floating.Close are parts without a press mechanism, so on a tag that received `role="button"` they carry the button's keys themselves: Enter and Space produce a click. They do not react when disabled, a key that bubbled up from an inner input belongs to that input, and the caller's `onKeyDown` runs first and, if it calls `preventDefault()`, nothing is pressed. The keys of Pressable belong to press, and the keys of Draggable · Draggable.Handle · Droppable belong to keyboard dragging. a[href], native tags and component targets keep their own keys.

Some places do not follow the table as it is. The disabled state of the Draggable root and of Droppable stops only dragging and dropping, so there is no click blocking and clicks on the inner content still work. The role and Tab stop of the Draggable root are decided by the way dragging starts (activation). RovingFocus.Item gives no role to a tag that is not a button (the caller decides the role), and its tabIndex is decided by the group's Tab-stop rule.

This table describes the `disabled` of components. The `disabled` of a hook turns off only that behaviour. `usePressable({ disabled })` stops press and sets `data-disabled` but uses neither native `disabled` nor `aria-disabled`, so blocking the element is up to whoever uses the hook. `useDraggable` and `useDroppable` likewise stop only dragging and dropping. dragProps and dropProps contain an `aria-disabled` for elements built directly with the hook, and handleProps contains native `disabled`; components follow the table above instead of that `aria-disabled`.

Children functions receive a read-only snapshot: Pressable `{ isActive, isFocused, isFocusVisible, isDisabled }`, Selectable `{ isSelected, isDisabled }`, SelectableGroup `{ selectedValues, isDisabled }`, RovingFocus `{ currentValue, isDisabled }`, Draggable `{ position, isDragging, isDisabled }`, Droppable `{ isDropTarget, isDisabled }`, Floating.Content `{ isOpen, presentation, placement, elevation }`, FormField `{ isDisabled, isInvalid, isRequired }`. A snapshot only reads state and cannot change it. A part inside Floating.Content that needs to open or close uses `useFloatingContext()`. Floating.Content and FormField are parts with a fixed structure, so they do not accept `as`.

`as` only changes the target and the ref; it does not create semantics. The example below makes a Stack into a surface: there is one element, and the props of Stack (`gap`) and of Surface (`fill` · `border`) are type-checked together.

```tsx
<Surface as={Stack} fill="raised" border radius="md" padding="md" gap="sm">
  <Text variant="label">Title</Text>
  <Text variant="body">Content</Text>
</Surface>
```

Surface does not add a button role or a Tab stop automatically. The native element that fits the meaning of the action, and the accessible name, are chosen by whoever uses it.

Native attributes of the element chosen with `as` whose names collide with a Primitive's own prop are removed from the type, and the Primitive's own prop wins. The `align` in `<Inline as="td" align="start">` is the `align` of Inline, not the native `align` of td. Even without `as`, Text takes its ref in the type of the tag its variant renders (span for `label`, h2 for `heading`).

Handling of input, focus and assistive-technology events is delegated to React Aria, and Paper owns the public API and the connection to state.

React Aria does not leave `src/internal/aria`. An adapter translates Paper's names (`disabled` · `cancelOnPointerExit` · `focusable` …) into React Aria's options and returns types declared by Paper, so every public option, result and event type is Paper's own. Lint blocks any other import, and the build fails if a `@react-aria`, `@react-types` or `@react-stately` path remains in the bundled d.ts.

Package styles are applied as CSS classes, and tokens are not passed as inline style. Only values decided at run time use runtime style: the Draggable move coordinates, Grid tracks, Floating rank variables, the Floating anchor position, the Floating transport of source variables, and the style the caller passes.

Errors addressed to developers are always in English and start with `[paper-ui] `. When a part is used outside its parent, the error names which part it is.

## Shared contract of hooks

A hook that touches the DOM returns one shape, `{ <part>Props, ...state }`. The props of a part already contain the callback ref and the state attributes the hook uses, so a hook takes no ref argument, and the consumer spreads them like `{...pressProps}` or merges them with the props of other hooks using `mergeProps`. Hooks that only handle state (`useSelectableGroup` · `useFloating` · `useFloatingContext`) return only state and actions and know nothing about the DOM.

| Hook | Props returned | State attributes |
| --- | --- | --- |
| usePressable | pressProps | data-active · data-disabled |
| useFocusRing | focusProps | data-focused · data-focus-visible |
| useFocusWithin | focusWithinProps | data-focus-within |
| useSelectable | selectProps | one aria attribute chosen by the role · data-selected |
| useDraggable | dragProps · handleProps | data-dragging · data-disabled, aria-disabled on dragProps |
| useDroppable | dropProps | data-drop-target · data-disabled · aria-disabled |
| useRovingFocusItem | itemProps | data-roving-item (the value is the item's value) |
| useFormFieldControl | controlProps | id · disabled · required · aria-invalid · aria-describedby, only the keys that have a value |
| FormField | (wrapper) | data-disabled · data-invalid · data-required, parts carry data-part |
| Floating.Content | (panel) | data-presentation · data-placement (popover) · data-presence (`entering` · `exiting`, absent while standing) |

Names follow one rule too. Inputs do not take `is` or `should` (`disabled` · `selected` · `flip` · `focusable` · `textInput` · `cancelOnPointerExit` · `closeOnInteractOutside`), and outputs are `is*` (`isActive` · `isSelected` · `isOpen` · `isFocusVisible` · `isDragging` · `isDropTarget`). Controlled state comes as the set `x` · `defaultX` · `onXChange`. Every public hook has `XOptions` and `XResult` (`useFloatingContext`, which takes no options, returns the `FloatingResult` of `useFloating`), and `XState` is the name of the read-only snapshot a children function receives. The types of press, drop, drag and focus events (`PressEvent` · `DropEvent` · `TransferDragEvent` · `Placement` …) are also declared by Paper and exported from `@studio-baeks/paper-ui`.

## State attributes

The names of state attributes are written in one place only, `tokens/state.ts`, and hooks export them as `stateAttributes`. A state is `"true"` while it holds, and when it does not hold the attribute itself is absent.

| Attribute | When it is on | Emitted by |
| --- | --- | --- |
| data-active | while pressing | Pressable · usePressable |
| data-focused | while focus is present | Pressable · useFocusRing |
| data-focus-visible | while focus must be shown (focus moved by keyboard) | Pressable · useFocusRing, and the frame of Atoms that draw a ring (the wrapper of Field and Select, Textarea itself) |
| data-focus-within | while focus is inside the element | useFocusWithin |
| data-selected | while selected | Selectable · SelectableGroup.Item · useSelectable |
| data-disabled | while disabled | every part that follows the projection of the [shared contract](#shared-contract), plus VisuallyHidden · FormField · usePressable · useDraggable · useDroppable |
| data-invalid | while `invalid` | FormField, and the frame of a Field · Textarea · Select that is in error |
| data-required | while required | FormField |
| data-dragging | while dragging | Draggable · Draggable.Handle · useDraggable |
| data-drop-target | while something being dragged is over it | Droppable · useDroppable |

The momentary state while being pressed is `active`. `pressed` means only `aria-pressed`, which announces selection, so the two meanings never overlap on one element. Hover is CSS and is not exported as an attribute.

## Theme and language

The theme of a subtree is decided by the `theme` axis of Surface. `light` and `dark` are fixed, and `inverse` is the opposite of the surroundings, which makes a dark plate on a light screen or a light plate on a dark screen. It is applied to that Surface itself without an extra node, the plate (canvas) is always laid, and a Floating drawn through Portal also keeps the theme of the place where it was opened ([Paint](paint.md#surface--the-plane)). The theme of the whole app is applied by `PaperProvider` to `<html data-pui-theme>` and stored, and `useTheme` · `useResolvedTheme` read it. Storage, the boot script and the rules of the hooks are in [Theming](../get-started/theming.md).

`PaperProvider` also decides the language. It takes `locale` (a BCP 47 tag) and `messages` (the wording the Atoms say on their own), and both may be omitted.

The locale is decided by the Provider's `locale`, then `<html lang>`, then `en`. A tag written with an underscore (`ko_KR`) is read with a dash (`ko-KR`), and a tag that `Intl` does not accept is read as English. Paper does not read the browser's language (`navigator.language`). If an inner Provider gives no `locale` or `messages`, it inherits the values of the outer Provider, and when `<html lang>` changes later it follows even without a Provider. Server rendering cannot read `<html>`, so it answers with the `locale` it was given or `en`. The decided locale is also passed to React Aria, so arrow keys and layout follow the page's language.

The wording list is `PaperMessages` (`clear` · `showPassword` · `loading`), and there are English and Korean lists. The list is chosen by the language subtag of the locale (before the first dash or underscore), and a language without a list gets English. The Provider's `messages` are laid over the list key by key. All wording that Atoms say on their own is a prop and this list is its default, and errors addressed to developers are always English.

`<html lang>` and `<html dir>` are written only when a `locale` is given to the Provider. `dir` is the writing direction of that language (`rtl` for `ar` · `fa` · `he` · `ur` · `ps` · `sd` · `ckb` · `dv` · `yi`, `ltr` for the rest), and when the Provider disappears they return to the values they had before it wrote them. Without a `locale`, neither attribute is touched.

## Composition tools

`mergeProps` · `mergeRefs` · `composeEventHandlers` are composition tools used together with the twelve categories above, and their contract belongs to Paper, not to React Aria. They are defined in the single file `primitives/composition.ts` so that consumers use the same tools when they merge the props returned by hooks into one element.

`mergeProps(...sets)` merges prop sets from the left, and has five rules. All `on[A-Z]*` handlers run in argument order. `className` is concatenated. `style` is merged key by key and the later key wins. `ref` is made into one by `mergeRefs`, and a null ref cannot erase an earlier ref. For the remaining keys the last value that is not undefined is used, so undefined cannot erase an earlier value, and `id` is not merged separately. The preventDefault of one handler does not stop later handlers.

An example that composes several behaviours onto a native button.

```tsx
const { pressProps } = usePressable({ onPress: save });
const { focusProps } = useFocusRing();

<Box as="button" type="button"
  {...mergeProps(pressProps, focusProps, { ref: forwardedRef })}>
  Save
</Box>
```

`mergeRefs(...refs)` gathers callback refs and object refs into one callback and connects them to the same DOM node. When detached, a callback ref is called with null, and a callback ref that returned a cleanup runs that cleanup instead of receiving null.

`composeEventHandlers(caller, internal)` is the only rule that joins the caller and the internal behaviour. The caller runs first, and internal is skipped only when the event is cancelable, has `defaultPrevented`, and the caller called preventDefault. The `onClick` of Selectable runs before `onSelectedChange`, and if it calls `preventDefault()` the selection does not change; the `onClick` of Floating.Trigger and Close also runs before opening or closing and is cancelled by the same rule. The `onFocus` · `onKeyDown` of RovingFocus.Item and SelectableGroup.Item use this rule too. PressEvent is a notification that cannot be cancelled, so `onPress` has no cancellation, and cancelling is done in `onClick`. The preventDefault of a focus event does not cancel the browser's actual focus move. So for the input Atoms (Field · Textarea · Select · Checkbox · Radio · Switch), the caller's `onFocus` · `onBlur` also run first, and the focus judgement after them only records a move that has already happened, so preventDefault does not skip it. The `onChange` of Field also runs the caller first, and the value that decides the clear button is the value the caller left.

## Where the package stops

```text
Foundations → Primitives → Atoms
```

The package provides only Primitives that compose layout and single-role Atoms. Larger combinations such as page headers, tables and menus are owned by the app until the same need repeats in real products and the boundary of a common API becomes clear. When an app needs meaningful HTML, it uses the `as` of a Primitive like `<Box as="section">` or writes its own markup directly.

Working examples are in the [Primitives](/playground/box) list of the Playground.
