# paper-ui

A design system for complex web apps. White and black carry the structure; colour
appears only where it means something.

Quiet like ChatGPT (pale surfaces, near-invisible borders), dense enough for
Atlassian, finished like SwiftUI.

```bash
pnpm add @studio-baeks/paper-ui
```

React 18.2 or newer, or React 19, as a peer dependency (`^18.2.0 || ^19.0.0`). The
package is ESM only: there is no `require` entry, and CommonJS code loads it with a
dynamic `import()`. Types come bundled, one declaration file per entry, and resolve
under TypeScript `moduleResolution` `bundler`, `node16` or `nodenext`.

## Getting started

The package has three entries, and every name comes from exactly one of them:

| Entry | Holds |
|---|---|
| `@studio-baeks/paper-ui` | Components, hooks, `PaperProvider` and their prop types. A client entry (`"use client"`). |
| `@studio-baeks/paper-ui/tokens` | `tokens` and the vocabulary constants and types. No React and no CSS, so server components and `.css.ts` stylesheets can import it. |
| `@studio-baeks/paper-ui/styles.css` | The one stylesheet. |

Import the stylesheet once at your entry point. It is the only way styles load:
neither the components nor `PaperProvider` import CSS. That single line puts every
CSS variable — colour, size, type — on `:root` and brings in the utility classes
and the component styles.

```ts
import "@studio-baeks/paper-ui/styles.css";
```

If the stylesheet is missing, `PaperProvider` warns once in development.

Every rule in the stylesheet sits in the cascade layer `pui`, ordered
`pui.reset < pui.theme < pui.base < pui.utilities < pui.components`; only `@keyframes`
and `@property` rules stand outside it. Your own CSS, left unlayered, beats all of it whatever the load
order or specificity, so a `className` you pass overrides state rules such as hover
and disabled too. Put element resets in a layer declared before `pui` — `@layer reset, pui;`
in a stylesheet that loads before this one — or they will override the components as well.

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

## Browser support

Chrome and Edge 125, Firefox 121 and Safari 16.4 (iOS included) or newer. `round()`,
`:has()` and `:dir()` set that floor: button insets, the keyboard focus ring of Field
and Select, and the Switch in right-to-left layouts depend on them. CSS features newer
than the floor are used only as enhancements, so a browser at the floor loses motion
and nothing else.

## What is in the box

| Tier | Exports |
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

Six rules hold the rest together, and eslint enforces them rather than the
documentation: no raw colour outside the token sources, source modules isolated
behind the token barrel, no token reads through inline styles, no length outside
the token sources, every package rule inside a `pui` cascade layer, and no
`eslint-disable` comment that switches a `paper/*` rule off. The package build,
prepublish and CI run those checks.

## Documentation

The principles behind visual decisions and the token reference live in the repository:
<https://github.com/bsiku3622/paper-ui>

## Licence

MIT © Jaewon Baek
