import { createVar, globalStyle, style, styleVariants } from "@vanilla-extract/css";

import { SYSTEM_COLORS, lineRule, tokens } from "@studio-baeks/paper-ui/tokens";

import { leafPaths, valueAt, type LeafPaths } from "./paths";

const spanAll = { gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "subgrid", alignItems: "center", minWidth: 0 } as const;

export const page = style({ minWidth: 0 });
export const section = style({ minWidth: 0 });
export const board = style({ minWidth: 0, maxWidth: "100%", overflowX: "auto" });
export const grid = style({ display: "grid", columnGap: tokens.layout.gap.md, alignItems: "center" });
export const header = style({ ...spanAll, paddingBlock: tokens.shape.inset.sm, ...lineRule({ side: "bottom" }) });
export const group = style({
  ...spanAll,
  paddingBlock: tokens.shape.inset.sm,
  ...lineRule({ side: "bottom" }),
  selectors: { "&:last-child": { borderBottom: 0, paddingBottom: 0 } },
});
export const groupLabel = style({ gridColumn: "2 / -2", paddingBlock: tokens.shape.inset.sm });

const bordered = { ...lineRule({ side: "bottom" }), selectors: { "&:last-child": { borderBottom: 0, paddingBottom: tokens.shape.inset.sm } } };
export const row = styleVariants({
  sm: { ...spanAll, paddingBlock: tokens.shape.inset.sm },
  md: { ...spanAll, paddingBlock: tokens.shape.inset.md, ...bordered },
  lg: { ...spanAll, paddingBlock: tokens.shape.inset.lg, ...bordered },
});

globalStyle([header, ...Object.values(row)].map((name) => `${name} > :first-child`).join(", "), { gridColumnStart: 2 });

export const align = styleVariants({
  start: { textAlign: "start", justifySelf: "start" },
  center: { textAlign: "center", justifySelf: "center" },
  end: { textAlign: "end", justifySelf: "end" },
});

export const cell = style({ minWidth: 0 });
export const value = style({ minWidth: 0, textAlign: "end", justifySelf: "end" });
export const matrixCell = style({ minWidth: 0, padding: tokens.shape.inset.sm, borderRadius: tokens.shape.radius.surface.sm, background: tokens.color.bg.canvas });

export const swatch = style({ width: "100%", aspectRatio: "1" });

type ColorRoles = Omit<typeof tokens.color, "opacity">;
const roles = Object.fromEntries(Object.entries(tokens.color).filter(([branch]) => branch !== "opacity")) as ColorRoles;
export type ChipRole = LeafPaths<ColorRoles>;
export const chipBox = style({ width: "100%", height: tokens.shape.control.height.sm, boxSizing: "border-box" });
export const chip = styleVariants(
  Object.fromEntries(leafPaths(roles).map((path) => [path, valueAt(roles, path) as string])),
  (background) => ({ background }),
) as Record<ChipRole, string>;

const steps = createVar();
export const stepsProperty = steps.slice(4, -1);
export const stepGrid = style({
  display: "grid",
  gridTemplateColumns: `minmax(6rem, 1.2fr) repeat(${steps}, minmax(2.2rem, 1fr))`,
  gap: tokens.layout.gap.sm,
  alignItems: "center",
  minWidth: "44rem",
});

export const bar = style({ height: tokens.shape.inset.sm, maxWidth: "100%", borderRadius: tokens.shape.radius.full, background: tokens.color.accent.primary.solid });

const dot = tokens.shape.inset.md;
export const travelTrack = style({ position: "relative", width: "100%", height: dot, borderRadius: tokens.shape.radius.full, background: tokens.color.control.track });
export const travelDot = style({
  position: "absolute",
  insetBlockStart: 0,
  insetInlineStart: 0,
  width: dot,
  height: dot,
  borderRadius: tokens.shape.radius.full,
  background: tokens.color.accent.primary.solid,
  transitionProperty: "inset-inline-start",
  "@media": {
    "(hover: hover)": { selectors: { [`${travelTrack}:hover &`]: { insetInlineStart: `calc(100% - ${dot})` } } },
    "(forced-colors: active)": { forcedColorAdjust: "none", background: SYSTEM_COLORS.canvasText },
  },
});

export const lengthProbe = style({ position: "absolute", visibility: "hidden" });

export const curve = style({ width: tokens.shape.dimension.width.xs, fill: "none", stroke: tokens.color.ink.primary, strokeWidth: tokens.shape.stroke.emphasis, overflow: "visible" });
