# Color

Color is the system that decides surfaces, inks, borders, semantic colors and state tints. The base is only white and black, and color (blue · green · amber · red) is added in small amounts only where it carries meaning: state, focus and links. It is a [first-order system](README.md#first-order-and-second-order), so it does not read other systems.

Color flows in one direction only.

```text
palette.ts (OKLCH source + assembly) ──calls──> color-ladder.ts (pure color math)
       │
       └── finished OKLCH coordinates + HEX Palette Tokens
                         ↓
        colors.ts (COLOR_SELECTION: per-theme role → Palette path) → CSS variables → screen
```

## Palette — source

`tokens/palette.ts` is the only source of color. It holds the OKLCH anchor points of one neutral ramp and four accent ramps (blue · green · amber · red), and the fixed opacity steps `alpha05` to `alpha95`. Between anchor points it interpolates in OKLCH, and only colors that fall outside sRGB are brought in by reducing chroma. This calculation belongs to the pure functions in `color-ladder.ts`, and `color-ladder.ts` does not import palette data, so the dependency stays in one direction.

The Palette does not depend on the theme. When the theme changes the ramps stay the same, and the light and dark semantic roles merely pick different steps from the same ramp.

| ramp | steps | notes |
|---|---|---|
| neutral | 0 · 50 · 100 · 150 · 200 · 300 · 400 · 500 · 600 · 650 · 700 · 800 · 875 · 900 · 925 · 950 | A cool neutral at hue 286° with low chroma. 0 is the lightest and 950 the darkest |
| blue · green · amber · red | 50 ~ 950 (14 steps) | The same number is the same OKLCH lightness in all four hues |
| alpha | 05 ~ 95 | Translucent steps made by putting a fixed opacity on the neutral 0 and 950 endpoints |

In-between steps such as `150` · `650` · `875` · `925` are made by interpolating between the neighboring anchor points. Where between two anchors each one falls is written per step in `NEUTRAL_BETWEEN`. `925` exists for places that must float just above 950, like the raised surface in dark. Amber stays yellow (90°) at the light steps and turns orange (65°) from 400, and the chroma of 200 and 300 is raised gently so that saturation does not jump. This correction is not a branch in the assembly code but data: `paleHue` and `chromaRatio` in `ACCENT_IDENTITIES.amber`.

A Palette Token is an internal name. Components and apps do not import it; they choose only semantic roles. You can check the generated steps in the Playground's [Color](/playground/foundations/color). The Palette matrix shows the accent's step axis (50 … 950), and neutral 0 · 875 and the alpha steps appear in the role cards under their Palette Token names. Hover a chip to see its HEX. Verification of OKLCH and gamut belongs to the palette tests.

## Semantic roles

These are the color names that the screen uses. Every role picks exactly one Palette Token per theme, and never references another role or computes a color. That choice is in a single table, `COLOR_SELECTION` in `colors.ts` (per-theme role → Palette path), and `COLOR_VALUES` is derived from that table. So every leaf has the same value as a generated Palette Token, and each cell of the Playground's [Color](/playground/foundations/color) reads this table to show the Palette Token name.

| System | Path | Roles |
|---|---|---|
| Surface | `bg.<level>` | `canvas` · `raised` · `sunken` |
| Control | `control.<role>` | `track` |
| Ink | `ink.<level>` | `primary` · `secondary` · `tertiary` |
| Border | `border.<level>` | `base` · `strong` · `hover` |
| Accent | `accent.<name>.<tone>` | `primary` · `info` · `success` · `warning` · `error` × `solid` · `wash` · `ink` · `soft` · `subtle` |
| Interaction | `interaction.<state>` | `bgHover.onSurface` · `bgHover.onPrimarySolid` · `bgHover.onAccentSolid` · `selected` · `active` · `focus` · `link` |
| Overlay | `overlay.<role>` | `scrim` |
| Shadow | `shadow.<depth>` | `floating` · `lifted` |
| Opacity | `opacity.<role>` | `disabled` · `subdued` |
| Marker | `marker.<role>` | `fill` · `ink` |

The steps each role picks are as follows.

| Role | Light | Dark |
| --- | --- | --- |
| `bg.canvas` | neutral.100 | neutral.950 |
| `bg.raised` | neutral.0 | neutral.925 |
| `bg.sunken` | neutral.150 | neutral.950 |
| `control.track` | neutral.150 | neutral.875 |
| `control.knob` | neutral.0 | neutral.400 |
| `control.thumb` | neutral.0 | neutral.800 |
| `control.field` | neutral.0 | neutral.875 |
| `control.mark` | neutral.0 | neutral.875 |
| `control.chosen` | neutral.150 | neutral.800 |
| `ink.primary` · `secondary` · `tertiary` | neutral.925 · 700 · 500 | neutral.100 · 400 · 500 |
| `border.base` · `strong` · `hover` | neutral.200 · 300 · 400 | neutral.800 · 700 · 600 |
| `interaction.bgHover.onSurface` | alpha05.neutral.950 | alpha05.neutral.0 |
| `interaction.bgHover.onPrimarySolid` | alpha10.neutral.0 | alpha10.neutral.950 |
| `interaction.bgHover.onAccentSolid` | alpha15.neutral.950 | alpha15.neutral.950 |
| `interaction.selected` · `active` | alpha15.neutral.950 · alpha15.neutral.950 | alpha10.neutral.0 · alpha15.neutral.0 |
| `interaction.focus` | blue.600 | blue.400 |
| `interaction.link` | blue.700 | blue.300 |
| `overlay.scrim` | alpha30.neutral.950 | alpha60.neutral.950 |
| `shadow.floating` · `lifted` · `resting` | alpha10.neutral.950 · alpha10.neutral.950 · alpha10.neutral.950 | alpha60.neutral.950 · alpha45.neutral.950 · alpha15.neutral.0 |
| `shadow.inset` | alpha10.neutral.950 | alpha45.neutral.950 |
| `marker.fill` | marker | marker |
| `marker.ink` | neutral.950 | neutral.950 |

Surfaces recede from front to back in the order `raised` > `canvas` > `sunken`. Light has three distinct steps; dark has two — the page (`canvas`) is already the deepest step, so `sunken` uses the same neutral.950. That is why in dark a sunken surface on the canvas is told apart by a border, not by its fill color, while on raised it recedes in both modes. This order is declared in `SURFACE_ORDER`, and a unit test guards that lightness decreases from front to back in both modes and that every ink is at least 4.5:1 on every surface.

`control.track` is a surface set into a control, like the track of a Switch · SegmentControl · Slider and the groove of a progress bar. What stands on it is `control.knob` (the knob of an off Switch) and `control.thumb` (the segment of a SegmentControl). An outlined SegmentControl has no track and stands on the surface of the input frame, and its chosen segment is the `control.chosen` surface — in light the track's gray, in dark one step above, since the frame is already that gray. `control.field` is the surface of an input frame that has not chosen a fill, and `control.mark` is the surface of an off mark; both stand as a white surface with one gray line wherever they are placed. In dark, `bg.raised`, the counterpart of the white surface, is the same as the card surface, so they stand on neutral.875, one step lighter. The reason for keeping them outside `bg` is so that control details do not spread into ordinary page surfaces. The color of the focus ring belongs to `interaction.focus`, its thickness and offset to [Shape](shape.md), and the geometry of shadows to the elevation in [Layout](layout.md).

`marker` is the role of a single highlighter. `fill` is one pigment of the Palette (`marker`) and has no ramp, because it is a color that does not widen into surfaces or states. This pigment is as bright as paper, so the `ink` of text on it is the dark `neutral.950` in both modes, and the contrast is over 16:1.

The color of a shadow is named by depth, not by the name of a layer. `floating` is the shadow color of floating layers such as popovers, dialogs and notifications, and `lifted` is the shadow color of slightly raised layers. In light the two values are the same and only in dark do they differ (60 versus 45). In this system "overlay" refers only to floating layers (Floating · elevation `overlay` · `overlay.scrim`), and a state wash laid on a surface is called a tint.

`opacity` uses a single alpha step as its value, not a palette step. `disabled` is alpha 50 (0.5) and `subdued` is alpha 70 (0.7), the same in any theme. It sits outside the selection table, so it appears neither in the table above nor in the Playground Color.

The state roles of `interaction` have different meanings. `active` is the surface of a neutral item while it is being pressed, `selected` is the surface of a selected neutral item, and `focus` is the place the input is directed to — the keyboard focus ring and the border of a drop target. An item reads these surfaces from `itemProfile` in `tokens/color-recipes.ts` (hover from `bgHover.onSurface`, press from `active`, selected from `selected`), and press beats selected, and selected beats hover.

The color of a link is `interaction.link`. It currently picks blue.700 · blue.300, which in dark is the same step as `accent.info.ink`, but the roles mean different things. Info reports a state, and link marks that you can press to navigate, so changing the state color does not move links along. A link is at least 4.5:1 on every surface.

## Theme scope

A theme is the choice of one bundle (a **mode**) of the entire set of color roles and Layout's shadow geometry. There are two modes, light and dark, decided by the `data-pui-theme` attribute set on `<html>` or on an element.

If `<html>` has no attribute, the OS's `prefers-color-scheme` decides the mode. `:root` is light, and only when the OS is dark and there is no attribute does `:root:not([data-pui-theme])` override with the dark bundle. If the attribute is present, its value wins regardless of the OS. The stylesheet and the engine (`readRootMode`) use the same rule.

Inside a scope, three things change. The scope element itself gets that mode's own roles (surface · ink · border · accent …) and `color-scheme`. The inherited text color `ink.primary` is redeclared in every scope, so text inside a scope follows the scope's mode, not the outer mode (specificity is 0, so a color set by a class still wins). And the ground roles change to that mode starting from the scope's children.

Ground roles are values drawn outside the element, on the ground the element stands on — the focus ring color (`interaction.focus`), the shadow color (`shadow.*`) and the shadow geometry (`--pui-layout-shadow-<depth>-<i>`). So the shadow and the focus ring cast by a dark scope element are drawn in the outer ground's mode, and what its children inside cast is drawn in the scope's mode. A shadow is not baked into one variable; the geometry variables and the shadow color are joined on the element that uses it ([Layout](layout.md)), so it follows whichever of the two a scope changes. The rule for changing these roles in an app is in [Installation](../get-started/install.md#overriding-sources).

## Contrast mode

In `prefers-contrast: more`, only the four quiet roles go up one step. Borders become at least 3:1 on every surface and `ink.tertiary` at least 4.5:1, and the other roles stay as they are. The raised values are written per mode in `COLOR_CONTRAST_MORE`, and because they are baked after the default bundle with the same scope selector, their priority is the same as the default bundle's.

| Role | Light | Dark |
|---|---|---|
| `border.base` · `strong` · `hover` | neutral.600 · 650 · 700 | neutral.600 · 500 · 400 |
| `ink.tertiary` | neutral.700 | neutral.400 |

A selected surface is laid on lightly and color alone may not give enough of an edge, so in this mode a selected neutral item gains an extra 1px inner line in `ink.primary` (`strokeRing`). It is a non-color cue so that selection does not rely on a single color.

## Contrast contract

Text is 4.5:1. Only light `ink.tertiary` is an exception — it is text that can be passed over without harming use of the screen (placeholders, an empty Select, group names in lists, supplementary caption text), so it deliberately recedes, at 3.1:1 on white, 2.9:1 on canvas and 2.6:1 on sunken. In `prefers-contrast: more` it goes up to neutral.700 and clears 4.5:1 on all surfaces, and dark `ink.tertiary` is always at least 4.5:1. So tertiary is not used where, without that text, the user would not know what to do. Controls and the marks that report their state are 3:1 — the on track of a switch, the check surface and the mark on it, the focus ring, the error border. An off selection mark stands as one gray line (`border.base`) on a white surface, like an input. If the input were pale and only the mark dark, they would clash on one screen. For a Switch, the surface is the `control.track` track where the knob sits. An on Switch has a primary solid track and an `accent.primary.wash` knob, and on is communicated by the surface (at least 15:1).

A unit test (`tokens/color.test.ts`) guards, on every surface (raised · canvas · sunken) in both themes, that the on surface of a mark (`accent.primary.solid`), the focus ring and the error outline (`accent.error.ink`) are at least 3:1; that the off track differs from the on track by at least 3:1; and that the knob and check on an on track (both `accent.primary.wash`) are at least 3:1. Dark `accent.ink` is at least 4.5:1 on every dark surface, the same as in light, and `ink.primary` on places where the hover · selected · active tint is laid on a surface is also at least 4.5:1.

There are three stated exceptions. The first is the border of inputs and of off selection marks. Both stand on one `border.base` line and fall short of 3:1. The label, the placeholder and the focus ring supplement the existence of the input, and in `prefers-contrast: more` that line darkens and an off mark changes to a `border.strong` line. An off mark is supplemented by the label beside it and the focus ring. The second is a lightly laid selected surface (accent `soft`, `interaction.selected`, and the `control.chosen` of an outlined SegmentControl). `aria-pressed` · `aria-current` · `aria-checked` and `ink.primary` supplement the selection (the chosen segment also gets a leading check), and in `prefers-contrast: more` it gains an inner `ink.primary` outline. Text on selected · active surfaces uses `ink.primary` only. The third is the knob of an off Switch. The `control.knob` knob on `control.track` is 1.19:1 in light and 6.48:1 in dark, and light adds a shadow. Since the on track differs from the off track by at least 3:1, on and off are spoken by the track and supplemented by the position of the knob. A unit test confirms that the first two exceptions really are below 3:1, so that the list cannot become false.

## Forced colors

In modes where the OS decides the colors, such as Windows high contrast (`forced-colors: active`), most elements are left to the OS. Only places where the state relies on the background alone — selection marks, the Spinner, selected surfaces and the dot of a Badge — are taken out with `forced-color-adjust: none` and drawn directly with system colors. The system color names are listed only in `SYSTEM_COLORS` (`Canvas` · `CanvasText` · `ButtonFace` · `ButtonText` · `Highlight` · `HighlightText` · `GrayText` · `LinkText`), and the OS decides the values. Hover is a Highlight border, disabled is GrayText, and the focus ring is Highlight. A selection mark, when on, goes from a Canvas surface with a ButtonText outline to a Highlight surface with a HighlightText mark, and the Switch's outline draws ButtonText · Highlight with the same inner outline (`strokeRing`). A Divider is drawn with border, not background, so it remains in this mode too. How each mark looks in this mode is in [States](../atoms/states.md#contrast--forced-colors--prefers-contrast--target).

## Accent

`primary` and the four status colors share the same five tones. `primary` is neutral, and `info` · `success` · `warning` · `error` pick from the blue · green · amber · red ramps respectively. This system has no `primaryColor` — the primary action is black too.

| tone | Used for | Light | Dark |
| --- | --- | --- | --- |
| `solid` | Filled surface, status dot | 600 (primary 950) | 600 (primary 50) |
| `wash` | Text on solid | 50 (primary 0) | 50 (primary 950) |
| `ink` | Text on soft · hairline · ghost and semantic-color text (links use `interaction.link`) | 650 (primary 925) | 300 (primary 100) |
| `soft` | Pale surface of the soft variant | 100 (primary 150) | 925 (primary 875) |
| `subtle` | Text of the muted variant | 700 (primary 700) | 400 (primary 500) |

The step each tone picks is a [light, dark] pair in `ACCENT_TONE_STEPS` (status colors) and `PRIMARY_TONE_STEPS` (primary). A combination that departs from this table is written in `STATUS_EXCEPTIONS` by status name, and the code does not branch on a pigment name. The `ink` of light `error` is red.600, one step lighter than the table, because red is the only one whose 600 exceeds 4.5:1 even when a hover tint is laid on a soft surface.

Light `warning` is an intended exception. `STATUS_EXCEPTIONS.warning` changes the light `solid` to amber.400 and `wash` to white (neutral.0), so the contrast of white text on the surface falls short of 4.5:1 (on hover the tint darkens the surface and it rises a little, but still falls short); we judged a mid-bright orange fill to be visually right and kept it. This is the only combination left below 4.5:1 for this reason.

One more is not the resting look but hover. The `muted` text (`subtle`) of dark `error` is at least 4.5:1 on every ground, but when the `bgHover.onSurface` tint is laid on `raised`, it falls short of 4.5:1 by about 0.02. The tint is already the lightest alpha step and cannot be reduced, and lightening the text would change a Color role. Whether to accept this exception or to lighten dark `error.subtle` has not been decided, and it is recorded here while that decision waits. A unit test names this single place and fails if it gets worse or spreads to another combination. All the other combinations keep 4.5:1 both at rest and on hover.

The `ghost` text (`ink`) of light `success` is at least 4.5:1 on every ground at rest, but when the `bgHover.onSurface` tint is laid on `sunken`, the darkest ground, it is 4.40:1. This place arose when `sunken` came down to neutral.150. A unit test names this single place too.

There are two kinds of status dots. A standalone status dot uses the accent `solid`, and a dot attached beside text uses that text's ink.

Status colors are used only for status. A classification like a brand label or a team is not a status, so draw it with `primary`. A mark whose color fills a surface, such as a mark for a person or a workspace, is the `solid` surface of `accent.primary` with `wash` text (for a lighter one, a `soft` surface with `ink` text), and an inverted surface is not made by crossing, such as using `ink` as a background or `bg` as text. The groove of a progress bar is `control.track`, and the fill is the accent's `solid`.

## Accent × variant

An Atom does not choose a color directly but speaks of two axes, `accent` and `variant`. Which tone this combination uses is decided in one place, `VARIANT_RECIPE` in `tokens/color-recipes.ts`, and `accentProfile` and the Accent × variant table in the Playground's [Color](/playground/foundations/color) read the same table.

| variant | Surface | Text | hover | selected |
|---|---|---|---|---|
| `solid` | `solid` | `wash` | `bgHover.onPrimarySolid` (primary) or an `onAccentSolid` tint | none |
| `soft` | `soft` | `ink` | `bgHover.onSurface` tint | none |
| `hairline` | `fill` + `border.base` solid line | `ink` | `border.hover` | that accent's `soft` surface, border transparent |
| `dashed` | `fill` + `border.base` dashed line | `subtle` | `border.hover` | none |
| `ghost` | `fill` | `ink` | `bgHover.onSurface` tint | that accent's `soft` surface |
| `muted` | `fill` | `subtle` | `bgHover.onSurface` tint | that accent's `soft` surface, text in `ink` |

Only `solid` and `soft` paint their surface themselves. The other four (`FILLABLE_VARIANTS`) decide only the line and the text; the surface is chosen by `fill` from the same ladder as Surface (raised · canvas · sunken), and if it is not given, whatever the element sits on shows through. An input frame accepts only `hairline` and `ghost` (`INPUT_VARIANTS`), and the default is `hairline`. If `fill` is not given, it is the white `control.field` surface ([Atoms](../atoms/README.md)).

The variants that can show the selected state with a soft surface are `SELECTABLE_VARIANTS` (`hairline` · `ghost` · `muted`). These are the variants that have no surface or only a pale one and so need a separate selected look; `solid` and `soft` already have a surface, and `dashed` is a mark that says where something goes, so it has no selected state. Selection is reported by `data-selected` or `aria-current`, and `Paint`'s `selected` sets `data-selected`. Hover on a selected surface does not raise the border and only lays on the tint. The tint does not change the surface (`backgroundColor`) but moves a layer, `--pui-state-tint`, laid over the surface, so the transition is composited over the surface ([States and feedback](../atoms/states.md#tint-and-color-profiles)).

The text of each variant is at least 4.5:1 on its own surface (for a variant that picks its surface with `fill`, on all three grounds) in both themes, and the same holds with the hover tint laid on. The only exceptions are the two written in [Accent](#accent).

The `wash` text of `solid` is at least 4.5:1 on the `solid` surface. The only exception is the solid of light `warning`.

The `ink` text of `soft` is at least 4.5:1 on the `soft` surface.

The text of `hairline` is at least 4.5:1 on all three grounds. Hover is a border, not a tint, so the text contrast stays the same.

The `subtle` text of `dashed` is at least 4.5:1 on all three grounds. Hover is a border, as with `hairline`, so the text contrast stays the same.

The `ink` text of `ghost` is at least 4.5:1 on all three grounds, and the same holds with the hover tint laid on the ground.

The `subtle` text of `muted` is at least 4.5:1 on all three grounds, and the same holds with the hover tint laid on. The only exception is hover on raised for dark `error`.

The same holds for the 25 real Buttons (5 accents × 5 variants). The computed text color is at least 4.5:1 on the computed surface (the ground, if the surface is transparent), also after the hover tint is composited (the only exception is the light `warning` solid); the solid surface of an accent differs from its soft surface; and no Button casts a shadow.

A profile is returned by `accentProfile(accent, variant)` as `{ face, ink, border, hover, selected? }`. `hover` is exactly one of `{ tint }` and `{ border }`, so each variant has exactly one hover expression, and `selected` exists only for `SELECTABLE_VARIANTS`. The same file also decides, as data, the colors of an input box (`outlinedControlProfile`: surface · ink · border · hover border · border per status), a neutral item (`itemProfile`), and a selection mark (`markProfile`, and `markForcedProfile` for the mode where the OS decides colors).

`paintClass({ accent: "error", variant: "solid" })` picks the class held by `accentVariantClass.error.solid` in `styles/color.css.ts`. That map is built by walking the `ACCENTS × VARIANTS` arrays, so a combination can neither be missing nor drift, and a name outside the vocabulary is caught by the type. The class name is made by the build. No name is promised globally, so an app does not hold names as strings but chooses by component props. Surface and ink are a different axis from color and go separately through `fillClass` · `inkClass`. The `ink` of text and icons is `INKS`, that is, Color's `ink.*` names (`primary` · `secondary` · `tertiary`), the status names and `inherit`. Hover applies only to components given `hoverable`, so it does not spread to marks that cannot be pressed, like a Badge. The priority among states is in [States](../atoms/states.md).

## When you change a color

1. Edit the OKLCH anchor points or the alpha steps in `palette.ts`.
2. Check the accent steps in the Palette matrix of the Playground Color, and see neutral 0 · 875 and the alpha steps in the role cards. Hover a chip to see its HEX. OKLCH and gamut are guarded by the palette tests. The ramps must be the same even when you change the app theme.
3. If a role needs to use a different step, edit only that role's path in `COLOR_SELECTION` in `colors.ts`. For a new role, add a leaf to the selection table and add an explanation to `ROLE_NOTES` in the Playground Color. If the explanation is missing, the type check blocks it.
4. In components use only semantic roles, and check in both light and dark.

There is one invariant to keep. Every semantic role is the same as a generated Palette Token, and every color drawn on the screen comes in through a semantic role.
