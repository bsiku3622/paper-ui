export const CONTROL_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
export type ControlSize = (typeof CONTROL_SIZES)[number];

export const controlSizes = <T>(recipe: (size: ControlSize) => T): Record<ControlSize, T> =>
  Object.fromEntries(CONTROL_SIZES.map((size) => [size, recipe(size)])) as Record<ControlSize, T>;
