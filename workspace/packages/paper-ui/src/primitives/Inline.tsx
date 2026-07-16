// Inline — 가로로 늘어놓는다. 장부 한 줄 안의 배치가 대부분 이것.

import type { ElementType } from "react";

import { Box, type BoxProps } from "./Box";
import { joinClass } from "../internal/joinClass";
import { inlineRoot, inlineAlign, inlineJustify, inlineWrap } from "./Inline.css";

export type InlineProps<As extends ElementType = "div"> = BoxProps<As> & {
  align?: "start" | "center" | "end" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
};

export const Inline = <As extends ElementType = "div">({
  align = "center",
  justify,
  wrap,
  className,
  ...rest
}: InlineProps<As>) => (
  <Box
    className={joinClass(
      inlineRoot,
      inlineAlign[align],
      justify && inlineJustify[justify],
      wrap && inlineWrap,
      className,
    )}
    {...(rest as object)}
  />
);
