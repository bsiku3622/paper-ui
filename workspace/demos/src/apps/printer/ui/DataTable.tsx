import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react";

import { Box, Checkbox, Divider, Grid, IconButton, Inline, Pressable, Select, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph } from "../../../kit";
import { useSettings } from "../settings";

export type Column<T> = {
  id: string;
  header: string;
  track: string;
  sortable?: boolean;
  cell: (row: T, dim: boolean) => ReactNode;
};

export type Sort = { id: string; desc: boolean };

type TableProps<T> = {
  label: string;
  columns: readonly Column<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  sort?: Sort;
  onSort?: (id: string) => void;
  selection?: { selected: ReadonlySet<string>; onToggle: (key: string) => void; onToggleAll: (checked: boolean) => void; canSelect?: (row: T) => boolean };
  onOpen?: (row: T) => void;
  isDim?: (row: T) => boolean;
  compact?: boolean;
  empty?: ReactNode;
};

export const DataTable = <T,>({ label, columns, rows, rowKey, sort, onSort, selection, onOpen, isDim, compact: given, empty }: TableProps<T>) => {
  const { settings } = useSettings();
  const compact = given ?? settings.ui.compact;
  const template = [selection ? "1.5rem" : null, ...columns.map((column) => column.track)].filter(Boolean).join(" ");
  const keys = rows.map(rowKey);
  const pickable = selection?.canSelect ? rows.filter((row) => selection.canSelect!(row)).length : rows.length;
  const chosen = selection ? keys.filter((key) => selection.selected.has(key)).length : 0;
  return (
    <Box overflowX="auto">
      <Box role="table" aria-label={label} minWidth="min-content">
        <Box role="rowgroup">
          <Grid role="row" columns={template} gap="md" align="center" paddingX="lg" paddingY="xs">
            {selection ? (
              <Box role="columnheader">
                <Checkbox aria-label="이 쪽 모두 선택" checked={pickable > 0 && chosen === pickable} indeterminate={chosen > 0 && chosen < pickable} onChange={(event) => selection.onToggleAll(event.target.checked)} />
              </Box>
            ) : null}
            {columns.map((column) => (
              <Box key={column.id} role="columnheader" aria-sort={sort?.id === column.id ? (sort.desc ? "descending" : "ascending") : undefined} minWidth={0}>
                {column.sortable && onSort ? (
                  <Pressable onPress={() => onSort(column.id)} aria-label={`${column.header} 정렬`}>
                    <Inline gap="xs" align="center">
                      <Text as="span" variant="label" strong={sort?.id === column.id} ink={sort?.id === column.id ? "primary" : "tertiary"}>{column.header}</Text>
                      {sort?.id === column.id ? <Glyph name={sort.desc ? "arrow-down" : "arrow-up"} size="label" /> : null}
                    </Inline>
                  </Pressable>
                ) : (
                  <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{column.header}</Text>
                )}
              </Box>
            ))}
          </Grid>
          <Divider aria-hidden />
        </Box>
        <Box role="rowgroup">
          {rows.length === 0 ? (
            empty ?? <Empty glyph="inbox" title="표시할 항목이 없습니다" />
          ) : (
            rows.map((row, index) => {
              const key = keys[index]!;
              const dim = isDim?.(row) ?? false;
              const picked = selection?.selected.has(key) ?? false;
              return (
                <Box key={key}>
                  {index > 0 ? <Divider aria-hidden /> : null}
                  <Surface
                    as={Grid}
                    role="row"
                    hoverable={onOpen !== undefined}
                    selected={picked}
                    tabIndex={onOpen ? 0 : undefined}
                    columns={template}
                    gap="md"
                    align="center"
                    paddingX="lg"
                    paddingY={compact ? "xs" : "sm"}
                    onClick={onOpen ? () => onOpen(row) : undefined}
                    onKeyDown={onOpen ? (event: ReactKeyboardEvent) => { if (event.key === "Enter" && event.target === event.currentTarget) onOpen(row); } : undefined}
                  >
                    {selection ? (
                      <Box role="cell" onClick={(event: ReactMouseEvent) => event.stopPropagation()}>
                        {selection.canSelect && !selection.canSelect(row) ? null : <Checkbox aria-label={`${key} 선택`} checked={picked} onChange={() => selection.onToggle(key)} />}
                      </Box>
                    ) : null}
                    {columns.map((column) => (
                      <Box key={column.id} role="cell" minWidth={0}>{column.cell(row, dim)}</Box>
                    ))}
                  </Surface>
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    </Box>
  );
};

type PagerProps = {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onSize: (size: number) => void;
  noun: string;
  sizes?: readonly number[];
};

export const Pager = ({ page, pageSize, total, onPage, onSize, noun, sizes = [10, 25, 50, 100] }: PagerProps) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  return (
    <Inline as="nav" aria-label={`${noun} 쪽`} justify="end" align="center" gap="lg" wrap paddingX="lg" paddingY="sm">
      <Inline gap="sm" align="center">
        <Text as="span" variant="caption" ink="tertiary">{noun}</Text>
        <Select size="sm" variant="ghost" aria-label={`쪽당 ${noun} 수`} value={String(pageSize)} onChange={(event) => onSize(Number(event.target.value))}>
          {sizes.map((size) => <Select.Option key={size} value={String(size)}>{size}</Select.Option>)}
        </Select>
      </Inline>
      <Text as="span" variant="caption" ink="tertiary" numeric>{from}–{to} / {total}</Text>
      <Inline gap="xs">
        <IconButton variant="ghost" size="sm" aria-label="이전 쪽" disabled={page <= 0} onClick={() => onPage(page - 1)}><Glyph name="chevron-left" /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="다음 쪽" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}><Glyph name="chevron-right" /></IconButton>
      </Inline>
    </Inline>
  );
};
