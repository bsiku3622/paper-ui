import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ElementType } from "react";

// A primitive's props: its own, `as`, and the native props of the element `as` names, minus every name
// the primitive's own props take. A native `align` or `width` never meets the primitive's own.
export type PolymorphicProps<Own, As extends ElementType> = Own & { as?: As } &
  Omit<ComponentPropsWithoutRef<As>, keyof Own | "as"> & { ref?: ComponentPropsWithRef<As>["ref"] };
