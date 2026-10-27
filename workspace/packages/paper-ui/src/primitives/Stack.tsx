// Stack — 세로로 쌓는다.

import { forwardRef, type ElementType, type ReactElement } from "react";

import { Box, type BoxProps } from "./Box";
import { joinClass } from "../internal/joinClass";
import { stackRoot, stackAlign } from "./Stack.css";

export type StackProps<As extends ElementType = "div"> = BoxProps<As> & {
  align?: "start" | "center" | "end" | "stretch";
};

const StackImpl = forwardRef<HTMLDivElement, Omit<StackProps, "as" | "ref"> & { as?: ElementType }>(function Stack({
  align,
  className,
  ...rest
}, ref) {
  return (
  <Box ref={ref} className={joinClass(stackRoot, align && stackAlign[align], className)} {...(rest as object)} />
);
});

export const Stack = StackImpl as <As extends ElementType = "div">(props: StackProps<As>) => ReactElement;
