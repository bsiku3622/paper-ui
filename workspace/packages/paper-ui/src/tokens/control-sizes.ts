// The control size axis. Typography's presets and Shape's ladders both key on it, and neither owns it: it is a list of
// names, not a value, so reading it does not tie one system to the other.

export const CONTROL_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
export type ControlSize = (typeof CONTROL_SIZES)[number];

// One typed size map; recipes choose a role instead of patching arbitrary CSS keys.
export const controlSizes = <T>(recipe: (size: ControlSize) => T): Record<ControlSize, T> =>
  Object.fromEntries(CONTROL_SIZES.map((size) => [size, recipe(size)])) as Record<ControlSize, T>;
