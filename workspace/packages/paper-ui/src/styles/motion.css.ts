// motion.css — Motion 의 조합과 정책. 역할이 정한 시간·곡선·변위를 keyframe 과 class 로 조립한다.
//
// presence 는 떠오르고 가라앉는 면이 data-presence 상태에 따라 enter · exit 역할로 움직이게 하고,
// loop 는 반복(spin · pulse)을 class 하나로 건다. reveal 은 화면에 처음 들어오는 덩어리를 reveal 역할로 들인다.
// 셋 다 utilities 에 서므로 컴포넌트와 앱은 class 를 합성한다.
// reduced-motion 정책은 components 에 선다 — 중요(!important) 선언은 layer 순서가 뒤집혀 앞선 layer 가 이기므로,
// utilities 의 loop 가 정책보다 먼저 이긴다: 전이와 유한한 animation 은 즉시 끝나고, 반복만 맥박으로 남는다.
// Motion 은 barrel 로만 읽는다.

import { keyframes } from "@vanilla-extract/css";

import { MOTION, MOTION_LOOPS, MOTION_REDUCED, REVEAL_AFTER, VALUE_ATTRIBUTE } from "../tokens";
import { layered } from "../tokens/layers.css";

const utilities = layered("utilities");
const components = layered("components");

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ presence — 면이 나타나고 사라진다                                        │
// ╰──────────────────────────────────────────────────────────────────────────╯

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

// 면(surface)은 opacity 와 함께 enter 변위만큼 떠오르고, 같은 변위로 가라앉는다. scrim 은 opacity 만.
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

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ loop — 반복                                                              │
// ╰──────────────────────────────────────────────────────────────────────────╯

const frames = { spin: keyframes(MOTION_LOOPS.spin.frames), pulse: keyframes(MOTION_LOOPS.pulse.frames) };
const run = (name: keyof typeof frames, important = "") => {
  const { duration, easing } = MOTION_LOOPS[name];
  return `${frames[name]} ${duration} ${easing} infinite${important}`;
};

// reduced-motion 에서는 loop 마다 정해진 반복(reduced)으로 바뀐다. class 가 정책(*)보다 앞선 layer 의 !important 라 이긴다.
export const loop = utilities.styleVariants({
  spin: { animation: run("spin"), "@media": { [REDUCED_MOTION]: { animation: run(MOTION_LOOPS.spin.reduced, " !important") } } },
  pulse: { animation: run("pulse"), "@media": { [REDUCED_MOTION]: { animation: run(MOTION_LOOPS.pulse.reduced, " !important") } } },
});

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ reveal — 화면에 처음 들어온다                                            │
// ╰──────────────────────────────────────────────────────────────────────────╯

// A reveal comes up from below its place, out of a blur, into its own opacity. It plays only where motion has not been turned
// down: under prefers-reduced-motion it stands in its place from the first frame, with no wait. load plays once, when the element
// mounts. scroll runs on the element's view timeline, from the moment it starts to come into view until it is wholly in, and
// only where the browser has view timelines; anywhere else it stands in its place too. The longhands leave the delay to
// revealAfter.
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

// A sibling that comes in with others waits its beats: revealAfter[2] starts two steps after revealAfter[0].
export const revealAfter = utilities.styleVariants(REVEAL_AFTER, (delay) => ({ animationDelay: delay }));

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ reduced motion — 전이와 유한한 animation 은 즉시 끝난다                  │
// ╰──────────────────────────────────────────────────────────────────────────╯

// 의사 요소도 포함한다 — 스위치 손잡이처럼 ::before · ::after 가 움직이는 자리가 있다.
components.globalStyle("*, *::before, *::after", {
  "@media": {
    [REDUCED_MOTION]: {
      transitionDuration: `${MOTION_REDUCED.duration} !important`,
      animationDuration: `${MOTION_REDUCED.duration} !important`,
      animationIterationCount: "1 !important",
    },
  },
});
