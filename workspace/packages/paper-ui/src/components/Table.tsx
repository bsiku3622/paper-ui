// Table — 화면에 보이는 table anatomy를 JSX 구조로 그대로 드러낸다.

import { createContext, useContext, type ReactNode } from "react";

import { Box, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { textTypography } from "../styles/typography.css";
import {
  tableRoot,
  tableCaption,
  tableHead,
  tableHeadSticky,
  tableTh,
  tableTr,
  tableTd,
  tableNumeric,
  tableRowVariant,
  tableRowDensity,
  tableHeadDensity,
  tableCellDensity,
  tableEmptyCell,
  tableAlign,
} from "./Table.css";

export type TableVariant = "plain" | "ruled" | "striped";
export type TableDensity = "compact" | "default" | "comfortable";
export type TableAlign = "start" | "center" | "end";

type TableContextValue = { variant: TableVariant; density: TableDensity };
const TableContext = createContext<TableContextValue>({ variant: "plain", density: "default" });
const useTable = () => useContext(TableContext);

export type TableRootProps = Omit<BoxProps<"table">, "as"> & {
  variant?: TableVariant;
  density?: TableDensity;
};

export const TableRoot = ({ variant = "plain", density = "default", className, children, ...rest }: TableRootProps) => (
  <TableContext.Provider value={{ variant, density }}>
    <Box as="table" className={joinClass(tableRoot, className)} {...rest}>{children}</Box>
  </TableContext.Provider>
);

export type TableCaptionProps = Omit<BoxProps<"caption">, "as">;
export const TableCaption = ({ className, ...rest }: TableCaptionProps) => (
  <Box as="caption" className={joinClass("pui-text-caption", tableCaption, className)} {...rest} />
);

export type TableHeaderProps = Omit<BoxProps<"thead">, "as"> & { sticky?: boolean };
export const TableHeader = ({ sticky, className, children, ...rest }: TableHeaderProps) => (
  <Box as="thead" className={joinClass(tableHead, sticky && tableHeadSticky, className)} {...rest}>
    <Box as="tr">{children}</Box>
  </Box>
);

export type TableBodyProps = Omit<BoxProps<"tbody">, "as">;
export const TableBody = (props: TableBodyProps) => <Box as="tbody" {...props} />;

export type TableRowProps = Omit<BoxProps<"tr">, "as">;
export const TableRow = ({ className, ...rest }: TableRowProps) => {
  const { variant, density } = useTable();
  return <Box as="tr" className={joinClass(tableTr, tableRowVariant[variant], tableRowDensity[density], className)} {...rest} />;
};

type CellAxis = { align?: TableAlign; numeric?: boolean };
export type TableColumnProps = Omit<BoxProps<"th">, "as" | "align"> & CellAxis;
export const TableColumn = ({ align, numeric, className, ...rest }: TableColumnProps) => {
  const { density } = useTable();
  const resolved = align ?? (numeric ? "end" : "start");
  return (
    <Box
      as="th"
      scope="col"
      className={joinClass("pui-text-label", tableTh, tableHeadDensity[density], tableCellDensity[density], tableAlign[resolved], numeric && tableNumeric, className)}
      {...rest}
    />
  );
};

export type TableCellProps = Omit<BoxProps<"td">, "as" | "align"> & CellAxis;
export const TableCell = ({ align, numeric, className, ...rest }: TableCellProps) => {
  const { density } = useTable();
  const resolved = align ?? (numeric ? "end" : "start");
  return <Box as="td" className={joinClass(textTypography.body, tableTd, tableCellDensity[density], tableAlign[resolved], numeric && tableNumeric, className)} {...rest} />;
};

export type Column<T> = {
  key: string;
  header: ReactNode;
  numeric?: boolean;
  align?: TableAlign;
  render: (row: T) => ReactNode;
};

export type DataTableProps<T> = Omit<TableRootProps, "children"> & {
  columns: readonly Column<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  caption?: ReactNode;
  empty?: ReactNode;
  stickyHeader?: boolean;
};

export const DataTable = <T,>({ columns, rows, rowKey, variant = "plain", density = "default", caption, empty, stickyHeader, ...rest }: DataTableProps<T>) => (
  <TableRoot variant={variant} density={density} {...rest}>
    {caption != null ? <TableCaption>{caption}</TableCaption> : null}
    <TableHeader sticky={stickyHeader}>
      {columns.map((column) => (
        <TableColumn key={column.key} align={column.align} numeric={column.numeric}>{column.header}</TableColumn>
      ))}
    </TableHeader>
    <TableBody>
      {rows.length === 0 && empty != null ? (
        <Box as="tr"><Box as="td" colSpan={columns.length} className={tableEmptyCell}>{empty}</Box></Box>
      ) : rows.map((row) => (
        <TableRow key={rowKey(row)}>
          {columns.map((column) => (
            <TableCell key={column.key} align={column.align} numeric={column.numeric}>{column.render(row)}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </TableRoot>
);

export type TableProps = TableRootProps;

export const Table = Object.assign(TableRoot, {
  Caption: TableCaption,
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Column: TableColumn,
  Cell: TableCell,
});
