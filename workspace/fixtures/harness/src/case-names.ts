// The cases the harness mounts, by ?case=. The e2e helpers type their harness URLs with this list.
export const CASE_NAMES = ["geometry", "carry", "theme", "layers", "layout", "elevation", "typography", "motion", "press", "states", "marks", "drag", "overrides", "exports", "accents"] as const;

export type CaseName = (typeof CASE_NAMES)[number];
