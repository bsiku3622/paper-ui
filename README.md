# paper-ui

A design system for complex web apps. Pure white and black, with colour used only as a point.

```
White and black are the whole base — their harmony is the skeleton of every
screen. Colour (blue · green · red) appears only where it means something:
status, focus, links. It is a point, never a fill.

Quiet like ChatGPT (soft radii, near-invisible borders, surfaces over rules),
dense enough for Atlassian, finished like SwiftUI.
```

- **20 components.** A 21st needs evidence it was needed twice in a real screen.
- **Black is the workhorse.** Primary actions are black, not blue — a blue button
  on every screen is no longer a "point". Colour stays small.
- **No `primaryColor`.** A brand has no colour to pick; the identity is white,
  black, and whitespace.
- **Four absolute rules**, enforced by eslint rather than by documentation.

## Layers

| Layer | Count | |
|---|---|---|
| Primitives | 4 | `Box · Stack · Inline · Text` — the only layer that renders raw HTML |
| Atoms | 9 | `Button · Field · Label · Badge · Checkbox · Icon · Divider · Link · Select` |
| Molecules | 4 | `Card · TextField · Tabs · Tooltip` |
| Components | 3 | `Table · Modal · Navbar` |

## Running

```bash
cd workspace
pnpm install
pnpm dev          # demo — one issue-tracker screen, the system's only real validation
pnpm typecheck
pnpm lint
```

## Licence

MIT © Jaewon Baek
