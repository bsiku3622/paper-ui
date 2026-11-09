# Overview

An Atom is a finished control that does one job. It draws on top of Primitives by choosing roles from Foundations, and an app builds screens by composing Atoms. The package publishes 16 of them.

## Common axes

Atoms speak with the same few axes. Every value of an axis comes from Foundations.

| axis | values | source |
| --- | --- | --- |
| `size` | xs · sm · md · lg · xl, default md | The Shape control ladder (heights 32 · 36 · 40 · 44 · 48). xs is the place for a toolbar where icons line up |
| `accent` | primary · info · success · warning · error | Color accent |
| `variant` | solid · soft · hairline · dashed · ghost · muted | Color [accent × variant](../foundations/color.md#accent--variant) |
| `variant` (inputs) | hairline · ghost, default hairline. Field · Textarea · Select use the same axis | ghost has no line, hairline has the Color `border.base` boundary. The line of a state remains even in ghost |
| `variant` (selecting row) | track · outline, default track. Only SegmentControl accepts it | track is the `control.thumb` segment on the Color `control.track` groove; outline is the same `control.field` surface and `border.base` line as the input frame, with the `control.chosen` surface on the chosen segment |
| `status` (inputs) | info · success · warning · error, neutral if omitted. Field · Textarea · Select use the same axis | The Color accent `ink` boundary |
| `status` (selection marks) | error only (`ChoiceStatus`), neutral if omitted. Checkbox · Radio · Switch · Slider use the same axis | The Color accent `error.ink` rim |
| `fill` | raised · canvas · sunken. Button · IconButton · Badge accept it only in hairline · dashed · ghost · muted and are transparent if it is not given; Field · Textarea · Select get the white `control.field` surface if it is not given | The Color [Surface](../foundations/color.md) surfaces; in dark, sunken is the same step as canvas |
| `shadow` | boolean. Accepted only when there is a surface. For Field · Textarea · Select there is no shadow if omitted, and `true` adds the resting shadow | Layout [resting depth](../foundations/layout.md#elevation--position-stacking-and-shadow-are-one-unit) |
| `shape` | sharp · small · rounded · pill. The pressables (Button · IconButton), the selecting row (SegmentControl) and Badge default to pill, and the value-taking frames (Field · Select · Textarea) default to rounded. The default for the whole app is `controlShape` on `PaperProvider`. A pill frame puts the value and the arrow in the same wide inset as Button, and Textarea has no pill | Shape `radius.small` · `radius.control` · `radius.pill`, [the four steps and the pill inset](../foundations/shape.md#radius) |
| `fontSize` | `label` · `caption` · `body` (`CONTROL_FONT_SIZES`) | Typography: an escape hatch that changes only the type size. It accepts only roles that the control box can hold |

`size` picks the geometry, and the type is picked separately in Typography's [Control preset](../foundations/typography.md#control-preset). A Button, Field and Select of the same size stand at the same height and their type heights match. Even if you change the type with `fontSize`, the geometry follows the chosen size.

## List

| Atom | own axes | defaults and behavior |
| --- | --- | --- |
| Button | as · accent · variant · fill · shadow · size · fontSize · strong · shape · selected · loading · loadingLabel · fullWidth · gap · align · justify · badge | button / primary / solid / md / pill, type=button. The type is the `button` preset regardless of variant. selected gives aria-pressed and the selected surface in hairline · ghost · muted. loading shows a spinner and aria-busy, keeps focus, and blocks only pressing and submitting |
| IconButton | as · accent · variant · fill · shadow · size · shape · disabled · iconSize · badge · required aria-label · a single children | Square, with the height as the side. The Icon inside follows the control height unless iconSize is given. No loading · fullWidth · fontSize |
| Field | status · size · variant · fill · shadow · fontSize · shape · numeric · textAlign · gap · leading / trailing · clearable · clearLabel · showPasswordToggle · showPasswordLabel · onClear | neutral / md / hairline / white surface (`control.field`) / rounded, type=text. The wrapper owns the surface, height, state and focus. The names of the clear and show buttons are locale wording and are changed with the label props. The browser's search cancel × and Edge's password reveal widget are owned by Field and hidden, while the number stepper and the date picker widget stay with the browser |
| Textarea | status · size · variant · fill · shadow · fontSize · shape · rows · native textarea props | neutral / md / hairline / white surface (`control.field`), 4 rows by default. rows decides the height (there is no minimum height), and one row = a Field of the same size, with vertical resize. No pill |
| Select | status · size · variant · fill · shadow · fontSize · shape · children · native select props | neutral / md / hairline / white surface (`control.field`) / rounded. A button (combobox) shows the value and a list drawn by Paper (listbox) opens. Option and Group, no multiple. The form and ref belong to the invisible native select. The arrow is a trailing Icon. className · style · data-testid go to the wrapper |
| Checkbox | status · size · indeterminate · native input props | md. The box is `selection.size` and the check is half of it. The off surface is a white `control.mark` surface with a `border.base` line, and with `status="error"` an error-ink rim. When on, a primary solid surface. While pressed, a press ring outside. 24px hit area |
| Switch | status · size · native input props | md. input type=checkbox + role=switch. Track width = 1.5 times the height (`anatomy.switch.length`). The off track is a `control.track` surface with no line. The knob is a circle that sits inside by the rim on all sides, and moves with `inset-inline-start`, so it flips by itself in RTL. While pressed, a press ring outside |
| Radio | status · size · native input props | md. The same box as Checkbox. When on, a wash dot sits on a primary solid surface, and the dot is 0.4 of the box. name and selection are assembled by the caller. All Radios in a group get the same `status` |
| Label | children · ref · native label props | Exactly Text's label role. Connected by htmlFor or an inner control |
| Badge | accent · variant · size · fontSize · dot · shape · gap · align · justify · ref | primary / soft / md / pill. It is `Paint as="span"` and display-only, so no hover. The height is Shape's badge ladder, and the type is fixed regardless of size |
| Spinner | size (xs · sm · md · lg · xl · inline) · ink (inherit) · label · decorative | md, label is locale wording ("Loading" in English, "불러오는 중" in Korean), role=progressbar. The diameter is the control icon ladder, and inline is as large as the text. decorative is aria-hidden |
| Divider | orientation=horizontal/vertical · level=base/strong · ref · native hr props | horizontal / base. `Box as="hr"` + aria-orientation. The line is drawn with border, level is the color of the line (`border.base` · `border.strong`), and the thickness is the border stroke |
| Link | as · underline (always · hover) · native anchor props | a, `interaction.link` ink, always underlined (`always`); a standalone link only on hover (`hover`). A router's Link is received through `as` |
| Marker | native attributes · ref | mark. The fill is `marker.fill` and the text is `marker.ink`, and the size and weight of the text follow the surrounding text |
| SegmentControl | value · defaultValue · onValueChange · variant · size · shape · fullWidth · disabled · native div props; SegmentControl.Item takes value · disabled | track / md / pill. `role=radiogroup` and the height is the control height. In track, segments sit inside the track at inset xs; in outline, segments fill the frame and draw the same line between segments. The text of an unchosen segment is `ink.secondary` because it is a choice to be read, and the chosen segment is `ink.primary`. The text decides the width, and with fullWidth the segments share the width equally |
| Slider | status · size · value · defaultValue · min · max · origin · native input props | md, 0 to 100. input type=range. The bar has the same height as the Switch track, and the knob is a circle whose diameter is the bar height (a white surface with an emphasis rim). Dragging and keyboard are native |

Select.Option and Select.Group are the anatomy of Select, so they are not counted separately. They are used only through the single path `Select.Option` · `Select.Group` and are not exported separately. SegmentControl.Item is the same. Where each Atom's dimensions come from is in the recipe table of [Shape](../foundations/shape.md#recipe--component-anatomy).

Divider's `orientation` picks the direction of the line and is passed on as `aria-orientation`. `level` picks the color of the line.

## Atoms on Primitives

An Atom stands on Primitives, hooks and shared recipes, and where a native control exists, that control remains the element that carries the meaning. Primitives come in two orders: the first order (Element · Content · A11y) is the base and does not lean on one another, and the second order adds one ability to Box and is tied together by Atoms through hooks and class functions ([Primitives](../primitives/README.md)). All color comes from `primitives/paint/`, so an Atom's stylesheet has only geometry and does not read `tokens.color`.

| Atom | stands on | color |
| --- | --- | --- |
| Button · IconButton | `Pressable as={target}` (a part is just a target too) · `motion="press"` · `useSelectable` · `controlClass` | `paintClass` |
| Link | its own target tag · `useFocusRing` | `linkPaint` |
| Marker | native `mark` | `markerPaint` |
| Field · Textarea · Select | `useFormFieldControl` · `useFocusRing` (`atoms/input-control.ts`) · the input frame `inputFrame` · `controlClass` · Icon · actions are Pressable, the password toggle is `Pressable as={Selectable}` · Select's list is `Floating` (listbox) | `fieldPaint`; Select's list is `selectOptionPaint` · `selectCheckPaint` |
| Checkbox · Radio · Switch | native input · `useFocusRing` · `useFormFieldControl` (`atoms/input-control.ts`) · `controlClass` | `markPaint` |
| Label | Text | The ink of Text's label role |
| Badge | `Paint as="span"` · `controlClass` | `paintClass` (applied by Paint) |
| Divider | `Box as="hr"` | `linePaint` |
| Spinner | `Box as="span"` · `loop.spin` · `controlClass` | `spinnerPaint` |

Spinner has no hidden label element and names itself with `aria-label`. A progressbar takes its name from the author's text, and since this is progress without a value, there is no body text to point to separately.

## `as` — the axis that changes the role in the same place

Button, IconButton and Link have `as` (`<Button as={RouterLink} to="/docs">`, `<Link as={RouterLink} to="/demo">`). It is not a hole through to a raw tag but an axis that changes the role in the same place. If something looks like a button but what it does is navigate, it should be a link, and wrapping a `<Button>` in a `<Link>` puts a `<button>` inside an `<a>` and gives two Tab stops. Making only one tag be drawn is the job of `as`. When the tag differs, `type` and `disabled` differ too, so a button that has become an `<a>` expresses inactivity with `aria-disabled`, `tabIndex=-1` and click blocking. The reset needed for the link look (no underline) is owned by Button's stylesheet.

Button and IconButton are always drawn as one [Pressable](../primitives/press.md), and `as` is that Pressable's target. Whether the target is a tag, a router Link or a behavior part, the press machinery is put on that element exactly once. The one and only way to put an Atom's look on a behavior is `<Button as={part}>`: `<Button as={Floating.Trigger}>` · `<Button as={Floating.Close}>` · `<Button as={Selectable}>` · `<Button as={SelectableGroup.Item}>`, and the part's behavior (opening, selecting) still happens just once. On this path, use the part's props as they are. `<Button as={Pressable}>` draws one Pressable. The opposite direction, `<Floating.Trigger as={Button}>`, puts two press machines on one element, so it is a development-mode error, and `<Button as={Draggable.Handle}>` is an error too (the handle's keyboard drag reads a click that reaches the handle as a cancel). A disabled link target does not navigate.

## Marker

Marker is a highlighter. It draws one `mark` element inside a sentence, and the ref, className and native attributes go to that element. The size and weight of the text follow the surrounding text, so place it directly inside a `Text`.

The fill is not the whole text box but a band that passes through the line box. The height and position are in the source `anatomy.marker`. When the line wraps, the band continues on each line, and a margin gives back as much as the band sticks out of the text, so the positions of words stay as in the sentence.

Marker is decoration. It takes no focus and says nothing about state. Do not use it for signals such as selection or error, because the contrast between lime and a white surface is 1.09:1 and the fill alone does not show a boundary.

## Button · IconButton · Spinner · Link

Button's `selected` can be given only in hairline · ghost · muted (the types block it), and it announces the selection with the one aria attribute the role decides (aria-pressed by default, aria-selected for `tab`, aria-checked for `switch`) and `data-selected`. The selected surface is applied not by a prop but by CSS that reads that attribute, and it is the `soft` surface of that accent. A Button without `selected` carries no aria-pressed, and for the current item `aria-current` gives the same selected surface. A toggle is handled by `<Button as={Selectable}>` and one-of-many by `<Button as={SelectableGroup.Item}>`. `selected` and `onSelectedChange` pass straight through to Selectable, making it controlled, and the selection of SelectableGroup.Item is decided by the group.

Button's loading does not lose focus. It carries no native `disabled` but `aria-busy`, `aria-disabled` and `data-disabled`, and pressing and implicit submission (Enter) are blocked. The spinner is decoration (`<Spinner size="inline" ink="inherit" decorative />`), and the announcement is left to the control's aria-busy. If focus is on that Button when loading starts, it announces `loadingLabel` (by default the locale's "Loading" in English, "불러오는 중" in Korean) once. disabled disables the native button. When the two overlap, disabled wins.

`strong` is a single beat of emphasis for the label. The preset is already an emphasized weight, so only `false` has a meaning, and it makes the label regular. The height and padding of the box stay the same. Use it as `strong={here}` where several buttons stand side by side, like a sidebar.

`justify` is the horizontal arrangement of the content (`JUSTIFIES`, centered by default). It matters when the button is wider than its content: a sidebar item is `fullWidth justify="start"`, and an item with a number at the end is `justify="between"`. `gap` and `align` are also the [content arrangement](../primitives/control.md#content-arrangement) chosen separately from size. An icon-only IconButton does not have them.

`badge` is a mark that straddles the outer corner of the button. It puts a small indicator that belongs to the button, like a notification count, on it without changing the button's size, and pressing on the mark still presses the button. The value is usually one `Badge`, and that Badge decides its color and size. In RTL it goes to the left corner. The name of an IconButton is spoken by `aria-label`, so write the number there too.

IconButton opens only the axes that do not collide with the square anatomy: `as` · accent · variant · size · shape · disabled · iconSize · badge and the required `aria-label`. loading · fullWidth · fontSize are blocked by the types. The Icon inside follows the control height unless you give it a `size` (`control.icon`).

IconButton keeps its square even when the row is full. When the width is short, the text next to it shrinks first.

When it stands alone, Spinner has `role="progressbar"` and `aria-label`. It is progress with no value (`aria-valuenow`), so how long it will take is unknown, and a progressbar takes its name from the author's text, so no hidden label element is placed. If `decorative`, it is `aria-hidden` and has neither role nor name; that is the Spinner inside a control. The rotation is Motion's single `loop.spin` (the package has one `@keyframes spin`), the size is decided by the control icon ladder (`inline` is as large as the text), and the color by `ink`: by default an arc in primary ink, and with `inherit` an arc in the surrounding text color, and either way the tail fades.

Link always draws an underline (`underline="always"`). A link inside a sentence does not reach 3:1 against the body by color alone, so the underline is the cue that it is a link. Only a standalone link whose position already says it is a link, like a menu, draws the underline on pointing with `underline="hover"`. Touch has no hover. Body links on doc pages are also drawn with the Link Atom and follow the same rule.

Link takes a component such as a router's Link through `as` and draws only one tag. With `as="button"` it gets `type="button"` and the button reset that Pressable uses, so it is drawn with the same text, ink and underline as a link, without the browser's button look. `useFocusRing` decides keyboard focus and puts `data-focus-visible` on the link itself, and the ring follows the link's own curvature (`radius.control`).

## ref and style targets

Every Atom follows the same contract. `ref` and native attributes (`id` · `data-*` · `aria-describedby`) go to the element that carries the meaning, and `className` · `style` · `data-testid` go to the visible box. Most Atoms have the two as one element, and only Field and Select, which have a separate frame, split them. Select has two elements that carry meaning: accessibility and keyboard are handled by the button that shows the value (combobox), and the form by the invisible native select, so `id` · `data-*` · `aria-*` and handlers go to the button, and `ref` and form attributes go to the native select. Label draws the same class as Text's `label` role.

Field and Textarea pass `ref` and native attributes to the inner native control, and `className` · `style` · `data-testid` to the visible frame. For Textarea the frame is the control itself, so everything is one element. Select passes `ref`, the form attributes (`name` · `value` · `defaultValue` · `required` · `form` · `autoComplete`) and `onChange` to the invisible native select, the remaining native attributes and handlers to the button, and `className` · `style` · `data-testid` to the frame.

| Atom | target of ref · native attributes | target of className · style | target of data-testid |
| --- | --- | --- | --- |
| Button · IconButton | the chosen root element | the same root | the same root |
| Link | the chosen root element (a by default) | the same root | the same root |
| Marker | mark | the same mark | the same mark |
| Spinner | span | the same span | the same span |
| Field | the inner input | the visible div wrapper | wrapper |
| Select | ref and form attributes go to the invisible native select; id · aria · data-* · handlers go to the button (combobox) | the visible span wrapper | wrapper |
| Textarea · Checkbox · Radio · Switch · Slider · Badge · Label · Divider | each native element (label for Label, hr for Divider) | the same element | the same element |
| SegmentControl | the radiogroup div | the same div | the same div |
| Select.Option · Select.Group | the option · optgroup inside the native select | the same element | the same element |

Label is `<Text as="label" variant="label">`. The ref and native label attributes go to the label element, and the text size, weight and ink are decided by Text's `label` role.

Badge stands on `Paint as="span"` and receives the accent × variant surface from Paint, and since it is not given `hoverable`, it has neither hover color nor tint layer. The ref and native attributes go to the span.

Divider is `Box as="hr"` and draws the line with border, not background. The ref and native attributes go to the hr; horizontal is one top border line on an hr of zero height, and vertical is one start-side border line on an hr of zero width, so it takes up only as much space as `stroke.border`. The color is `linePaint` (`border.base` · `border.strong`), and because the line is a border, it stays CanvasText even in modes where the OS decides colors.

An app class passed through className is outside the layer that holds the package CSS, so it beats even an Atom's state rules regardless of load order ([Priority](../get-started/install.md#priority)). Field and Select have their surface, border and focus ring on the wrapper. Select's form is handled by the invisible native select: Option and Group are drawn inside it as they are, and choosing from the list changes that select's value and fires the native `input` and `change` events. So `name` · `required` · `form` · reset · FormData, `e.currentTarget.value` of `onChange`, and `ref` are the same as a native select. Choosing the same item again fires no event. That select is absent from the accessibility tree and the Tab order, and if something sends focus there (a form pointing at an empty required value), the button receives it. Select's arrow neither takes focus nor intercepts clicks.

The button that shows the value is `role=combobox` · `aria-haspopup=listbox` · `aria-expanded`. When open, `aria-controls` points to the list and `aria-activedescendant` points to the item the list is pointing at, and focus stays on the button. The list opens as a listbox panel of [Floating](../primitives/float.md) at the start side below the frame (upward if there is no room below), no narrower than the frame but not beyond the window's `layout.gutter`. Items stand inside inset xs at Select's size height. An item is `role=option` with `aria-selected`, an item that cannot be chosen is dimmed with `aria-disabled`, and Group is a named `role=group`. The chosen item is shown with a leading check and the pointed item with a hover tint, so the two do not mix. The check slot is left empty on all items so the text starts on one line. The name of the list is the same as Select's name.

When closed, ↓ · ↑ · Enter · Space open the list pointing at the chosen item, and Home · End open it pointing at the first · last item. When open, ↓ · ↑ move one at a time (without wrapping at the ends), Home · End move to the two ends, PageDown · PageUp move ten at a time, and items that cannot be chosen are skipped. Enter · Space · Alt+↑ choose the pointed item and close; Escape closes without choosing (it does not close the dialog that Select stands in); Tab closes without choosing and then passes focus on. Typing characters, whether open or closed, points to the next item that begins with that character; characters typed in succession within a short time (0.5 seconds) become one word, and repeating the same character cycles through the items that begin with it. Space while typing a word does not choose but becomes a character.

Pressing the button opens the list, and pressing again closes it. Pressing an item chooses it and closes, and pressing outside the list closes without choosing. Even while the list is pressed, focus stays on the button, so the keyboard continues. The item the pointer passes over becomes the pointed item.

In a place where no width is given (an `auto` cell of Grid), Select grows as wide as the longest choice. Where there is a width, it fills it. The inner padding of the value belongs to the button and the button fills the frame, so pressing anywhere on the frame opens it. The text of all the choices overlaps in one cell and only the chosen one is shown, so the frame does not move when the value changes.

## States and accessibility

Field, Textarea and Select speak of errors with a single rule. Inside a [FormField](../primitives/field.md#input-and-description-relations), they receive the field's id, description, error, disabled and required through context and spread them last as `controlProps`; outside, they use only their own props. For `aria-invalid`, a directly given value wins; otherwise it is `true` when `status="error"` or when the field is invalid. You need give only one of the two, and even without `status`, if the field is invalid the frame draws the error boundary. A directly given `aria-invalid={false}` leaves the attribute `false` while keeping the boundary of `status="error"` as it is. The frame carries `data-invalid` on an error and `data-status` when there is a status. Checkbox · Radio · Switch call the same hook.

Field's clear is a button that shows only when there is a value and the Field is usable, and its name is `clearLabel` (otherwise the locale's "Clear" in English, "지우기" in Korean). Pressing it fires `onChange` for both controlled and uncontrolled through the native setter and an input event, calls `onClear`, and returns focus to the input. The reveal toggle shows only for `type="password"` with `showPasswordToggle`, its name is always the same (`showPasswordLabel`, otherwise "Show password" in English, "비밀번호 보기" in Korean), and `aria-pressed` announces whether it is pressed. If the Field is disabled (including FormField's disabled), the toggle stays drawn but disabled, so it has neither reaction nor Tab stop, and the clear hides. The icons of the two buttons follow the control height unless you give a `size` (so does an Icon inside a leading · trailing adornment), and they have a hit area widened to the minimum target, separate from the visible size (WCAG 2.5.8); the hit areas of two buttons side by side do not overlap. Because Field owns the clear (the × of a search field) and the password reveal, widgets that the browser draws inside the input for the same job (the search cancel ×, Edge's reveal) are hidden. The number stepper and the date picker widget stay with the browser.

The frame of Field · Textarea · Select picks its line with `variant` (hairline · ghost) and its surface with `fill` (raised · canvas · sunken). The default is `hairline`, and the surface is `control.field` (a white surface), so the line builds the boundary even on a white card. It is the same edge as a hairline Button. Where the color of the surface is the boundary, like a search field, give `variant="ghost"` with `fill="sunken"`. It is a box that holds text, so a surface is always there and `shadow` is accepted at any time, but there is no shadow by default. `ghost` also draws the line of a state.

An input frame with no surface chosen and an off Checkbox · Radio look the same wherever they are placed. The input frame is `control.field`, and an off mark stands on a `control.mark` white surface with one gray line (`border.base`), with no shadow. The line builds the boundary even inside a white card. In dark, the two surfaces are neutral.875, one step lighter than the card. Gray is chosen by the screen: an input frame given `fill="sunken"` with `variant="ghost"` is a gray surface without a line. It does not read the floor it sits on and change its look. The tracks of Switch and SegmentControl are grooves with an inset shadow wherever they are placed (Slider does not have it yet because of the hit area margin).

The height of Textarea is decided by `rows` (default 4), and there is no minimum height. One row (`rows={1}`) is the same height as a Field of the same size, and the default 4 rows are xs 88 · sm 92 · md 96 · lg 100 · xl 104. The surface is chosen by the same `fill` as Field and is the white `control.field` surface if not given, and the frame is the same `inputFrame` as Field · Select, so it does not lean on Field's stylesheet.

Checkbox · Radio · Switch are native inputs. Checkbox is `type=checkbox`, Radio is `type=radio`, and Switch is `type=checkbox` with `role=switch` added, so it reads as on/off. The selection state is spoken by the input's own `checked` and is not written once more as `aria-checked`; of Radios with the same `name` only one stands, and the form reads that value. Inactivity is the native `disabled`.

The `status` of Checkbox · Radio · Switch is `error` only (`ChoiceStatus`). An error is spoken by the same rule as inputs: for `aria-invalid`, a directly given value wins; otherwise it is `true` when `status="error"` or when the FormField is invalid, and the selection mark itself carries `data-invalid` and `data-status`. A directly given `aria-invalid={false}` leaves the attribute `false` while keeping the rim of `status="error"`. Only the rim of an off mark becomes error ink and an on mark stays as it is, and an error is not announced by color alone: `aria-invalid` and the FormField's error text announce it together. All Radios in a group get the same `status`, or the radiogroup gets `aria-invalid`.

The stylesheet of a selection mark has only geometry. The color is applied by `markPaint` (`primitives/paint/recipes.css.ts`), the keyboard ring and inactivity are applied by the state recipes (`stateStyle.focusVisible` · `stateStyle.disabled`), and there is no hover (the places where a pointer rises are the label and the row, not the mark). While the mark is pressed, a press ring stands outside it (`markPressPaint`; see [Press, disabled, selection marks](states.md#press-disabled-selection-marks)). An off mark wears one `border.base` line on a `control.mark` white surface, and that line is a documented exception below 3:1 ([non-text contrast](../foundations/color.md#contrast-contract)). Switch's off track is a `control.track` surface, and an on mark is a primary solid surface.

SegmentControl is `role=radiogroup` and SegmentControl.Item is `role=radio`. The Tab stop is the one chosen segment and the arrow keys move the chosen segment; pressing the chosen segment again does not empty the selection. If you give `value`, the caller holds the value and is asked for changes through `onValueChange`. `disabled` blocks the whole group, and an Item's `disabled` blocks only that segment. The position of the segment is obtained by measuring the chosen item, so it fits even when the text widths differ. A group that fills the width (`fullWidth`) divides the width equally among the segments, but no segment becomes narrower than its own text (for the chosen segment of outline, including the check): a segment that needs more keeps its own width and the remaining segments share the leftover.

A SegmentControl with `variant="outline"` stands in the same look as the frame of Field · Select: a `control.field` white surface with one `border.base` line, the same height and curvature as a Field of the same size. There is no sliding segment; from the second segment on, the same line is drawn on the start side to divide the segments. The chosen segment fills the inside of the frame's line with the `control.chosen` surface and puts a check before the text. The check is `aria-hidden`, so the segment's name is the text as it is. If a segment brings its own icon, that place is given to the check while it is chosen. Use it beside a form (a place where it sits on one line with a Select · Field, like the Props panel). The default is `track`, and the `shape` default (pill) goes separately from variant.

Slider is a native `input type=range`. Dragging, arrow keys and form submission are handled by the browser, and `min` · `max` · `step` have their native meaning. It receives FormField's relations and errors by the same rules as other inputs.

The filled part extends to where the value stands. With no value it starts from the center, like a native range, and a value out of range stays inside the bar.

With `origin`, the fill runs from that value's place to the thumb and paints only what lies between, on whichever side the thumb stands. A value whose 0 means "unchanged", such as -100 to 100, fills from the middle with `origin={0}`. Without it the fill starts at `min`.

Checkbox's `indeterminate` is a DOM property, not an attribute, so a layout effect sets it on the input directly. The ref passed in is left as it is, so the callback ref is not called again when the value changes.

Selection marks and Field actions have a 24px hit area separate from their visible size (WCAG 2.5.8). For Checkbox · Radio it is an invisible `::before` that widens around the box, and for Switch it widens above and below the track (horizontally the track is already enough), and it paints no color. A pointer within 12px of the mark's center, half of the hit area, reaches that mark, and one beyond 14px does not. A Link inside a sentence is the inline exception.

Field · Select · Textarea judge keyboard focus with React Aria's single input modality, and put `data-focus-visible` on the frame that draws the ring (the wrapper for Field · Select, itself for Textarea). Pointer focus has no ring, and arriving by Tab or Shift+Tab shows a 2px ring on the frame. Checkbox · Radio · Switch use the same judgment, but because the ring owner is the input itself, they draw the ring with their own curvature, and inactivity gets `opacity.disabled` and the `not-allowed` cursor through the native `disabled` and `data-disabled`. IconButton's aria-label is required by the types, and Badge's dot and Select's arrow are hidden as decoration. The priority of hover · focus · selected is in [States and feedback](states.md).

For working examples, look at the Playground's [Atoms](/playground/button) list.
