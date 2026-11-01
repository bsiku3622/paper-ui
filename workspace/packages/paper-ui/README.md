# paper-ui

A design system for complex web apps. White and black carry the structure; colour appears only where it means something.

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

The package has four entries, and every name comes from exactly one of them:

| Entry | Holds |
|---|---|
| `@studio-baeks/paper-ui` | Components, hooks, `PaperProvider` and their prop types. A client entry (`"use client"`). |
| `@studio-baeks/paper-ui/tokens` | `tokens` and the vocabulary constants and types. No React and no CSS, so server components and `.css.ts` stylesheets can import it. |
| `@studio-baeks/paper-ui/theme-boot` | `themeBootScript`, `THEME_STORAGE_KEY` and `THEME_ATTRIBUTE`: the script that applies the theme before first paint. No React and no CSS. |
| `@studio-baeks/paper-ui/styles.css` | The one stylesheet. |

Import the stylesheet once at your entry point. It is the only way styles load:
neither the components nor `PaperProvider` import CSS. That single line puts every
CSS variable — colour, size, type — on `:root` and brings in the component styles.

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
your layout; the theme goes on `<html data-pui-theme>`.

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

The provider chooses the theme, and, when asked, the language. Pass `defaultTheme` as
`light`, `dark`, or `system` (the default, which follows
`prefers-color-scheme`). A choice the user makes is kept in localStorage under
`storageKey` (`pui-theme` by default; `null` stores nothing) and wins on the
next visit. For a toggle of your own, `useTheme()` returns the user's own choice
(`theme`, which may be `system`) alongside the `resolved` value that is actually
applied. `<html data-pui-theme>` is the one truth for the mode: any theme manager
may write it, and `useResolvedTheme()` reads it with or without a provider.

`locale` (a BCP 47 tag) and `messages` set the language of the words Atoms say for
themselves. The locale is the one given, else `<html lang>`, else `en`; Paper never
reads the browser's language. `messages` overrides the catalog key by key
(`clear`, `showPassword`, `loading`; English and Korean ship). `<html lang>` and
`<html dir>` are written only when a `locale` is passed, and put back when the
provider goes.

To apply the stored or OS theme before the first paint, put the boot script first
in `<head>` with the same options the provider gets. With Vite:

```ts
import { themeBootScript } from "@studio-baeks/paper-ui/theme-boot";

// vite.config.ts: add this plugin to `plugins`
export const themeBoot = {
  name: "theme-boot",
  transformIndexHtml: () => [{ tag: "script", children: themeBootScript(), injectTo: "head-prepend" }],
};
```

A subtree takes its own mode through `<Surface theme="light | dark | inverse">`.

There is no `primaryColor`. A brand has no colour to pick here — the identity is
white, black, and whitespace.

## Fonts

The weight ladder (400 · 450 · 500 · 600 · 650 · 700) assumes Pretendard Variable, so the
font is part of the Typography contract rather than an option. The package bundles no font
files. Load the two stylesheets whose URLs it exports as `FONT_STYLESHEETS` from
`@studio-baeks/paper-ui/tokens`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fonts-archive/D2Coding@5ac6fc6fada70f1d8a8561cec826722574c51a6e/D2Coding.css" />
```

Without the font the ladder folds onto the weights the system font has: on Windows
(Segoe UI, Malgun Gothic) 450 and 500 become 400 and 600 and 650 become 700; on Android
(Roboto) 450 becomes 500 and 600 and 650 become 700; macOS keeps most steps. Line heights are
fixed, so geometry stays identical. D2Coding supplies Korean monospace glyphs.

## Browser support

Chrome and Edge 125, Firefox 121 and Safari 16.4 (iOS included) or newer. `round()`
sets the floor of Chrome and Edge and `:has()` that of Firefox: button insets and the empty
choice of a Select depend on them. Safari's floor is the release that brought `@property`,
which gives the hover tint its fade. CSS features newer
than the floor are used only as enhancements, so a browser at the floor loses motion
and nothing else.

## What the stylesheet sets globally

Nearly every rule in the stylesheet applies to elements that carry one of its classes. The rules without a class selector are the ones below, by cascade layer; all of them sit inside `pui`, and only `@keyframes` and `@property` stand outside it. They apply once the stylesheet is loaded, with or without a `PaperProvider`, which renders no element.

| Layer | Selector | Sets |
|---|---|---|
| `pui.reset` | `*` | `box-sizing: border-box` |
| `pui.reset` | `body` | `margin: 0` |
| `pui.theme` | `:root` | The Shape, Layout and Typography source variables, opacity, the light mode's colour roles, and the default `color-scheme: light` |
| `pui.theme` | `:root[data-pui-theme=light]`, `[data-pui-theme=light]` | The light mode's colour roles and `color-scheme: light` |
| `pui.theme` | `:root[data-pui-theme=light]`, `[data-pui-theme=light] > *` | The ground roles: focus ring colour, shadow colour and shadow geometry |
| `pui.theme` | `:root[data-pui-theme=dark]`, `[data-pui-theme=dark]` | The dark mode's colour roles and `color-scheme: dark` |
| `pui.theme` | `:root[data-pui-theme=dark]`, `[data-pui-theme=dark] > *` | The ground roles |
| `pui.theme` | `:root:not([data-pui-theme])` | Under `prefers-color-scheme: dark`, the dark mode when `<html>` carries no attribute |
| `pui.base` | `body` | The canvas, the primary ink and the body type role |
| `pui.base` | `:where([data-pui-theme])` | Scope ink: text inside a mode scope takes that mode's primary ink (specificity 0) |
| `pui.base` | `:root[data-pui-theme-swap] *`, `:root[data-pui-theme-swap] ::before`, `:root[data-pui-theme-swap] ::after` | Transitions are instant while the theme changes (`!important`) |
| `pui.base` | `:where(:focus-visible)` | The focus ring baseline: outline width, colour and offset only, no change to corners (specificity 0) |
| `pui.components` | `*`, `::before`, `::after` | Under `prefers-reduced-motion: reduce`, transitions and animations shrink to almost nothing (`!important`); `loop` keeps its own reduced form in an earlier layer |

Under `prefers-contrast: more` the `pui.theme` selectors redeclare the border roles and `ink.tertiary` one step stronger. To opt out of a rule, write an unlayered rule: unlayered CSS beats every layer whatever the specificity or load order, so `:where(:focus-visible) { outline: none }` simply wins.

## What is in the box

<!-- generated:inventory.package -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
|  | Exports |
| --- | --- |
| Primitives, first order | `Box · Text · Icon · FocusScope · VisuallyHidden · Portal · LiveRegion` (and `announce · clearAnnouncements`) |
| Primitives, second order | `Surface · Paint · Pressable · Selectable · SelectableGroup · Floating · Draggable · Droppable · RovingFocus · FormField · Stack · Inline · Grid` |
| Atoms | `Button · IconButton · Field · Textarea · Select · Checkbox · Switch · Radio · Label · Badge · Spinner · Divider · Link` |
| `/tokens` | `tokens`, and the vocabulary: one constant and one type for each axis (`ACCENTS` · `Accent`, `VARIANTS` · `Variant`, `SPACES` · `Space` …) |
<!-- /generated:inventory.package -->

The package stops at primitives and atoms. Product-specific compositions belong
to the consuming app, where their structure and lifecycle can follow the product.
Atoms are built on the Primitives and on shared recipes, and take their colour from the Paint primitives.
`Box` also exposes typed dimension and overflow props; a named size (`md`, `measure.md`,
`container.content`, `full`; the names `xs` to `xl` resolve to the Shape dimension tokens) and an overflow keyword become classes, so a consumer's
className can override them, and only a CSS length that is not a name goes inline.
Stack, Inline and Grid, not Box, take the `gap` family and share one `align` / `justify`
vocabulary.

## How it decides

Two axes run through the colour system: `accent` says what something means
(`primary` plus `info` · `success` · `warning` · `error`) and `variant` says how
much visual weight it carries (`solid` · `soft` · `hairline` · `ghost` · `muted`).
Primary actions are black rather than blue — a blue button on every screen stops
being a point.

Shape is the system's call, not the caller's. What you choose is meaning:
`size`, `status`, `accent`. Where a shape prop does exist it takes a closed
vocabulary — `shape="pill"`, not `radius={10}`.

```tsx
import { Button, Field, Stack } from "@studio-baeks/paper-ui";

export const Confirm = () => (
  <Stack gap="md">
    <Field aria-label="Email" status="error" />
    <Button accent="error" size="md">Delete</Button>
  </Stack>
);
```

<!-- generated:rules.en -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
Eight rules hold the rest together, and eslint enforces them rather than the documentation: no raw colour outside the token sources, source modules isolated behind the token barrel (an app uses the package through its exports and overrides a source with `sourceVars()` instead of naming its variable), no token read through an inline style, no number outside the token sources, every package rule inside a `pui` cascade layer, no internal class name in an app, no hand-named global class, and no `eslint-disable` comment that switches a `paper/*` rule off. The package build, prepublish and CI run those checks.
<!-- /generated:rules.en -->

## Versioning

Versions follow semver. While the package is 0.x, removing or renaming an exported name raises the minor version and adding one raises the patch; from 1.0 on they raise the major and the minor. The repository records every exported name, the token paths, the CSS variables and the cascade layers in `api/surface.json`. `pnpm api:update` rewrites that record, and it refuses to change the record of a released version, or to record a new version whose bump is too small or whose `## <version>` heading is missing from `CHANGELOG.md`.

## Documentation

The principles behind visual decisions and the token reference live in the repository:
<https://github.com/bsiku3622/paper-ui>

## Licence

MIT © Jaewon Baek
