# Motion

Motion is the system that decides how values change over time. The speed at which a color changes and the curve along which an overlay floats up belong here. It is a [first-order system](README.md#first-order-and-second-order) that has only time and curves; displacement, which needs a length, such as the distance a button sinks when pressed, is added by the second-order Motion displacement.

This is a system of quiet density, so its motion is also short and calm. Hover is almost immediate, state transitions take 130ms, and only a floating overlay is a little longer. There are no bouncy transitions. Only the blocks that first enter the screen (titles · sections · cards) get a long `reveal`, not component transitions — over 700ms they rise quickly and settle for a long time.

## Source

| Axis | Values |
| --- | --- |
| `duration` | `instant` 0ms · `reduced` 0.01ms · `fast` 100ms · `base` 130ms · `moderate` 200ms · `slow` 300ms · `scene` 700ms |
| `easing` | `linear` · `standard` (0.4, 0, 0.2, 1) · `decelerate` (0, 0, 0.2, 1) · `accelerate` (0.4, 0, 1, 1) · `overshoot` (0.22, 1, 0.36, 1) · `emphasized` (0.16, 1, 0.3, 1) |
| `loop` | `spin` 900ms linear · `pulse` 1400ms standard |

`reduced` is the smallest positive duration applied to every transition in a reduced-motion environment. `scene` is the time of a scene, so component transitions do not use it and only `reveal` does. `linear` is for repeated rotation and constant-speed progress, `overshoot` for when a floating overlay settles, and `emphasized` for when a block entering the screen first covers almost all the distance and then settles over the rest for a long time. `loop` is repetition, separate from transitions.

Despite its name, `overshoot` does not pass its target. The y value of the curve never exceeds 1, so it starts fast and comes to a soft stop at the end. `emphasized` is the same.

This source is read only inside Motion's own files. Components and apps do not touch duration · easing · loop, and choose the roles below.

## Roles

A component does not choose time and curve separately but only what situation the motion is for (the role). There are seven roles below, and where each role is used is decided by `MOTION_CONSUMERS`. The vocabulary comes out as `MOTION_ROLES` and `MotionRole`.

| Role | duration | easing | Displacement | Situation | Used by |
| --- | --- | --- | --- | --- | --- |
| `press` | fast | standard | down by `stroke.border` | The moment a button is pressed | Button · IconButton |
| `hover` | fast | standard | — | Hover tint · border · text color that change as the pointer passes | Button · IconButton · Field · Select · Textarea · Surface |
| `state` | base | standard | — | A state that stays, like on or selected, transitions of surfaces and backgrounds, the Switch knob | Button · IconButton · Field · Select · Textarea · Checkbox · Radio · Switch · SegmentControl |
| `enter` | moderate | overshoot | `gap.xs` · scale 0.99 | A floating overlay | Floating |
| `exit` | fast | accelerate | — | A disappearing overlay | Floating |
| `reveal` | scene | emphasized | `gap.lg` · blur `gap.sm` | A block that first enters the screen — titles · sections · cards | App screens — the `reveal` class |
| `theme` | instant | linear | — | Theme change — every transition finishes instantly on the frame the mode changes | PaperProvider · Surface |

The Atoms listed under "Used by" really do transition with that role. `reveal` has no component in the package that uses it — components do not make an entrance, and an app's screen chooses it with the `reveal` class. For hover reactions choose `hover`, and for states that stay on and transitions of surfaces choose `state`. One element can have both, so a Button transitions the hover tint (`--pui-state-tint`) and the border with `hover`, the background color and text color with `state`, and the press with `press`. The frame of an input (Field · Select · Textarea) also transitions the border that rises on hover with `hover`, and the background with `state`.

Focus has no role. The focus ring is a signal that tells where the keyboard has landed, so it must appear without delay, and nothing transitions on focus.

Displacement is a length, so Motion does not hold it; the second-order `motion-recipes.ts` adds it to roles and points at Shape · Layout roles. The displacement of `press` is `shape.stroke.border`, that of `enter` is `layout.gap.xs`, that of `reveal` is `layout.gap.lg` and its blur is `layout.gap.sm`. All of them are `var(--pui-…)` references, so in a subtree that overrides the source they are recomputed in place. `scale` is not a length and so is a Motion value, and the step that `reveal` puts between siblings is time, so it is `fast` on the duration ladder.

## Compositions

There are four compositions on top of roles.

`transition(role, …properties)` is a transition string that joins the role's duration and easing to each property. `transition("hover", "color")` is `color 100ms cubic-bezier(0.4, 0, 0.2, 1)`, and with several properties they are joined with commas. When the properties of one element follow different roles, call `transition()` for each group of properties and join them with commas. It comes out of `/tokens` together with `MOTION_CONSUMERS`.

`presence` is the entrance and exit of a surface. `presence.surface` floats up and appears with the `enter` role (opacity and displacement · scale) when `data-presence` is `entering`, and when it is `exiting`, it sinks by the same displacement with the `exit` role and stays, disappeared. `presence.scrim` changes only opacity with the same timing. Setting the attribute is Floating's job — when it opens it sets `entering` on the panel (on the scrim and panel for a modal), and when it closes it sets `exiting` and keeps it mounted until the animation ends ([Float](../primitives/float.md#opening-and-closing-motion)).

`loop` is repetition. `loop.spin` rotates at 900ms linear and `loop.pulse` pulses at 1400ms standard. The Spinner and the loading mark of a button (the same Spinner) compose `loop.spin` and have no keyframes of their own.

`reveal` is a block that first enters the screen. It starts `gap.lg` below its place, blurred by `gap.sm`, and transparent, and settles into place with the `reveal` role (`scene` 700ms · `emphasized`). `reveal.load` plays once when mounted, and `reveal.scroll` resolves along that element's view timeline from when the element starts to enter the screen until it has entered completely. Siblings that enter together start n steps later with `revealAfter[n]` (`fast` 100ms each). Both forms move only in environments that have not reduced motion (`prefers-reduced-motion: no-preference`), and `reveal.scroll` moves only in browsers that have a view timeline. Elsewhere it stands in place from the start with no delay. `reveal` does not use the `animation` shorthand so that `revealAfter`, which gives the delay, wins.

`presence` · `loop` · `reveal` · `revealAfter` are class maps, so they come from the component entry (`@studio-baeks/paper-ui`), not from `/tokens`. The keyframes exist in one place only, `styles/motion.css.ts`.

## How it differs from the other systems

Motion is not baked into CSS variables. Duration and easing are values assembled into a transition string, so they are hard to reduce to one variable, and assembling them at build time fits better. So `tokens.motion` is only `role`, and a role holds the time and curve as values. Displacement alone is not an exception but a reference to Shape · Layout variables. There is no path that reads the source directly, such as `tokens.motion.duration`.

A stylesheet assembles the transition string with `transition()`. The example below makes background and border color change with the time and curve of the `state` role.

```ts
import { style } from "@vanilla-extract/css";
import { tokens, transition } from "@studio-baeks/paper-ui/tokens";

export const row = style({
  transition: transition("state", "background", "border-color"),
  selectors: { "&:active": { transform: `translateY(${tokens.motion.role.press.offset})` } },
});
```

`transition("state", "background", "border-color")` becomes `background 130ms cubic-bezier(0.4, 0, 0.2, 1), border-color 130ms …`.

## In an app

An app also does not write time and curves as numbers. Choose transitions with `transition(role, …properties)`, the entrance of a surface and loops with the `presence` · `loop` classes, and a block that first enters the screen with the `reveal` · `revealAfter` classes; if you write `130ms` or `cubic-bezier(…)` in an app stylesheet's `transition` · `animation`, `paper/source-numbers` blocks it. When a new motion is needed, the job is to add a role, not to add a value in the app.

## Reduced motion

In `prefers-reduced-motion: reduce`, every transition and finite animation ends instantly. `reveal` does not wait for this policy but does not play at all, so it stands in place from the start with no delay. `::before` and `::after` receive the same rule, so a Switch knob does not slide either but jumps. Components have nothing to handle separately. A Floating's exit also ends in an instant, so it goes down the moment it closes.

Loops do not stop but change to a fixed pulse. `loop.spin` reports that work is in progress with `loop.pulse` (opacity 1 → 0.25 → 1) instead of rotating. Only motion that travels across the screen is removed, and the signal that something is waiting remains. So that progress does not rely on motion alone, the Spinner also conveys it with `role="progressbar"` and a label.

This policy splits by layer. `presence` and `loop` are in `pui.utilities`, and the rule that ends everything instantly, applied to every element, is in `pui.components`. The reduced form of loops and the end-instantly rule are both `!important`, and since `!important` reverses the layer order so that earlier layers win, the loop's pulse does not lose to the end-instantly rule. `presence` is not `!important`, so it loses to the end-instantly rule and ends at once. An app's `!important` loses to both rules.

In the Playground's [Motion](/playground/foundations/motion) you can see the source, real samples of the roles, and the compositions. The samples are real components that use the roles and the `presence` · `loop` classes.
