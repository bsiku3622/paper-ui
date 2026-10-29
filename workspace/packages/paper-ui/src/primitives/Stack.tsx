// Stack — 세로로 쌓는다.

import { forwardRef, type ElementType, type ReactElement } from "react";

import { Box, type BoxOwnProps } from "./Box";
import { joinClass } from "../internal/joinClass";
import { resolveGap, type GapProps } from "../resolvers";
import type { Align, Justify } from "../tokens";
import { flexAlign, flexJustify, stackRoot } from "./flex.css";
import type { PolymorphicProps } from "./polymorphic";

// align 은 가로 정렬이고 justify 는 세로 분배다. 기본값은 root 가 갖고, prop 은 줄 때만 class 가 된다.
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

export const Stack = StackImpl as <As extends ElementType = "div">(props: StackProps<As>) => ReactElement;
