// Stack — 세로로 쌓는다.

import type { ElementType } from "react";

import { Box, type BoxProps } from "./Box";
import { joinClass } from "../internal/joinClass";
import { stackRoot, stackAlign } from "./Stack.css";

export type StackProps<As extends ElementType = "div"> = BoxProps<As> & {
  align?: "start" | "center" | "end" | "stretch";
};

export const Stack = <As extends ElementType = "div">({
  align,
  className,
  ...rest
}: StackProps<As>) => (
  <Box className={joinClass(stackRoot, align && stackAlign[align], className)} {...(rest as object)} />
);
