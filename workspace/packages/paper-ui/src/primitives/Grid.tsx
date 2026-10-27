import { forwardRef, type CSSProperties, type ElementType, type ReactElement } from "react";
import { Box, type BoxProps } from "./Box";
import type { Space } from "../tokens";
import { joinClass } from "../internal/joinClass";
import { gridRoot, gridAlign, gridJustify, gridRowGap, gridColumnGap } from "./Grid.css";

export type GridProps<As extends ElementType = "div"> = BoxProps<As> & {
  columns?: number | CSSProperties["gridTemplateColumns"];
  rows?: number | CSSProperties["gridTemplateRows"];
  autoFlow?: CSSProperties["gridAutoFlow"];
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "stretch";
  rowGap?: Space;
  columnGap?: Space;
};
const tracks = (value: GridProps["columns"]) => {
  if (typeof value !== "number") return value;
  if (!Number.isInteger(value) || value < 1) throw new RangeError("Grid track count must be a positive integer.");
  return `repeat(${value}, minmax(0, 1fr))`;
};
const GridImpl = forwardRef<HTMLDivElement, Omit<GridProps, "as" | "ref"> & { as?: ElementType }>(function Grid({
  columns = 1, rows, autoFlow, align = "stretch", justify = "stretch", rowGap, columnGap, className, style, ...rest
}, ref) {
  return <Box ref={ref} {...rest} className={joinClass(gridRoot, gridAlign[align], gridJustify[justify], rowGap && gridRowGap[rowGap], columnGap && gridColumnGap[columnGap], className)}
    style={{ gridTemplateColumns: tracks(columns), gridTemplateRows: tracks(rows), gridAutoFlow: autoFlow, ...style }} />;
});
export const Grid = GridImpl as <As extends ElementType = "div">(props: GridProps<As>) => ReactElement;
