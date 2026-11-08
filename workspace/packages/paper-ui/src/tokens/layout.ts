import { COLOR_MODES, type ColorMode } from "./color-modes";
import type { Depth } from "./colors";
import { buildVarTree, keys, lengths, mediaEm, px } from "./helpers";
import { SPACE } from "./shape";

export const ELEVATIONS = ["lifted", "sticky", "overlay", "modal", "toast"] as const;
export type Elevation = (typeof ELEVATIONS)[number];
type ElevationPosition = "relative" | "sticky";
type ShadowLayer = readonly [x: number, y: number, blur: number, spread: number];

export const LAYOUT_SOURCE = {
  container: { content: 1152 },
  breakpoint: { sm: 480, md: 768, lg: 1024, xl: 1280 },
  section: { start: { vh: 8, maxRatio: 2 }, end: { vh: 5 } },
  elevation: {
    tier: {
      lifted: { z: 10, depth: "lifted", position: "relative" },
      sticky: { z: 20, depth: null, position: "sticky" },
      overlay: { z: 30, depth: "floating", position: "relative" },
      modal: { z: 40, depth: "floating", position: "relative" },
      toast: { z: 50, depth: "floating", position: "relative" },
    } satisfies Record<Elevation, { z: number; depth: Depth | null; position: ElevationPosition }>,
    nudge: 1,
  },
  shadow: {
    light: { resting: [[0, 0, 2, 0]], lifted: [[0, 0, 2, 0]], floating: [[0, 8, 24, 0], [0, 2, 6, 0]], inset: [[0, 0, 2, 0]] },
    dark: { resting: [[0, 0, 0, 1]], lifted: [[0, 0, 2, 0]], floating: [[0, 8, 22, -5], [0, 3, 7, -2]], inset: [[0, 0, 2, 0]] },
  } satisfies Record<ColorMode, { resting: readonly [ShadowLayer]; lifted: readonly [ShadowLayer]; floating: readonly [ShadowLayer, ShadowLayer]; inset: readonly [ShadowLayer] }>,
} as const;

export const BREAKPOINTS = keys(LAYOUT_SOURCE.breakpoint);
export type Breakpoint = keyof typeof LAYOUT_SOURCE.breakpoint;
export const CONTAINERS = keys(LAYOUT_SOURCE.container);
export type Container = keyof typeof LAYOUT_SOURCE.container;

export const ALIGNS = ["start", "center", "end", "stretch", "baseline"] as const;
export type Align = (typeof ALIGNS)[number];
export const JUSTIFIES = ["start", "center", "end", "between"] as const;
export type Justify = (typeof JUSTIFIES)[number];
export const JUSTIFY_ITEMS = ["start", "center", "end", "stretch"] as const;
export type JustifyItem = (typeof JUSTIFY_ITEMS)[number];

export const ORIENTATIONS = ["horizontal", "vertical"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export const LAYOUT_VALUES = {
  container: lengths(LAYOUT_SOURCE.container),
  elevation: {
    ...(Object.fromEntries(ELEVATIONS.map((tier) => [tier, { z: String(LAYOUT_SOURCE.elevation.tier[tier].z) }])) as Record<Elevation, { z: string }>),
    nudge: String(LAYOUT_SOURCE.elevation.nudge),
  },
} as const;

const ELEVATION_Z = ELEVATIONS.map((tier) => LAYOUT_SOURCE.elevation.tier[tier].z);
export const ELEVATION_NEST_LIMIT = Math.min(...ELEVATION_Z.slice(1).map((z, index) => z - ELEVATION_Z[index]!)) / LAYOUT_SOURCE.elevation.nudge - 1;

type Geometry<Layers extends readonly ShadowLayer[]> = { [Index in Extract<keyof Layers, `${number}`>]: string };
const geometry = <const Layers extends readonly ShadowLayer[]>(layers: Layers) =>
  Object.fromEntries(layers.map((layer, index) => [String(index), layer.map(px).join(" ")])) as Geometry<Layers>;

export const LAYOUT_MODE_VALUES = Object.fromEntries(COLOR_MODES.map((mode) => [mode, {
  shadow: { resting: geometry(LAYOUT_SOURCE.shadow[mode].resting), lifted: geometry(LAYOUT_SOURCE.shadow[mode].lifted), floating: geometry(LAYOUT_SOURCE.shadow[mode].floating), inset: geometry(LAYOUT_SOURCE.shadow[mode].inset) },
}])) as Record<ColorMode, { shadow: { resting: Geometry<readonly [ShadowLayer]>; lifted: Geometry<readonly [ShadowLayer]>; floating: Geometry<readonly [ShadowLayer, ShadowLayer]>; inset: Geometry<readonly [ShadowLayer]> } }>;

const source = buildVarTree(LAYOUT_VALUES, ["layout"]);
const { section } = LAYOUT_SOURCE;

export const LAYOUT = {
  gap: SPACE,
  gutter: SPACE.lg,
  container: source.container,
  breakpoint: lengths(LAYOUT_SOURCE.breakpoint, mediaEm),
  viewport: "100dvh",
  section: {
    start: `clamp(${SPACE["3xl"]}, ${section.start.vh}vh, calc(${SPACE["3xl"]} * ${section.start.maxRatio}))`,
    end: `clamp(${SPACE["2xl"]}, ${section.end.vh}vh, ${SPACE["3xl"]})`,
  },
} as const;
