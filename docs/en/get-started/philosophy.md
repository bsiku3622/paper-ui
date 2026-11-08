# Philosophy

## What is Paper UI?

To understand anything about Paper UI, first look at who it is for and what kind of screen it aims at. The answer is **complex web apps**: issue trackers, dashboards, admin consoles and data tools. These are information-dense screens where tables, filters, statuses, forms and dozens of controls sit on one screen at the same time.

Such screens have a chronic dilemma: the more information they hold, the noisier they become. More elements bring more colors, more colors call for lines, where lines fall short shadows are added, and when there is much to emphasize, bold text and badges get planted everywhere. The screen ends up in a state where "full of information" and "chaotic" can no longer be told apart.

Paper UI starts from a one-sentence challenge to this dilemma.

▎ Let's make a screen that is beautiful and refined, and still quiet and soft.

By analogy, what Paper UI wants to resemble is an accounting ledger. A ledger is not showy, yet it holds an enormous number of figures on one page and organizes them quietly with ruled lines and margins alone. A ledger with highlighter all over it is harder to read. The library name and metaphor of Paper UI, "paper, ink and ruled lines", come from the pursuit of the refined quietness of something drawn on paper, like an accounting ledger.

This aim borrows one piece each from four real systems: Atlassian's soft density, Shadcn's restrained color, ChatGPT's refined quietness and SwiftUI's beautiful tidiness. Paper UI binds the four into one grain in Studio Baeks' own way.

## Philosophies

A complex screen, refined and quiet. Paper UI achieves this goal with three philosophies: a comfortable color sense that governs color, a quiet density that embraces space, and a gentle robustness that makes sure the two last over time. The first two are the face of the screen, and the last builds the skeleton that keeps that face from coming apart.

### Comfortable color

The face of Paper UI is like a picture drawn with a black pen on pure white paper. In Paper UI, colors such as red and blue are nothing more than accent points placed only where there is something to say. Color is used only in meaningful places, such as announcing a state, marking focus or pointing at a link. Because color has become rare, it finally catches the user's eye and finishes the black-and-white canvas with a refined sense of color.

### Quiet density

A complex screen has a lot of information by nature, and Paper UI does not give up that density. Instead, it refines the tightness so it does not turn noisy, so that a dashboard reads as one smooth flow. Corners are rounded just enough to lose their edge and ease the harshness, and sections are divided by pale surfaces and margins instead of lines, so that boundaries do not jump out. A carefully designed UI explains dense information gently and weaves a calm essay.

### Gentle robustness

A refined, quiet screen does not stay that way once it is made. Even if one screen spares color, the moment someone adds one blue button on the next screen, the quiet breaks. So Paper UI leaves this restraint to types and the build, not to people's memory or a reviewer's goodwill. It reduces what developers can choose, and breaks the build when a rule is violated. Writing "use color sparingly" in a doc is not kept three months later, but if you take the color out of the palette altogether, color is restrained by itself.

But too much robustness leaves developers at a dead end. If the system blocks even the expressions that are needed, developers fight it, finally go around it, and at that moment the robustness collapses too. So the robustness of Paper UI is gentle. It keeps the rules firmly, and always leaves an escape hatch that the types watch over. Even when you leave the system, you do not drift out of line. Even so, the safety of the structure comes before freedom: developers should first look for a way inside the system, and open the door only when there really is none.

## Principles

The three philosophies point to where Paper UI is going, and the principles are the concrete promises that keep that direction on the screen. Paper UI currently holds up the three philosophies with seven principles, and each principle sits under the philosophy it protects. Developers come back to these principles when they are building a new component, when they waver while choosing a color, shape or spacing, or when they wonder "what does the system do here?"

### Comfortable color (color and gray)

#### Principle 1. Do not use color without meaning

Paper UI uses only four colors: blue, green, amber and red. All four are tied to a meaning: info, success, warning and error. So a color on the screen means there is a state or meaning in that place. Blue also serves as the focus ring (`interaction.focus`) and the link (`interaction.link`). A fill's role is named like `accent.info.solid`, and the actual values are checked in Playground Color.

For the same reason, Paper UI has no `primaryColor`. Even the primary action is filled with black (`accent.primary.solid`), not blue. If a blue button appears on every screen, blue stops being a point and becomes the background. The workhorse is black, and color catches the eye only when it is rare. That there is no color for a brand to choose is Paper UI's claim. Identity comes from pure white, black and margins, not from color.

Colors that fill a surface follow the same standard. Black is the neutral workhorse, so it fills any surface, but a status color fills only when the surface itself is that state, like the red button of an irreversible action. Even then, Paper UI limits solid fills to small elements such as buttons and badges, and announces things quietly on wide surfaces with soft (a pale color surface).

| Do | Don't |
|---|---|
| Add color only where it has meaning, such as status, focus or a link | Fill a surface with a decorative or brand color |
| Fill the primary action with black (primary) | Make the primary action a blue button |
| Use soft quietly in wide places, and solid only on small elements such as buttons and badges | Paint a wide surface with a solid color |

#### Principle 2. Gray supports a card, it does not wrap it

Gray (`bg.sunken`) is not a default wrapper around a card but a floor that supports content. A white surface stands on a small resting shadow or a thin hairline, and gray is used where things have sunk a step, such as an expanded region, a hover or a small mark. A track uses `control.track`, distinct from an ordinary surface.

When developers use gray as a default wrapper, gray boxes pile up on the screen and collide. So the rule is simple: **do not put gray on gray.** A white canvas, a white card on it, and a low-contrast gray surface supporting the card. A complex screen reads quietly when these three layers do not mix.

For sections too, margins and surfaces come before lines. Keep boundary lines pale (`border.base`), and use the one-step darker neutral line (`border.strong`) only at boundaries that need a line itself. The hover of a control is shown with the dedicated `border.hover`. The exact row structure of a table or panel is owned by the product app, so this system enforces no particular row height or table anatomy.

| Do | Don't |
|---|---|
| Compose an attached surface from Surface's fill, border and radius | Build a fixed anatomy and color steps into a generic Card |
| Use gray only where things have sunk, such as an accordion body, a table head, hover and markers | Wrap every section in a gray surface |
| Divide with thin hairlines and margins | Draw a line for every section and every row |

### Quiet density (density and shadow)

#### Principle 3. Size and density are different axes

A complex screen holds a lot of information by nature, so Paper UI keeps density. Body text is 14px (`body`) and spacing is tight. It is where shadcn, Atlassian and Linear sit. If a developer enlarges it to the 16px of a content site, the density loosens and the dashboard stretches out like a blog.

Paper UI makes two vocabularies orthogonal when it handles density. **Space** picks Box's padding and the gap of Stack, Inline and Grid from one length scale (`xs` to `3xl`). **ControlSize** picks the size of a single control such as Button, Field or Select from five steps: `xs`, `sm`, `md`, `lg`, `xl`. Spacing stays fine-grained and control size stays simple.

Font size is chosen separately from control size. ControlSize decides geometry, and the typography preset picks the type style for each role. The default md control is 40px high with 14px type. From xs up, the heights are 32 · 36 · 40 · 44 · 48 and the type is 13 · 14 · 14 · 15 · 16.

Density does not mean sharpness. Controls use curves of 8 and 12px depending on size, and layout surfaces use 12, 16 and 20px. Comfort comes from margins and surfaces, without making the overall height and radius large. On hover the boundary gets one step clearer than the surface, and keyboard focus shows as a blue ring.

#### Principle 4. Shadow belongs only to the first surface on the ground and to things that float

A shadow is not decoration, and it says only two things. One is that the first surface on the ground raises its edge with a shadow instead of a line, and the other is that something floats above the page. The former is the resting shadow (`shadow`). Only an element that has a surface receives it, and it changes neither position nor z. The latter is decided by Layout's elevation tier. One tier decides position, z and shadow together, so there is no way to take only the shadow of a floating layer. The tiers that float above the page, such as popovers, dialogs and notifications (overlay, modal, toast), get the floating shadow, and the slightly lifted tier, like the Switch knob, gets the lifted shadow. An input field and an off mark build their boundary with one gray line on a white surface, wherever they sit, because a shadow cannot build a boundary on a white card. In a place where gray suits (like a search field), the screen chooses a gray surface with no line. A button attaches as a gray surface everywhere, and a track is slightly dug in by an inner shadow. The resting shadow and the inner shadow spread evenly in all directions with no offset, so they read like paper lying flat under a light from above. A shadow that falls offset downward belongs only to floating layers. An inner shadow says "sunk in", not "floating", so it does not conflict with this principle. A surface inside a surface, and a control, are attached to that surface, so they are told apart by the contrast between surface and boundary, without a shadow. Specimens and mockups drawn inside the flow are put on an `isolation: isolate` stage, so the specimen's z does not rise above the page's sticky header.

When emphasis is needed, Paper UI does not raise an element but sinks it (Principle 2). On paper, the way to emphasize something is closer to leaving a mark than to making it protrude. If you give shadows even to surfaces inside surfaces, depth loses its meaning and you can no longer tell what is really floating.

| Do | Don't |
|---|---|
| Seat a card with a surface and a hairline, or, if it is the first surface on the ground, raise it with a resting shadow | Give a shadow to a card or control inside a surface |
| Make emphasis by sinking, with surface and margin | Lift an element to emphasize it |
| For a floating layer, pick an elevation tier and let the tier decide the shadow (depth is only four: resting, lifted, floating, inset) | Write shadow values separately or add steps |

### Gentle robustness (shape, build and escape hatches)

#### Principle 5. The system decides the shape

Under the belief that the fewer the choices, the more consistent the screen becomes by itself, in Paper UI developers choose only meaning and the system decides the shape. What developers choose are axes of meaning such as accent, variant and size (status for inputs), and shape values such as radius, padding, weight and font-size are decided by tokens in one place. The fewer things a developer has to decide when using a component, the more design consistency is kept by itself.

This does not mean there are no shape props at all. Surface offers a limited ladder of `radius`, and Button, Badge, Field and Select can choose `shape="pill"`. An arbitrary numeric radius is not opened. Only the curves of the tokens are used, preventing needless differences between screens.

The same principle applies to the package boundary. The public API currently stops at Primitives and Atoms. Compositions such as page headers, tables and menus are owned by the product app. A shared API is reconsidered only when it is used repeatedly across several products and its common responsibility has become clear.

| Do | Don't |
|---|---|
| Let tokens decide the shape, and have developers choose only meaning such as accent, variant and size | Open a prop that accepts arbitrary values for radius, padding or weight |
| Take a state on one status axis | Let booleans (invalid, error) multiply |
| Add only when the need is proven (after release, with evidence from two or more cases) | Add components "because it might be nice to have" |

#### Principle 6. The build keeps the rules

The promises above are not kept by docs alone. Rules block. For example, `raw-color` blocks color literals, `source-isolation` blocks imports of the source, `inline-token` blocks injecting tokens through style, and `source-numbers` blocks numbers outside the source ([list of rules](../foundations/README.md#the-build-enforces-the-rules)). The lint rules paper-ui defines itself (`paper/*`) cannot be turned off even with an `eslint-disable` comment. `eslint-plugin-jsx-a11y` checks static accessibility problems such as invalid role or aria, missing alternative text and positive tabindex. Nobody has to remember to run these checks. The package build must pass lint and typecheck before it makes a bundle, and the pre-publish check and CI run unit tests and browser tests in the same order. Runtime behavior is the responsibility of the product's implementation and review.

Paper UI defines a value in one place only. Colors, sizes and durations have their canonical copy in `tokens/`, and helpers that walk the same tree make the CSS variables and the TS reference objects. The Playground shows Foundations, Primitives and Atoms, and the issue tracker demo is the place to look at primitives and atoms inside a real app composition.

#### Principle 7. Closed, but no dead ends

Paper UI is closed by default. It does not open shape values carelessly (Principle 5) and it blocks raw values (Principle 6). But if a closed system traps an app in a dead end, developers fight the system, and at that moment the system gets bypassed. So instead of walls, Paper UI provides typed escape hatches.

There are four ways out. Developers change a Primitive's semantics with `<Box as="button">`, reach the system's values directly by importing `tokens`, close their own components' props to the same values as the system with the public vocabulary (`Accent`, `Variant`, `SurfaceFill`, `Ink`), and handle a truly one-off spot with `style`. All four are passages the types watch over, so developers leave the system without drifting out of line.

```ts
import type { Accent, Ink, SurfaceFill, Variant } from "@studio-baeks/paper-ui/tokens";

export type Look = { accent: Accent; variant: Variant; fill: SurfaceFill; ink: Ink };
```

There is an order, though. The safety of the structure comes before freedom, so **an escape is the last resort.** When a requirement calls for a local style, developers first check whether it is a place that a token or a layer can express. If the answer is still not found after passing all the earlier principles, the principles are not lacking; it is that the requirement has not yet been expressed in the system. Developers first look at extending a token or a layer, and open an escape only for what is truly one-off and still does not fit.

## When decisions split

When developers are torn between two directions, they pass the question through from top to bottom. First look at the **three philosophies**: which of comfortable color, quiet density and gentle robustness does this decision protect, and which does it harm? Then look at the **seven principles**. Should I use more color (Principle 1: does it have something to say?), stack gray (Principle 2), enlarge the size (Principle 3: does it loosen density?), give a shadow (Principle 4: is it floating?), add a prop (Principle 5: can the system not decide it instead?), ask for it in docs or block it with lint (Principle 6), bypass with a local style (Principle 7: is it truly one-off?).

If, even after developers pass through to the end, the two directions still collide, especially robustness and flexibility, Paper UI **chooses structure and opens freedom through an escape.** That is the priority of this system, because its purpose is not one beautiful hero image but a beautiful web app.
