import { forwardRef, type ElementType, type ReactElement, type ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { bareButton } from "../primitives/bare-button.css";
import { mergeProps } from "../primitives/composition";
import { useFocusRing } from "../primitives/a11y/focus";
import type { PolymorphicProps } from "../primitives/polymorphic";
import { linkPaint } from "../primitives/paint/recipes.css";
import type { LinkUnderline } from "../tokens";
import { linkRoot, linkUnderline } from "./Link.css";

type LinkOwn = {
  underline?: LinkUnderline;
  children?: ReactNode;
  className?: string;
};

export type LinkProps<As extends ElementType = "a"> = PolymorphicProps<LinkOwn, As>;

const LinkImpl = forwardRef<HTMLElement, Omit<LinkProps, "as" | "ref"> & { as?: ElementType }>(function Link(
  { as, underline = "always", className, ...rest },
  ref,
) {
  const Tag = as ?? "a";
  const { focusProps } = useFocusRing();
  const isButton = Tag === "button";
  return <Tag ref={ref} className={joinClass(isButton && bareButton, linkPaint, linkRoot, linkUnderline[underline], className)} {...mergeProps(isButton ? { type: "button" } : null, rest, focusProps)} />;
});

export const Link = LinkImpl as <As extends ElementType = "a">(props: LinkProps<As>) => ReactElement;
