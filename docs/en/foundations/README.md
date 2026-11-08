# Overview

Foundations define every value used on screen. Color, type, shape, layout and time each form one system, and anything that spans more than one is handled by a composition on top of them. Primitives and Atoms only choose these values. A component never writes a number or a color of its own.

## First order and second order

Foundations come in two orders, like Primitives. The **first order** is five systems, each with only its own source and its own roles. The **second order** is where two or more systems are joined. A single line needs Shape's thickness and Color's color before it can be drawn, and a control size needs Shape's height and Typography's text line before it can be set, so neither belongs to any one system.

```text
First order    Color · Typography · Shape · Layout · Motion
                ↓
Second order   Line · Control · Elevation · Motion displacement · State
                ↓
Primitives → Atoms
```

A first-order system does not read the values of another system. There is one exception: the length scale lives in Shape and Layout's gaps are chosen from the same scale, so Layout reads Shape. The mode names (`color-modes`) and the control size names (`control-sizes`) are names, not values, so any system may read them, and imports that bring in only types do not bind values, so they are not counted.

Second-order files read the first order and do not lean on each other, and the first order does not read the second. There is one exception: the distance a press sinks is stated by a Motion role, so State reads Motion displacement.

| First-order system | What it decides | Source |
|---|---|---|
| [Color](color.md) | Surfaces, inks, borders, semantic colors, state tints | `tokens/palette.ts` |
| [Typography](typography.md) | Typefaces, sizes, weights, leading, tracking, type roles | `tokens/typography.ts` |
| [Shape](shape.md) | Radius, stroke, focus ring, size and inner padding of a single element | `tokens/shape.ts` |
| [Layout](layout.md) | Gaps between siblings, page frame, breakpoints, stacking order, shadow geometry | `tokens/layout.ts` |
| [Motion](motion.md) | Transition durations, curves, motion for each situation | `tokens/motion.ts` |

The boundary between Shape and Layout is drawn by one question: **does it remain if you put only that one element on an empty canvas?** A button's radius, height and inner padding are visible with the button alone, so they are Shape. The gap between siblings and the stacking order only exist once there is a second element or a screen, so they are Layout.

| Second order | What it joins | File |
|---|---|---|
| [Line](#line) | Color border + Shape thickness + solid · dashed | `tokens/line-recipes.ts` |
| [Control](#control) | Shape controls + Typography text line | `tokens/control-recipes.ts` |
| Elevation | Layout tier and shadow geometry + Color shadow color | `tokens/elevation-recipes.ts` |
| Motion displacement | Motion time + Shape · Layout lengths | `tokens/motion-recipes.ts` |
| State | Color state + Motion + Shape, focus ring | `tokens/state-recipes.ts` |

### Line

A single line is assembled here. `lineFrame` returns the thickness and the style, and `lineRule` returns the finished form with the color added. You choose `side` (top · bottom · start · end; omitted means all the way around), `style` (solid · dashed), `weight` (border · emphasis) and `level` (base · strong · hover). These are logical properties, so they flip by themselves in RTL. No colors are added: the line on a surface is the single `border.base`, and the levels are names Color already has.

```ts
import { style } from "@vanilla-extract/css";
import { lineRule } from "@studio-baeks/paper-ui/tokens";

export const topbar = style({ ...lineRule({ side: "bottom" }) });
```

### Control

What one size means across Shape and Typography is decided here. The inner padding is the control height minus the text line, and the top and bottom padding of a Textarea and the place where a Select's value stops follow the same formula. The numbers live in each system's source, and only the formula is here. The resolved values are guarded by `tokens/__golden__/control-resolved.json`, and the path to look them up is `tokens.shape.control.inset`, the same as for the other control roles. The Primitive that uses these values is [Control](../primitives/control.md).

## Source → role → composition

The first-order systems are built in the same three steps, and the differences are in the table below. Numbers and colors are written once in the source, components and apps choose roles, and roles are combined into the finished forms that a single component uses.

| System | Source | Roles | Composition |
|---|---|---|---|
| Color | OKLCH Palette → HEX Palette Token | `bg` · `ink` · `border` · `accent` · `interaction` … | accent × variant profile |
| Typography | Typography Palette | Type roles `hero` to `label` | Control preset · code · emphasis rule |
| Shape | `SHAPE_SOURCE` | `inset` · `radius` · `control` · `selection` … | Shape recipe |
| Layout | `LAYOUT_SOURCE` | `gap` · `gutter` · `container` · `breakpoint` · `section` | elevation class · Surface `elevation` |
| Motion | duration · easing · loop | `press` · `hover` · `state` · `enter` · `exit` · `theme` | `transition()` · `presence` · `loop` |

The Playground's [Foundations](/playground/foundations/color) pages show each system in this same order: source, roles, compositions, from the top. Only Color keeps its earlier form (the Palette matrix and the value card for each role), and the accent × variant table at the bottom stands in for the composition step. Every row on every page is derived from the source, so adding a role or a step makes the page follow.

## Naming contract

From the source to the screen, names come from the same place. The values a person writes are `SOURCE`, the tree that turns them into CSS values is `VALUES`, the object of variable references that an app chooses from is `tokens.<system>`, and the finished forms that combine roles live in `<system>-recipes.ts`. The table below lists the files where each system's three steps sit. For a system whose composition is not yet split into `<system>-recipes.ts`, the file where that composition lives now is listed.

```text
SOURCE  →  VALUES  →  roles (tokens.<system>)  →  compositions (<system>-recipes.ts)
dp·em·color  CSS values   var() references          finished forms without numbers
```

The prefix of `VALUES` is passed as an argument. `buildVarTree(TYPOGRAPHY_VALUES, ["typography"])` makes `--pui-typography-palette-*` names, and the same tree is walked with `walkValues()` to bake the `:root` variables. So one copy of the tree yields both the CSS names and the TS paths.

| System | Files |
|---|---|
| Color | `tokens/palette.ts` · `tokens/colors.ts` · `tokens/color-modes.ts` · `tokens/color-recipes.ts` |
| Typography | `tokens/typography.ts` · `tokens/typography-recipes.ts` · `styles/typography.css.ts` |
| Shape | `tokens/shape.ts` · `tokens/shape-recipes.ts` |
| Layout | `tokens/layout.ts` · `tokens/elevation-recipes.ts` · `styles/elevation.css.ts` |
| Motion | `tokens/motion.ts` · `tokens/motion-recipes.ts` · `styles/motion.css.ts` |
| Line | `tokens/line-recipes.ts` |
| Control | `tokens/control-sizes.ts` · `tokens/control-recipes.ts` · `primitives/control/Control.css.ts` |
| State recipes | `tokens/state.ts` · `tokens/state-recipes.ts` · `styles/states.css.ts` |

Some places are built differently from system to system on purpose. Forcing the shapes to match would distort how they are used, so the differences and the reasons are collected in one table.

| System | Difference | Reason |
|---|---|---|
| Color | Roles are baked in two sets, light and dark. | When the theme changes, only the values of the same-named variables change, so consumers do not branch on the theme. |
| Color | The source is `OKLCH_PALETTE` in `tokens/palette.ts`, and `COLOR_VALUES` is not a source but roles. | The source of a color is a single coordinate, and a role comes from a selection table (`COLOR_SELECTION`) that picks that coordinate for each mode. |
| Motion | There is no `VALUES`; the source (`DURATION` · `EASING` · `LOOP`) is already the CSS string. No variables are baked. | Duration and easing are hard to reduce to a single variable, so the stylesheet assembles the transition string at build time. Displacement is a length, so it points at Shape · Layout variables. |
| Composition | What is public differs per system. Typography's rules, Motion's `transition` and the state fragments are public through `/tokens`; Shape recipes and Color profiles stay inside the package. | Only what an app stylesheet may need is made public. A Shape recipe is the form of an Atom and a Color profile belongs to the Paint layer, so if apps read them, that boundary leaks. |
| Layout | `LAYOUT_VALUES` bakes only `container` and the stacking order of `elevation`. | Gap and gutter are aliases that point at Shape's space, and breakpoints stay as values because a media query cannot read a variable. The shadow geometry is baked separately per mode (`LAYOUT_MODE_VALUES`). |
| Typography | Only roles and presets are public, and emphasis is public as a rule. | `tokens.typography` is `role` and `preset`, and the Palette is their source, so it is not in the public tree. The CSS variables `--pui-typography-palette-*` are still baked, so `sourceVars` can override them. Emphasis inside text is chosen by `emphasisRule()` using the Palette's weight names (`regular` · `medium` · `semibold` · `bold`), and the underline offset of a link is held by `linkStyle`. |
| Motion | Only roles are public. | Duration, easing and loop are Motion's source, so they are not in `tokens.motion`. Components choose a role and assemble it with `transition(role, …properties)`, so no property picks its own duration. |

The substance of a class lives in `styles/` and `resolvers/` only chooses from that typed map, so `styles/` does not import `resolvers/`.

## The token layer and its door

The source (`SOURCE`), the `VALUES` tree and the helpers that make names live only inside `tokens/`. The one door the rest of the package reads through is the barrel `tokens/index.ts`, and what comes out of it is only roles (`tokens`), vocabulary and compositions (recipes · rule functions · state fragments).

Every export of the barrel is listed in `tokens/barrel.test.ts` as one of: a vocabulary pair, a composition function, a name (attribute · selector · system color), a composition object, or a documented value role. The leaves of the role tree are either variable references or expressions over variables. The only places where the value is the role itself are the breakpoints (`tokens.layout.breakpoint`), the fluid section (`tokens.layout.section`), and Motion's times and curves (`tokens.motion` and `MOTION` · `MOTION_LOOPS` · `MOTION_REDUCED`), and the test writes down the reason for each. If a source, `VALUES` or a helper is put on the barrel, the test blocks it.

The only place that has to show the source as it is, is the Playground's Foundations inspector. Each system has a read-only re-export (`tokens/inspect/<system>.ts`), which the app's Vite and tsconfig resolve with one alias (`@paper-ui/inspect/<system>`). The package does not import this folder and it is not in the published build. The way to override values is a single one on the other side: [`sourceVars()`](shape.md#overriding-the-source).

## How a value reaches the screen

A leaf of the `tokens` object is not a value but a CSS variable reference. `tokens.color.bg.raised` is not a white value but `"var(--pui-color-bg-raised)"`, and the actual value is baked once by `tokens/variables.css.ts` into `:root` and the theme scopes. When the theme changes, only the variable values change, so consumers do not branch on the theme.

```text
source values tree
   │  walkValues() / buildVarTree() — same tree, same naming rule
   ├──► tokens/variables.css.ts   :root { --pui-color-ink-primary: … }
   └──► tokens object             tokens.color.ink.primary = "var(--pui-color-ink-primary)"
```

The variables the stylesheet emits are the source and nothing else. The paths from walking the Shape · Layout · Typography source trees match, without remainder, the names of the variables that do not depend on the mode. Light and dark have the same variables. Every `var()` that `tokens` points at is actually emitted. And the path of a role never becomes a variable name.

Two outputs walk the same tree with the same helper, so a variable name and a TS path cannot drift apart. That is also why the list of axes is not written out by hand but the whole tree is walked: a hand-written list silently drops an axis when one is added, and a missing variable falls back to its initial value without an error.

The variables the browser computes are also the variables that are emitted. The source, the opacities and the color roles of the current mode that `:root` holds match the values `themeVariables()` declares, and a scope with `data-pui-theme` has that mode's own roles on its own element and the ground roles on its children.

The range that is baked differs per system.

- **Color** bakes the whole set of semantic roles in two sets, light and dark. If `<html>` has no attribute, the OS setting decides the mode, and a theme scope (`[data-pui-theme]`) puts that mode's own roles on its own element. Roles drawn on the ground, such as the focus ring color and the shadow color, change from the scope's children on. Opacity is baked once as a value that does not depend on the theme.
- **Typography** bakes the Palette, and type roles and control presets are classes that combine Palette variables.
- **Shape · Layout** bake only the source. A role is an alias of a source variable or a `calc()` expression computed on the element that uses it, so when one source is overridden in a subtree, every role above it is recomputed in place. The geometry of shadows differs per mode, so it is baked as per-mode source variables, and the shadow value is assembled on the element that uses it by joining the geometry variables and the shadow color. For layers moved by a Portal (a Floating's panel and backdrop), the source that the opening place overrides is placed on the root and follows. A layout value that needs a number at run time takes a gap step name and is measured where it is used.
- **Motion** is not baked into variables. Duration and easing are hard to reduce to one variable, so the stylesheet assembles the transition string with `transition()` at build time, and displacement points at Shape · Layout variables. Entrance, exit and loops are applied with the `presence` and `loop` classes.

## State recipes

How hover, press, selected, disabled and keyboard focus look is not a system but a composition. Color decides the colors of surfaces and lines, Shape decides the shape of the ring, Motion decides the transition time, and the state recipes (`tokens/state-recipes.ts`) bind those values to state attributes and hand them out as style fragments. The names of states (`data-active` · `data-selected` …) are written only in `tokens/state.ts`, and every selector in the recipes is built from there.

| Fragment | What it does |
|---|---|
| `focusRing` | Keyboard focus ring — `focus.width` · `focus.offset` and `interaction.focus` |
| `stateStyle.focusVisible` | The ring owner turns off the native outline and draws the ring on `data-focus-visible` |
| `stateStyle.disabled` · `disabledCursor` | Disabled — `opacity.disabled` and a not-allowed cursor |
| `stateStyle.press` | A 1px press |
| `stateStyle.tinted` · `item` | Tint over a surface — hover · press · selected |
| `stateStyle.field` | Border per status of an input box, and its hover border |
| `stateStyle.dropTarget` | Border of a drop target |
| `stateStyle.hoverUnderline` | Underline that shows only on pointing — a Link with `underline="hover"` |
| `linkStyle` | A link where the Link Atom cannot be drawn — an `a` the stylesheet reaches |

Fragments are plain objects and go out through `/tokens`. No fragment decides a transition, so you tie it up yourself with `transition()` to match the properties the element uses. The fragments that paint color (`tinted` · `item` · `field` · `dropTarget`) are spread by the paint layer and by apps outside the package, and the only colors painted in forced-colors are system colors (`SYSTEM_COLORS`). The priority is disabled > press > selected > hover. Hover shows only in environments where the pointer can hover (`@media (hover: hover)`) and only on targets that are not blocked, and since it is the weakest state it adds no specificity to the selector.

The tint is one property, `--pui-state-tint`. `styles/states.css.ts` registers it as `<color>`, non-inheriting, with a transparent initial value so that it can transition, and the rules change only this variable, so they never touch the surface color. In a browser that cannot use `@property`, the tint still appears but does not blend. The baseline for the keyboard ring (`:where(:focus-visible)`) is in the same file, and its rule is decided by [Shape](shape.md#stroke--focus).

The places where states are written are fixed, and a test that sweeps the whole package source (`styles/states.test.ts`) guards them. `:hover` · `:active` · `:focus-visible` selectors exist only in the state recipes (`tokens/state-recipes.ts`), the ring baseline (`styles/states.css.ts`) and the paint layer (`primitives/paint/` and the accent × variant map `styles/color.css.ts`), and the spelling of states, values and marker attributes (`data-*`) exists only in `tokens/state.ts`. Everything else calls the recipes and the selector helpers, so the name a component sets and the name the stylesheet reads cannot drift apart.

## Public vocabulary

A closed set of values that a prop accepts is called an **axis**. Each axis is published as a pair, one constant and one type, and apps use this pair instead of rewriting the list by hand. Every pair comes from `@studio-baeks/paper-ui/tokens`, and each pair is defined once in its own system's file, and `tokens/vocabulary.ts` collects and re-exports them.

| Pair (constant · type) | Defined in | Props · tokens paths that use it |
|---|---|---|
| `STATUSES` · `Status` | `tokens/colors.ts` | `status` of Field · Textarea · Select |
| `CHOICE_STATUSES` · `ChoiceStatus` | `tokens/colors.ts` | `status` of Checkbox · Radio · Switch — a subset of `STATUSES` (`error`) |
| `ACCENTS` · `Accent` | `tokens/colors.ts` | `accent` of Button · IconButton · Badge, `tokens.color.accent.<accent>` |
| `ACCENT_TONES` · `AccentTone` | `tokens/colors.ts` | `tokens.color.accent.<accent>.<tone>` |
| `VARIANTS` · `Variant` | `tokens/color-recipes.ts` | `variant` of Button · IconButton · Badge |
| `SELECTABLE_VARIANTS` · `SelectableVariant` | `tokens/color-recipes.ts` | Variants that can show the selected state with a soft surface — a subset of `VARIANTS` |
| `SURFACE_FILLS` · `SurfaceFill` | `tokens/colors.ts` | `fill` of Surface, `fill` of Field · Textarea · Select (raised · sunken), `tokens.color.bg.<fill>` |
| `INK_LEVELS` · `InkLevel` | `tokens/colors.ts` | `tokens.color.ink.<level>` |
| `INKS` · `Ink` | `tokens/colors.ts` | `ink` of Text · Icon — `INK_LEVELS` and `STATUSES`, plus `inherit` |
| `BORDER_LEVELS` · `BorderLevel` | `tokens/colors.ts` | `tokens.color.border.<level>` |
| `DIVIDER_LEVELS` · `DividerLevel` | `tokens/colors.ts` | `level` of Divider — a subset of `BORDER_LEVELS` |
| `DEPTHS` · `Depth` | `tokens/colors.ts` | `tokens.color.shadow.<depth>`, the shadow depths that Layout elevation has |
| `COLOR_MODES` · `ColorMode` | `tokens/color-modes.ts` | The mode that binds one set of color roles and the shadow geometry — light · dark |
| `THEME_PREFERENCES` · `ThemePreference` | `tokens/color-modes.ts` | The theme a user chooses — the two modes and `system`. `defaultTheme` of `PaperProvider`, `useTheme().theme` |
| `SURFACE_THEMES` · `SurfaceTheme` | `tokens/color-modes.ts` | `theme` of Surface — the two modes and `inverse`, the opposite of the surroundings |
| `TEXT_VARIANTS` · `TextVariant` | `tokens/typography.ts` | `variant` of Text, `tokens.typography.role.<variant>` |
| `TEXT_FAMILIES` · `TextFamily` | `tokens/typography.ts` | `family` of Text |
| `CONTROL_SIZES` · `ControlSize` | `tokens/typography.ts` | `size` of a control |
| `CONTROL_FONT_SIZES` · `ControlFontSize` | `tokens/typography.ts` | `fontSize` of a control — the subset of `TEXT_VARIANTS` that a control box can hold |
| `CONTROL_PRESETS` · `ControlPreset` | `tokens/typography.ts` | `tokens.typography.preset.<preset>` |
| `EMPHASES` · `Emphasis` | `tokens/typography.ts` | Argument of `emphasisRule()` — a subset of the Palette's weight names |
| `SPACES` · `Space` | `tokens/shape.ts` | `padding` of Box, `gap` of Stack · Inline · Grid, `rowGap` · `columnGap` of Inline · Grid, `tokens.shape.inset.<space>`, `tokens.layout.gap.<space>` |
| `DIMENSIONS` · `Dimension` | `tokens/shape.ts` | Named values of `width` · `height` of Box, `tokens.shape.dimension` |
| `MEASURES` · `Measure` | `tokens/shape.ts` | The `measure.<measure>` width of Box, `tokens.shape.measure.<measure>` |
| `ICON_SIZES` · `IconSize` | `tokens/shape.ts` | `size` of Icon, `iconSize` of IconButton — a subset of `TEXT_VARIANTS` |
| `CONTROL_SHAPES` · `ControlShape` | `tokens/shape.ts` | `shape` of Button · Badge · Field · Select |
| `SURFACE_RADII` · `SurfaceRadius` | `tokens/shape.ts` | `radius` of Surface — the steps of `radius.surface` and `full` |
| `ELEVATIONS` · `Elevation` | `tokens/layout.ts` | `elevation` of Surface, the keys of the `elevation` class map |
| `BREAKPOINTS` · `Breakpoint` | `tokens/layout.ts` | `tokens.layout.breakpoint.<breakpoint>` |
| `CONTAINERS` · `Container` | `tokens/layout.ts` | The `container.<container>` width of Box, `tokens.layout.container.<container>` |
| `ALIGNS` · `Align` | `tokens/layout.ts` | `align` of Stack · Inline · Grid (Stack excludes `baseline`) |
| `JUSTIFIES` · `Justify` | `tokens/layout.ts` | `justify` of Stack · Inline · Grid — distribution on the main axis |
| `JUSTIFY_ITEMS` · `JustifyItem` | `tokens/layout.ts` | `justifyItems` of Grid — horizontal alignment inside a cell |
| `ORIENTATIONS` · `Orientation` | `tokens/layout.ts` | `orientation` of Divider, `orientation` of RovingFocus (with `both` added) |
| `MOTION_ROLES` · `MotionRole` | `tokens/motion.ts` | `tokens.motion.role.<role>`, the first argument of `transition()` |
| `STATE_NAMES` · `StateName` | `tokens/state.ts` | Names of state attributes (the argument of `stateSelector()`) — active · focused · focusVisible · focusWithin · selected · disabled · invalid · required · dragging · dropTarget. Attribute names are written in this one file only |

A new axis is either derived from the source tree or tied in both directions with `satisfies`, and published in `vocabulary.ts` as a constant and type pair. For an axis derived from the source tree, adding a step grows the constant and the type together; for an axis tied with `satisfies`, the type check blocks the change if only one side grows.

## Using it in an app

An app imports `tokens` from `@studio-baeks/paper-ui/tokens` and chooses roles in its stylesheets. This entry imports neither React nor CSS, so it is used by the same path in server components and in stylesheets alike. The example below builds one panel.

```ts
import { style } from "@vanilla-extract/css";
import { elevation } from "@studio-baeks/paper-ui";
import { tokens, transition } from "@studio-baeks/paper-ui/tokens";

export const panel = style([elevation.overlay, {
  padding: tokens.shape.inset.lg,
  borderRadius: tokens.shape.radius.surface.lg,
  border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`,
  background: tokens.color.bg.raised,
  transition: transition("hover", "background-color"),
}]);
```

An app that writes its stylesheets as `.css.ts`, as in the example, installs `@vanilla-extract/css` and a bundler plugin (for example `@vanilla-extract/vite-plugin`) itself. The package uses vanilla-extract only at build time, and the published build contains only the finished CSS (`styles.css`).

Inner padding is chosen from `tokens.shape.inset`; the space between siblings, margins and position offsets from `tokens.layout.gap`; and position, z and shadow are attached all at once by the single `elevation` class. `elevation` is a class map, so it comes from the component entry (`@studio-baeks/paper-ui`), not from `/tokens`. A media query cannot read CSS variables, so `tokens.layout.breakpoint` is a value like `"48em"`. Dimensions that exist only on that screen, such as a sidebar width or a grid track, the app writes itself.

There is one order for choosing styles. First choose by the props of Primitives and Atoms. A static value the props do not have, a state selector or a media query is written with `style()` and `styleVariants()` in a `.css.ts`, and descendants are chosen by a selector under your own class, like ``globalStyle(`${scoped} …`)``. Breakpoints come from `tokens.layout.breakpoint`, the page frame from `container.content` and `layout.gutter`, and reading widths from `shape.measure`. Inline style is only for values decided at run time, such as a position, a percentage, or a display value that differs per item, and is never used to inject tokens. No hand-named global classes are made; text is chosen with `Text` roles or `typographyRule` · `codeRule` · `emphasisRule`, and opacity with the `tokens.color.opacity` roles. The only lengths an app writes directly are the dimensions of that screen: widths, heights and grid tracks.

## The build enforces the rules

Principles are guarded by eslint, not by a reviewer's memory. The name after each rule is the eslint rule that enforces it. The paths a rule reads and its exceptions are all declared in `eslint-rules/manifest.js`, and the names and summaries of the rules are also kept there, in its `RULES`. Exceptions are not made with comments.

1. **No raw color values** (`paper/raw-color`). The only source of color is the OKLCH coordinates in `tokens/palette.ts`, and HEX is generated by `tokens/color-ladder.ts`. No file writes a color literal by hand — HEX, color functions such as `oklch()`, named colors and CSS system color keywords in a place that takes a color are all blocked. Places that take a color are properties that take a color (including computed keys read in the same file as a shorthand property), variables in `vars`, computed keys whose name cannot be read, and DOM style writes. Values are followed within one file — names, tables and functions, and what is passed to a parameter (call arguments · JSX props · `.map` · `.forEach` · items of `styleVariants`) are read, as are strings passed to a function that cannot be read inside a style call. System colors go through `SYSTEM_COLORS`. In the package, the only places that read `tokens.color` are the paint layer (`primitives/paint/`), the class maps in `styles/`, and the Icon's ink (`COLOR_OWNERS` in `manifest.js`; `primitives/orders.test.ts` and `atoms/color-ownership.test.ts` are the backstop).
2. **Source isolation** (`paper/source-isolation`). The only place that reads source values is the token layer (`tokens/`). The rest of the package enters only through the tokens barrel (`tokens/index.ts`) (an import of `variables.css` with no bindings and `layers.css`, which holds names only, are exceptions; `tokens/inspect` is not imported), and apps and fixtures do not import package source but use only the exports (the one boot script that `vite.config` reads is `TOOLING` in the manifest). The Foundations inspector reads its own single system through `@paper-ui/inspect/<system>` and shows it only as text or through the kit's display parts (`Swatch` · `Meter` …), and those values never reach `style` · `className` or the props of package components. A `--pui-` variable is not written as a string outside the token layer — read it with `tokens` and override it with `sourceVars()`. Tests are verification code, so they are not subject to this. The same bundle also guards the React Aria boundary (`no-restricted-imports`, patterns in the manifest's `ARIA_BOUNDARY`): `@react-aria/*` · `@react-stately/*` · `@react-types/*` are not imported outside `packages/paper-ui/src/internal/aria` (and `@react-stately` is not used at all), and the adapter translates them into Paper's names and types. If those paths remain in the bundled d.ts, `build-types.mjs` fails the build.
3. **No injecting tokens through inline style** (`paper/inline-token`). Tokens are applied only through `.css.ts` classNames. In the `.ts` · `.tsx` of the package and the app, it is blocked when a value that comes from the package itself (`@studio-baeks/paper-ui*`) or from a relative module reaches `style` or a DOM style write (`el.style.width =` · `setProperty` · `Object.assign(el.style, …)` · `setAttribute("style", …)`), even through a variable, a function call, a hook, a destructuring, or the call arguments · JSX props · `.map` · `.forEach` items passed to a parameter (thrown errors are not followed). The range followed is one file — callers outside the file, methods of objects, `.call` · `.apply` · `.bind`, and callbacks passed to another function are not read. What a relative module returns is not read, so it is treated as carrying a token. `.css` modules are not followed, because they export only the names of their own classes and variables (anything inside `tokens` · `styles` · `internal` is followed). Only values decided at run time are exceptions, and this is the full list: Draggable move coordinates, Grid tracks, Floating rank variables, Floating anchor positions, Floating's carrying of source variables, and a style the caller passes in. The exception modules (`internal/aria` · `internal/measure` · `theme/source-carry` · `primitives/drag/useDraggable` · `primitives/float/nestElevation`) are declared with their reasons in the manifest's `RUNTIME_STYLE`.
4. **Numbers only in the source** (`paper/source-numbers`). Numbers, units and easing in a style position (arguments of vanilla-extract calls in `.css.ts`, and `style` and DOM style writes in `.ts` · `.tsx`) are source values unless they are structural values (0 · 100% · 50% · 1fr · multiples of 45° · `/ 2` and `* -1` in calc; the canonical list is `eslint-rules/structural.js`). Properties with no category and the values of `vars` variables are read in the same way. Values are followed within one file — names, tables and functions, and what is passed to a parameter (call arguments · JSX props · `.map` · `.forEach` · items of `styleVariants` · default values) are read, as are numbers passed to a function that cannot be read in a style position, and an imported style API is seen under its original name (`style as s`). Values imported from another module, methods of objects, `.call` · `.apply` · `.bind`, and callbacks passed to another function are not read. In the package, an object literal that has style properties as keys is a style position in any `.ts` · `.tsx`, because that fragment may be spread into a stylesheet through an import. Outside the token layer, the package chooses spacing, shape, depth, type, opacity, time and dimensions all by roles, and an app writes directly only content dimensions (widths · heights · grid tracks and their positions). An app's variable value is a dimension only when a rule in the same file reads that variable as a dimension. The lengths of media and container queries are written only through `tokens.layout.breakpoint` or an import from `APP_DIMENSION_MODULES`, and queries that cannot be read are blocked. Depth (`zIndex` · `boxShadow` · `filter`) comes only from the stylesheets of Surface and Floating, the stylesheet of Motion that uses the entrance blur (`ELEVATION_OWNERS` in the manifest), or a spread of an elevation fragment, and an inner line comes only from `strokeRing()`. The thickness and style of a border come only from a spread of `lineRule` · `lineFrame` (`LINE_OWNERS` in the manifest). Apps do not read the Typography Palette — it is not in the public tree, and the Typography inspector that shows it reads it through `@paper-ui/inspect/typography`. The dimension module of one screen (`pages/demo/layout.ts`) is declared in `APP_DIMENSION_MODULES`.
5. **Package CSS inside a layer** (`paper/layered-styles`). A package `.css.ts` does not import vanilla-extract's rule API (`style` · `styleVariants` · `globalStyle` · `globalLayer` …) directly but makes rules with `layered(name)` from `tokens/layers.css.ts`. So every rule sits inside the cascade layer `pui`, and app CSS outside the layer wins regardless of load order. Only `layers.css.ts`, which defines the layers, is an exception, and `keyframes` · `createVar` · `fallbackVar` · `createGlobalVar` are used as they are.
6. **No internal class name strings** (`paper/internal-class`). The package (`packages/paper-ui/src`), the app (`app/src`), fixtures (`fixtures/`) and tests (`tests/`) do not use a string in which letters follow `pui-` (including templates, a `+` after a left-hand string ending in `pui-`, and regular expressions). The class of a shared axis is chosen by the resolver indexing a typed map in `styles/` (`fillClass` · `inkClass` · `accentVariantClass` · `spaceClass`), and the build makes the name. The variable `--pui-*` and the attribute `data-pui-*` pass this rule (variable strings are blocked by source isolation). Only inside the package may such a name not be a class, and the place where it sits says so — the id of an element (`id` · `htmlFor` · `…Id` bindings), a storage key (`…KEY` · `…Key` bindings and the first argument of a storage call), and a negative assertion in a test (`.not`). A `.pui-` selector and a binding read in a class position are still classes.
7. **No hand-made global classes** (`paper/global-class`). The `globalStyle` selector in an app `.css.ts` starts from a scoped class. Element and `:root` selectors are allowed only in `site/shell.css.ts` (`GLOBAL_SELECTOR_FILES` in the manifest), and global keyframes and global variable names are not made.
8. **Rules are not switched off by comments** (`paper/no-rule-disable`). Paper rules are not turned off with `eslint-disable` comments, and exceptions are declared only in `eslint-rules/manifest.js`. A comment that turns off another rule must carry `-- reason`, and a disable comment that covers nothing is also an error. `pnpm lint` runs twice — the second pass (`eslint.paper.config.js`) reads only the paper rules with comment configuration turned off, so even a configuration comment like `/* eslint paper/…: "off" */` switches nothing off.

Not only values come from the source. The vocabulary constants and types and the keys of class maps are also made by walking the same source tree, so adding a step to the source grows the constants, types and classes together, and a name outside the vocabulary is caught by the type.

These checks are not run by anyone remembering to. The package build makes a bundle only after lint and typecheck pass, and the pre-publish step (`prepublishOnly`) and CI run lint · typecheck · unit tests · build · smoke:dist · e2e in the same order with `pnpm verify`.

Accessibility is guarded the same way. `eslint-plugin-jsx-a11y` is configured to read elements that were changed by `as`, so cases like `<Box as="button">` are checked too.
