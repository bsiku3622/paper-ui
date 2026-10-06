# Color architecture

Paper UI colors follow one direction:

```
palette.ts (source + assembly) ──calls──> color-ladder.ts (pure color functions)
       │                                      │
       └── completed OKLCH + HEX Palette Tokens
                         ↓
                  colors.ts (semantic) → CSS vars → UI
```

The Palette is one theme-independent source of truth. It owns hue, chroma, lightness anchors, and percentage alpha steps. `palette.ts` calls the pure interpolation and color-encoding functions in `color-ladder.ts`, then exports the completed OKLCH coordinates and HEX Palette Tokens. `color-ladder.ts` never imports palette data, so the dependency remains one-way. Light and dark semantics independently select steps from this same generated Palette; switching theme never changes the Palette itself.

## Palette source and generated tokens

`tokens/palette.ts` is the only authored color source and the assembly point for the completed Palette. Neutral and accent families are described by one OKLCH ramp each. Neutral step numbering runs from light to dark: `0` is the lightest endpoint and `950` the darkest; both ramps include `925` between `900` and `950`. Dark `bg.canvas` and `bg.sunken` select neutral `950`; `bg.raised` selects `925`, and `control.track` selects `900`. The close spacing keeps broad surfaces calm while letting panels lift slightly above the page. Accent families keep one set of reviewed anchors; intermediate tones, including `925`, are interpolated in OKLCH. `alpha05` through `alpha95` are fixed percentage ramps applied to the neutral endpoints and are shared by every theme.

`tokens/color-ladder.ts` contains pure operations only: completing a ramp, interpolating OKLCH coordinates, mapping out-of-gamut colors into sRGB, encoding HEX, and appending alpha. It does not import or assemble palette data. `palette.ts` applies these functions and exports generated `PaletteToken`s; they are not semantic roles.

Palette Token keys are internal. Components and application code do not import them. The ladder functions brand encoded output as `PaletteToken`, so semantic values cannot be assigned arbitrary CSS strings at type level. The Palette inspector is the only view that displays source coordinates and generated values side by side.

## Semantic systems

All semantic values select Palette Tokens according to the current theme. They share the public root `tokens.color`. For example, dark mode can select a lighter accent solid and a deeper accent soft surface from the same blue ramp; no second dark palette is generated.

| System | Public shape | Responsibility |
|---|---|---|
| Surface | `bg.<level>` | Page, raised, and sunken surfaces |
| Control | `control.<role>` | Tracks built into interactive controls |
| Border | `border.<level>` | Base, strong, and hover boundaries |
| Ink | `ink.<level>` | Primary, secondary, and tertiary text |
| Accent | `accent.<name>.<ladder>` | Primary or status pigment roles: `solid`, `wash`, `soft`, `subtle` |
| Interaction | `interaction.<state>` | Background hover overlays, selected, active, and focus feedback |
| Overlay | `overlay.<role>` | Modal backdrop scrim |
| Shadow | `shadow.<role>` | Palette-derived shadow tints |

Examples:

```ts
tokens.color.bg.canvas
tokens.color.control.track
tokens.color.border.strong
tokens.color.ink.secondary
tokens.color.accent.warning.soft
tokens.color.interaction.bgHover.onSurface
tokens.color.interaction.focus
tokens.color.overlay.scrim
tokens.color.shadow.overlay
```

The surface levels are `raised`, `canvas`, and `sunken`. In light mode, `canvas` and `sunken` select neutral `50` and `100`; `control.track` selects neutral `200` for the recessed track inside Switch and SegmentedControl. In dark mode it selects neutral `900`. Keeping this track outside `bg` prevents a component detail from becoming a general-purpose page surface. Borders use `base`, `strong`, and `hover`; ink uses `primary`, `secondary`, and `tertiary`.

Accent names are `primary`, `info`, `success`, `warning`, and `error`. They map to neutral, blue, green, amber, and red Palette Tokens. Every name has the same ladder:

| Ladder token | Use |
|---|---|
| `solid` | Filled surface or pigment text on a neutral surface |
| `wash` | Foreground on a solid accent surface; light tint |
| `soft` | Soft variant surface |
| `subtle` | Muted variant foreground |

Interaction values select from the shared alpha Palette too. `interaction.bgHover` provides `onSurface`, `onPrimarySolid`, and `onAccentSolid` overlays. Selected, active, scrim, and shadow tints select a neutral endpoint and alpha percentage appropriate to the theme. Focus uses a step from the shared blue ramp. Focus ring width and offset remain geometry constants in the shape system. Shadow colors are exposed as `shadow.overlay` and `shadow.overlayMinimal`; their geometry remains in shape.

Hairline and default form controls share a raised surface, base neutral border, primary ink, and hover border. Semantic hairline accents retain their pigment foreground.

## Real use

`theme.css.ts` emits the semantic tree as theme-scoped CSS variables. `tokens.color` contains only `var(...)` references. Components and apps consume those references; they do not read palette source or generated palette token modules.

When changing color:

1. Adjust OKLCH source coordinates, anchors, or alpha steps in `palette.ts`.
2. Check the shared generated HEX values and gamut mapping in the Palette inspector; the ramp must stay identical when the app theme changes.
3. Adjust theme-specific semantic mappings in `colors.ts` when a role needs a different palette step.
4. Use the semantic role in components and inspect the light and dark themes.

The key invariant is structural: every semantic leaf equals a generated Palette Token, and every rendered color enters through the semantic tree.
