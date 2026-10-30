import { ELEVATIONS, ELEVATION_NEST_LIMIT } from "../../tokens";

// The elevation a Floating opens at: its tier, and how many panels of that tier already stand under it.
export type FloatingElevation = { tier: "overlay" | "modal"; rank: number };

// A Floating inside another takes the higher of the two tiers, so a popover opened from a dialog stays above the
// dialog's scrim. Within the parent's own tier it rises one rank, held at ELEVATION_NEST_LIMIT so the next tier
// is never reached; a new tier starts at rank 0.
export const nestElevation = (parent: FloatingElevation | undefined, own: FloatingElevation["tier"]): FloatingElevation => {
  if (!parent) return { tier: own, rank: 0 };
  const tier = ELEVATIONS.indexOf(parent.tier) > ELEVATIONS.indexOf(own) ? parent.tier : own;
  return { tier, rank: tier === parent.tier ? Math.min(parent.rank + 1, ELEVATION_NEST_LIMIT) : 0 };
};
