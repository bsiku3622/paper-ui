export const CASE_NAMES = ["geometry", "control", "carry", "theme", "layers", "layout", "elevation", "typography", "motion", "press", "states", "marks", "ground", "drag", "overrides", "provider-overrides", "exports", "accents", "provider", "shapes"] as const;

export type CaseName = (typeof CASE_NAMES)[number];
