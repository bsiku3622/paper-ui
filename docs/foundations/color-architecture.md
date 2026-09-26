# Color architecture

Paper UI colors follow one direction:

```
OKLCH Palette source → generated HEX Palette Tokens → semantic systems → real use
      palette.ts              color-ladder.ts       colors.ts       CSS vars / UI
```

The Palette is one theme-independent source of truth. It owns hue, chroma, lightness anchors, and percentage alpha steps. The generator interpolates missing tones, maps out-of-gamut colors into sRGB, and emits six-digit HEX colors plus eight-digit HEX alpha tokens. Light and dark semantics independently select steps from this same generated Palette; switching theme never changes the Palette itself.

## Palette source and generated tokens

`tokens/palette.ts` is the only authored color source. Neutral and accent families are described by one OKLCH ramp each. Neutral step numbering runs from light to dark: `0` is the lightest endpoint and `950` the darkest; both ramps include `925` between `900` and `950`. Dark `bg.canvas` selects neutral `925`, leaving `950` for the deeper raised surface. Accent families keep one set of reviewed anchors; intermediate tones, including `925`, are interpolated in OKLCH. `alpha05` through `alpha95` are fixed percentage ramps applied to the neutral endpoints and are shared by every theme.

`tokens/color-ladder.ts` converts every source color to HEX. Chroma is reduced only when a color falls outside sRGB. Alpha variants are emitted as eight-digit HEX from a palette endpoint and a named percentage step. Generated values are Palette Tokens; they are not semantic roles.

Palette Token keys are internal. Components and application code do not import them. The generator brands its output as `PaletteToken`, so semantic values cannot be assigned arbitrary CSS strings at type level. The Palette inspector is the only view that displays source coordinates and generated values side by side.

## Semantic systems

All semantic values select Palette Tokens according to the current theme. They share the public root `tokens.color`. For example, dark mode can select a lighter accent solid and a deeper accent soft surface from the same blue ramp; no second dark palette is generated.

| System | Public shape | Responsibility |
|---|---|---|
| Surface | `bg.<level>` | Page, raised, sunken, and well surfaces |
| Border | `border.<level>` | Base, strong, and hover boundaries |
| Ink | `ink.<level>` | Primary, secondary, and tertiary text |
| Accent | `accent.<name>.<ladder>` | Primary or status pigment roles: `solid`, `wash`, `soft`, `subtle` |
| Interaction | `interaction.<state>` | Background hover overlays, selected, active, and focus feedback |
| Overlay | `overlay.<role>` | Modal backdrop scrim |
| Shadow | `shadow.<role>` | Palette-derived shadow tints |

Examples:

```ts
tokens.color.bg.canvas
tokens.color.border.strong
tokens.color.ink.secondary
tokens.color.accent.warning.soft
tokens.color.interaction.bgHover.onSurface
tokens.color.interaction.focus
tokens.color.overlay.scrim
tokens.color.shadow.overlay
```

The surface levels retain their established meaning: `raised`, `canvas`, `sunken`, and `well`. Borders use `base`, `strong`, and `hover`; ink uses `primary`, `secondary`, and `tertiary`.

Accent names are `primary`, `info`, `success`, `warning`, and `error`. They map to neutral, blue, green, amber, and red Palette Tokens. Every name has the same ladder:

| Ladder token | Use |
|---|---|
| `solid` | Filled surface or pigment text on a neutral surface |
| `wash` | Foreground on a solid accent surface; light tint |
| `soft` | Soft variant surface and hairline border |
| `subtle` | Muted variant foreground |

Interaction values select from the shared alpha Palette too. `interaction.bgHover` provides `onSurface`, `onPrimarySolid`, and `onAccentSolid` overlays. Selected, active, scrim, and shadow tints select a neutral endpoint and alpha percentage appropriate to the theme. Focus uses a step from the shared blue ramp. Focus ring width and offset remain geometry constants in the shape system. Shadow colors are exposed as `shadow.overlay` and `shadow.overlayMinimal`; their geometry remains in shape.

## Real use

`theme.css.ts` emits the semantic tree as theme-scoped CSS variables. `tokens.color` contains only `var(...)` references. Components and apps consume those references; they do not read palette source or generated palette token modules.

When changing color:

1. Adjust OKLCH source coordinates, anchors, or alpha steps in `palette.ts`.
2. Check the shared generated HEX values and gamut mapping in the Palette inspector; the ramp must stay identical when the app theme changes.
3. Adjust theme-specific semantic mappings in `colors.ts` when a role needs a different palette step.
4. Use the semantic role in components and inspect the light and dark themes.

The key invariant is structural: every semantic leaf equals a generated Palette Token, and every rendered color enters through the semantic tree.
