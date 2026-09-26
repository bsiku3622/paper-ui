import { style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const stepsRoot = style({
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
});

export const stepsOrientation = styleVariants({
  horizontal: { flexDirection: "row", alignItems: "flex-start" },
  vertical: { flexDirection: "column" },
});

export const stepItem = style({ position: "relative", display: "flex", minWidth: 0, flex: 1 });
export const stepItemHorizontal = style({
  flexDirection: "column",
  alignItems: "flex-start",
  paddingRight: tokens.shape.padding.lg.interaction,
  selectors: {
    "&:not(:last-child)::after": {
      content: "",
      position: "absolute",
      top: `calc(${tokens.shape.height.sm.interaction} / 2)`,
      left: `calc(${tokens.shape.height.sm.interaction} + ${tokens.shape.gap.sm})`,
      right: tokens.shape.gap.sm,
      height: tokens.shape.constants.borderWidth,
      background: tokens.color.border.base,
    },
  },
});
export const stepItemVertical = style({
  alignItems: "flex-start",
  paddingBottom: tokens.shape.padding.lg.interaction,
  selectors: {
    "&:not(:last-child)::after": {
      content: "",
      position: "absolute",
      top: `calc(${tokens.shape.height.sm.interaction} + ${tokens.shape.gap.xs})`,
      bottom: tokens.shape.gap.xs,
      left: `calc(${tokens.shape.height.sm.interaction} / 2)`,
      width: tokens.shape.constants.borderWidth,
      background: tokens.color.border.base,
    },
  },
});

export const stepButton = style({
  display: "flex",
  alignItems: "flex-start",
  gap: tokens.shape.gap.sm,
  padding: 0,
  border: 0,
  background: "transparent",
  color: "inherit",
  font: "inherit",
  textAlign: "start",
});
export const stepClickable = style({ cursor: "pointer" });
export const stepMarker = style({ flex: "0 0 auto", minWidth: tokens.shape.height.sm.interaction, justifyContent: "center" });
export const stepCopy = style({ paddingTop: tokens.shape.gap.xs, minWidth: 0 });
export const stepFuture = style({ color: tokens.color.ink.tertiary });
