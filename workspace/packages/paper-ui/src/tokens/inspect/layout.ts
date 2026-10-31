// The Layout inspector's view of the source — the authored frame, breakpoints, elevation tiers and
// shadow geometry. The Playground reads it as @paper-ui/inspect/layout and shows it; nothing in the
// package imports this directory.

export { ELEVATION_NEST_LIMIT, LAYOUT_SOURCE } from "../layout";
// A role in dp over what the stylesheet emits: the gaps and the gutter select from the Shape scale.
export { resolveRole } from "../resolve-dp";
