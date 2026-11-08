import { COLOR, type Depth } from "./colors";
import { buildVarTree, pathToVarRef } from "./helpers";
import { ELEVATIONS, LAYOUT_MODE_VALUES, LAYOUT_SOURCE, LAYOUT_VALUES, type Elevation } from "./layout";

const vars = buildVarTree(LAYOUT_VALUES, ["layout"]).elevation;

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

export const elevationStack = (tier: Elevation, rank?: string) => ({
  zIndex: rank ? `calc(${ELEVATION.z[tier]} + ${rank} * ${ELEVATION.nudge})` : ELEVATION.z[tier],
});

export const elevationCast = (tier: Elevation) => ({ boxShadow: ELEVATION.shadow[tier] });

export const restingCast = { boxShadow: castShadow("resting") };

export const insetCast = { boxShadow: castShadow("inset") };

export const elevationStyle = (tier: Elevation) => ({
  position: ELEVATION.position[tier],
  ...elevationStack(tier),
  ...elevationCast(tier),
});
