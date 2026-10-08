# paper-ui

A design system for complex web apps. White and black carry the structure; colour
appears only where it means something.

Quiet like ChatGPT (pale surfaces, near-invisible borders), dense enough for
Atlassian, finished like SwiftUI.

```bash
pnpm add @studio-baeks/paper-ui
```

React 18 or newer, as a peer dependency.

## Getting started

Import the stylesheet once at your entry point. That single line puts every CSS
variable — colour, size, type — on `:root` and emits the utility classes the
components reference.

```ts
import "@studio-baeks/paper-ui/styles.css";
```

Then wrap the app. `PaperProvider` renders no DOM wrapper, so it cannot affect
your layout; the theme goes on `<html data-theme>`.

```tsx
import { PaperProvider, Stack, Text, Button } from "@studio-baeks/paper-ui";

export const App = () => (
  <PaperProvider>
    <Stack gap="md" padding="xl">
      <Text variant="title">Hello</Text>
      <Button>Get started</Button>
    </Stack>
  </PaperProvider>
);
```

The provider takes exactly one setting: the theme. Pass `defaultTheme` as
`light`, `dark`, or `system` (the default, which follows
`prefers-color-scheme`). A choice the user makes is kept in localStorage and
wins on the next visit. For a toggle of your own, `useTheme()` returns the
user's own choice (`theme`, which may be `system`) alongside the `resolved`
value that is actually applied.

There is no `primaryColor`. A brand has no colour to pick here — the identity is
white, black, and whitespace.

## What is in the box

| Layer | Exports |
|---|---|
| Primitives | `Box · Stack · Inline · Text` |
| Atoms | `Button · Field · Textarea · Select · Checkbox · Switch · Radio · Label · Badge · Icon · Spinner · Divider · Link` |

The package stops at primitives and atoms. Product-specific compositions belong
to the consuming app, where their structure and lifecycle can follow the product.
Atoms render their own semantic elements; primitives provide layout and text.
`Box` also exposes typed dimension and overflow props; named `xs`–`xl` values resolve
to layout tokens, while CSS lengths remain available for application-specific layout.

## How it decides

Two axes run through the colour system: `accent` says what something means
(`primary` plus `info` · `success` · `warning` · `error`) and `variant` says how
much visual weight it carries (`solid` · `soft` · `hairline` · `ghost` · `muted`).
Primary actions are black rather than blue — a blue button on every screen stops
being a point.

Shape is the system's call, not the caller's. What you choose is meaning:
`size`, `status`, `color`. Where a shape prop does exist it takes a closed
vocabulary — `shape="pill"`, not `radius={10}`.

Four absolute rules hold the rest together, and eslint enforces them rather than
the documentation: no raw hex outside the token files, value modules isolated
behind the theme, no token reads through inline styles, and no raw HTML above
the Primitive layer.

## Documentation

The principles behind visual decisions and the token reference live in the repository:
<https://github.com/bsiku3622/paper-ui>

## Licence

MIT © Jaewon Baek
