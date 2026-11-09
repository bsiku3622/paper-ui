# Overview

A Component is a piece of an app screen built by composing Atoms. Where an Atom is a control with one job, a Component only means something when several parts stand together: a navigation sidebar, where items, groups, a divider and a drawer move under one contract. It stands on Primitives and Atoms, and borrows colour only from the recipes in `primitives/paint/`. The package publishes one for now.

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

`Sidebar.Item` stands on Button, so `as` takes a router Link, `a` or `button`. When `current` it carries `aria-current="page"`, the `muted` variant and strong text; otherwise it is `ghost`. `icon` goes first and `badge` at the end of the line. `accent`, `variant` and `shape` (rounded by default) can be overridden.

At or above the breakpoint it is a rail. It sticks below `offset`, its height is the viewport minus `offset`, and it scrolls inside when it overflows. One `border.base` line hangs on its end edge, with the scrollbar inside it. Its width is `width` (a Dimension, `lg` by default).

Below the breakpoint it is a drawer. At the same width it stands fixed at the start side (mirrored in RTL). Closed, it is off screen and `inert`, so neither focus nor assistive technology reaches it. Open, it slides into place and contains focus; closing returns focus to whatever opened it. Page scroll is locked while it is open, and the space at the bottom keeps the device's safe area. Its motion is the Motion `state` role, so the movement remains under reduced motion.

The drawer calls `onOpenChange(false)` on Escape, on a press of the scrim and on a press of a `Sidebar.Item`. Pressing an item closes it, so there is no need to close it separately when the route changes. As a rail, pressing an item calls nothing. The button that opens it belongs to the app: join `aria-expanded` and `aria-controls` yourself; Sidebar accepts an `id`.

`offset` is the height of the bar above it (a CSS length) and is 0 when omitted. It is written as one CSS variable, and the rail's sticky position, the drawer's top and the scrim's edge all read that one variable, so they cannot disagree.

On a touch screen (a phone, upright or on its side) items stand at the lg control height (44px) and the icon is one step larger. Text size stays. No prop is changed from JavaScript: one CSS media query changes the control size variables, so it is right from the first paint. The condition is a coarse pointer under the Layout `sm` breakpoint in width, or under `sm` in height.

| prop | values | default |
| --- | --- | --- |
| `label` | required. The name of the `<nav>` | — |
| `open` · `defaultOpen` · `onOpenChange` | the drawer's open state, controlled or not | closed |
| `collapseBelow` | `sm` · `md` · `lg` · `xl` · `never` | `md` |
| `offset` | height of the bar above (a CSS length) | none (0) |
| `width` | Dimension | `lg` |
