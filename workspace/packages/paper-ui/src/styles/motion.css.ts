import { keyframes } from "@vanilla-extract/css";

import { MOTION, MOTION_LOOPS, MOTION_REDUCED, REVEAL_AFTER, VALUE_ATTRIBUTE } from "../tokens";
import { layered } from "../tokens/layers.css";

const utilities = layered("utilities");
const components = layered("components");

// The reduced-motion policy sits in components: !important reverses layer order, so a loop in utilities wins over it by design.
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const { enter, exit } = MOTION;
const hidden = { opacity: 0 };
const surfaceHidden = { ...hidden, transform: `translateY(${enter.offset}) scale(${enter.scale})` };

const rise = keyframes({ from: surfaceHidden });
const sink = keyframes({ to: surfaceHidden });
const appear = keyframes({ from: hidden });
const vanish = keyframes({ to: hidden });

const entering = `${enter.duration} ${enter.easing}`;
const exiting = `${exit.duration} ${exit.easing} forwards`;

const presenceOf = (state: "entering" | "exiting") => `&[${VALUE_ATTRIBUTE.presence}="${state}"]`;

export const presence = utilities.styleVariants({
  surface: {
    selectors: {
      [presenceOf("entering")]: { animation: `${rise} ${entering}` },
      [presenceOf("exiting")]: { animation: `${sink} ${exiting}` },
    },
  },
  scrim: {
    selectors: {
      [presenceOf("entering")]: { animation: `${appear} ${entering}` },
      [presenceOf("exiting")]: { animation: `${vanish} ${exiting}` },
    },
  },
});

const frames = { spin: keyframes(MOTION_LOOPS.spin.frames), pulse: keyframes(MOTION_LOOPS.pulse.frames) };
const run = (name: keyof typeof frames, important = "") => {
  const { duration, easing } = MOTION_LOOPS[name];
  return `${frames[name]} ${duration} ${easing} infinite${important}`;
};

export const loop = utilities.styleVariants({
  spin: { animation: run("spin"), "@media": { [REDUCED_MOTION]: { animation: run(MOTION_LOOPS.spin.reduced, " !important") } } },
  pulse: { animation: run("pulse"), "@media": { [REDUCED_MOTION]: { animation: run(MOTION_LOOPS.pulse.reduced, " !important") } } },
});

const NO_PREFERENCE = "(prefers-reduced-motion: no-preference)";
const VIEW_TIMELINE = "(animation-timeline: view())";
const { reveal: revealRole } = MOTION;
const unrevealed = { opacity: 0, filter: `blur(${revealRole.blur})`, transform: `translateY(${revealRole.offset})` };
const emerge = keyframes({ from: unrevealed });

export const reveal = utilities.styleVariants({
  load: {
    "@media": {
      [NO_PREFERENCE]: { animationName: emerge, animationDuration: revealRole.duration, animationTimingFunction: revealRole.easing, animationFillMode: "both" },
    },
  },
  scroll: {
    "@media": {
      [NO_PREFERENCE]: {
        "@supports": {
          [VIEW_TIMELINE]: { animationName: emerge, animationTimingFunction: revealRole.easing, animationFillMode: "both", animationTimeline: "view()", animationRange: "entry 0% entry 100%" },
        },
      },
    },
  },
});

export const revealAfter = utilities.styleVariants(REVEAL_AFTER, (delay) => ({ animationDelay: delay }));

components.globalStyle("*, *::before, *::after", {
  "@media": {
    [REDUCED_MOTION]: {
      transitionDuration: `${MOTION_REDUCED.duration} !important`,
      animationDuration: `${MOTION_REDUCED.duration} !important`,
      animationIterationCount: "1 !important",
    },
  },
});
