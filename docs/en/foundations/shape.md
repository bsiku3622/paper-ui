# Shape

Shape is the system that decides the form of a single element. Everything you can see by putting one button on an empty canvas — radius, stroke thickness, focus ring, size, inner padding — belongs to Shape. Values that exist only once there is a second element or a screen, such as the gap between siblings, the page frame and the stacking order, belong to [Layout](layout.md).

Shape is a [first-order system](README.md#first-order-and-second-order) that does not read other systems. Layout stands on Shape's length scale, and Shape does not read Layout. Values that need a text line, such as the inner padding of a control, are made by the second-order [Control](README.md#control), and assembling a single line is done by the second-order [Line](README.md#line).

## Source → role → recipe

Shape's numbers are written in dp only in one place, `SHAPE_SOURCE` in `tokens/shape.ts` (at the default root of 16px, 1dp = 1px). Below that, everything flows in one direction.

```text
SHAPE_SOURCE    source numbers (dp)
     ↓
SHAPE_VALUES    the source turned into CSS values → emitted once as --pui-shape-* variables
     ↓
SHAPE           public roles: an alias of a source variable, or a calc() expression over the source
     ↓
SHAPE_RECIPES   component anatomy: expressions combining roles and the source anatomy (private)
     ↓
*.css.ts        applied as className
```

### Overriding the source

A role has no variable of its own. An alias is the source variable itself, and an expression is computed on the element that uses it. So if you override one source variable in some subtree, every role and recipe built on it is recomputed in place. The example below changes only the control height in one region.

```ts
import { style } from "@vanilla-extract/css";
import { sourceVars } from "@studio-baeks/paper-ui/tokens";

export const dense = style({ vars: sourceVars({ shape: { control: { height: { md: "36px" } } } }) });
```

With this single line, the md button height in that region becomes 36 and the input inset becomes 10. The button inset is a source written by hand per size (`control.buttonInset`), so it does not follow the height and stays at 17 — to change it along with the height, override that source too. The Checkbox and Switch follow their own ladder (`selection.size`), so they stay as they are. If a role variable had been baked separately, it would already have been computed at `:root` and could not follow this redefinition.

`sourceVars()` turns a path in the source tree into the name of the variable where that value is emitted. Paths start from one of three roots, `shape` · `layout` · `typography`, following the source as it is; the path of a role (`shape.inset`) is blocked by the type, and an unknown path throws at run time. The names it returns are always a subset of the source variables that are baked independent of the mode (`SOURCE_VARIABLES`), so the same value is carried over by a Floating's panel. The result goes straight into vanilla-extract's `vars` and React's `style`. You can also write the variable directly in plain CSS (`.dense { --pui-shape-control-height-md: 36px }`). This form is checked neither by the type nor by `sourceVars()` — the names appear in the source table of the Playground's [Shape](/playground/foundations/shape). Apps and fixtures do not write `--pui-` names as strings but call this function (`paper/source-isolation`).

A typo or a role name in plain CSS does nothing and passes silently, so during development `PaperProvider` reads the document's stylesheets once when it first mounts and reports, as a single `[paper-ui] ` warning, any `--pui-shape-*` · `--pui-layout-*` · `--pui-typography-*` declaration whose name the package does not emit. It reads rules inside `@layer` · `@media`, nested rules, `@import`ed sheets and `adoptedStyleSheets`. There are things it cannot see. It does not read inline `style` or values that a script writes with `setProperty`, it skips sheets from other origins that the browser does not let it read, and it does not see sheets added after mount or sheets inside Shadow DOM. It does not run in a production build or on a page without a Provider.

The panel of a Floating opened in that region is moved under `<body>` but does not lose the overridden source. The Portal's root carries over only the source variables whose values differ between the opening place and the container (`SOURCE_VARIABLES`: Shape, Layout that does not depend on the mode, and Typography), so controls inside a popover or dialog opened within the region also become 40, and a dialog's scrim margin follows the region's gutter. A panel that is open from the start also follows the place where its Trigger stands, and one opened outside the region keeps the defaults. Color roles are not carried over, and the mode is carried by the theme attribute.

Inside the package, numbers are written only in the source files (`shape.ts` · `layout.ts` · `typography.ts` · `motion.ts` and the color source). Recipes and stylesheets contain no numbers except structural values (0 · 100% · 1fr · half `/ 2` · 45° rotation …), and the eslint rule `paper/source-numbers` blocks this across the whole package outside the token layer.

## Length scale — inset

Inner padding is chosen from `tokens.shape.inset`. It is the same scale as Layout's `gap`, so the same step is the same length. It climbs to xl on a 4dp grid, and page-scale distances continue on an 8dp flow.

| Step | xs | sm | md | lg | xl | 2xl | 3xl |
|---|---|---|---|---|---|---|---|
| dp | 4 | 8 | 12 | 16 | 24 | 32 | 48 |

`padding` · `paddingX` · `paddingY` of Box accept these steps. In an app stylesheet, use `tokens.shape.inset` for `padding`-type properties.

## Radius

The corners of a control follow its size, because the same curve reads as much rounder on a small box. A surface is chosen by Surface's `radius`, and the ring beside a text line, the pill and the circle use a single value regardless of size.

| Role | Value | Used for |
| --- | --- | --- |
| `radius.control.xs / sm / md / lg / xl` | 8 / 12 / 12 / 12 / 12 | Button · IconButton · Field · Select · Textarea, Badge with `shape="rounded"` |
| `radius.selection` | 4 | Checkbox |
| `radius.surface.sm / md / lg` | 12 / 16 / 20 | The `radius` prop of Surface |
| `radius.text` | 4 | Things that stand beside a text line — the Link's ring |
| `radius.pill` | 999px | Pill — the default of Badge, `shape="pill"` |
| `radius.full` | 999px | Circle (Radio · Switch · Spinner), `radius="full"` of Surface |

Button · IconButton · Field · Select · Textarea and a Badge with `shape="rounded"` read the `radius.control` of their own size. The source exists per size, so it can be overridden per size with `PaperProvider` and `sourceVars`.

`radius.pill` is the shape of a pill and `radius.full` is the geometry of a circle. If you lower `radius.pill`, only Badge and `shape="pill"` follow, and Radio · Switch · Spinner stay circles.

A Field and Select with `shape="pill"` place their value at the button inset (`control.inset.button`). The rounded ends of a pill take up room beside the value, so the input frame leaves the same wide room that a pill Button leaves around its label. The Select's arrow also stands on that inset, and the value stops before the arrow by `control.gap`. A rounded frame uses the input inset (`control.inset.input`) as it is.

`radius="sm"` of Surface picks the surface side. Even where it has the same value as `radius.control.sm`, the role and the variable are separate.

The corner of something placed inside a rounded box at a constant distance is chosen with `nestedRadius(outer radius, distance)`. It is the outer radius minus the distance, so the two curves run parallel, and if the distance is larger than the radius the corner is square.

## Stroke · Focus

Strokes and focus rings are kept as CSS px so that they do not grow with the root font size. `stroke.border` 1px is for borders and Divider, `stroke.emphasis` 2px is for the check mark, the Spinner ring, the outline around a Switch knob and the outline of a Slider thumb, and `stroke.icon` 1.75 is an SVG line on a 24 artboard. The focus ring is `focus.width` 2px · `focus.offset` 2px, and every focus ring in the package shares one style (`focusRing`). The ring's thickness and offset are owned by Shape, and its color by Color (`interaction.focus`). The 1px line drawn inside is made in one place by `strokeRing(color)` as `inset 0 0 0 stroke.border`, which draws a line inside the box without changing the element's size.

The ring follows the element's own radius. The global baseline (`:where(:focus-visible)`) draws only the ring and does not change the shape of the element, so the keyboard ring of an element with no radius of its own (a heading, a sidebar link) is drawn square. The radius is decided by the element that draws the ring — Button · Field · Select · Textarea have the `radius.control` of their own size, and Link has `radius.text`. A Field and Select are frames whose wrapper draws the ring, so they use the wrapper's radius, a Textarea follows its own radius, and the native control inside has neither a radius nor an outline.

## Control

The control source is the height ladder (`control.height`: xs 32 · sm 36 · md 40 · lg 44 · xl 48), the button inset ladder (`control.buttonInset`: xs 11 · sm 14 · md 17 · lg 20 · xl 23) and the mark ladder (`selection.size`: xs 16 · sm 18 · md 18 · lg 20 · xl 20), and `anatomy` is the Badge height and inset (`anatomy.badge`), the correction ratio of the check (`anatomy.checkbox.markShift`: x 0.25 · y -0.5, multiples of `stroke.emphasis`) and the inline dot · spinner sizes (`anatomy.inline`: 0.5em · 1em). The rest is computed from the height and the control text line (the one text line that Typography's control preset reads, leading 16). The line box `inputLeading` 20, where an input value sits, is not an input to this formula but a value for the caret height, and it sits centered inside the text line.

| Role | xs | sm | md | lg | xl | Formula |
| --- | --- | --- | --- | --- | --- | --- |
| `control.height` | 32 | 36 | 40 | 44 | 48 | source |
| `control.inset.input` | 8 | 10 | 12 | 14 | 16 | (height − preset text line) / 2 — an input value gets equal room on all four sides of the text line |
| `control.inset.button` | 11 | 14 | 17 | 20 | 23 | source (`control.buttonInset`) — written by hand per size. The label defines the box, so it is wider than an input value |
| `selection.size` | 16 | 18 | 18 | 20 | 20 | source — the box of Checkbox and Radio. It moves independently of the control height |
| `control.icon` | 16 | 16 | 18 | 20 | 20 | Icon size that follows the height (caption · caption · body · subheading · subheading) |
| `control.gap` | 8 | 8 | 8 | 8 | 8 | Between icon and label, inset sm |

An icon inside a control grows with the control height, not with the text beside it (`control.icon`), because control text is a control preset and is not the same as any Text role. A Button · Field · Select of the same size pick the same height, and their text is chosen separately from Typography's control presets. Every sized Atom decides its size through the single [Control](../primitives/control.md). A stylesheet does not make its own size ladder. The check · dot · track · knob · press area that come out of a selection box are one set of `markParts` expressions, and the values in the table are that expression solved for each size. `control.icon` is the default size of an icon inside a control. An Icon inside a control reads the size that control decided through a CSS variable, and an explicit `size` wins.

The inset is measured from the outer edge of the control, the same place a design file measures. A control that draws no line leaves no room for one, so the surface and the shadow drawn inside it reach the edge. Only in a variant that draws a line, in a state such as error, in higher contrast, and in forced colors (where the OS draws the edge of every control) does it take back the 1px of room, and the inset shrinks by that much so that the text inside stays in place. Whether a line exists is decided by the paint, which knows the variant and the state (`CONTROL_LINE_ROOM`), and the thickness and inset of the frame read that value (`CONTROL_LINE` · `insideLine`). The room is registered as an inherited length, so the native select inside a Select reads the room of its own frame, every control that has a line decides its own room itself, and other elements have no room. An ordinary box painted with Paint is outside this rule, so its frame stays the same when the variant changes.

## Sizing

| Role | Step | dp |
| --- | --- | --- |
| `icon.size` | label · caption · body · subheading | 14 · 16 · 18 · 20 |
| `dimension.width` | xs ~ xl | 72 · 108 · 160 · 240 · 360 |
| `dimension.height` | xs ~ xl | 64 · 96 · 144 · 216 · 320 |
| `measure` | xs ~ xl | 448 · 512 · 608 · 672 · 736 (28 ~ 46rem) |

The names of icon artboards are a subset of Text role names, tied together by the type, and mean the size to place beside text of that role. An icon inside a control follows `control.icon`, not these names. `dimension` is a named size like `width="md"` of Box, and `measure` is the reading width of a block of text, so in Box it is chosen as `maxWidth="measure.md"`. Every named size becomes a class.

## Target

The minimum size you can press is `target.min`, 24px (CSS px). For a mark whose visual size is smaller, an invisible hit area is widened by `targetReach`. `targetReach(visual)` is `(min(visual, target.min) − target.min) / 2`, so it is half of how far the mark falls short of 24px, and 0 if it is already 24px or more. The value is the distance the hit area extends beyond the mark, written as a negative inset.

| Target | Formula | xs | sm | md | lg | xl |
|---|---|---|---|---|---|---|
| `target.selection` | targetReach(`selection.size`) | −4 | −3 | −3 | −2 | −2 |
| `target.switchBlock` | targetReach(Switch track height) | −3 | −2 | −2 | −1 | −1 |
| `target.action` | targetReach(`control.icon`) | −4 | −4 | −3 | −2 | −2 |

The Atoms with a hit area are Checkbox · Radio · Switch and the clear and show buttons of Field. An invisible `::before` extends beyond the mark and paints no color. The icon inside a Field's button is drawn at `control.icon` as it is, and `::before` widens on all sides by `target.action` to make a 24px square. Two buttons side by side have `control.gap` 8 between them, so they do not intrude on each other's hit area. Checkbox · Radio widen on all sides by `target.selection`, and Switch widens above and below the track by `target.switchBlock`, with the horizontal unchanged since the track width is already 24px or more. `::before` is placed from the padding box, so on a box that has room for a line (error · higher contrast · forced colors) it starts that one line farther out, and on a resting mark with no line room it starts at the edge of the box.

We do not grow targets further on a coarse pointer — in a dense list, overlapping hit areas send a tap to the wrong place, and hit areas per row are decided by the app.

## Recipe — component anatomy

`SHAPE_RECIPES` uses only structural values (half `/ 2`, 45° rotation), and optical correction ratios are kept in the source anatomy. Every value is a role, an anatomy value of the source, or an expression over those two. A unit test checks the numbers left in a recipe string after removing the var() names against `STRUCTURAL`.

| Target | Rule |
|---|---|
| Checkbox | Corner is `radius.selection`. The check is an L shape, half the box's width and a quarter of its height, rotated diagonally; rotating it pulls the visual weight toward the lower left, so it is moved by a multiple of its own stroke (`stroke.emphasis`). That multiple is the source `anatomy.checkbox.markShift` (x ¼ · y −½). The indeterminate dash is a round-ended emphasis line drawn at the length of the check's long side. |
| Radio | The dot is a proportion of the box set by the source `anatomy.radio.dot`. A white dot on a dark surface reads as large, so it is set smaller than half. |
| Switch | Track height = selection box + outline, track width = height × the source `anatomy.switch.length` (1.5), so it is short and plump. The knob is a circle whose diameter is the selection box − the outline. The outline is `stroke.emphasis`, so the knob sits 2px in on all sides and travels the track minus the knob and the outline on both sides. The knob is placed with `inset-inline-start` and travel is added to that value when on, a logical property, so it flips by itself in RTL. The inner outline (`stroke.border`) for error is drawn inside the box and does not grow its size. |
| Textarea | One line is exactly the same height as a Field of the same size: block padding = (control height − textarea text line) / 2 − border. There is no minimum height and `rows` (default 4) decides the height — four lines are xs 88 · sm 92 · md 96 · lg 100 · xl 104. |
| Select | The arrow is a trailing icon. An Icon of size `control.icon` (the recipe has no separate value) sits at the input inset, and the value stops short of it by `control.gap` — a structure that mirrors the leading icon of Field. |
| Spinner | The diameter is `control.icon`, the ring thickness is `stroke.emphasis`, and a mask hollows out the center. The tail starts at a gap left by the source `anatomy.spinner.tail`. A spinner placed in a line of text (`spinner.inline`) follows the label text (1em), and the loading mark of a Button is that size. |
| SegmentControl | The track follows the control height and radius, a segment sits inset inward by `inset.xs` with a corner of `nestedRadius`. The segment's inner padding is `inset.lg` when the text decides the width, and `inset.md` when the width is divided. |
| Slider | The bar height is the same as the Switch track. The thumb is a circle whose diameter is the bar height, surrounded by a `stroke.emphasis` outline. If the bar falls short of the minimum target, it is widened by empty room above and below. |
| Marker | The height of the band, its place in the line box and how far it extends beyond the text do not come out of a rule, so they are kept in the source `anatomy.marker`. |
| Badge | Height and inset do not come out of a rule, so they are kept in the source `anatomy.badge`. The dot is 0.5em of the text from `anatomy.inline`, and the space between dot and text is inset xs. |

The knob of a Switch sits an outline's width from the end of the track when off, and an outline's width from the opposite end when on, and the value is decided by the logical property. In a document written right to left, the two ends swap — an on knob sits an outline's width from the left end of the track. This is the result of the same declaration reading a different direction, with no separate rule, and the test reads the distance of the knob from both ends of the track.

The link underline offset is a decoration of the text, so it is owned by Typography's Palette (`decoration.underlineOffset`) and goes out to apps as `linkStyle`.

## In an app

An app chooses spacing, shape and depth by roles. Inner padding is `tokens.shape.inset`, space between siblings, margins and position offsets are `tokens.layout.gap`, strokes are `tokens.shape.stroke`, and position · z · shadow are Layout's `elevation` classes. Dimensions that exist only on that screen, such as a sidebar width or a grid track, the app writes itself, and media query lengths are written with `tokens.layout.breakpoint`. The app scope of eslint `paper/source-numbers` (every category except content dimensions) guards this boundary.
