# Press

The Press Primitive is the second-order primitive that owns pressing. It unifies mouse, touch, keyboard and assistive-technology input into a single press event and keeps the semantics of a native button. It chooses neither colour nor size; it exposes state through `data-*` attributes and children functions so that the consumer attaches styles. Input normalization is delegated to React Aria, and Paper owns the public API and the connection to state (options, event types and results are all declared by Paper).

| Component | Hook | Responsibility | Default |
| --- | --- | --- | --- |
| Pressable | usePressable | onPress lifecycle, disabled, focusable, motion, native button props | native button, type=button, motion none. active / focus-visible state, keyboard ring |

## Press

Pressable accepts onPress · onPressStart · onPressEnd · onPressUp · onPressChange and disabled, and in addition preventFocusOnPress · cancelOnPointerExit · allowTextSelection can be chosen. usePressable accepts only the same options (there is no ref argument) and returns pressProps · isActive. The press event (`PressEvent`) delivers mouse, touch, keyboard and assistive-technology input through a common contract, and once one element handles it, it does not rise to the parent. To let it through, call `continuePropagation()` ([Events that reach the parent](#events-that-reach-the-parent)). An element pressed by mouse or touch receives focus when the press ends (Safari does not give focus to a pressed button, so Paper matches it). `preventFocusOnPress` turns this off. A bare button does not choose Paper's colour, size or variant.

The children function of Pressable receives isActive · isFocused · isFocusVisible · isDisabled. The state is also reflected in data-active · data-focused · data-focus-visible · data-disabled. The momentary state while being pressed is called `active`; `pressed` means only aria-pressed, which announces selection. The consuming app writes class styles connected to the data attributes. Hover is not exposed as a state: the hover colour is CSS's job, and it is drawn by `hoverable` of [Paint](paint.md#paint--accent--variant), which puts colour on the place being pressed.

Pressable decides keyboard focus by itself with `useFocusRing` and also draws the ring by itself from that decision (`data-focus-visible`). So a Pressable focused by the pointer has no ring, and it does not disagree with the browser's `:focus-visible` judgement. When `as` receives a part (`<Pressable as={Selectable}>`), the ring of that element is also Pressable's job. Parts and elements without that decision get their ring from the global baseline (`:where(:focus-visible)`).

`motion` chooses the look while pressing. The default `none` puts nothing on, and `press` sinks the target by one pressing step (the displacement of `motion.press`) while it is pressed, gives a pointer cursor, and gives a disabled target the disabled look (dimmed, `not-allowed`). Presses by mouse and keyboard both get the same look through `:active` and `data-active`, so Enter sinks like the pointer. This class decides neither colour nor transition: the transition is bound by the element with `transition()`, and the colour is put on by [Paint](paint.md). usePressable accepts the same `motion` and carries it in the className of `pressProps`. Button · IconButton use `motion="press"`.

A disabled Pressable given `focusable` stays in the Tab order, gets `aria-disabled`, and causes neither press nor click ([shared contract](README.md#shared-contract)).

One press is one click on the target, regardless of the input and platform. React Aria blocks the browser's click on the keys it handles itself. These are Space on `type=button` and Enter on non-Mac platforms. React Aria leaves the Mac Enter to the browser, but the browser emits that click when the key is pressed. If the click moves focus (when Floating.Trigger opens a panel), the pressed element does not receive the key up and the press disappears, so Paper also blocks Enter on a button with `type=button` and emits the click when the press ends. Pressable emits, in their place, the clicks blocked this way and the clicks that an element without key activation cannot receive. So the target's `onClick` runs once for any input: mouse, touch, keyboard or assistive technology. The click of a submit button and of a link is emitted by the browser, so they do not overlap.

Pressable chooses what to render with `as`. The default is `<button type="button">`, and the bare reset class is put on only in this case. `disabled` varies with the target and follows the projection of the [shared contract](README.md#shared-contract): `<Pressable as="div">` gets `role="button"` and tabIndex 0, and when disabled it becomes `aria-disabled`. Even when another primitive wraps it, as in `<Paint as={Pressable} disabled>`, the same button becomes disabled. When `as` receives a part, that part gets the press mechanism. `<Pressable as={Selectable}>` and `<Pressable as={Floating.Trigger}>` are examples, and the part gains `onPress`, `data-active`, `data-focus-visible` and focus after mouse and touch. `disabled` and the ref are passed to the target. A part receives only clicks and one press is always one click, so an element has one press mechanism and the part's behaviour (selecting, opening) happens only once. The children function receives only `PressableState` and is not merged with the part's state.

The way to put an Atom's look on a behaviour is the same `as`, and its direction is one. To put the look of Button on a part, give the part to Button, as in `<Button as={Floating.Trigger}>`. Button is always drawn as a single Pressable, so there is one press mechanism on a part too and the part's behaviour stays as it is. The reverse (`<Floating.Trigger as={Button}>`) would put two press mechanisms on one element and is a development-mode error ([Atoms](../atoms/README.md#as--the-axis-that-changes-the-role-in-the-same-place)).

```tsx
<Pressable as={Selectable} onPress={log}>
  {({ isActive }) => isActive ? "Pressing" : "Select"}
</Pressable>
```

An example that connects press behaviour to a button implemented directly. pressProps already contains the ref and state attributes, so they are not written separately.

```tsx
const { pressProps, isActive } = usePressable({ onPress: save });

return <button {...pressProps} type="button">{isActive ? "Saving…" : "Save"}</button>;
```

## Events that reach the parent

Pressable and the Button · IconButton built on it follow React Aria's behaviour as it is. When an element handles a press, part of the DOM events that carried that input stop at the element. A stopped event reaches neither the parent's React handlers (`onClick` · `onPointerDown` · `onMouseDown` …) nor a native listener attached in the bubble phase on `document`. Listeners in the capture phase (the capture of `document`, the parent's `onClickCapture`) hear all of them. A plain `<button>` stops nothing.

| Input | Reaches the parent and the bubble of `document` | Stopped |
| --- | --- | --- |
| Mouse · touch | `pointerup` · `mouseup` | `pointerdown` · `mousedown` · `click` |
| Keyboard (Enter · Space) | `click` · `keyup` | `keydown` |
| `element.click()` (assistive technology) | none | `click` |

So the `onClick` of a card whose whole row is pressable, or an outside-click listener on `document`, cannot hear a Button pressed by mouse if left as it is.

To let them through, call `continuePropagation()` in the element's press callback. Called in `onPress` · `onPressEnd` · `onPressUp` it lets `click` rise, and called in `onPressStart` it lets the `pointerdown` of mouse and touch and the `keydown` of the keyboard rise. The `click` of `element.click()` rises whichever of the four callbacks calls it. `mousedown` does not rise from any callback, so listen to `pointerdown` or listen in the capture phase. A listener whose element cannot be edited, like an outside click, is attached with capture. The types of Button · IconButton have no press callbacks, so attach them with `<Button as={Pressable} onPress={…}>`.

An example where the Pressable and Button inside a card whose whole row is pressable pass the click upward.

```tsx
import { Button, Pressable, Surface, type PressEvent } from "@studio-baeks/paper-ui";

const passOn = (event: PressEvent) => event.continuePropagation();

export const Row = ({ onOpen }: { onOpen: () => void }) => (
  <Surface onClick={onOpen}>
    <Pressable onPress={passOn}>Button in the row</Pressable>
    <Button as={Pressable} onPress={passOn}>Button in the row</Button>
  </Surface>
);
```

The hook does not include the semantics or attribute defaults of a native button. A consumer who assembles it directly connects the native tag, type and label. Merge it with the props of other hooks using `mergeProps` ([Composition tools](README.md#composition-tools)).
