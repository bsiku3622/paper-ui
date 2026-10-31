import { ELEVATIONS, ELEVATION_NEST_LIMIT } from "../../tokens";

// How a Floating Content is presented: a popover beside its anchor, or a modal dialog over a scrim.
export type FloatingPresentation = "popover" | "modal";

// The elevation a Floating opens at: its tier, and how many panels of that tier already stand under it.
export type FloatingElevation = { tier: "overlay" | "modal"; rank: number };

const TIER = { popover: "overlay", modal: "modal" } as const satisfies Record<FloatingPresentation, FloatingElevation["tier"]>;

// A Floating inside another takes the higher of the two tiers, so a popover opened from a dialog stays above the
// dialog's scrim. Within the parent's own tier it rises one rank, held at ELEVATION_NEST_LIMIT so the next tier
// is never reached; a new tier starts at rank 0.
export const nestElevation = (parent: FloatingElevation | undefined, own: FloatingPresentation): FloatingElevation => {
  if (!parent) return { tier: TIER[own], rank: 0 };
  const tier = ELEVATIONS.indexOf(parent.tier) > ELEVATIONS.indexOf(TIER[own]) ? parent.tier : TIER[own];
  return { tier, rank: tier === parent.tier ? Math.min(parent.rank + 1, ELEVATION_NEST_LIMIT) : 0 };
};
