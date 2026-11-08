import { forwardRef, type ElementType } from "react";

import { Box, type BoxOwnProps } from "../Box";
import { joinClass } from "../../internal/joinClass";
import { resolveGap, type GapProps } from "../../resolvers";
import type { Align, Justify } from "../../tokens";
import { flexAlign, flexJustify, stackRoot } from "./flex.css";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";

type StackOwnProps = BoxOwnProps & Pick<GapProps, "gap"> & {
  align?: Exclude<Align, "baseline">;
  justify?: Justify;
};

export type StackProps<As extends ElementType = "div"> = PolymorphicProps<StackOwnProps, As>;

const StackImpl = forwardRef<HTMLDivElement, Omit<StackProps, "as" | "ref"> & { as?: ElementType }>(function Stack({
  gap,
  align,
  justify,
  className,
  ...rest
}, ref) {
  return (
    <Box
      ref={ref}
      className={joinClass(stackRoot, resolveGap({ gap }), align && flexAlign[align], justify && flexJustify[justify], className)}
      {...(rest as object)}
    />
  );
});

export const Stack = StackImpl as PolymorphicComponent<StackOwnProps, "div">;
