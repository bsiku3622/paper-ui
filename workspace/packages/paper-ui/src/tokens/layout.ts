// Layout — the relations between elements: the gap between siblings, the page frame (gutter ·
// container), the viewport (breakpoints) and depth (elevation = stacking order + shadow).
//
// Same direction as Shape:
//
//   LAYOUT_SOURCE   authored dp numbers
//   LAYOUT_VALUES   emitted once as --pui-layout-* (styles/theme.css.ts)
//   LAYOUT          public roles
//
// Distances select from the Shape space scale, so a gap and an inset of the same step are the
// same length. Elevation shadows take their tint from Color when the theme is emitted.

import { buildVarTree, keys, lengths, pathToVarRef, px } from "./helpers";
import { SPACE } from "./shape";

export const ELEVATIONS = ["base", "raised", "sticky", "overlay", "modal", "toast"] as const;
export type Elevation = (typeof ELEVATIONS)[number];
type Depth = "lifted" | "floating";
type ShadowLayer = readonly [x: number, y: number, blur: number, spread: number];

export const LAYOUT_SOURCE = {
  container: { content: 1152 },
  breakpoint: { sm: 480, md: 768, lg: 1024, xl: 1280 },
  // One elevation decides how a layer stacks and whether it casts a shadow — only what floats
  // has one. Tiers sit 10 apart so a layer can nudge within its tier without crossing the next.
  elevation: {
    base: { z: 0, depth: null },
    raised: { z: 10, depth: "lifted" },
    sticky: { z: 20, depth: null },
    overlay: { z: 30, depth: "floating" },
    modal: { z: 40, depth: "floating" },
    toast: { z: 50, depth: "floating" },
  } satisfies Record<Elevation, { z: number; depth: Depth | null }>,
  // Shadow geometry per theme. Dark surfaces need tighter, negatively spread layers.
  shadow: {
    light: { lifted: [[0, 1, 3, 0]], floating: [[0, 8, 24, 0], [0, 2, 6, 0]] },
    dark: { lifted: [[0, 1, 2, 0]], floating: [[0, 8, 22, -5], [0, 3, 7, -2]] },
  } satisfies Record<"light" | "dark", Record<Depth, readonly ShadowLayer[]>>,
} as const;

export const BREAKPOINTS = keys(LAYOUT_SOURCE.breakpoint);
export type Breakpoint = keyof typeof LAYOUT_SOURCE.breakpoint;
export const CONTAINERS = keys(LAYOUT_SOURCE.container);
export type Container = keyof typeof LAYOUT_SOURCE.container;

// The two directions a line or a list can run.
export const ORIENTATIONS = ["horizontal", "vertical"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

// The Color shadow tint each depth is drawn with.
export const SHADOW_TINT = { lifted: "overlayMinimal", floating: "overlay" } as const satisfies Record<Depth, string>;

export const LAYOUT_VALUES = {
  container: lengths(LAYOUT_SOURCE.container),
  elevation: Object.fromEntries(ELEVATIONS.map((level) => [level, { z: String(LAYOUT_SOURCE.elevation[level].z) }])) as Record<Elevation, { z: string }>,
} as const;

// Shadows change with the theme, so theme.css.ts emits them per theme under this path.
export const elevationShadowPath = (level: Elevation) => ["layout", "elevation", level, "shadow"] as const;
export const elevationShadow = (level: Elevation, theme: "light" | "dark", tint: (name: (typeof SHADOW_TINT)[Depth]) => string): string => {
  const depth = LAYOUT_SOURCE.elevation[level].depth;
  if (!depth) return "none";
  return LAYOUT_SOURCE.shadow[theme][depth].map((layer) => `${layer.map(px).join(" ")} ${tint(SHADOW_TINT[depth])}`).join(", ");
};

const source = buildVarTree(LAYOUT_VALUES, ["layout"]);

export const LAYOUT = {
  gap: SPACE,
  // The distance between the page edge and its content.
  gutter: SPACE.lg,
  container: source.container,
  // Media queries cannot read variables, so breakpoints are values.
  breakpoint: lengths(LAYOUT_SOURCE.breakpoint, px),
  elevation: Object.fromEntries(ELEVATIONS.map((level) => [level, {
    z: source.elevation[level].z,
    shadow: pathToVarRef(elevationShadowPath(level)),
  }])) as Record<Elevation, { z: string; shadow: string }>,
} as const;
