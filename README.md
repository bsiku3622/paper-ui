# paper-ui

A design system for complex web apps. White and black carry the structure; colour appears only where it means something.

```
White and black are the whole base — their harmony is the skeleton of every
screen. Colour (blue · green · amber · red) shows up only where it carries
meaning: status, focus, links. The only hue that fills a surface is black.

Quiet like ChatGPT (pale surfaces, near-invisible borders), dense enough for
Atlassian, finished like SwiftUI.
```

The seven principles behind every visual decision: **[docs/get-started/philosophy.md](docs/get-started/philosophy.md)**.

- **Primitive and Atom foundation.** The package currently stops at composable layout
  primitives and single-purpose controls. Page-level compositions stay in the consuming app
  until repeated product use gives them a clear, shared shape.
- **Black is the workhorse.** Primary actions are black, not blue — a blue button
  on every screen stops being a point. Colour stays small.
- **No `primaryColor`.** A brand has no colour to pick here; the identity is
  white, black, and whitespace. The one thing the provider picks is the theme
  (`light` · `dark` · `system`).
- **Core constraints and accessibility checks**, enforced by eslint.

## Structure

The system stacks in three tiers, and the docs and the playground are organised the same way.

| Tier | | |
|---|---|---|
| Foundations | 5 systems | `Color → Typography → Shape → Layout → Motion` — each reads only the ones before it |
| Primitives, first order | Element 1 | `Box` |
| | Content 2 | `Text · Icon` |
| | A11y 3 | `FocusScope · VisuallyHidden · Portal` |
| Primitives, second order | Paint 2 | `Surface · Paint` |
| | Press 1 | `Pressable` |
| | Select 2 | `Selectable · SelectableGroup` |
| | Float 1 | `Floating` |
| | Drag 2 | `Draggable · Droppable` |
| | Focus 1 | `RovingFocus` |
| | Field 1 | `FormField` |
| | Layout 3 | `Stack · Inline · Grid` |
| Atoms | 13 | `Button · IconButton · Field · Textarea · Select · Checkbox · Switch · Radio · Label · Badge · Spinner · Divider · Link` |

The theme is one attribute, `<html data-pui-theme>`, and one store per document. `PaperProvider` keeps the user's choice under `storageKey` (`pui-theme` by default), `themeBootScript` from `@studio-baeks/paper-ui/theme-boot` applies it before the first paint, and a subtree takes its own mode through `<Surface theme="light | dark | inverse">`.

Every Foundations system writes its numbers once, in its source, and exposes roles that select from it: [docs/foundations](docs/foundations/README.md). Product-specific compositions are owned by consuming applications. The package exposes three kinds of names: components and hooks (Primitives and Atoms), `tokens` with its role
rules, and the vocabulary, one constant and one type for each axis (`Accent`, `Variant`, `SurfaceFill`, `Space` …).
`<Box as="…">` remains the typed route to semantic HTML when an application needs it.

## Running

```bash
cd workspace
pnpm install
pnpm dev          # site, playground, docs and the demo screen
pnpm check        # lint, typecheck, unit tests and the contract check: the fast loop while working
pnpm verify       # check, then the package and app builds, then e2e: what CI and prepublish run
pnpm typecheck
pnpm lint
pnpm test         # unit tests and the contract check (every docs contract has its test)
pnpm test:e2e     # e2e on computed values: six projects across Chromium, Firefox and WebKit
```

`pnpm test:e2e` starts its own two servers: the app on port 41731 and the test harness
(`workspace/fixtures/harness`) on 41732. Both run with `--strictPort` and are never reused,
so the run fails when another process holds either port instead of testing that process.
Set `E2E_APP_PORT` or `E2E_HARNESS_PORT` to move them. Firefox and WebKit come from
`pnpm exec playwright install firefox webkit`.

## Licence

MIT © Jaewon Baek
