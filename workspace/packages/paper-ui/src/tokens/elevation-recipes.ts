// Elevation recipes — the one unit an elevation applies: its position, its stacking order and its shadow
// together. Layout owns the numbers and the shadow geometry, Color the shadow colour; nothing here is a
// number, and every consumer (the `elevation` classes, Floating, the Switch thumb) spreads one of these.

import { COLOR, type Depth } from "./colors";
import { buildVarTree, pathToVarRef } from "./helpers";
import { ELEVATIONS, LAYOUT_MODE_VALUES, LAYOUT_SOURCE, LAYOUT_VALUES, type Elevation } from "./layout";

const vars = buildVarTree(LAYOUT_VALUES, ["layout"]).elevation;

// A depth's shadow, assembled on the element that casts it: each layer's geometry beside the shadow
// colour, both read where the element stands. No variable holds the result, so a scope that swaps the
// mode swaps the shadow with it.
export const castShadow = (depth: Depth): string =>
  Object.keys(LAYOUT_MODE_VALUES.light.shadow[depth])
    .map((layer) => `${depth === "inset" ? "inset " : ""}${pathToVarRef(["layout", "shadow", depth, layer])} ${COLOR.shadow[depth]}`)
    .join(", ");

const perTier = <T>(read: (tier: Elevation) => T): Record<Elevation, T> =>
  Object.fromEntries(ELEVATIONS.map((tier) => [tier, read(tier)])) as Record<Elevation, T>;

export const ELEVATION = {
  z: perTier((tier) => vars[tier].z),
  nudge: vars.nudge,
  depth: perTier((tier) => LAYOUT_SOURCE.elevation.tier[tier].depth),
  shadow: perTier((tier) => {
    const { depth } = LAYOUT_SOURCE.elevation.tier[tier];
    return depth ? castShadow(depth) : "none";
  }),
  position: perTier((tier) => LAYOUT_SOURCE.elevation.tier[tier].position),
} as const;

// The stacking order of a tier. A panel nested `rank` times inside another of its tier rises that many nudges;
// rank is a CSS value (a number or a var()) so a stylesheet can read it where it renders.
export const elevationStack = (tier: Elevation, rank?: string) => ({
  zIndex: rank ? `calc(${ELEVATION.z[tier]} + ${rank} * ${ELEVATION.nudge})` : ELEVATION.z[tier],
});

// The shadow a tier casts — `none` for a tier that does not float.
export const elevationCast = (tier: Elevation) => ({ boxShadow: ELEVATION.shadow[tier] });

// The shadow of a face that stays where it is. It is no tier: it does not stack over anything, so it brings no position and no z.
export const restingCast = { boxShadow: castShadow("resting") };

// The shade a groove or a well sinks with: a track, and a field or a mark lying in a raised face. No tier either.
export const insetCast = { boxShadow: castShadow("inset") };

// The whole unit, for an element that is not already positioned.
export const elevationStyle = (tier: Elevation) => ({
  position: ELEVATION.position[tier],
  ...elevationStack(tier),
  ...elevationCast(tier),
});
