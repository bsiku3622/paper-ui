# Paint

The Paint Primitive is the way to put colour on a Box. Colour comes from two places, and every colour rule lives in this layer. Surface owns the surface (fill), border, corners, elevation and theme, and Paint owns accent × variant and the hover colour. So Box · Stack · Inline · Grid have no colour, and Press · Select · Float do not paint either. Both render a Box, so `as`, padding, size and clipping are the same as Box's.

| Component | Public axes | Default |
| --- | --- | --- |
| Surface | the whole of Box + `fill` canvas / raised / sunken · `border` · `radius` · `shadow` · `elevation` · `theme` · `hoverable` · `selected` | div. Surface, border, corners and elevation are all opt-in; with a theme, the canvas of that mode is laid even without a fill |
| Paint | the whole of Box + `accent` · `variant` · `fill` · `shadow` · `hoverable` · `selected` | div. Without an accent, nothing is painted |

Atoms reach this layer through two class functions only. `surfaceClass({ fill, border, radius, elevation, shadow, hoverable })` returns the class of a Surface without the theme, and `paintClass({ accent, variant, fill, shadow, hoverable })` returns the class of Paint. The theme needs context, so it cannot be made from a class alone. An element that needs only elevation skips Surface and takes the tier's class directly from the public class map `elevation` (`@studio-baeks/paper-ui`). The `elevation` prop of Surface uses the same map.

## Surface — the plane

Surface is the paper a Box sits on. It says which surface it is on (fill), whether it has a boundary (border), how round the corners are (radius), how far it floats (elevation) and which mode it is in (theme).

| prop | Values | Source |
| --- | --- | --- |
| `fill` | canvas · raised · sunken (`SURFACE_FILLS`) | Color `bg.*`. In dark, sunken = canvas, so on a canvas it goes with a border. It also sets the default of inner inputs and marks that do not choose a surface ([Atoms](../atoms/README.md)) |
| `border` | boolean · top · bottom · start · end (`LINE_SIDES`) | Color `border.base`, Shape `stroke.border` |
| `radius` | sm · md · lg · full (`SURFACE_RADII`) | Shape `radius.surface.*` · `radius.full` |
| `shadow` | boolean | Layout resting depth, a shadow in place. Accepted only with a `fill`, and in a tier that has its own shadow, that shadow wins. sticky has no shadow, so it takes this one as it is |
| `elevation` | lifted · sticky · overlay · modal · toast (`ELEVATIONS`) | Layout `elevation` class, with position, z and shadow together |
| `top` | none · xs ~ 3xl | Layout `gap.*`, the place where a sticky surface stops. Not read in other tiers |
| `theme` | light · dark · inverse (`SURFACE_THEMES`) | Color mode: only this surface and its inside take that mode. `inverse` is the opposite of the surrounding mode |
| `hoverable` | boolean | Color `interaction`: the surface becomes an item, and hover, press and selection show as a neutral tint |
| `selected` | boolean | Sets only `data-selected`; the colour is applied by CSS that reads that attribute |

`border` draws a line around the whole surface when on, and only on one side when given a side name. The line under a top bar or beside a sidebar is that case. The colour is `border.base` either way.

The `fill`, `border`, `radius` and `elevation` of Surface each become one class from one map, and an axis that is not given gets no class. `surfaceClass` returns the same classes except the theme. When `as` chooses a primitive such as Stack · Inline · Grid, that one element becomes the surface, so `<Surface as={Stack} gap="md" fill="raised">` is also a single DOM element and keeps the class and props of Stack. Giving surface props to Box · Stack · Inline · Grid is blocked by the type.

`shadow` is a shadow in place. It is used when the first surface on the ground raises its edge instead of a line, and is not given to a surface inside a surface. The shadow of a box without a surface looks like a hollow ring, so without a `fill` the type blocks it and it is not drawn. The sticky tier has no shadow of its own, so a sticky surface also raises its edge with `shadow`.

The `top` of `elevation="sticky"` is the place where the surface stops. `none` is the very top of the window and the others are Layout `gap` steps. It leaves the same distance below as it has above so it stands inside the window, so `max-height` is also set, and longer content scrolls inside the surface with `overflowY="auto"`. A surface that stands as tall as the window also takes `height="viewport"`. The position of other tiers is decided by the flow or by Floating, so they do not read `top`. A position that cannot be named by a step, such as under a fixed header, is decided by the app's className.

A Surface given `theme` puts that mode's own roles on its element and makes its inside read as that mode. `light` and `dark` are that mode regardless of the surroundings, and `inverse` is the opposite of the surrounding mode, so putting another `inverse` inside flips it back. Even without a `fill` it lays the `canvas` of that mode, so the plate is always there, and the text, Icon and Pressable inside, and the content of layers opened by Floating, take the ink of that mode. The focus ring and shadow of the Surface itself are drawn in the mode of the outer ground it stands on. The same holds on Stack · Inline · Grid, as in `as={Stack}`, and the theme of the whole app is decided by [Theming](../get-started/theming.md). The only ways to write a theme attribute below `<html>` are the Surface in `theme/scope.ts` and [Portal](a11y.md#portal).

Padding and curvature are natural when paired by name. A card is `padding="md" radius="md"` and a panel is `padding="lg" radius="lg"`. `elevation` changes not only the shadow but also position and stacking order (`lifted` is relative, `sticky` is sticky), so give it only to a surface that really floats over something. A surface that must stay attached to the ground, like `sticky` without a shadow, is chosen with the same prop, and a surface attached to the ground omits the prop.

A `hoverable` Surface is an item. When the pointer is over it, the `interaction.bgHover.onSurface` tint lies over the surface; when pressed (`:active` or `data-active`), the `interaction.active` tint; when selected (`data-selected` or `aria-current`), the `interaction.selected` tint. Pressing beats selection, and selection beats hover. Hover appears only inside `@media (hover: hover)` and only where the target is not blocked (disabled · `aria-disabled` · `data-disabled`); a blocked item does not react to the pointer or to pressing, and keeps its selection tint. The `selected` prop only sets `data-selected` and does not change the class, so the selected look is put on by the surface that became an item through `hoverable`, reading the attribute. Text on the selection tint is `ink.primary`.

```tsx
<Surface as="section" fill="raised" border radius="lg" padding="lg">…</Surface>
<Surface as="li" hoverable selected={current === id} padding="sm">…</Surface>
<Surface as={Stack} theme="inverse" radius="md" padding="lg" gap="md">…</Surface>
```

## Paint — accent × variant

Paint puts the colour of an accent (meaning) and variant (visual weight) combination on a Box. The combinations come from one map, and Button and Badge use the same map through `paintClass`. Not filling large surfaces with colour is part of the identity, so use it only where there is meaning.

`accent` is primary (neutral) and info · success · warning · error, and `variant` is solid · soft · hairline · dashed · ghost · muted. Omitting the variant gives solid, and without an accent nothing is painted. `paintClass` is the only way an Atom reaches the accent classes, and it attaches the hover gate only when `hoverable`.

`solid` and `soft` paint their own surface and do not take `fill`. The other four decide only the line and the text; the surface is chosen by `fill` with the same classes as Surface, and without it whatever lies underneath shows through.

A box with an accent has the same frame regardless of the variant. The line of a variant without a line is transparent, so the box does not move when the variant changes. The frame comes from [Line](../foundations/README.md#line).

`shadow` is the same shadow in place as Surface and is accepted only when there is a surface. `solid` and `soft` always accept it, the other four only with a `fill`, and other combinations are blocked by the type and not drawn. The line is decided by the variant regardless of the shadow. To raise an edge with a shadow instead of a line, give `ghost` a `fill` and a `shadow`.

The hover colour is drawn by CSS. A `hoverable` Paint lays one layer of tint (`--pui-state-tint`) over the surface and moves that tint only inside `@media (hover: hover)` and only on targets that are not disabled · `aria-disabled` · `data-disabled` (hairline and dashed raise the boundary instead). Touch has no hover, so the `:hover` a tap leaves does not show colour either, and a blocked target shows nothing even when the pointer is over it. No component exports a hover attribute. Display-only components (Badge) are not given `hoverable`, so no colour appears.

`selected` only sets `data-selected`. A selected surface is dressed by CSS that reads that attribute (or `aria-current`), and only `hairline` · `ghost` · `muted` take the `soft` surface of that accent. `solid` and `soft` already have a surface, so their look stays as it is. A selected `hairline` has its boundary turn transparent, and hover on a selected surface adds only the tint without raising the boundary.

```tsx
<Paint accent="info" variant="soft" hoverable padding="md">…</Paint>
<Paint accent="info" variant="ghost" fill="raised" shadow padding="md">…</Paint>
```
