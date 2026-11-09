# Overview

A Component is a finished part that ties Atoms and Primitives together to do one job. Where an Atom is a control with one role, a Component only means something as a set: a sidebar whose items, groups and drawer move under one contract, or a date choice whose grid and popup move together. Components make no new colour, line or size; they use the Foundations roles and the Atoms' axes, and borrow colour only from the recipes in `primitives/paint/`. The package exposes 5 today.

| Component | What it does | Docs |
| --- | --- | --- |
| Sidebar | Navigation that is a rail on wide screens and a drawer on narrow ones | [below](#sidebar) |
| Calendar | Chooses one date on a month grid | [Calendar · DatePicker](date-picker.md) |
| DatePicker | A button in the shape of an input frame opens a Calendar in a popup | [Calendar · DatePicker](date-picker.md) |
| RangeCalendar | Chooses a period (start and end) on a month grid | [Calendar · DatePicker](date-picker.md#range) |
| DateRangePicker | A button in the shape of an input frame that opens a RangeCalendar as a popup | [Calendar · DatePicker](date-picker.md#range) |

## Sidebar

Sidebar is a navigation `<nav>`. On a wide screen it is a rail that sticks beside the page; below the `collapseBelow` breakpoint it becomes a drawer that slides in over a scrim. It is built from items (`Sidebar.Item`), groups (`Sidebar.Group`), a divider (`Sidebar.Divider`) and a place pinned to the bottom (`Sidebar.Footer`).

```tsx
import { useState } from "react";
import { Icon, IconButton, Sidebar } from "@studio-baeks/paper-ui";

export function Shell({ upload }: { upload: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton aria-label="Menu" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
        <Icon><path d="M4 6h16M4 12h16M4 18h16" /></Icon>
      </IconButton>

      <Sidebar id="main-nav" label="Main" open={open} onOpenChange={setOpen} offset="3.5rem">
        <Sidebar.Group title="Printer">
          <Sidebar.Item as="a" href="/" current icon={<Icon><path d="M4 11 12 4l8 7v9H4z" /></Icon>}>Dashboard</Sidebar.Item>
        </Sidebar.Group>
        <Sidebar.Divider />
        <Sidebar.Footer>
          <Sidebar.Item onClick={upload}>Upload</Sidebar.Item>
        </Sidebar.Footer>
      </Sidebar>
    </>
  );
}
```

The root is a `<nav>` named by `label`, and it forwards its ref. A `Sidebar.Group` with a title is a `role="group"` named by that title; without a title it is only a wrapper that stacks its items and has no role.

A `Sidebar.Group` with `collapsible` keeps its title as plain text and puts a small ghost icon button (xs) at the end of the title row to fold it. The title is required, and its absence is an error in development. The button is named by the title (`aria-labelledby`) and joined to the item list by `aria-expanded` and `aria-controls`; the chevron inside points down when open and toward the inline end when folded (mirrored in RTL), and it turns under reduced motion too. The title row is as tall as that button, and the title text starts on the same line as the items' text. A folded list is `hidden`, so its items leave the tab order and the accessibility tree. `open`, `defaultOpen` (open by default) and `onOpenChange` work controlled or uncontrolled. A Group without `collapsible` stays a titled `role="group"`.

`Sidebar.Item` stands on Button, so `as` takes a router Link, `a` or `button`. When `current` it carries `aria-current="page"`, the `muted` variant and strong text; otherwise it is `ghost` at regular weight. Its size follows the Sidebar's `size` (`sm`, 36, by default). `icon` goes first and `badge` at the end of the line. `accent`, `variant` and `shape` (rounded by default) can be overridden.

At or above the breakpoint it is a rail. It sticks below `offset`, its height is the viewport minus `offset`, and it scrolls inside when it overflows. One `border.base` line hangs on its end edge, with the scrollbar inside it. Its width is `width` (a Dimension, `lg` by default).

Below the breakpoint it is a drawer. With `collapseBelow="always"` it is a drawer at every width, for an app that only ever opens it from a menu button or for a framed preview. At the same width it stands fixed at the start side (mirrored in RTL). Closed, it is off screen and `inert`, so neither focus nor assistive technology reaches it. Open, it slides into place and contains focus; closing returns focus to whatever opened it. Page scroll is locked while it is open, and the space at the bottom keeps the device's safe area. Its motion is the Motion `state` role, so the movement remains under reduced motion.

The drawer calls `onOpenChange(false)` on Escape, on a press of the scrim and on a press of a `Sidebar.Item`. Pressing an item closes it, so there is no need to close it separately when the route changes. As a rail, pressing an item calls nothing. The button that opens it belongs to the app: join `aria-expanded` and `aria-controls` yourself; Sidebar accepts an `id`.

`offset` is the height of the bar above it (a CSS length) and is 0 when omitted. It is written as one CSS variable, and the rail's sticky position, the drawer's top and the scrim's edge all read that one variable, so they cannot disagree.

| prop | values | default |
| --- | --- | --- |
| `label` | required. The name of the `<nav>` | — |
| `open` · `defaultOpen` · `onOpenChange` | the drawer's open state, controlled or not | closed |
| `collapseBelow` | `sm` · `md` · `lg` · `xl` · `never` · `always` | `md` |
| `offset` | height of the bar above (a CSS length) | none (0) |
| `width` | Dimension | `lg` |
| `size` | Control size of every `Sidebar.Item`. The rail pads `sm` | `sm` |
| `Sidebar.Group` `collapsible` | An icon button at the end of the title row folds it. `title` required | no |
| `Sidebar.Group` `open` · `defaultOpen` · `onOpenChange` | The fold state when `collapsible`. Controlled or uncontrolled | open |
