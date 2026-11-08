// The leaves of a tree of authored values, by their path. The *-source.ts modules (the studio's readers of the originals) use it to
// say where each source value sits in the tree that PaperProvider's override props are written in.

export const leafPaths = (tree: object, prefix: readonly string[] = []): string[][] =>
  Object.entries(tree).flatMap(([key, value]): string[][] => (typeof value === "object" && value !== null ? leafPaths(value, [...prefix, key]) : [[...prefix, key]]));

// A path as the stylesheet names it: camelCase words joined with a dash.
export const kebab = (word: string): string => word.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
export const dashed = (path: readonly string[]): string => path.map(kebab).join("-");
