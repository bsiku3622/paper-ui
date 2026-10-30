// Elevation recipes — the one unit an elevation applies: its position, its stacking order and its shadow
// together. Layout owns the numbers and the shadow geometry, Color the shadow colour; nothing here is a
// number, and every consumer (the `elevation` classes, Floating, the Switch thumb) spreads one of these.

import { buildVarTree } from "./helpers";
import { ELEVATIONS, LAYOUT_SOURCE, LAYOUT_VALUES, castShadow, type Elevation } from "./layout";

const vars = buildVarTree(LAYOUT_VALUES, ["layout"]).elevation;
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

// The whole unit, for an element that is not already positioned.
export const elevationStyle = (tier: Elevation) => ({
  position: ELEVATION.position[tier],
  ...elevationStack(tier),
  ...elevationCast(tier),
});
