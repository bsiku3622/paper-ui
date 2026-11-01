# Changelog

Every published version has a `## <version>` heading below, newest first. The recorded API surface (`api/surface.json`)
moves only with a version that has one: `pnpm api:update` refuses otherwise.

## 0.1.0

First release.

- Four entries: `@studio-baeks/paper-ui` (components, hooks, `PaperProvider`), `/tokens` (values and vocabulary, no React and no CSS), `/theme-boot` (the first-paint script) and `/styles.css` (the one global stylesheet, in the cascade layer `pui`).
- Foundations: Color, Typography, Shape, Layout and Motion, authored as sources and emitted as CSS variables, with a theme engine for light, dark and system.
- Primitives in two orders: Element, Content and A11y as the ground; Paint, Press, Select, Float, Drag, Focus, Field and Layout as Box plus one capability.
- Thirteen Atoms built on them: Button, IconButton, Field, Textarea, Select, Checkbox, Switch, Radio, Label, Badge, Spinner, Divider and Link.
- ESM only; peers `react` and `react-dom` `^18.2.0 || ^19.0.0`.
