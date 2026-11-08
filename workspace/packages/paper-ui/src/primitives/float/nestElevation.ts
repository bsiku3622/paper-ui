import { ELEVATIONS, ELEVATION_NEST_LIMIT } from "../../tokens";

export type FloatingPresentation = "popover" | "modal";

export type FloatingElevation = { tier: "overlay" | "modal"; rank: number };

const TIER = { popover: "overlay", modal: "modal" } as const satisfies Record<FloatingPresentation, FloatingElevation["tier"]>;

// Within the parent's own tier it rises one rank, held at ELEVATION_NEST_LIMIT so the next tier is never reached.
export const nestElevation = (parent: FloatingElevation | undefined, own: FloatingPresentation): FloatingElevation => {
  if (!parent) return { tier: TIER[own], rank: 0 };
  const tier = ELEVATIONS.indexOf(parent.tier) > ELEVATIONS.indexOf(TIER[own]) ? parent.tier : TIER[own];
  return { tier, rank: tier === parent.tier ? Math.min(parent.rank + 1, ELEVATION_NEST_LIMIT) : 0 };
};
