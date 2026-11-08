import type { ReactNode } from "react";

import { Box, Divider, Grid, Stack, Surface, Text } from "@studio-baeks/paper-ui";
import type { Breakpoint } from "@studio-baeks/paper-ui/tokens";

import { useAtLeast } from "../content/viewport";

export type Column<T> = {
  id: string;
  header: ReactNode;
  track: string;
  render: (row: T) => ReactNode;
};

export type TableProps<T> = {
  label: string;
  rows: readonly T[];
  rowKey: (row: T) => string;
  columns: readonly Column<T>[];
  card: (row: T) => ReactNode;
  stackBelow?: Breakpoint;
  isSelected?: (row: T) => boolean;
  dense?: boolean;
};

export const Table = <T,>({ label, rows, rowKey, columns, card, stackBelow = "xl", isSelected, dense = false }: TableProps<T>) => {
  const wide = useAtLeast(stackBelow);
  if (!wide) {
    return (
      <Stack as="ul" aria-label={label}>
        {rows.map((row, index) => (
          <Stack key={rowKey(row)} as="li">
            {index > 0 ? <Divider aria-hidden /> : null}
            <Box paddingX={dense ? undefined : "lg"} paddingY="md">{card(row)}</Box>
          </Stack>
        ))}
      </Stack>
    );
  }
  const template = columns.map((column) => column.track).join(" ");
  const side = dense ? undefined : "xl";
  return (
    <Box overflowX="auto">
      <Box role="table" aria-label={label} minWidth="min-content">
        <Box role="rowgroup">
          <Grid role="row" columns={template} gap="sm" paddingX={side} paddingY="sm">
            {columns.map((column) => (
              <Box key={column.id} role="columnheader" minWidth={0}>
                <Text as="span" variant="label" strong={false} ink="tertiary">{column.header}</Text>
              </Box>
            ))}
          </Grid>
          <Divider aria-hidden />
        </Box>
        <Box role="rowgroup">
          {rows.map((row, index) => (
            <Box key={rowKey(row)}>
              {index > 0 ? <Divider aria-hidden /> : null}
              <Surface as={Grid} role="row" hoverable={!dense} selected={isSelected?.(row)} aria-selected={isSelected ? isSelected(row) : undefined} columns={template} gap="sm" align="center" paddingX={side} paddingY={dense ? "sm" : "md"}>
                {columns.map((column) => (
                  <Box key={column.id} role="cell" minWidth={0}>{column.render(row)}</Box>
                ))}
              </Surface>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export const Two = ({ top, sub, strong, subMono }: { top: ReactNode; sub?: ReactNode; strong?: boolean; subMono?: boolean }) => (
  <Stack minWidth={0}>
    <Text as="span" strong={strong} truncate>{top}</Text>
    {sub ? <Text as="span" variant="label" strong={false} ink="tertiary" family={subMono ? "mono" : undefined} numeric truncate>{sub}</Text> : null}
  </Stack>
);
