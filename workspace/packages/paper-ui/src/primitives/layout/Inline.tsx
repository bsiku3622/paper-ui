import { forwardRef, type ElementType } from "react";

import { Box, type BoxOwnProps } from "../Box";
import { joinClass } from "../../internal/joinClass";
import { resolveGap, type GapProps } from "../../resolvers";
import type { Align, Justify } from "../../tokens";
import { flexAlign, flexJustify, inlineRoot, inlineWrap } from "./flex.css";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";

type InlineOwnProps = BoxOwnProps & GapProps & {
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
};

export type InlineProps<As extends ElementType = "div"> = PolymorphicProps<InlineOwnProps, As>;

const InlineImpl = forwardRef<HTMLDivElement, Omit<InlineProps, "as" | "ref"> & { as?: ElementType }>(function Inline({
  gap,
  rowGap,
  columnGap,
  align,
  justify,
  wrap,
  className,
  ...rest
}, ref) {
  return (
    <Box
      ref={ref}
      className={joinClass(
        inlineRoot,
        resolveGap({ gap, rowGap, columnGap }),
        align && flexAlign[align],
        justify && flexJustify[justify],
        wrap && inlineWrap,
        className,
      )}
      {...(rest as object)}
    />
  );
});

export const Inline = InlineImpl as PolymorphicComponent<InlineOwnProps, "div">;
