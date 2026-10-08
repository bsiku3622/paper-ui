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

## Layers

| Layer | Count | |
|---|---|---|
| Primitives | 5 | `Box · Stack · Inline · Text · Icon` |
| Atoms | 13 | `Button · IconButton · Field · Textarea · Select · Checkbox · Switch · Radio · Label · Badge · Spinner · Divider · Link` |

Compositions are owned by consuming applications. The package exposes Primitives and Atoms;
`<Box as="…">` remains the typed route to semantic HTML when an application needs it.

## Running

```bash
cd workspace
pnpm install
pnpm dev          # demo — one issue-tracker screen, the system's only real validation
pnpm typecheck
pnpm lint
pnpm test         # unit
pnpm test:e2e     # playground contracts, asserted on computed values
```

## Licence

MIT © Jaewon Baek
