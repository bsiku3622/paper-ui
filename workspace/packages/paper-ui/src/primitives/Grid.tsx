import { forwardRef, type CSSProperties, type ElementType, type ReactElement } from "react";
import { Box, type BoxOwnProps } from "./Box";
import { resolveGap, type GapProps } from "../resolvers";
import type { Align, Justify, JustifyItem } from "../tokens";
import { joinClass } from "../internal/joinClass";
import { gridRoot, gridAlign, gridJustify, gridJustifyItems } from "./Grid.css";
import type { PolymorphicProps } from "./polymorphic";

// align 은 칸 안의 세로 정렬, justify 는 track 묶음의 가로 분배, justifyItems 는 칸 안의 가로 정렬이다.
// 기본값은 CSS 의 normal 이 stretch 처럼 동작하므로 root 가 갖고, prop 은 줄 때만 class 가 된다.
type GridOwnProps = BoxOwnProps & GapProps & {
  columns?: number | CSSProperties["gridTemplateColumns"];
  rows?: number | CSSProperties["gridTemplateRows"];
  autoFlow?: CSSProperties["gridAutoFlow"];
  align?: Align;
  justify?: Justify;
  justifyItems?: JustifyItem;
};

export type GridProps<As extends ElementType = "div"> = PolymorphicProps<GridOwnProps, As>;

const tracks = (value: GridOwnProps["columns"]) => {
  if (typeof value !== "number") return value;
  if (!Number.isInteger(value) || value < 1) throw new RangeError("Grid track count must be a positive integer.");
  return `repeat(${value}, minmax(0, 1fr))`;
};
const GridImpl = forwardRef<HTMLDivElement, Omit<GridProps, "as" | "ref"> & { as?: ElementType }>(function Grid({
  columns = 1, rows, autoFlow, gap, rowGap, columnGap, align, justify, justifyItems, className, style, ...rest
}, ref) {
  return <Box ref={ref} {...rest}
    className={joinClass(gridRoot, resolveGap({ gap, rowGap, columnGap }), align && gridAlign[align], justify && gridJustify[justify], justifyItems && gridJustifyItems[justifyItems], className)}
    style={{ gridTemplateColumns: tracks(columns), gridTemplateRows: tracks(rows), gridAutoFlow: autoFlow, ...style }} />;
});
export const Grid = GridImpl as <As extends ElementType = "div">(props: GridProps<As>) => ReactElement;
