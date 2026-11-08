# Paper UI demos

Eight small apps drawn with `@studio-baeks/paper-ui` alone, to show what the design system looks like when it carries a whole
screen and not a single part: an admin console, a Markdown typesetter (Paperdown), a canvas notebook (Doodle), a photo
straightener (GridPhoto), a music player, a school course explorer (Class Explorer), a wiki and a 3D-printer console. The site
shows them on its `/demo` page, each in an iframe of `/demos/<id>/`.

Everything in them is invented. The people, devices, addresses, files, songs, lyrics and articles are made up for these demos
(addresses use the reserved example ranges and names), nothing talks to a server, and what a visitor does is kept in the
browser's `localStorage`. The one real thing in the school app is the school's public course catalogue and exam timetable.

## Layout

```
src/
  main.tsx        mounts the router and the Paper provider
  App.tsx         routes: the launcher at /, each app under /<id>/
  launcher/       the index of the eight apps
  kit/            the parts the apps share (shell, sidebar, tabs, stats, art, toast, glyphs …), written with Paper's parts
  apps/
    registry.ts   the list of apps the launcher shows
    <id>/         one folder per app: App.tsx, its pages, its data
```

The kit is not part of the package. It holds what an app screen needs and Paper has no part for yet (a navigation sidebar, a
menu, a toast, a meter, generated pictures); each of those is a few lines of Paper's own parts and tokens.

The demos follow the same lint rules as the site: no colour literals, no tokens through `style`, spacing, shape, depth, type and
time chosen by role. Run them from `workspace/`:

```sh
npx eslint "demos/src/**/*.{ts,tsx}" --max-warnings 0
npx tsc --noEmit -p demos
```

## Run

From `workspace/`:

```sh
pnpm --filter @paper-ui/demos dev
```

and open <http://localhost:5310/demos/>. Through the site's dev server (`pnpm --filter @paper-ui/app dev`) the same apps are
served at `/demo`, which proxies `/demos/` to this one.

## Build

```sh
pnpm --filter @paper-ui/demos build
```

builds into `app/dist/demos`, inside the site's own `dist`, so the site and its demos deploy as one. Add `?theme=light` or
`?theme=dark` to any demo address to open it in that theme; in the site's frame the page chooses it.

## Icons

`src/kit/glyphs.ts` is the path data of [Lucide](https://lucide.dev) icons, which Paper's `Icon` draws. Lucide is under the ISC
licence (and the icons derived from Feather under MIT); the file carries both licence texts at its top, and they stay with it.
