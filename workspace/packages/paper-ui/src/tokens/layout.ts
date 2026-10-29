// Layout — the relations between elements: the gap between siblings, the page frame (gutter ·
// container), the viewport (breakpoints) and depth (elevation = stacking order + shadow).
//
// Same direction as Shape:
//
//   LAYOUT_SOURCE        authored dp numbers
//   LAYOUT_VALUES        emitted once as --pui-layout-* (tokens/variables.ts)
//   LAYOUT_MODE_VALUES   the shadow geometry, emitted once per mode as --pui-layout-shadow-*
//   LAYOUT               public roles
//
// Distances select from the Shape space scale, so a gap and an inset of the same step are the
// same length. A shadow is assembled where it is cast, from its geometry here and its shadow
// colour from Color.

import { COLOR_MODES, type ColorMode } from "./color-modes";
import { COLOR, type Depth } from "./colors";
import { buildVarTree, keys, lengths, mediaEm, pathToVarRef, px } from "./helpers";
import { SPACE } from "./shape";

export const ELEVATIONS = ["base", "raised", "sticky", "overlay", "modal", "toast"] as const;
export type Elevation = (typeof ELEVATIONS)[number];
type ShadowLayer = readonly [x: number, y: number, blur: number, spread: number];

export const LAYOUT_SOURCE = {
  container: { content: 1152 },
  breakpoint: { sm: 480, md: 768, lg: 1024, xl: 1280 },
  // A page section opens and closes with a distance that follows the viewport height (vh of it), held
  // between two steps of the space scale. The one fluid distance; every other gap is fixed.
  section: { start: { vh: 8, maxRatio: 2 }, end: { vh: 5 } },
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
  // Shadow geometry per mode. Dark surfaces need tighter, negatively spread layers.
  shadow: {
    light: { lifted: [[0, 1, 3, 0]], floating: [[0, 8, 24, 0], [0, 2, 6, 0]] },
    dark: { lifted: [[0, 1, 2, 0]], floating: [[0, 8, 22, -5], [0, 3, 7, -2]] },
  } satisfies Record<ColorMode, { lifted: readonly [ShadowLayer]; floating: readonly [ShadowLayer, ShadowLayer] }>,
} as const;

export const BREAKPOINTS = keys(LAYOUT_SOURCE.breakpoint);
export type Breakpoint = keyof typeof LAYOUT_SOURCE.breakpoint;
export const CONTAINERS = keys(LAYOUT_SOURCE.container);
export type Container = keyof typeof LAYOUT_SOURCE.container;

// How a container places its children. Align is the cross axis (align-items); Justify distributes along
// the main axis of a flex line or a grid's tracks (justify-content); a grid's JustifyItem places each item in
// its own cell (justify-items).
export const ALIGNS = ["start", "center", "end", "stretch", "baseline"] as const;
export type Align = (typeof ALIGNS)[number];
export const JUSTIFIES = ["start", "center", "end", "between"] as const;
export type Justify = (typeof JUSTIFIES)[number];
export const JUSTIFY_ITEMS = ["start", "center", "end", "stretch"] as const;
export type JustifyItem = (typeof JUSTIFY_ITEMS)[number];

// The two directions a line or a list can run.
export const ORIENTATIONS = ["horizontal", "vertical"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export const LAYOUT_VALUES = {
  container: lengths(LAYOUT_SOURCE.container),
  elevation: Object.fromEntries(ELEVATIONS.map((level) => [level, { z: String(LAYOUT_SOURCE.elevation[level].z) }])) as Record<Elevation, { z: string }>,
} as const;

// One length list per layer, such as "0px 8px 24px 0px". Emitted per mode: the geometry is the part of a
// shadow that a mode changes.
type Geometry<Layers extends readonly ShadowLayer[]> = { [Index in Extract<keyof Layers, `${number}`>]: string };
const geometry = <const Layers extends readonly ShadowLayer[]>(layers: Layers) =>
  Object.fromEntries(layers.map((layer, index) => [String(index), layer.map(px).join(" ")])) as Geometry<Layers>;

export const LAYOUT_MODE_VALUES = Object.fromEntries(COLOR_MODES.map((mode) => [mode, {
  shadow: { lifted: geometry(LAYOUT_SOURCE.shadow[mode].lifted), floating: geometry(LAYOUT_SOURCE.shadow[mode].floating) },
}])) as Record<ColorMode, { shadow: { lifted: Geometry<readonly [ShadowLayer]>; floating: Geometry<readonly [ShadowLayer, ShadowLayer]> } }>;

// A depth's shadow, assembled on the element that casts it: each layer's geometry beside the shadow
// colour, both read where the element stands. No variable holds the result, so a scope that swaps the
// mode swaps the shadow with it.
export const castShadow = (depth: Depth): string =>
  Object.keys(LAYOUT_MODE_VALUES.light.shadow[depth])
    .map((layer) => `${pathToVarRef(["layout", "shadow", depth, layer])} ${COLOR.shadow[depth]}`)
    .join(", ");

const source = buildVarTree(LAYOUT_VALUES, ["layout"]);
const { section } = LAYOUT_SOURCE;

export const LAYOUT = {
  gap: SPACE,
  // The distance between the page edge and its content.
  gutter: SPACE.lg,
  container: source.container,
  // Media queries cannot read variables, so breakpoints are values, in em of the default root font.
  breakpoint: lengths(LAYOUT_SOURCE.breakpoint, mediaEm),
  // Formulas over the space scale, evaluated where a section uses them.
  section: {
    start: `clamp(${SPACE["3xl"]}, ${section.start.vh}vh, calc(${SPACE["3xl"]} * ${section.start.maxRatio}))`,
    end: `clamp(${SPACE["2xl"]}, ${section.end.vh}vh, ${SPACE["3xl"]})`,
  },
  elevation: Object.fromEntries(ELEVATIONS.map((level) => {
    const { depth } = LAYOUT_SOURCE.elevation[level];
    return [level, { z: source.elevation[level].z, shadow: depth ? castShadow(depth) : "none" }];
  })) as Record<Elevation, { z: string; shadow: string }>,
} as const;
