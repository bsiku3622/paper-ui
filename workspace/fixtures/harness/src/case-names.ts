// The cases the harness mounts, by ?case=. The e2e helpers type their harness URLs with this list.
export const CASE_NAMES = ["geometry", "theme", "layers", "typography"] as const;

export type CaseName = (typeof CASE_NAMES)[number];
