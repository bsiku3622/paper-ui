# Changelog

Every published version has a `## <version>` heading below, newest first. The recorded API surface (`api/surface.json`)
moves only with a version that has one: `pnpm api:update` refuses otherwise.

## 0.1.5

- A popover opened from a trigger that is still pressed keeps its gap: a pressed Button sinks one step, and the panel used to be placed against the sunk trigger, one pixel lower than its `offset` once the trigger came back up. The panel is now placed again when the trigger's press transition ends.
- The `Sidebar` drawer is wider on phones: it stays at least the rail's `width`, and grows to `dimension.width.xl` (360) while leaving `layout.gap.3xl` (48) of scrim at the end of the screen. The rail is unchanged.

## 0.1.4

- A new layer, Components, after Atoms: finished parts built from Atoms and Primitives. `INVENTORY.components` lists `Sidebar`, `Calendar`, `DatePicker`, `RangeCalendar` and `DateRangePicker`.
- `Sidebar`, with `Sidebar.Item`, `Sidebar.Group`, `Sidebar.Divider` and `Sidebar.Footer`: a `<nav>` that is a sticky rail at or above `collapseBelow` and a drawer below it. The drawer is `inert` while closed; open, it contains focus, closes on Escape, on its scrim and on a pressed item, returns focus to what opened it and locks the page scroll. `offset` is the height of the bar above, read by the rail, the drawer and the scrim as one variable. `collapseBelow="always"` keeps it a drawer at every width.
- `Sidebar.Group` takes `collapsible`, `open`, `defaultOpen` and `onOpenChange`: its title stays plain text and a small ghost icon button at its end, named by the title, carries a turning chevron and is joined to the item list by `aria-expanded` and `aria-controls`; a folded list is `hidden`. It needs a title.
- `Sidebar` takes `size` (a control size, `sm` by default) for every `Sidebar.Item`; the rail pads `sm`, and only the current item is strong.
- `Calendar` is a month grid with muted previous and next buttons, day cells on the control ladder (`size`, `xs` by default) and `shape` from the app's control shape. The chosen day is a solid face, today a hairline, and cells outside the month stay empty. Keys, focus and the locale's week start and names come from the React Aria calendar.
- `DatePicker` is an input-frame button (the axes of `Field` and `Select`) that shows the date in the locale's medium format and opens a `Calendar` in a popover. Choosing a day closes it and returns focus. `name` sends the ISO value with a form, and it works inside `FormField`. There is no typing of dates and no range yet.
- `RangeCalendar` chooses a period on the `Calendar` grid. The value is `{ start, end }` (ISO strings, exported as `DateRangeValue`); the first press is the start and the second the end, and `onValueChange` is called once, when the end is set. One soft band runs from the start to the end, the two end days are solid with their inner corners square, and while the end is pending the band previews up to the day the pointer or focus is on. `min` and `max` stay limits only.
- `DateRangePicker` is the `DatePicker` button for a period: the locale's medium date range on one line, `startName` and `endName` hidden inputs, and a popup that closes, and returns focus, when the end is chosen.
- New dependencies: `@react-aria/calendar`, `@react-stately/calendar` and `@internationalized/date`.
- Dark lines are quieter: `border.base`, `strong` and `hover` move one step toward the surfaces (neutral.875, 800 and 700), and the resting edge of a first surface is a 1px line of 10% white instead of 15%. A dark input or mark now reads as its face, since its line is the same grey; the hover line still appears. Light is unchanged.

## 0.1.3

- `SegmentControl` takes `variant="underline"`: no surface, one `border.base` line under the group and an `ink.primary` bar that slides under the chosen choice, so hover only changes the text colour. For a row of tabs that changes the list below it.

## 0.1.2

- Controls take four corners: `shape` is `sharp`, `small`, `rounded` or `pill`. `small` reads a new source, `radius.small` (4 at xs, 6 from sm up), and `sharp` has none. The corners inside a control follow it: SegmentControl's segments, Select's list and options, and Field's clear and reveal buttons.
- `PaperProvider` takes `controlShape`, the shape of every control under it that is not given one. `Textarea` takes `shape` too, without `pill`, and stands rounded under an app that asks for pill.

## 0.1.1

- `Slider` takes `origin`: the fill runs from that value to the thumb, so a range whose 0 means "unchanged" (-100 to 100) fills from the middle.

## 0.1.0

First release. Nothing before it was published: the earlier commits on `origin/main` that also carried the version `0.1.0` were never released, and their token paths and variables promise nothing. The bump gate measures from this release.

- Four entries: `@studio-baeks/paper-ui` (components, hooks, `PaperProvider`), `/tokens` (values and vocabulary, no React and no CSS), `/theme-boot` (the first-paint script) and `/styles.css` (the one global stylesheet, in the cascade layer `pui`).
- Foundations: Color, Typography, Shape, Layout and Motion, authored as sources and emitted as CSS variables, with a theme engine for light, dark and system. The first-order systems read only themselves; the second-order recipes (Control, Line, Elevation) tie them together. The control ladder has five rungs, `xs` to `xl` (32 to 48).
- Primitives in two orders: Element, Content and A11y as the ground; Paint, Control, Press, Select, Float, Drag, Focus, Field and Layout as Box plus one capability.
- Sixteen Atoms built on them: Button, IconButton, Field, Textarea, Select (a list Paper draws, over a native select), Checkbox, Switch, Radio, Label, Badge, Spinner, Divider, Link, Marker, SegmentControl (`track` and `outline`) and Slider.
- Type: the titles, from `hero` to `subheading`, stand at one weight (600) and step down by size alone; reading text (`lead`, `body`, `caption`) is 400.
- Motion: roles for press, hover, state, enter, exit, theme and `reveal`, the entrance a screen plays as it loads (`reveal.load`) or scrolls into view (`reveal.scroll`, with `revealAfter` for siblings). Every role stands still under reduced motion.
- State preview: an element with `data-pui-preview` (written by `previewAttributes`), or under one, is drawn hovered, pressed or focused without a pointer or a key, for a gallery of states.
- `tokens.shape.selection.size` is a source of its own: Checkbox and Radio boxes do not follow the control height, and a Switch track is the box's height and a rim, one and a half times as long.
- `tokens.typography` is `role` and `preset`. The Palette is not public; its CSS variables stay, and `sourceVars()` still names them.
- ESM only; peers `react` and `react-dom` `^18.2.0 || ^19.0.0`.
