# Overview

Paper UI is a design system for complex web apps. Its skeleton is pure white and black, and color is added, in small amounts, only where it carries meaning. It combines Atlassian's density, shadcn's restrained neutrals, ChatGPT's quietness and SwiftUI's tidy finish into one grain.

The system is built in three layers. **Foundations** decide every value on the screen. **Primitives** use those values to make the bases (first-order) and the pieces that add one ability to Box (second-order). **Atoms** are controls that do one job on top of them. The docs and the Playground are divided in the same order.

```text
Foundations   Color → Typography → Shape → Layout → Motion
     ↓
Primitives    first-order  Element · Content · A11y
              second-order Paint · Press · Select · Float
                           Drag · Focus · Field · Layout
     ↓
Atoms         Button · Field · Select · Checkbox · Badge …
```

## Map

- **Get started** — [Philosophy](get-started/philosophy.md) · [Installation](get-started/install.md) · [Theming](get-started/theming.md)
- **Foundations** — [Overview](foundations/README.md) · [Color](foundations/color.md) · [Typography](foundations/typography.md) · [Shape](foundations/shape.md) · [Layout](foundations/layout.md) · [Motion](foundations/motion.md)
- **Primitives** — [Overview](primitives/README.md) · first-order [Element](primitives/element.md) · [Content](primitives/content.md) · [A11y](primitives/a11y.md) · second-order [Paint](primitives/paint.md) · [Control](primitives/control.md) · [Press](primitives/press.md) · [Select](primitives/select.md) · [Float](primitives/float.md) · [Drag](primitives/drag.md) · [Focus](primitives/focus.md) · [Field](primitives/field.md) · [Layout](primitives/layout.md)
- **Atoms** — [Overview](atoms/README.md) · [States](atoms/states.md)
- **Playground** — [Overview](/playground) · [Foundations](/playground/foundations/color) · [Primitives](/playground/box) · [Atoms](/playground/button)

The Playground's [Overview](/playground) is an index derived from the samples. Its lists come from the vocabulary, and the numbers in the captions are read from the tokens. The code on a component page is a printout of exactly what is drawn on the screen.

If you want to **use** the system, start with [Installation](get-started/install.md), then read [Philosophy](get-started/philosophy.md) to see why the system looks the way it does. If you want to **understand** the system, follow the [Foundations Overview](foundations/README.md) to see how a value flows from its source to the screen.

## At a glance

- **The product owns compositions.** The package provides Primitives and Atoms only. A screen-level composition becomes a shared API only when the same need keeps recurring in real products.
- **Black does the work.** Even the primary action is black, not blue. This system has no `primaryColor`.
- **One place for the source.** Every color, size and duration is written once, in the source of its system, and components and apps choose roles.
- **Orthogonal axes.** A control picks meaning (accent), visual weight (variant), density (size) and type (fontSize) on separate axes.
- **The build keeps the rules.** eslint, not the docs, enforces the eight rules and accessibility (jsx-a11y), and the package build, the pre-publish checks and CI run those checks every time.

Every contract sentence in the docs has a test that begins its title with the same id, so `pnpm test` matches the two one to one and fails on any contract without a test and any test that points to a contract missing from the docs.

Every `data-testid` planted in the app and the e2e harness stays only while a test looks for it. `check-testids` in `pnpm test` fails on every value that no test's `getByTestId` or `[data-testid=…]` reads and that no table listing the ids reads, so a fixture nobody reads must be deleted or tied to a spec.

## Site contracts

The site (home, docs, Playground, Demo) also has promises that tests keep.

Every route the site declares, that is, every link drawn by the page list, the doc list (`DOC_GROUPS`) and the Playground sidebar, opens without a redirect, draws an h1 in the body (`main`), raises no console error, and does not overflow horizontally at phone width. In the dark theme the same check runs once more on representative routes.

Every link a doc draws works. A doc link reaches a page in the doc list, an anchor reaches an id that exists on that page, and an app link reaches a page that has an h1 and does not change the path.

The five Foundations pages of the Playground (Color · Typography · Shape · Layout · Motion) each draw their title and sections without errors.

The code panel on a component page prints exactly what is drawn now. Copy puts the printed code on the clipboard, edited code moves the controls and the preview if it can be read, and reset returns the controls and the code to their defaults. A select names the component's real default on that value's item (`solid (default)`), and when the default is not one of the choices, the top item says it with that word (`none (default)`). A prop with three choices or fewer is an outlined SegmentControl, so it stands on the same white frame as Select.

An Atom page places a Props table and All combinations below the code. The Props table lists, for each prop the page touches, its type (the choices, `boolean`, or `ReactNode` for the spots an example switches on) and its default, and it does not list the props of other elements (the label text). All combinations draws, on the same background as the preview and from the first screen's state, a table that sets every value of the item's two chosen axes against each other, and rows that move one axis at a time; the default is marked `(default)` after its name. The components in the combinations are pictures, so they take neither focus nor pointer (`inert`) and are not read by assistive technology, and a table wider than its column scrolls inside it. Primitive pages have neither.

The Playground Overview has one board for each Atom that has sizes. The left of a board is a table that sets every value of one axis of that Atom (usually variant; for a mark, off and on) against the five sizes, and the right holds the state to draw the table in and the remaining props. The picture is the subject (registry) of that Atom's page, so it is the same as what you see there, and it follows when a prop changes. The state is chosen from default, hover, pressed, focus and disabled, only those the Atom has: a mark has no hover, and Badge and Spinner have no state. Hover, pressed and focus are drawn with the [state preview](atoms/states.md#state-vocabulary), and disabled with `disabled`; pressed also draws hover, as when a pointer presses, and for SegmentControl hover is drawn on an unchosen segment and focus only on the chosen one. If you expand all the states, the same table repeats for each state. The pictures are live: the pointer and keyboard reach them and the marks turn on and off, and each control has a name made of board, value and size. A table wider than its board scrolls inside it, and an Atom too wide to stand the five sizes side by side (SegmentControl) stands the sizes vertically.

The home page is five scenes seen in one scroll. The first scene brings in the kicker, the two title lines, the paragraph and the actions one step at a time with `reveal.load`, and at the end the words of the title's second line spread apart and open a slot. The Switch in the slot changes the page theme. Below it, the wall of real components flows in four staggered columns; the big sentence turns on, one line at a time, to the body ink as it rises toward the middle of the screen; and under a light from above, the Arcfield demo (`/demo/arcfield`) itself rises in the same theme as the page. It is a frame that floats the demo, not a drawn screen, and it is inert so the page's scroll does not catch on it. The scroll effects are view timelines, so they need no JS, and in an environment that reduces motion or a browser without view timelines every scene stands in place from the start.

The side where a sidebar exists (docs, Playground) uses the screen width, with no cap from the frame (`container.content`), and the side margins are `gap.2xl`. The header has the same width, so the brand and the sidebar stand on one axis. A doc's text, tables and code also fill that column to its end, as in the Playground, and a table wider than the column scrolls inside itself. The other pages (home) stand inside `container.content`.
