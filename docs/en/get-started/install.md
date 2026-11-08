# Installation

This is how to attach Paper UI to a React app. One package and one line of stylesheet are enough.

## Package

```bash
pnpm add @studio-baeks/paper-ui
```

Paper UI takes React 18.2 or later, or React 19, as a peer dependency (`^18.2.0 || ^19.0.0`). The package is ESM-only, so it does not support `require`. An app loads it with `import`, and CommonJS code loads it only with a dynamic `import()`. The TypeScript types are bundled into one declaration file per entry, and TypeScript finds that file when `moduleResolution` is one of `bundler`, `node16` or `nodenext`.

The package splits its entries by use. A name comes from one entry only, so you never have to choose the same name from two paths.

| entry | contains |
|---|---|
| `@studio-baeks/paper-ui` | Components, hooks, `PaperProvider` and its prop types. It is code that runs on the client, so it declares the `"use client"` boundary. |
| `@studio-baeks/paper-ui/tokens` | `tokens`, the vocabulary constants (`CONTROL_SIZES` · `SPACES` …) and vocabulary types (`Space` · `Accent` · `Variant` …), and `sourceVars`, which overrides the source ([Overriding sources](#overriding-sources)). Each axis has a constant and a type as a pair, and the list is in [Public vocabulary](../foundations/README.md#public-vocabulary). These are values that import neither React nor CSS. |
| `@studio-baeks/paper-ui/theme-boot` | `themeBootScript`, which applies the theme before the first paint, and `THEME_STORAGE_KEY` · `THEME_ATTRIBUTE`. It imports neither React nor CSS, so build tools and servers load it on its own. It is used in [Theming](theming.md). |
| `@studio-baeks/paper-ui/styles.css` | One global stylesheet. The CSS variables and the component styles are all in it. |

## Loading the styles

Before using a component, import the stylesheet once at the app's entry point. This one line is the only way styles come in. It lays down all the CSS variables (color, size, typography) on `:root` and brings in the component styles with them.

```ts
import "@studio-baeks/paper-ui/styles.css";
```

Components and `PaperProvider` do not import CSS. An app that leaves this line out gets an unstyled screen. During development, `PaperProvider` logs one console warning that the stylesheet is missing.

## Build tools

The published build contains finished JS and CSS, so an app that only uses the package needs no bundler plugin. For a Vite app, the React plugin is enough. With pnpm 11, the build script of esbuild, which Vite uses, is blocked, and the first `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS`. This happens to any Vite app regardless of Paper UI, and writing the permission in `pnpm-workspace.yaml` gets past it.

```yaml
allowBuilds:
  esbuild: true
```

Install vanilla-extract directly only when the app writes its own stylesheet as `.css.ts` (as in the example in [Overriding sources](#overriding-sources)).

```bash
pnpm add -D @vanilla-extract/css @vanilla-extract/vite-plugin
```

Then turn on the plugin in the Vite config.

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({ plugins: [react(), vanillaExtractPlugin()] });
```

If you load a `.css.ts` without the plugin, the build passes, but the moment the screen opens a vanilla-extract error (`Styles were unable to be assigned to a file`) appears.

## Priority

All of the package's CSS rules are inside the cascade layer `pui`. `pui` is divided into five sublayers, and a layer declared later beats an earlier one regardless of specificity.

```text
pui.reset < pui.theme < pui.base < pui.utilities < pui.components
```

`reset` has box-sizing, the body margin and the reset of the part button (`bareButton`); `theme` has the CSS variables; `base` has the document ground (the body's surface, the body role's type, and the focus ring). `utilities` has classes chosen by the names of shared axes, such as surface, ink, spacing, height, type roles, presets, and entrance and repetition (`presence` · `loop`). `components` has the styles of Primitives and Atoms and the reduced motion policy. So the type presets, sizes and colors beat the button reset. Only `@keyframes` and `@property` stand outside the layers.

The app's CSS belongs outside the layers by default. CSS outside the layers beats the package CSS regardless of load order and specificity. So a className the app passes to a component overrides even state rules such as hover and disabled, no matter in what order the stylesheets are loaded. With `!important` it is the other way around: the one inside a layer wins. The `!important` the package applies when the user has reduced motion (reduced motion) is stronger than the app's `!important`.

For the same reason, an app's element reset (for example `button { background: none }`) beats the component styles too if it is placed outside the layers. Put a global reset in a layer declared before `pui`. The order of layers is decided by the order in which they are first declared, so the CSS that holds the declaration below must be loaded before `styles.css`.

```css
@layer reset, pui;

@layer reset {
  button { background: none; }
}
```

## Global rules this stylesheet applies

Almost all of the package's rules apply only to elements that carry a class. The rules that apply to the document or to whole elements without a class are exactly those in the table below, and all of them are inside the `pui` layer. Only `@keyframes` and `@property` stand outside the layers. The statement that `PaperProvider` makes no DOM wrapper is separate from this table: the Provider adds no element, and the rules below apply once the stylesheet is loaded, even without a Provider.

| Layer | Selector | Applies |
|---|---|---|
| `pui.reset` | `*` | `box-sizing: border-box` |
| `pui.reset` | `body` | `margin: 0` |
| `pui.theme` | `:root` | The Shape · Layout · Typography source variables and the opacities, the light mode's color roles, and the default `color-scheme: light` |
| `pui.theme` | `:root[data-pui-theme=light]`, `[data-pui-theme=light]` | The light mode's color roles and `color-scheme: light` |
| `pui.theme` | `:root[data-pui-theme=light]`, `[data-pui-theme=light] > *` | Ground roles: focus ring color, shadow color, shadow geometry |
| `pui.theme` | `:root[data-pui-theme=dark]`, `[data-pui-theme=dark]` | The dark mode's color roles and `color-scheme: dark` |
| `pui.theme` | `:root[data-pui-theme=dark]`, `[data-pui-theme=dark] > *` | Ground roles |
| `pui.theme` | `:root:not([data-pui-theme])` | When `prefers-color-scheme: dark` and `<html>` has no attribute, the dark mode's color roles and `color-scheme: dark` |
| `pui.base` | `body` | The document's surface (`bg.canvas`), ink (`ink.primary`), and the body role's type |
| `pui.base` | `:where([data-pui-theme])` | Scoped ink: type inside a mode scope receives that mode's `ink.primary` (specificity 0) |
| `pui.base` | `:root[data-pui-theme-swap] *`, `:root[data-pui-theme-swap] ::before`, `:root[data-pui-theme-swap] ::after` | Makes transitions instant while the theme is changing (`!important`) |
| `pui.base` | `:where(:focus-visible)` | Focus ring baseline: sets only the thickness, color and offset of `outline` and leaves the corners alone (specificity 0) |
| `pui.components` | `*`, `::before`, `::after` | Under `prefers-reduced-motion: reduce`, the policy that cuts transitions and animations to almost zero (`!important`). The repetition of `loop` keeps its own reduced form with `!important`, in a layer earlier than this policy |

Under `prefers-contrast: more`, the `:root` and mode selectors of `pui.theme` redeclare the three borders and `ink.tertiary` one step higher in the same scope. To turn this rule off, put one rule outside the layers. CSS outside the layers wins regardless of specificity and load order, so `body { margin: 8px }` or `:where(:focus-visible) { outline: none }` applies as written.

## Overriding sources

If you want to change only the size or spacing of one region, override the source, not the role. When you change one source such as a control height in a subtree, the roles built on it are recomputed in place ([Shape › Overriding sources](../foundations/shape.md#overriding-the-source)). `sourceVars()` makes the variable names emitted from the source's path, so you do not have to write variable names as strings.

```ts
import { style } from "@vanilla-extract/css";
import { sourceVars } from "@studio-baeks/paper-ui/tokens";

export const dense = style({
  vars: sourceVars({ shape: { control: { height: { md: "40px" } } } }),
});
```

Paths start from the `shape`, `layout` and `typography` sources; the types block the path of a role, and an unknown path throws at run time. The result goes straight into React's `style` too. The panel of a Floating opened from that region follows the overridden source as well. Color roles are not overridden this way: color is decided by the theme scope ([Theming](theming.md)), and the color of the whole document is changed with the Provider's `color`.

The focus ring color (`--pui-color-interaction-focus`), the shadow color (`--pui-color-shadow-*`) and the shadow geometry (`--pui-layout-shadow-*`) are ground roles, so the package redeclares them on every child of a theme scope (`[data-pui-theme=…] > *`). To change them you therefore need a rule that reaches those children. If you write it only on `:root`, on a page whose `<html>` has a mode (a page that uses the Provider or the boot script), `<body>` redeclares them and the change reaches neither the ring nor the shadow. A rule written on a page whose `<html>` has no mode, on `<body>`, or on a region's wrapper reaches the page under it, but not the children of a themed Surface or the panel of a Floating. The one rule that reaches them all is below, and placed outside the layers it beats the package's declaration regardless of specificity.

```css
:root,
[data-pui-theme] > * {
  --pui-color-interaction-focus: rebeccapurple;
  --pui-color-shadow-floating: rebeccapurple;
}
```

If you write a mode in the selector (`[data-pui-theme="dark"] > *`), it changes only inside the scope of that mode. Use it when you want to split values by the mode of the ground.

## Runtime environments

Paper UI targets both apps that render in the browser (CSR) and apps whose server draws the HTML first (SSR · RSC). What changes per environment is which entry you import what from.

- **CSR** — Use the four entries as in the table above.
- **SSR** — The server draws the components as HTML and the browser attaches to it. The stylesheet must be in the `<head>` of the document the server delivers, so that styles stand from the first paint.
- **RSC** — The root entry is a `"use client"` boundary. A server component imports `tokens` and the vocabulary from `@studio-baeks/paper-ui/tokens`. The components of the root entry render as client components, so the props a server component passes must be serializable values, and hooks are called only inside client components. The class maps (`elevation` · `presence` · `loop`) and the class functions (`surfaceClass` · `paintClass`) are also exports of the root entry, so they belong to the client entry. If a server component imports them it gets a client reference, not a value, so keep the places that need a class inside client components.

## Supported browsers

Paper UI supports Chrome and Edge 125, Firefox 121, and Safari 16.4 (including iOS), and later. The floor for Firefox is set by `:has()`, which Select relies on to show an empty selection. The floor for Safari is the version that introduced `@property`, which gives the transition of the hover tint. The floor for Chrome and Edge is a declared value set higher than what the stylesheet requires now. CSS features newer than the floor are used only as enhancements, and in a floor browser without that feature only the motion is missing.

## First screen

Wrap the app in the Provider and place components. The Provider makes no DOM wrapper, so it does not affect the layout; the theme is applied globally with `<html data-pui-theme>`.

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

The settings `PaperProvider` takes are the theme, the language (`locale`) and the wording (`messages`). `defaultTheme` takes one of `light`, `dark` and `system` (default), and `system` follows the OS setting (`prefers-color-scheme`). The value the user chooses is kept in localStorage under `storageKey` (default `pui-theme`) and wins on the next visit. The boot script that applies it before the first paint and the storage rules are in [Theming](theming.md). `locale` decides the language of the wording Atoms speak for themselves, and is written to `<html lang>` and `<html dir>` only when you pass it. If you do not pass it, it only reads `<html lang>` and does not touch `<html>` ([Theme and language](../primitives/README.md#theme-and-language)).

The values for the whole document are changed in `PaperProvider`. All the roles built on them follow, and the value of an inner Provider beats the outer one. They are applied after the page loads, so an app that draws on the server puts the same values in its stylesheet.

| prop | changes | path |
| --- | --- | --- |
| `shape` · `layout` · `typography` | the source | same as `sourceVars()` |
| `color` | per-mode color roles | the paths of `tokens.color`, under `light` · `dark` |
| `palette` | palette steps. Every role that picked the step follows. A value is a six-digit HEX | the steps under `neutral` · `blue` · `green` · `amber` · `red`, and `marker` |
| `shadow` | per-mode shadow geometry | depth and layer, under `light` · `dark` |
| `opacity` | opacity roles | `disabled` · `subdued` |

Motion and a single type role have no variable, so they are not accepted. Change type with the `typography` source. The types block an unknown path, and it throws at run time.

```tsx
import { PaperProvider } from "@studio-baeks/paper-ui";

export const App = () => (
  <PaperProvider
    shape={{ radius: { control: { md: "10px" } }, control: { height: { md: "40px" } } }}
    color={{ light: { bg: { canvas: "#f3f3f5" } }, dark: { bg: { canvas: "#0c0c0e" } } }}
    palette={{ blue: { "600": "#2f6bff" } }}
    shadow={{ light: { resting: { "0": "0px 2px 8px 0px" } } }}
  >
    …
  </PaperProvider>
);
```

Change colors one role and one palette step at a time. A mode's roles are used where the stylesheet declares them, so they reach the themed Surface and the panel of a Floating as well. Alpha roles follow the palette step while keeping their original strength, and a role written in `color` beats the palette.

There is no setting that tints the whole screen with one color. This system has no `primaryColor`, because identity comes from pure white, black and margins, not from color. The reason is explained in [Philosophy](philosophy.md).

## Theme toggle

When you build a toggle UI yourself, use `useTheme`. `theme` is the user's choice (including `system`), and `resolved` is the `light` or `dark` actually applied.

```tsx
import { Icon, IconButton, useTheme } from "@studio-baeks/paper-ui";

const ThemeToggle = () => {
  const { resolved, setTheme } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  return (
    <IconButton variant="hairline" aria-label={next === "dark" ? "Switch to dark theme" : "Switch to light theme"} onClick={() => setTheme(next)}>
      <Icon>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </Icon>
    </IconButton>
  );
};
```

To keep only part of the screen in a different mode, use a Surface's `theme`, as in `<Surface theme="inverse">`. It is the same engine.

## Fonts

The typeface is part of the Typography contract. The system does not bundle font files, but the weight ladder (400 · 450 · 500 · 600 · 700) is built on the assumption that Pretendard Variable is present. The sans stack puts Pretendard first, because it draws Latin and Hangul as one body so the weights stay balanced; `-apple-system` is a fallback after it. The mono stack uses the OS's monospace typefaces first (ui-monospace · SF Mono · Menlo · Consolas) and falls back to D2Coding for Hangul. The canonical font stacks are in [Typography](../foundations/typography.md#typefaces), and in an app, load the two stylesheets below directly.

The two lines below load Pretendard (v1.3.9) and D2Coding. Both stylesheet URLs pin a version. The D2Coding repository has no release tag, so it is pinned by commit, and the font files that stylesheet points to follow the repository's default branch.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fonts-archive/D2Coding@5ac6fc6fada70f1d8a8561cec826722574c51a6e/D2Coding.css" />
```

The two URLs are the same as the values the package publishes as `FONT_STYLESHEETS` (`@studio-baeks/paper-ui/tokens`). This site also loads exactly these two stylesheets on its pages.

If you do not load the typefaces, the weight ladder collapses. On Windows (Segoe UI · Malgun Gothic), 450 and 500 collapse to 400 and 600 to 700, and on Android (Roboto), 450 collapses to 500 and 600 to 700. macOS keeps most of the steps. Line heights are fixed px values, so even when the weights collapse, the heights and inner padding of controls stay the same and only the difference in weight shrinks. Hangul mono falls back to the system CJK font if D2Coding is missing.

Numeric columns in tables are aligned with `tabular-nums` on sans, not with mono. Monospace is used only in technical places such as code and tokens.

## Verification

`pnpm smoke:dist` checks the promises of this doc in the exact form in which they would go up to npm. It unpacks, in a temporary folder, the tarball made with `pnpm pack` (not the workspace), checks the shape of the exports with publint (`--strict`) and attw (esm-only), compares the CSS features the built stylesheet uses with the floor in [Supported browsers](#supported-browsers), and then builds a React 19 and a React 18.2 consumer app that each install the same tarball. The consumer apps pass `tsc` (with `bundler` and `node16` resolution, `skipLibCheck` off) and the Vite build without vanilla-extract, and Playwright serves the two builds with `vite preview` and checks the following.

The only style a consumer loads is `styles.css`, and with it alone the source variables and the light mode's color roles stand on `:root` and the height of an md Button equals the value in the Shape source.

Every export of the root entry renders or runs without console errors in both Reacts. The list that is checked is `INVENTORY`, and if the harness leaves out a name on the list, the verification fails. The `install.layers.app-css-wins` in [Priority](#priority) above is also checked in the same consumer app.

`/tokens` and `/theme-boot` import no React and carry no `"use client"`. The verification reads the imports of the two entries and the chunks they call, and actually loads the two entries in Node with the `react-server` condition. The first statement of the root entry is `"use client"`. The rules the stylesheet keeps at the selector level are the same as the table in [Global rules this stylesheet applies](#global-rules-this-stylesheet-applies), and the same verification compares them with the built `dist/paper-ui.css`.

## Record of public names

The names the package exports are recorded in `packages/paper-ui/api/surface.json`. It holds the values and type names of the four entries, the leaf paths of `tokens`, the names of the CSS variables and layers the stylesheet emits, and the version, and `api.test.ts` checks that it equals the values computed from the source. When a name appears, disappears or moves, fix the record with `pnpm api:update` in the same change, and that diff reads as an API change in review.

The record of an already released version (`api/released/<version>.json`) cannot be changed, and `pnpm api:update` refuses an attempt to change that version's names. The new version must be bumped to fit the change: in 0.x, minor if a name disappears or changes and patch if names are only added; after 1.0, major and minor respectively. A new version must also have a `## <version>` heading in `CHANGELOG.md`. Just before publishing (`prepublishOnly`), that version's record is left in `api/released/`. The record of a pre-release (`x.y.z-alpha` · `x.y.z-beta` · `x.y.z-rc.n`) is pinned in the same way, but it promises no names to the next version, so the bump is measured from the last stable version. This check measures from the first release. While `api/released/` is empty there is no baseline to measure against, so `pnpm api:update` fixes the record as it is. The current version 0.1.0 is that first release.
