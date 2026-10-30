import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ElementType, ReactElement } from "react";

declare const polymorphic: unique symbol;

// A primitive's props: its own, `as`, and the native props of the element `as` names, minus every name
// the primitive's own props take. A native `align` or `width` never meets the primitive's own.
export type PolymorphicProps<Own, As extends ElementType> = Own & { as?: As } &
  Omit<TargetProps<As>, keyof Own | "as"> & { ref?: TargetRef<As> };

// A polymorphic primitive names its own props and its default tag in a phantom property. `as={Stack}` reads
// them from there: a generic component's own signature only gives the open props of `ElementType`, which
// would let a misspelt prop through.
export type PolymorphicComponent<Own, Default extends ElementType> = {
  <As extends ElementType = Default>(props: PolymorphicProps<Own, As>): ReactElement;
  readonly [polymorphic]?: { own: Own; tag: Default };
};

type Primitive = { readonly [polymorphic]?: { own: unknown; tag: ElementType } };
type PrimitiveOwn<As> = As extends { readonly [polymorphic]?: { own: infer Own; tag: ElementType } } ? Own : never;
type PrimitiveTag<As> = As extends { readonly [polymorphic]?: { own: unknown; tag: infer Tag extends ElementType } } ? Tag : never;

type TargetProps<As extends ElementType> = As extends Primitive
  ? PrimitiveOwn<As> & Omit<ComponentPropsWithoutRef<PrimitiveTag<As>>, keyof PrimitiveOwn<As>>
  : ComponentPropsWithoutRef<As>;
type TargetRef<As extends ElementType> = As extends Primitive ? ComponentPropsWithRef<PrimitiveTag<As>>["ref"] : ComponentPropsWithRef<As>["ref"];
