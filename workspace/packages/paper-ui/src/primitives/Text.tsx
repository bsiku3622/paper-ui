import { forwardRef, type ElementType, type ReactElement, type ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveText } from "../resolvers";
import type { Ink, TextFamily, TextVariant } from "../tokens";
import type { PolymorphicProps } from "./polymorphic";

type TextOwnProps<V extends TextVariant> = {
  variant?: V;
  ink?: Ink;
  family?: TextFamily;
  numeric?: boolean;
  strong?: boolean;
  truncate?: boolean;
  children?: ReactNode;
  className?: string;
};

const DEFAULT_TEXT_TAG = {
  hero: "h1",
  headline: "h1",
  display: "h1",
  title: "h1",
  heading: "h2",
  subheading: "h3",
  lead: "p",
  body: "p",
  caption: "p",
  label: "span",
} as const satisfies Record<TextVariant, ElementType>;

export type TextProps<V extends TextVariant = "body", As extends ElementType = (typeof DEFAULT_TEXT_TAG)[V]> = PolymorphicProps<TextOwnProps<V>, As>;

const TextImpl = forwardRef<HTMLElement, Omit<TextProps<TextVariant>, "as" | "ref"> & { as?: ElementType }>(function Text({
  variant = "body",
  ink,
  family,
  numeric,
  strong,
  truncate,
  as,
  children,
  className,
  ...rest
}, ref) {
  const Tag = (as ?? DEFAULT_TEXT_TAG[variant]) as ElementType;
  return (
    <Tag
      ref={ref}
      className={joinClass(resolveText({ variant, family, ink, numeric, strong, truncate }), className)}
      {...(rest as object)}
    >
      {children}
    </Tag>
  );
});

export const Text = TextImpl as <V extends TextVariant = "body", As extends ElementType = (typeof DEFAULT_TEXT_TAG)[V]>(props: TextProps<V, As>) => ReactElement;
