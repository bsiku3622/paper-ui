# Changelog

Every published version has a `## <version>` heading below, newest first. The recorded API surface (`api/surface.json`)
moves only with a version that has one: `pnpm api:update` refuses otherwise.

## 0.1.0

First release. Nothing before it was published: the earlier commits on `origin/main` that also carried the version `0.1.0` were never released, and their token paths and variables promise nothing. The bump gate measures from this release.

- `tokens.shape.selection.size` is a source of its own: Checkbox and Radio boxes no longer follow the control height, and a Switch track is two boxes wide.
- `tokens.typography` is `role` and `preset`. The Palette is not public; its CSS variables stay, and `sourceVars()` still names them.
- Four entries: `@studio-baeks/paper-ui` (components, hooks, `PaperProvider`), `/tokens` (values and vocabulary, no React and no CSS), `/theme-boot` (the first-paint script) and `/styles.css` (the one global stylesheet, in the cascade layer `pui`).
- Foundations: Color, Typography, Shape, Layout and Motion, authored as sources and emitted as CSS variables, with a theme engine for light, dark and system.
- Primitives in two orders: Element, Content and A11y as the ground; Paint, Press, Select, Float, Drag, Focus, Field and Layout as Box plus one capability.
- Fourteen Atoms built on them: Button, IconButton, Field, Textarea, Select, Checkbox, Switch, Radio, Label, Badge, Spinner, Divider, Link and Marker.
- ESM only; peers `react` and `react-dom` `^18.2.0 || ^19.0.0`.
