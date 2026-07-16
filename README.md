# paper-ui

A ledger for the screen. Paper, ink, and ruled lines.

```
Paper and ink are the whole palette. Colour appears three times — error,
success, danger — and never for decoration. A ledger does not need a brand
colour; it needs a line you can read a number off.
```

- **20 components.** Adding a 21st requires evidence it was needed twice in a
  real screen.
- **One spine.** `line = 44px` — rule spacing, row height, and table head all
  derive from it, so entries sit *on* the ruled paper.
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
pnpm dev          # demo — one ledger screen, the system's only real validation
pnpm typecheck
pnpm lint
```

## Licence

MIT © Jaewon Baek
