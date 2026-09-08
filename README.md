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

- **27 components — the baseline.** Forms, feedback and loading included, this is
  the smallest set that finishes a real screen. After v1 a 28th needs evidence it
  was needed twice; until then it has to be a standard primitive or fill a real
  semantic gap, and extending an existing component comes first either way.
- **Black is the workhorse.** Primary actions are black, not blue — a blue button
  on every screen stops being a point. Colour stays small.
- **No `primaryColor`.** A brand has no colour to pick here; the identity is
  white, black, and whitespace. The one thing the provider picks is the theme
  (`light` · `dark` · `system`).
- **Four absolute rules**, enforced by eslint rather than by documentation.

## Layers

| Layer | Count | |
|---|---|---|
| Primitives | 4 | `Box · Stack · Inline · Text` |
| Atoms | 13 | `Button · Field · Textarea · Select · Checkbox · Switch · Radio · Label · Badge · Icon · Spinner · Divider · Link` |
| Molecules | 6 | `Card · TextField · RadioGroup · Tabs · Tooltip · Alert` |
| Components | 4 | `Table · Modal · Navbar · Banner` |

Raw HTML stops at Atoms — each renders its own semantic tag. From Molecules up,
everything is composed from Primitives and Atoms, and `<Box as="…">` is the only
way back to a raw tag.

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
