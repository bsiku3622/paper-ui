import { keyframes, style } from "@vanilla-extract/css";

import { emphasisRule, lineRule, tokens } from "@studio-baeks/paper-ui/tokens";

const BP = tokens.layout.breakpoint;
const narrow = `screen and (max-width: ${BP.md})`;
const NO_PREFERENCE = "(prefers-reduced-motion: no-preference)";
const VIEW_TIMELINE = "(animation-timeline: view())";
const { reveal } = tokens.motion.role;

export const column = style({ isolation: "isolate" });

export const heroBand = style({ display: "flex", justifyContent: "center" });
export const hero = style({
  paddingBlock: `${tokens.layout.section.start} ${tokens.layout.section.end}`,
  maxWidth: tokens.shape.measure.xl,
  marginInline: "auto",
  textAlign: "center",
});
export const heroLine = style({ display: "block" });
export const heroQuiet = style({ color: tokens.color.ink.secondary });

const slotOpen = keyframes({ from: { width: 0, marginInline: 0, opacity: 0 } });
export const heroSlot = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.3em",
  height: "0.82em",
  marginInline: tokens.layout.gap.md,
  verticalAlign: "middle",
  overflow: "hidden",
  "@media": {
    [NO_PREFERENCE]: { animationName: slotOpen, animationDuration: reveal.duration, animationTimingFunction: reveal.easing, animationFillMode: "both" },
  },
});

export const footerLink = style({ color: tokens.color.ink.secondary });

export const sub = style({
  marginTop: tokens.layout.gap.lg,
  marginInline: "auto",
  maxWidth: tokens.shape.measure.md,
});

export const heroMeta = style({ marginBottom: tokens.layout.gap.lg });
export const heroActions = style({ marginTop: tokens.layout.gap.xl });

export const sceneHead = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
  alignItems: "end",
  gap: tokens.layout.gap.xl,
  marginBottom: tokens.layout.gap["3xl"],
  "@media": { [narrow]: { gridTemplateColumns: "minmax(0, 1fr)" } },
});
export const sceneHeadCentered = style({ textAlign: "center", maxWidth: tokens.shape.measure.xl, marginInline: "auto", marginBottom: tokens.layout.gap["3xl"] });
export const eyebrow = style({ marginBottom: tokens.layout.gap.md });

export const statement = style({ paddingBlock: `${tokens.layout.section.start} ${tokens.layout.section.end}` });
export const statementText = style({ maxWidth: tokens.shape.measure.xl, marginInline: "auto" });
const lightUp = keyframes({ from: { color: tokens.color.ink.tertiary } });
export const statementWord = style({
  display: "inline-block",
  "@media": {
    [NO_PREFERENCE]: {
      "@supports": {
        [VIEW_TIMELINE]: { animationName: lightUp, animationTimingFunction: reveal.easing, animationFillMode: "both", animationTimeline: "view()", animationRange: "cover 0% cover 50%" },
      },
    },
  },
});

export const stageSection = style({ paddingInline: tokens.layout.gutter });
// The mockup keeps its size on purpose: resizing it would re-lay the table every frame.
export const stage = style({
  paddingBlockStart: tokens.layout.section.start,
  paddingInline: tokens.layout.gap["2xl"],
  backgroundImage: `radial-gradient(ellipse farthest-side at top, ${tokens.color.bg.raised}, transparent)`,
  "@media": { [narrow]: { paddingInline: 0 } },
});
export const stageFigure = style({
  width: "100%",
  maxWidth: tokens.layout.container.content,
  marginBlock: 0,
  marginInline: "auto",
});

export const principlesSection = style({ paddingBlock: `${tokens.layout.section.start} 0` });
export const principles = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: tokens.layout.gap.xl,
  "@media": {
    [`screen and (max-width: ${BP.lg})`]: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
    [`screen and (max-width: ${BP.sm})`]: { gridTemplateColumns: "minmax(0, 1fr)" },
  },
});
export const principleMark = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: tokens.shape.control.height.md,
  height: tokens.shape.control.height.md,
  borderRadius: tokens.shape.radius.control.md,
});

export const closing = style({ paddingBlock: `${tokens.layout.section.start} ${tokens.layout.section.end}`, textAlign: "center" });
export const install = style({
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.layout.gap.sm,
  marginBlock: tokens.layout.gap.xl,
  paddingInlineStart: tokens.shape.inset.lg,
  paddingInlineEnd: tokens.shape.inset.xs,
  paddingBlock: tokens.shape.inset.xs,
});

export const demoWindow = style({ overflow: "hidden" });
export const demoFrame = style({ display: "block", width: "100%", height: "40rem", border: 0 });

export const demoLink = style({ ...emphasisRule("medium") });
export const demoArrow = style({ verticalAlign: "text-bottom", marginInlineStart: tokens.layout.gap.xs });

export const footer = style({
  ...lineRule({ side: "top" }),
  marginTop: tokens.layout.gap.lg,
  paddingBlock: `${tokens.shape.inset.xl} ${tokens.shape.inset["2xl"]}`,
});
export const footerLogo = style({ opacity: tokens.color.opacity.subdued });
