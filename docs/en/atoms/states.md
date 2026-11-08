# States

This decides how an Atom reacts to hover, focus, active, selected, disabled and invalid. A change of state is not **decoration that creates new depth** but a signal that briefly tells the user where they currently are. The base surface and structural lines are left alone, and only one piece of feedback that fits the meaning of the component is added. The color comes from the interaction roles of [Color](../foundations/color.md), the thickness of the focus ring from [Shape](../foundations/shape.md), and the transition time from [Motion](../foundations/motion.md).

## State vocabulary

The names and attributes of states are written in one place, `tokens/state.ts`, and so that the names components attach and the names the stylesheet reads do not drift apart, no other file in the package writes these attributes directly. A state is a boolean that has its attribute only while it is on, and it is a `data-*` without a prefix (`data-pui-*` is used only for the theme attribute).

| state | attribute | meaning |
| --- | --- | --- |
| `active` | `data-active` | The momentary state while being pressed. `pressed` means only `aria-pressed` and does not overlap with this name |
| `focused` · `focusVisible` | `data-focused` · `data-focus-visible` | Has focus · the keyboard gave focus (when the ring is drawn) |
| `focusWithin` | `data-focus-within` | Focus is inside the element |
| `selected` | `data-selected` | Selected. `aria-current` of the current item is also read as the same selection |
| `disabled` | `data-disabled` | Accepts no input. A blocked target always carries this attribute |
| `invalid` | `data-invalid` | An error state |
| `required` | `data-required` | Required |
| `dragging` · `dropTarget` | `data-dragging` · `data-drop-target` | Being dragged · a place to drop |

The attributes that carry a value are `data-status` (a state word of the frame, like error), `data-presence` (`entering` · `exiting`), `data-presentation`, `data-placement`, `data-part` and `data-orientation`, and the markers that let code walk the DOM are `data-roving-item` and `data-drag-ignore`. Hover is CSS and has no attribute: it applies inside `@media (hover: hover)`, and only to targets that are not blocked.

A state preview is a way to draw one state without a pointer or keyboard. An element carrying `data-pui-preview`, and the elements below it, are drawn in the pointed look if the value is `hover`, in the pressed look if `active`, and in the look the keyboard has reached (the ring) if `focus`. The three stand in one selector with the real states and have the same weight, so the order stays the same too: a preview hover loses to selected and pressed, does not appear on a blocked target, and is not drawn outside `@media (hover: hover)`. It is a device used only by the state gallery (Playground Overview), so no component carries this attribute, and the cells attach it with `previewAttributes("hover")`. Disabled, selected and invalid have no preview; you give them with props.

## Priority

Within one surface, states are read in the following order.

1. `disabled` — turns off every interaction.
2. `active` — the surface and displacement while being pressed.
3. `selected` — keeps the surface of the currently selected item.
4. `hover` — shows temporary feedback only while the pointer is over it.

The focus ring is a separate channel outside this chain, so it is always drawn when the keyboard reaches it, regardless of the surface state.

A pointer click is different from keyboard focus. On a clicked Field, Select or Textarea, only the caret or the native open state remains, and no focus ring is drawn. The ring is shown only for focus that React Aria's input modality judges to be keyboard: arriving by Tab or coming back by Shift+Tab, and for a text input the ring does not appear just from typing characters. A key pressed after a click is also judged to be keyboard: pressing a key in a clicked Select (even Escape to close the list) shows the ring, and pressing Escape in a clicked text input shows the ring.

## How states get drawn

A state reaches an Atom in four steps. The roles of [Color](../foundations/color.md) (`interaction.bgHover` · `selected` · `active` · `focus`, `control.track`, `border.base`) are picked as surface, ink and boundary by the profiles of `tokens/color-recipes.ts` (`accentProfile` · `outlinedControlProfile` · `itemProfile` · `markProfile` · `markForcedProfile`); the state pieces of `tokens/state-recipes.ts` (`stateStyle`) bind those profiles to attribute selectors; the pieces that paint color are spread only by the paint layer (`primitives/paint/`) and put out as classes of `paintClass` and `recipes.css.ts`; and an Atom composes those classes. There is one way a state changes a surface: it moves the tint (`--pui-state-tint`) laid over the surface (`backgroundColor`).

Transitions are decided per state by a Motion role. Hover is the tint, the hover boundary and the hover ink (`hover`, 100ms), state is the selected surface and the on mark (`state`, 130ms), and press is a 1px displacement (`press`, 100ms).

## Standard hover rules

| target | resting | hover | focus | note |
|---|---|---|---|---|
| Pressable shared accent components such as `Button` | `accent × variant` | the variant profile's tint or boundary | keyboard ring | Applies only when `hoverable` (Button gets it, Badge does not) |
| primary `solid` | `accent.primary.solid` | `interaction.bgHover.onPrimarySolid` tint | keyboard ring | A black surface cannot get any darker, so it is lightened one step |
| neutral `Field`·`Select`·`Textarea` | `border.base` line, `control.field` white surface | from `border.base` to `border.hover`. None if `variant="ghost"` | keyboard ring | The background is not changed |
| pointer-focused neutral Form | resting look as it is | resting look as it is | no ring | A clicked input does not change its boundary |
| disabled `Field`·`Select`·`Textarea` | the resting look with `opacity.disabled` | none | not applicable | `not-allowed` cursor. Field's reveal button also stays drawn and does not react |
| semantic Form (`info`·`success`·`warning`·`error`) | the accent's `ink` boundary | keeps the same boundary | keyboard ring | The state-color boundary keeps showing the meaning |
| selectable row · item | base surface | `interaction.bgHover.onSurface` tint | keyboard ring or selected state | The selected surface has priority over hover |
| Link | `interaction.link` ink, underline (`underline="always"` by default) | only a Link that started without an underline (`underline="hover"`) gets an underline when pointed | keyboard ring | Makes no surface |
| Badge · state dot · static display | as it is | none | not applicable | No hover is added to an informational mark |

The `border.hover` of a neutral Form is a dedicated boundary role darker than `border.base` and `border.strong` and paler than the ink, and it only briefly emphasizes the existence of the input box. A semantic Form uses a meaning color from the start, so it does not raise the same line once more and keeps the same boundary on hover too.

The wrapper of Field · Select and Textarea itself are the input's frame (`inputFrame`). The frame carries the border, corners, focus ring and inactivity, and the color is applied by `fieldPaint` and the surface by Surface `fill` (raised by default, or sunken). The frame's state is spoken by attributes: `data-status` (error when `status` was given or the state is an error), `data-invalid`, `data-disabled`, `data-focus-visible`. So the boundary of a neutral frame rises to `border.hover` only on a frame that a pointer can rise over and that is not blocked, a frame with a status keeps the same boundary, and a disabled frame has `opacity.disabled` and the `not-allowed` cursor and does not rise. The frame's boundary transitions with Motion `hover` (100ms), like Button's boundary, and the background with `state` (130ms). Field's clear and reveal buttons stand at `ink.tertiary` and become `ink.primary` when the pointer rises (`hover`, 100ms), and a blocked reveal button keeps only the `not-allowed` cursor. The frame's stylesheet has only geometry and does not write `:hover`, `:focus-visible` or the pointer-focus marker itself. The frame reads only props and FormField's disabled, and does not read the inactivity of an ancestor `<fieldset disabled>`.

## Tint and color profiles

The `soft`, `ghost`, `muted` and solid of a pressable control (`hoverable`) do not change the surface (`backgroundColor`) directly. One layer of `--pui-state-tint` (`linear-gradient`) is laid over the surface, and hover moves that variable to `tokens.color.interaction.bgHover`. So it reads in the same direction on any of raised, canvas and sunken surfaces, and because the variable is a registered `<color>`, only the tint transitions while the surface stays as it is. `hairline` and `dashed` raise the boundary to `border.hover` instead of the surface. Hover is the weakest state, so it adds no specificity to the selector.

The variants that can be selected (`hairline` · `ghost` · `muted`) wear the `soft` surface of their accent when `data-selected` or `aria-current` is present, and hover on top of that does not raise the boundary but adds only the tint. `solid` and `soft`, which already have a surface, have no selected. In high contrast (`forced-colors`), the selected surface becomes the Highlight surface and hover gets a Highlight boundary, and under `prefers-contrast: more`, an ink hairline is added to the selected surface. Neutral items (rows, menu items, segments) get the same done by `stateStyle.item`: it changes `--pui-state-tint` in the order pressed > selected > hover, and the text of a selected item is `ink.primary` ([State recipe](../foundations/README.md#state-recipes)).

This rule is defined by `tokens/color-recipes.ts` and emitted by `styles/color.css.ts` across all of `ACCENTS × VARIANTS`. Display-only components do not accept `hoverable`, so where hover is meaningless, like Badge, there is neither a tint layer nor a hover color. The hover color appears only inside `@media (hover: hover)`, and only on targets that are not disabled, `aria-disabled` or `data-disabled`: touch has no hover, and a blocked target does not react even when a pointer rises over it ([Paint](../primitives/paint.md#paint--accent--variant)).

## Press, disabled, selection marks

Button and IconButton sink one step (the displacement of `motion.press`, 1px) while being pressed. The mouse gets the same look through `:active`, and the keyboard (Enter · Space) through the `data-active` that Pressable attaches, and this look is applied by [Pressable's `motion="press"`](../primitives/press.md). Button has no press color of its own, so the hover tint stays as it is while pressed.

A Button that is disabled or loading carries `data-disabled`, is dimmed (`opacity.disabled`), shows the `not-allowed` cursor, and receives no hover tint. A Button shaped like a link is the same. That look is applied by the single disabled recipe (`stateStyle.disabled`), and a Button that has become an `<a>` does not navigate because of `aria-disabled` and click blocking. The accessibility of loading is decided as one: a Spinner standing alone is a progressbar with a label, and a Spinner inside a control is decoration while the control carries `aria-busy`.

An off Checkbox · Radio stands on a `control.mark` white surface with one `border.base` line. It is the same wherever it is placed ([the surface of input frames](README.md)), and it stays as it is when a pointer rises over it. When on or partially selected it has a primary solid surface, and on an error only the off mark gets an error-ink rim. An off Switch has a `control.knob` knob sitting on the `control.track` track. An on Switch has an `accent.primary.wash` knob sitting on a primary solid track, and the rim is transparent, so nothing is painted over the track's edge while the transition continues. Under `prefers-contrast: more`, the line of an off mark and the rim of an off track darken to `border.strong`.

While Checkbox · Radio · Switch are pressed by a pointer (`:active`), a press ring stands outside the mark. The ring is the `interaction.active` color, and its width is 4px, the width of the focus ring plus the offset, so it fills in, without a gap, the place the keyboard ring would occupy. So the three states of resting, pressed and selected read as different from one another, and the ring disappears on release. While the keyboard ring is visible the ring wins and the press ring does not stand, and it does not appear on a disabled mark. In forced colors mode the ring is Highlight.

A disabled Checkbox · Radio · Switch, on or off, carries `data-disabled`, is dimmed with `opacity.disabled` and shows the `not-allowed` cursor. That look is applied by the single disabled recipe (`stateStyle.disabled`), and the mark stylesheet has no opacity number. A mark that is not disabled is opaque and has the pointer cursor.

## State table per Atom

One column is one state, and the [Verification](#verification) below points to the test that keeps each column.

| Atom | ring owner | hover | active (pressed) | selected | disabled | invalid | forced colors | target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Button | itself (its own curvature) | the variant profile's tint; hairline · dashed use `border.hover` | 1px displacement | `selected` (hairline · ghost · muted) · `aria-current` → soft surface | `opacity.disabled` · `not-allowed`. The link form uses `aria-disabled` and is excluded from Tab; loading keeps focus | — | hover is a Highlight boundary, selected a Highlight surface, disabled GrayText, the ring Highlight | height 30 or more |
| IconButton | same as Button | same as Button | same as Button | same as Button | same as Button | — | same as Button | square, one side is the control height |
| Field | the frame (wrapper) | `border.hover` only when `variant="hairline"` and there is no status | — | — | the frame has `opacity.disabled` · `not-allowed`; the reveal button stays drawn and does not react | `status` · `aria-invalid` → state-ink boundary | boundary CanvasText, hover Highlight | clear · reveal buttons 24px |
| Textarea | itself | same as Field | — | — | same as Field | same as Field | same as Field | the whole control |
| Select | the frame (wrapper) | same as Field. In the list, the item the pointer or keyboard points to gets the hover tint | — | the chosen item in the list gets a leading check (the surface stays) | same as Field. An item that cannot be chosen has `opacity.disabled` | same as Field (`status` exists) | same as Field. The pointed item is Highlight | the whole control |
| Checkbox | itself (box curvature) | none; the label and the row handle it | a 4px `interaction.active` press ring outside | checked · indeterminate → primary solid surface | `opacity.disabled` · `not-allowed` | `status="error"` (`ChoiceStatus`) → an error-ink rim on the off box | Canvas surface · ButtonText rim, when on a Highlight surface · HighlightText mark, disabled GrayText | 24px hit area |
| Switch | itself (track) | none | same as Checkbox | checked → primary solid track | same as Checkbox | `status="error"` → an error-ink inner rim on the off track | ButtonFace track · ButtonText rim · knob, when on a Highlight track · HighlightText knob | 24px hit area above and below the track |
| Radio | itself (circle) | none | same as Checkbox | checked → primary solid surface and wash dot | same as Checkbox | same as Checkbox | Canvas surface · ButtonText rim, when on a Highlight surface and HighlightText dot | 24px hit area |
| Label | not applicable | not applicable | not applicable | not applicable | not applicable | not applicable | the text is decided by the OS | not applicable |
| Badge | no focus | none; since `hoverable` is not given there is no hover color | none | none | not applicable | not applicable | remains as a border, the dot is CanvasText | not applicable |
| Spinner | not applicable | not applicable | not applicable | not applicable | not applicable | not applicable | ring GrayText, arc CanvasText | not applicable |
| Divider | not applicable | not applicable | not applicable | not applicable | not applicable | not applicable | it is a border, so it stays CanvasText | not applicable |
| Link | itself (`radius.text`) | with `underline="hover"` the underline appears | — | — | a link has no disabled | — | LinkText | inline exception |
| Marker | not applicable | not applicable | not applicable | not applicable | not applicable | not applicable | the OS's Mark · MarkText | not applicable |
| SegmentControl | the segment (Item) | in track, the text of an unchosen segment becomes `ink.primary`; in outline, an unchosen segment gets the hover tint | — | in track, the `control.thumb` segment slides over the chosen segment; in outline, the chosen segment gets the `control.chosen` surface and a leading check | `opacity.disabled` · `not-allowed` | — | ButtonFace track (the frame for outline) · ButtonText rim, the chosen segment a Highlight surface · HighlightText text | the whole segment |
| Slider | itself | none | — | — | `opacity.disabled` · `not-allowed` | `status="error"` → an error-ink inner rim on the bar | ButtonFace bar · Highlight fill · ButtonText knob rim | 24px above and below the bar |

## Focus and transition

The focus ring uses one style across the whole package (`focusRing`): the color is `interaction.focus`, and the width and offset are Shape's `focus.width` · `focus.offset` (2px · 2px). The Form wrapper is the owner of focus, so the inner native control turns off its own outline. Pressable draws the ring from its own judgment ([Press](../primitives/press.md#press)). For an element without a ring owner, the global baseline `:where(:focus-visible)` draws only the ring and does not change the element's shape, so the ring follows the element's own curvature ([Shape](../foundations/shape.md#stroke--focus)). The transition time is decided by Motion's roles. Button and IconButton pick a role per group of properties: the hover tint and border are `hover` (100ms), the surface (`background-color`) and text color are `state` (130ms), and the press is `press` (100ms), and the canonical source is [Motion](../foundations/motion.md). Under `prefers-reduced-motion: reduce`, transitions end instantly.

Button, IconButton and Link judge keyboard focus with `useFocusRing` (the same one inside Pressable), put `data-focus-visible` on their own element, and draw the ring from that attribute with their own curvature: the ring of a pill Button is a pill, and the ring of Link is `radius.text`. An element focused by pointer has no ring. A loading Button also receives focus, so it draws the ring when the keyboard reaches it. Field · Select · Textarea use the same judgment, and the ring owner is the input's frame: the inner native control receives `useFocusRing` (`textInput` for text inputs) and the frame carries `data-focus-visible`. For Textarea the frame is itself. When you return to the input from Field's clear or reveal button with Shift+Tab, the wrapper draws the ring again, and the button's ring follows the button's own curvature (`radius.control`). Checkbox · Radio · Switch use the same judgment too, and because the ring owner is the input itself, the ring follows the curvature of the box, circle or track.

## Contrast · forced colors · prefers-contrast · target

Text keeps 4.5:1, and controls and the marks that announce their state keep 3:1: the on track, the on surface and the mark on it, the focus ring, and the error rim. The three stated exceptions (the boundary of inputs and off marks, the pale selected surface, and the off Switch's knob) and their compensation are in the [contrast contract](../foundations/color.md#contrast-contract), and unit tests keep the numbers in both themes.

In the mode where the OS decides colors (`forced-colors: active`), most elements are left to the OS. Only the places where a state relies on the background alone (selection marks, Spinner, the selected surface, Badge's dot) are taken out with `forced-color-adjust: none` and drawn directly with system colors (`SYSTEM_COLORS`). Hover is a Highlight boundary, disabled is GrayText, the focus ring is Highlight, and Divider stays as it is because it is a border ([Color](../foundations/color.md#forced-colors)). In this mode an error cannot choose a color, so `aria-invalid` and the error text announce it.

In forced colors, an off Switch is a ButtonFace track surrounded by a ButtonText rim and knob, and an on Switch is a Highlight track with a HighlightText knob; a Checkbox is a Canvas surface with a ButtonText rim, and when on or partially selected a Highlight surface with a HighlightText check or dash; a Radio, when on, is a Highlight surface with a HighlightText dot. A disabled mark, on or off, is GrayText, the arc of a Spinner is CanvasText, and Divider remains a 1px solid line.

In forced colors, a selected Button is a Highlight surface with HighlightText text, a hovered Button has a Highlight boundary, a disabled Button has GrayText text, and the keyboard ring is Highlight.

In forced colors, the boundary of an input frame (Field · Textarea · Select) is CanvasText, and Highlight when the pointer rises over it.

In forced colors, the text of Label is the CanvasText the OS decides.

In forced colors, Link is the LinkText the OS decides.

In forced colors, Marker is the Mark surface and MarkText text the OS decides, and the image that draws the band disappears.

In forced colors, Badge remains as a 1px solid border even when the surface disappears. The same goes for a variant whose border is normally transparent. The leading dot is only a surface, so it is drawn directly in CanvasText and kept.

Under `prefers-contrast: more`, the boundary roles (`border.*`) and `ink.tertiary` rise to palette values one step darker so that `border.base` reaches 3:1 against the raised surface, and the pale selected surface gets a 1px inner rim of `ink.primary`.

Marks and Field actions have a 24px hit area separate from their visible size ([Shape](../foundations/shape.md#target)). A Link inside a sentence is the inline exception.

## New components

Answer the following questions before adding hover to a new component.

- Is this an interactive control that the user presses to change a state?
- Does it change the surface, change the line, or only add a tint?
- Should a selected/semantic state take priority over hover?
- Are you putting hover on a static mark and blurring the information hierarchy?
- Does it emit `data-*` states? Does that name come from `tokens/state.ts`?
- Who is the ring owner? Is keyboard judgment a single `useFocusRing`?

If there is no answer, do not add hover. Do not express a state with a shadow either: a shadow belongs only to a tier that really floats, and that tier is decided by the elevation of [Layout](../foundations/layout.md).

## Verification

Each column of the table has a test that keeps it, and the contract sentences of the doc are tied one to one to tests of the same name (`check-contracts` in `pnpm test`).

| column | test |
| --- | --- |
| ring owner | `atoms.focus.ring` in `tests/atoms/focus.spec.ts`: whether the Button family, input frames and selection marks draw the ring only by keyboard |
| hover | `atoms.button.tint` · `atoms.field.frame` · `atoms.mark.ring` (the rim of a mark stays the same even on hover) in `tests/atoms/states.spec.ts`, and `atoms.link.underline` |
| active | `atoms.button.press`: pointer and Enter make the same 1px displacement |
| selected | `atoms.button.selected` · `atoms.button.tint` · `atoms.mark.ring` |
| disabled | `atoms.button.disabled` · `atoms.field.frame` · `atoms.mark.disabled` |
| invalid | `atoms.field.invalid` · `atoms.mark.invalid` in `atoms/contract.test.tsx`; the color of the error rim is `atoms.mark.ring` |
| forced colors | `atoms.mark.forced-colors` · `atoms.button.forced-colors` · `atoms.field.forced-colors` · `atoms.label.forced-colors` · `atoms.link.forced-colors` · `atoms.badge.forced-colors` in `tests/atoms/forced-colors.spec.ts` |
| target | `atoms.mark.target` (marks), `foundations.shape.target-reach` (Field actions), `foundations.shape.control-geometry` (Button height and the square IconButton) |
| contrast | `foundations.color.non-text-contrast` in `tokens/color.test.ts`; `prefers-contrast: more` is `atoms.mark.contrast-more` |
| state preview | `atoms.states.preview` in `tokens/state.test.ts` and `tests/atoms/states.spec.ts`: whether the preview draws the same look as real hover, press and keyboard focus |
| state spelling | `foundations.state.source-scan` in `styles/states.test.ts`: `:hover` · `:active` · `:focus-visible` exist only in the state recipes and the paint layer, and state attributes only in `tokens/state.ts` |
