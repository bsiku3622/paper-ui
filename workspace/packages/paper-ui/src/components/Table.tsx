// Table — 장부의 본체. 이 시스템이 존재하는 이유에 가장 가까운 컴포넌트.
//
// column 을 data 로 받는다. 행을 손으로 그리게 두면 숫자 열 정렬을 매번 다시
// 정하게 되고, 그 순간 장부가 무너진다.

import type { ReactNode } from "react";

import { Box } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { tableRoot, tableHead, tableTh, tableTr, tableTd, tableNumeric } from "./Table.css";

export type Column<T> = {
  key: string;
  header: ReactNode;
  // 숫자 열 — mono·tabular·우측정렬이 자동으로 붙는다.
  numeric?: boolean;
  render: (row: T) => ReactNode;
};

export type TableProps<T> = {
  columns: readonly Column<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  className?: string;
};

export const Table = <T,>({ columns, rows, rowKey, className }: TableProps<T>) => (
  <Box as="table" className={joinClass(tableRoot, className)}>
    <Box as="thead" className={tableHead}>
      <Box as="tr">
        {columns.map((c) => (
          <Box
            as="th"
            key={c.key}
            scope="col"
            className={joinClass("paper-text-label", tableTh, c.numeric && tableNumeric)}
          >
            {c.header}
          </Box>
        ))}
      </Box>
    </Box>
    <Box as="tbody">
      {rows.map((r) => (
        <Box as="tr" key={rowKey(r)} className={tableTr}>
          {columns.map((c) => (
            <Box as="td" key={c.key} className={joinClass(tableTd, c.numeric && tableNumeric)}>
              {c.render(r)}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  </Box>
);
