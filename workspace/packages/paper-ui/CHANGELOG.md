# Changelog

Every published version has a `## <version>` heading below, newest first. The recorded API surface (`api/surface.json`)
moves only with a version that has one: `pnpm api:update` refuses otherwise.

## 0.1.0

First release. Nothing before it was published: the earlier commits on `origin/main` that also carried the version `0.1.0` were never released, and their token paths and variables promise nothing. The bump gate measures from this release.

- Four entries: `@studio-baeks/paper-ui` (components, hooks, `PaperProvider`), `/tokens` (values and vocabulary, no React and no CSS), `/theme-boot` (the first-paint script) and `/styles.css` (the one global stylesheet, in the cascade layer `pui`).
- Foundations: Color, Typography, Shape, Layout and Motion, authored as sources and emitted as CSS variables, with a theme engine for light, dark and system. The first-order systems read only themselves; the second-order recipes (Control, Line, Elevation) tie them together. The control ladder has five rungs, `xs` to `xl` (32 to 48).
- Primitives in two orders: Element, Content and A11y as the ground; Paint, Control, Press, Select, Float, Drag, Focus, Field and Layout as Box plus one capability.
- Sixteen Atoms built on them: Button, IconButton, Field, Textarea, Select (a list Paper draws, over a native select), Checkbox, Switch, Radio, Label, Badge, Spinner, Divider, Link, Marker, SegmentControl (`track` and `outline`) and Slider.
- Type: the titles, from `hero` to `subheading`, stand at one weight (600) and step down by size alone; reading text (`lead`, `body`, `caption`) is 400.
- Motion: roles for press, hover, state, enter, exit, theme and `reveal`, the entrance a screen plays as it loads (`reveal.load`) or scrolls into view (`reveal.scroll`, with `revealAfter` for siblings). Every role stands still under reduced motion.
- State preview: an element with `data-pui-preview` (written by `previewAttributes`), or under one, is drawn hovered, pressed or focused without a pointer or a key, for a gallery of states.
- `tokens.shape.selection.size` is a source of its own: Checkbox and Radio boxes do not follow the control height, and a Switch track is the box's height and a rim, one and a half times as long.
- `tokens.typography` is `role` and `preset`. The Palette is not public; its CSS variables stay, and `sourceVars()` still names them.
- ESM only; peers `react` and `react-dom` `^18.2.0 || ^19.0.0`.
