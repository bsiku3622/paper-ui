# Layout

Layout is the system that decides the relationships between elements. The gap between siblings (gap), the space between the page edge and content (gutter), the maximum width of the body (container), the viewport breakpoints (breakpoint) and depth (elevation) belong here. The radius, stroke, size and inner padding that are visible on a single element alone are handled by [Shape](shape.md).

Layout stands on Shape. Distances are chosen from Shape's length scale, so a gap and an inset of the same step are the same length. For shadows, only the shape lives here, and joining it to a color is done by the second-order Elevation.

## Source → role

Layout's numbers are only in `LAYOUT_SOURCE` in `tokens/layout.ts`. Container and the z · nudge of each tier are emitted once as `--pui-layout-*` variables. The geometry of shadows differs per mode, so it is baked as per-mode source variables (`--pui-layout-shadow-<depth>-<i>`), and the shadow itself is not baked into a variable but assembled on the element that uses it ([Theme scope](color.md)).

| Role | Value | Notes |
| --- | --- | --- |
| `layout.gap.xs ~ 3xl` | 4 · 8 · 12 · 16 · 24 · 32 · 48 | The same scale as Shape inset |
| `layout.gutter` | 16 | Between the page edge and content, the inside of a modal scrim, and the margin a popover leaves when it touches the viewport |
| `layout.container.content` | 72rem (1152) | The maximum width of the site's body grid. In Box it is chosen as `maxWidth="container.content"` |
| `layout.breakpoint.sm / md / lg / xl` | 30 · 48 · 64 · 80em (480 · 768 · 1024 · 1280px) | Kept as values because a media query cannot read variables |
| `layout.viewport` | 100dvh | The height of the window. It is the current height without the bars of a phone browser, and Box's `height="viewport"` reads it |
| `layout.section.start / end` | clamp(3xl, 8vh, 2 × 3xl) · clamp(2xl, 5vh, 3xl) | The distance above and below a page section. A fluid step that grows with the viewport height |
| `elevation.<tier>` (class) | the table below | A class that attaches position · z · shadow of one tier at once. It is not a role of `tokens.layout` |

`gap` of Stack · Inline · Grid and `rowGap` · `columnGap` of Inline · Grid accept the gap steps. A Box, which does not lay out children, has no gap. In an app stylesheet, use `tokens.layout.gap` for `gap` · `margin` · position offsets like `top`/`left`. Layout values that need a pixel number at run time (Floating's `offset` · `crossOffset`, Draggable's `keyboardStep`) also take the same gap step names rather than numbers, and are measured where they are used and turned into pixels. So if a subtree overrides the scale, those values follow.

Breakpoints are written in em. The unit policy is rem for lengths, em for media queries, and px for strokes and focus rings, so when a user enlarges the browser's default font size, lengths like container · gutter and the breakpoints move at the same ratio. The em in a media query is based on the browser's default font size, not the document's `html` font size, and at the default size (16px) it is dp divided by 16, so `30em` is the same place as 480px. In a browser whose default size is 20px, `48em` is 48 × 20px and so becomes a place wider than `md` (based on 768px), and even a wider window reads as a screen narrower than `md`.

Section is the declared fluid exception to the fixed gap ladder. `start` is `clamp(3xl, 8vh, 2 × 3xl)` and `end` is `clamp(2xl, 5vh, 3xl)`, so when the viewport is short they stay at 3xl · 2xl, and as it grows they grow up to the upper limit. It is an expression that uses the Space source variables without baking a new variable, so if a subtree overrides the Space source, section is recomputed too. The fluid steps are only Typography's `hero` and this section.

## In an app

An app chooses the space between siblings and page edges with `tokens.layout.gap` · `gutter` · `container`, and the space above and below a block with `section`. Media queries are also written only with the breakpoint roles — insert the value like `` `(max-width: ${tokens.layout.breakpoint.md})` `` and do not write the length by hand; `paper/source-numbers` blocks this in the keys of `@media` and `@container`. `/demo`, where a screen folds at its own width, is an exception: the dimensions and breakpoints of that screen are gathered in one module, `pages/demo/layout.ts`, and declared in the manifest. Position · z · shadow are chosen only by elevation below.

## Elevation — position, stacking and shadow are one unit

Choosing one tier decides position, z and shadow together. z works only on an element that has a position, so the tier decides the position too, and only floating tiers have a shadow. This unit is applied by the same recipe in the `elevation` class, Surface's `elevation` prop, Floating and the Switch knob, and no path to take only a part of it is public.

| tier | position | z | Shadow depth | Used for |
| --- | --- | --- | --- | --- |
| `lifted` | relative | 10 | lifted | Small, slightly raised things like a Switch knob |
| `sticky` | sticky | 20 | none | Sticky headers · sidebars — separate them with a border line or an in-place shadow (`shadow`) |
| `overlay` | relative | 30 | floating | Popovers · menus |
| `modal` | relative | 40 | floating | Dialogs, with `color.overlay.scrim` beneath |
| `toast` | relative | 50 | floating | The topmost notification |

The list of tiers is `ELEVATIONS` (`/tokens`), and both Surface's `elevation` prop and the keys of the `elevation` class map walk this list. A surface attached to the ground is not a tier. An element given no elevation is the ground.

Tiers are spaced by 10 and one step (nudge) within a tier is 1, so one tier holds 9 nudges (`ELEVATION_NEST_LIMIT`). A panel opened on a panel of the same tier rises by one nudge, and past 9 it stays there, so no matter how deep the nesting, it never reaches the next tier — even the deepest modal (49) is below toast (50). A panel opened above a higher tier follows that tier. A popover opened on a dialog rises one nudge on the modal tier and stands above the dialog's scrim, and a dialog opened on a popover stands at the start of the modal tier and covers the popover with its scrim.

The computed z-index follows the tier order exactly. Surfaces of all tiers get strictly larger in the order `lifted` < `sticky` < `overlay` < `modal` < `toast`; a popover's panel stands in overlay, a modal's scrim in modal and a toast in the toast tier, and even the place where nudges are stacked `ELEVATION_NEST_LIMIT` times within one tier is below the next tier.

Samples and mockups drawn in the flow are placed in a stage that has `isolation: isolate`. The stage confines the stacking context, so a sample's z does not rise above a sticky header or tool. Elements of the same tier stack in DOM order, so a sticky rail that follows below a page header is placed inside a frame that has `isolation: isolate`, so that the header is not hidden by the rail.

There are four shadow depths: resting · lifted · floating · inset. The shadows of things placed on the page (resting · lifted · inset) fall straight down with no offset. Like paper lying flat under light from above, the four edges are equal, and a groove inside a raised surface is pressed in evenly. Only floating falls off to one side below, so only the floating layers read as being above the page. Only inset is a depth drawn inside the element, used where the track of a Switch and SegmentControl goes inward (light alpha10 · dark alpha45, `inset 0 0 2px`). The geometry is held by Layout per mode (dark does not spread wider than light, and floating uses a negative spread), and the shadow color is painted by Color's `shadow.resting` · `shadow.lifted` · `shadow.floating` · `shadow.inset`. A shadow is a value joined, on the element that uses it, from the per-layer geometry variables of its shadow depth and the shadow color variable for each tier, so whichever of geometry or color a theme scope changes, the shadows beneath it follow. The shadow that a scope element casts itself is drawn in the mode of the outer ground.

Surface chooses a tier with the `elevation` prop. Position, z and shadow are attached together. An element that is not a Surface receives the same class directly.

resting and inset are not tiers. They are the shadows with which a surface in place raises its edge instead of a line (in light, the same geometry as lifted), received through the `shadow` prop (Surface · Paint and the Atoms on top of them), and they attach neither position nor z, so they cover nothing. Only elements that have a surface receive them, and if a Surface also has `elevation`, the tier's shadow wins. A dark background is already nearly black, so there is no place for a shadow to fall; dark's resting is therefore a 1px line of 10% white. The size does not change.

```tsx
<Surface fill="raised" border radius="md" padding="md" elevation="overlay">…</Surface>
<div className={elevation.toast}>…</div>
```
