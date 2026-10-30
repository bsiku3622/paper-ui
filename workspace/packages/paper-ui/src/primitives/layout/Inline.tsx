// Inline — 가로로 늘어놓는다. 장부 한 줄 안의 배치가 대부분 이것.

import { forwardRef, type ElementType } from "react";

import { Box, type BoxOwnProps } from "../Box";
import { joinClass } from "../../internal/joinClass";
import { resolveGap, type GapProps } from "../../resolvers";
import type { Align, Justify } from "../../tokens";
import { flexAlign, flexJustify, inlineRoot, inlineWrap } from "./flex.css";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";

// align 은 세로 정렬(기본 center)이고 justify 는 가로 분배다. 기본값은 root 가 갖고, prop 은 줄 때만 class 가 된다.
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
