# Typography

Typography is the system that decides typeface, size, weight, leading and tracking. A component does not choose a size as a number but as a **role** — whether this is a page title, body text or a short name. Each role has the name of a default ink, and the color that name points to is decided by Color.

Typography also has three steps. The source numbers are the **Typography Palette**, the **type roles** combine them, and the **control presets** bundle the control text that repeats. Roles and presets only combine Palette variables and write no new numbers. The public token paths are `tokens.typography.role` for roles and `tokens.typography.preset` for presets. The Palette is not in the public tree and is baked only as CSS variables (`--pui-typography-palette-*`); inside the package it is read from `tokens/typography.ts`, and the Playground's Typography inspector reads it through `@paper-ui/inspect/typography`. The declarations that apply these values to the screen are made in one place, `tokens/typography-recipes.ts` ([The unit that applies a role](#the-unit-that-applies-a-role)).

## Typography Palette — source

| Axis | Values |
| --- | --- |
| `fontSize` | 12 · 13 · 14 · 15 · 16 · 20 · 24 · 32 · 48, and the fluid step `hero` |
| `leading` | 16 · 20 · 24 · 28 · 32 · 40 · 56, and the unitless `hero` 1.12 |
| `weight` | `regular` 400 · `normal` 450 · `medium` 500 · `semibold` 600 · `bold` 700 |
| `tracking` | `mono` −0.04em · `tightest` −0.035em · `tighter` −0.03em · `tight` −0.02em · `normal` 0 · `wide` 0.01em |
| `family` | `sans` · `mono` |
| `decoration` | `underlineOffset` 0.2em |
| `monoSizeScale` | 0.95 |
| `codeScale` | `inline` 0.85 · `compact` 0.8 |

Sizes and leading use the actual px value as the name (`fontSize.14`), so that differently named steps are not forced into pairs. 450 is a correction for input values, so that small sans text does not lose strength on Retina, and the underline offset is a decoration of the text, so it follows the text size (em). `codeScale` is the ratio by which code inside a sentence shrinks from the surrounding text.

**The one declared exception to the fixed ladder is `hero`.** The size of `hero` is `clamp(2.75rem, 5.2vw, 4.75rem)`, which grows between 44px and 76px with the viewport width, and its leading is not px but a unitless ratio of 1.12. Only the one place whose size must vary with the screen width, like the headline on a landing page's first screen, uses this exception. All other sizes and leading are fixed px values.

## Typefaces

| family | Typeface | Used for |
|---|---|---|
| `sans` | Pretendard Variable → system sans | All text |
| `mono` | ui-monospace · SF Mono · Menlo · Consolas → D2Coding | Code, token names, identifiers |

Pretendard comes first. It draws Latin and Hangul as one body, so mixed sentences do not split in weight and rhythm. If `-apple-system` comes first, only the Latin goes to San Francisco and the Hangul to Apple SD Gothic Neo, so the Hangul looks thinner at the same weight.

The typeface is part of Typography's contract. The weight ladder (400 · 450 · 500 · 600 · 700) is built on the assumption that Pretendard Variable is present, and without it the system font folds to the nearest weight — on Windows (Segoe UI · Malgun Gothic), 450 · 500 fold to 400 and 600 to 700, and on Android (Roboto), 450 folds to 500 and 600 to 700. macOS keeps most steps as they are. Because leading is a fixed px value, the geometry does not change even when weights fold. The addresses of the two stylesheets to load are in `FONT_STYLESHEETS` (`/tokens`), and the snippet that copies them as they are is in [Installation › Fonts](../get-started/install.md#fonts).

Mono is not a hierarchy but a **family axis**. Put it on any role with `<Text family="mono">`, and use it only in technical places. A number column in a table is not switched to mono; it just gets `tabular-nums` in sans. Mono reads larger than sans at the same px, so the size is multiplied by `monoSizeScale` (0.95), and instead of the per-role tracking it uses the single `tracking.mono` (−0.04em) — SF Mono and D2Coding have wide glyphs and look spread out in UI. To use Hangul mono, the app must load D2Coding.

## Type roles

| Role | Size / leading | Weight | Emphasis | Tracking | Default ink | Default tag | Used for |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `hero` | 44–76 fluid / 1.12 | 600 | 600 | tightest | primary | h1 | Landing headline |
| `headline` | 48 / 56 | 600 | 600 | tightest | primary | h1 | Large title of an app screen |
| `display` | 32 / 40 | 600 | 600 | tighter | primary | h1 | Large title |
| `title` | 24 / 32 | 600 | 600 | tight | primary | h1 | Page title |
| `heading` | 20 / 28 | 600 | 600 | normal | primary | h2 | Section title |
| `subheading` | 16 / 24 | 600 | 600 | normal | primary | h3 | Small title |
| `lead` | 16 / 24 | 400 | 500 | normal | primary | p | Intro at the top of a page · document body |
| `body` | 14 / 20 | 400 | 500 | normal | primary | p | Body text (default) |
| `caption` | 13 / 16 | 400 | 500 | normal | secondary | p | Supporting info · meta |
| `label` | 12 / 16 | 600 | 600 | wide | secondary | span | Field label · table header · short name |

Body text is 14px, because that is the standard density of a complex web app. The only role that reads at 16px is `lead`, used for text that is read rather than worked in, like the intro at the top of a page and document body. Titles from `hero` to `subheading` build hierarchy by size alone, with a single weight of 600 — if the large titles were 400, they would look thinner than the `title` (24 · 600) just below them and the hierarchy would read upside down. `label` is sentence case semibold, not uppercase or mono. `hero` is the only role whose size grows with the viewport ([Palette](#typography-palette--source)). `headline` is a fixed step of the same character, used for the large title of an app screen rather than a landing page.

`variant` and the tag are decided separately. A `title` may be an `h1` on one page and an `h2` inside a dialog. The ink can be overridden once with `ink`, and on a colored surface `ink="inherit"` takes the surface's text color as it is.

```tsx
<Text as="h1" variant="title">Website redesign</Text>
<Text variant="caption">Last edited · today 10:42 AM</Text>
<Text variant="body" family="mono">WEB-24</Text>
```

Information that sits alongside, like a date, an owner or a parent project, is written as `caption` rather than just lowering the ink of `body`, and section heads and table heads are written as `label`, not uppercase. The Demo draws it this way.

What the browser computes equals what the source resolves to. The computed font size · weight · leading · tracking of every `Text` variant and every control preset match the values resolved from the source (`TYPOGRAPHY_SOURCE`); for mono the size is the variant's `monoSizeScale` times and the tracking changes to `tracking.mono`. The unitless leading of hero, which is not a fixed leading, is multiplied by its own font size.

## The unit that applies a role

There are two ways to apply a role to the screen, and both come from the same single declaration. Components use `Text`, and an app's stylesheet takes the same declaration through the rule functions in `/tokens`.

| Rule | Declaration it makes | Used for |
|---|---|---|
| `typographyRule(variant, { family })` | The role's typeface · size · weight · leading · tracking · line breaking | `Text`, the body element, stylesheets that follow a role, like headings |
| `monoRule()` | A mono fragment inside a sentence under any role — the size is `monoSizeScale` times the surrounding text | Identifiers inside a role |
| `codeRule('inline' \| 'compact' \| 'block')` | Code. `inline` is the size inside a paragraph and `compact` the size inside a table cell; neither decides tracking or line breaking, so they follow the surrounding text. `block` breaks like mono. The values are in the generated table above | Inline code in documents, table cells, code blocks |
| `presetRule(preset, size, weight)` | A control preset. Button takes size and weight, Field · Textarea take size, and Badge is independent of size | Stylesheets that draw a control directly |
| `emphasisRule(emphasis)` | A single weight. `regular` · `medium` · `semibold` · `bold` are Palette names, so `regular` is always 400 | Emphasis inside a sentence, light text outside a role |

The body element receives the whole body role. It includes not only size and leading but also weight 400 and line breaking, so text outside Text (links, lists) is drawn the same as `<Text variant="body">`.

Only document body text is one step larger than that. A document is a place to read, not a screen to work in, so the site's document body uses the size and leading of `subheading` with regular weight, and its headings also go up one step each: h2 is `title` and h3 is `heading`.

An app does not read the Palette directly. Weights in a stylesheet are chosen with `emphasisRule` and everything else with the rules above. A component does not choose a weight name. `strong` of `Text` · `Button` turns the role's decided value on and off.

### Line breaking

Line breaking is decided by the typeface, and roles follow the typeface.

| family | `word-break` | `overflow-wrap` | Meaning |
|---|---|---|---|
| `sans` | `keep-all` | `break-word` | Hangul breaks only between words (eojeol), and a word is broken inside only when a single word is longer than the line. |
| `mono` | `normal` | `anywhere` | Identifiers and paths break anywhere. |

Code fragments inside a sentence (`inline` · `compact` of `codeRule`) follow the surrounding text's line breaking, not the typeface rule. If an identifier in a table cell could break anywhere, it would reduce the minimum width of the cell, and the table would narrow by cutting identifiers across, so when a cell is narrow the table scrolls inside its own wrapper.

A label that must stand on one line is decided by the preset. The presets of Button and Badge also carry `white-space: nowrap`, and an input does not, because its value decides the lines.

## Control preset

Control text follows the **control size**, not the reading hierarchy. If a Button, Field and Select of the same size stand on the same line, their text heights must match too. So the button text and input value of the same size have the same size and line, and differ only in weight. Button text is the label that defines the box, so it is medium, and an input value is a value to be read, so it is normal. A preset is provided as one finished class, and the package's Atoms choose that class internally. A stylesheet that draws a control directly takes the same declaration with `presetRule(preset, size, weight)` from `/tokens`.

| preset | xs | sm | md | lg | xl | Atoms that use it |
| --- | --- | --- | --- | --- | --- | --- |
| `button` | 13 / 16 · 500 | 14 / 16 · 500 | 14 / 16 · 500 | 15 / 16 · 500 | 16 / 16 · 500 | Button · IconButton |
| `field` | 13 / 16 · 450 · input line box 20 | 14 / 16 · 450 · input line box 20 | 14 / 16 · 450 · input line box 20 | 15 / 16 · 450 · input line box 20 | 16 / 16 · 450 · input line box 20 | Field · Select |
| `textarea` | 13 / 20 · 450 | 14 / 20 · 450 | 14 / 20 · 450 | 15 / 20 · 450 | 16 / 20 · 450 | Textarea |
| `badge` | 12 / 16 · 500 (independent of size) |  |  | Badge |

The control text line (leading 16) is also the input from which Shape computes a control's inner padding — the input inset is (control height − 16) / 2. Badge text does not go below 12px even when the badge gets smaller, because density (height) and readability (text size) are different axes.

A Field's input value sits not on the text line (16) but in the preset's `inputLeading` (20) line box. In a 16px line box, the browser caret and Hangul fallback glyphs can be squeezed and clipped at the top and bottom. A Select uses the same field preset but has no separate line box for drawing the value, so it uses the text line 16 as it is.

The `fontSize` prop is an escape hatch that changes only the text size to another role. It accepts only `label` · `caption` · `body`, which a control box can hold (`CONTROL_FONT_SIZES`), and the type blocks any larger role. Even when the size changes, the leading stays in the preset, so the geometry is kept based on the preset of the chosen size.

## In an app

The way an app chooses text is the role. In components, use `variant` · `ink` · `family` · `strong` · `numeric` of `Text`; in stylesheets, use `typographyRule(variant, { family })` and `codeRule` · `presetRule` · `emphasisRule`; and where you must read the values directly, use `tokens.typography.role.<variant>` (`size` · `weight` · `strong` · `leading` · `tracking`) and `tokens.typography.preset.<preset>`. Do not write numbers or unit values in `fontSize` · `fontWeight` · `lineHeight` · `letterSpacing`. Emphasis that changes only the weight is `emphasisRule`, code is `codeRule`, and the underline offset of a link is `linkStyle`. The app scope of eslint `paper/source-numbers` blocks the values, and the Palette is not in the public tree, so an app has no path to read it. Only the Typography inspector, which shows the Palette, reads it through `@paper-ui/inspect/typography`. The escape hatch for changing control text by one step is the control's `fontSize` prop.

You can see the Palette, roles and presets as real text in the Playground's [Typography](/playground/foundations/typography).
