// Dotted paths into a tree of leaves — how the inspector names a role and finds what it selects.

export type LeafPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends object ? LeafPaths<T[K], `${Prefix}${K}.`> : `${Prefix}${K}`;
}[keyof T & string];

const walk = (tree: object, prefix: string): string[] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "object" && value !== null ? walk(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );

// The leaves of a tree in source order.
export const leafPaths = <T extends object>(tree: T, prefix = ""): LeafPaths<T>[] => walk(tree, prefix) as LeafPaths<T>[];

export const valueAt = (tree: object, path: string): unknown =>
  path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], tree);
