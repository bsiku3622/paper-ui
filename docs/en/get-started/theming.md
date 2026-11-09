# Theming

Paper UI's theme distinguishes two things. The **choice** is the `light`, `dark` or `system` that the user picked, and the **mode** is the `light` or `dark` actually applied to the screen. If the user chooses `system`, the OS setting (`prefers-color-scheme`) decides the mode.

The canonical source of the mode is one attribute, `<html data-pui-theme>`. The stylesheet and the hooks both read this attribute, and if the attribute is absent they follow the OS setting ([Color](../foundations/color.md#theme-scope)). Three parties write the attribute: the boot script in `<head>`, `PaperProvider`, and an external theme manager.

## Provider and storage

`PaperProvider` stores the choice and writes the chosen mode to `<html>`. It makes no DOM wrapper and imports no stylesheet.

```tsx
<PaperProvider defaultTheme="system" storageKey="pui-theme">…</PaperProvider>
```

| prop | default | meaning |
|---|---|---|
| `defaultTheme` | `system` | The choice before the user picks one. If there is a stored value, that value wins |
| `storageKey` | `pui-theme` | The localStorage key that holds the choice. If `null`, nothing is stored |
| `controlShape` | none | The default corner of every control in the app: sharp · small · rounded · pill. The `shape` given to a control wins ([Shape](../foundations/shape.md#radius)) |

The choice is written to localStorage under `storageKey` only when `setTheme` is called. If `storageKey` is `null`, the storage is neither read nor written, and the choice stays only on that page. Even when storage is blocked (private mode and the like), it works the same way without errors.

A document has only one theme store. However many `PaperProvider`s you nest or place side by side, they attach to that one store and see the same choice and the same mode. When the last Provider disappears, the attribute on `<html>` returns to the value it had before the Provider attached. If you place Providers with different settings, the one that set first wins, and one error is logged during development.

## Applying it before the first paint

The Provider writes the attribute only after the app has run, so by itself a user of a dark screen briefly sees a light one. Putting the short inline script that `themeBootScript` of `@studio-baeks/paper-ui/theme-boot` makes at the very start of `<head>` removes this gap. It is an entry that imports neither React nor CSS, so build tools and servers load it on its own.

The boot script writes `<html data-pui-theme>` before the app's JavaScript runs. If there is a stored choice, that choice decides; if not, `defaultTheme` does; and for `system` it follows the OS setting. So a stored `light` beats a dark OS.

The options must be the same as the Provider's. Pass the same `storageKey` and `defaultTheme` to both places.

In Vite, insert it with `transformIndexHtml`.

```ts
import { defineConfig } from "vite";
import { themeBootScript } from "@studio-baeks/paper-ui/theme-boot";

export default defineConfig({
  plugins: [
    {
      name: "theme-boot",
      transformIndexHtml: () => [{ tag: "script", children: themeBootScript(), injectTo: "head-prepend" }],
    },
  ],
});
```

For SSR, put it in the document's `<head>` as an inline `<script>`. The script adds the attribute to the `<html>` the server drew, so give `<html>` `suppressHydrationWarning`. An app that uses a CSP attaches a nonce or hash to this script.

```tsx
import { themeBootScript } from "@studio-baeks/paper-ui/theme-boot";

export const Document = ({ children }: { children: React.ReactNode }) => (
  <html lang="ko" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: themeBootScript() }} />
    </head>
    <body>{children}</body>
  </html>
);
```

## External theme managers

Because the attribute is canonical, even if another theme manager only writes `<html data-pui-theme="dark">`, the stylesheet and `useResolvedTheme` follow. The Provider writes its own choice once when it attaches, and after that it reads, without reverting, an attribute written by another party. If the server knows the theme from a cookie, it is most accurate for the server to write that value directly to `<html data-pui-theme>`.

## Hooks

| hook | Provider | returns |
|---|---|---|
| `useTheme()` | inside only | `theme` (the choice, including `system`) · `resolved` (the mode `<html>` shows) · `setTheme(choice)` |
| `useResolvedTheme()` | anywhere | The mode of the nearest Surface `theme`; if none, the Provider's mode; if none, the `<html>` attribute (if there is no attribute, the OS setting) |

Calling `useTheme` outside a Provider is an error, because the Provider is the owner that changes the choice. `useResolvedTheme` only reads, so it answers the actual mode even without a Provider.

Server rendering cannot read `<html>`, so it answers with the Provider's `defaultTheme`, and with `light` if that is `system`. A window without `matchMedia` also answers `light`. It redraws once with the actual mode right after hydration.

## Flipping only part

To keep only one part of the screen in a different mode, use the Surface's `theme`. `light` and `dark` are fixed, and `inverse` is the opposite of the surroundings. The detailed rules are in [Paint](../primitives/paint.md#surface--the-plane).

```tsx
<Surface theme="inverse" padding="lg" radius="md">
  <Text variant="heading">A surface in the opposite theme</Text>
</Surface>
```

## Instant switching

For the frame in which the mode changes, `<html>` carries the `data-pui-theme-swap` attribute, and during that time the transitions of all elements end instantly (Motion's `theme` role). So buttons, inputs and switches do not change later than the page. This holds not only when the Provider writes, but also when the mode of a Surface's `theme` or of a layer opened by Floating changes, when an external theme manager writes the attribute, and when the OS setting the Provider follows changes. The transitions of other libraries on the page also stop for that frame.

On a page without a `PaperProvider`, there are two transitions that cannot be bound. When the OS setting changes, `<html>` has no attribute, so the stylesheet's media query changes the mode immediately, and Chromium and WebKit notify scripts of that change only after they have recomputed styles. And on a page without any component that reads the theme (`useResolvedTheme`, a Surface's `theme`, an open Portal), nobody listens even if the attribute is written from outside. In both cases the surfaces change at once and the controls follow later by their own transition time. To bind these transitions too, place a `PaperProvider`: when there is a Provider, `<html>` always has an attribute, so changing the mode is the Provider's write, and that write binds the transition.
