import { forwardRef, type CSSProperties, type ElementType } from "react";
import { Box, type BoxOwnProps } from "../Box";
import { resolveGap, type GapProps } from "../../resolvers";
import type { Align, Breakpoint, Justify, JustifyItem } from "../../tokens";
import { paperError } from "../../internal/errors";
import { joinClass } from "../../internal/joinClass";
import { gridColumnSteps, gridRoot, gridRowSteps, gridAlign, gridJustify, gridJustifyItems } from "./Grid.css";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";

type Steps<Track> = { base?: Track } & { [Step in Breakpoint]?: Track };
type ColumnTracks = number | CSSProperties["gridTemplateColumns"];
type RowTracks = number | CSSProperties["gridTemplateRows"];

type GridOwnProps = BoxOwnProps & GapProps & {
  columns?: ColumnTracks | Steps<ColumnTracks>;
  rows?: RowTracks | Steps<RowTracks>;
  autoFlow?: CSSProperties["gridAutoFlow"];
  align?: Align;
  justify?: Justify;
  justifyItems?: JustifyItem;
};

export type GridProps<As extends ElementType = "div"> = PolymorphicProps<GridOwnProps, As>;

const tracks = (value: ColumnTracks | RowTracks) => {
  if (typeof value !== "number") return value;
  if (!Number.isInteger(value) || value < 1) throw paperError("Grid track count must be a positive integer.", RangeError);
  return `repeat(${value}, minmax(0, 1fr))`;
};

const isSteps = <Track,>(value: Track | Steps<Track>): value is Steps<Track> => typeof value === "object" && value !== null;

// Steps go through the variables their classes read: an inline track would beat every media query.
const stepped = (value: Steps<ColumnTracks | RowTracks>, rules: typeof gridColumnSteps) => {
  const given = [["base", rules.base] as const, ...(Object.entries(rules.at) as [Breakpoint, typeof rules.base][])].filter(([step]) => value[step] !== undefined);
  return {
    classes: given.map(([, rule]) => rule.className),
    variables: Object.fromEntries(given.map(([step, rule]) => [rule.property, tracks(value[step]!)])),
  };
};

const GridImpl = forwardRef<HTMLDivElement, Omit<GridProps, "as" | "ref"> & { as?: ElementType }>(function Grid({
  columns, rows, autoFlow, gap, rowGap, columnGap, align, justify, justifyItems, className, style, ...rest
}, ref) {
  const columnSteps = columns !== undefined && isSteps(columns) ? stepped(columns, gridColumnSteps) : undefined;
  const rowSteps = rows !== undefined && isSteps(rows) ? stepped(rows, gridRowSteps) : undefined;
  return <Box ref={ref} {...rest}
    className={joinClass(gridRoot, resolveGap({ gap, rowGap, columnGap }), ...(columnSteps?.classes ?? []), ...(rowSteps?.classes ?? []), align && gridAlign[align], justify && gridJustify[justify], justifyItems && gridJustifyItems[justifyItems], className)}
    style={{ gridTemplateColumns: columns === undefined || isSteps(columns) ? undefined : tracks(columns), gridTemplateRows: rows === undefined || isSteps(rows) ? undefined : tracks(rows), gridAutoFlow: autoFlow, ...columnSteps?.variables, ...rowSteps?.variables, ...style }} />;
});
export const Grid = GridImpl as PolymorphicComponent<GridOwnProps, "div">;
