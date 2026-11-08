// A list of bars: one Meter a row, its name above and its number at the end. A row with a link opens a search for what it
// names; a long list shows its first rows and opens the rest with "더 보기". The bars are neutral ink and thin — a bar's
// length is the only thing it says, and fifteen of them should not read as a barcode.

import { useState } from "react";

import { Box, Button, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, Meter, SurfaceLink } from "../../../../kit";

export type Bar = {
  key: string;
  label: string;
  // 0 to 1: how long the bar is.
  value: number;
  valueText: string;
  // Where the row leads. Without it the row is only read.
  href?: string;
  hint?: string;
  // A small quiet line under the bar.
  note?: string;
};

const Row = ({ row, dense }: { row: Bar; dense: boolean }) => {
  const body = (
    <Stack gap="xs">
      <Meter value={row.value} label={row.label} valueText={row.valueText} weight="thin" />
      {row.note ? <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{row.note}</Text> : null}
    </Stack>
  );
  return row.href ? (
    <SurfaceLink to={row.href} paddingX="md" paddingY="sm" radius="md" aria-label={row.hint ?? `${row.label} ${row.valueText}`}>{body}</SurfaceLink>
  ) : (
    <Box paddingX="md" paddingY={dense ? "xs" : "sm"}>{body}</Box>
  );
};

export const BarList = ({ rows, name, limit, dense = false }: { rows: readonly Bar[]; name: string; limit?: number; dense?: boolean }) => {
  const [all, setAll] = useState(false);
  const shown = limit !== undefined && !all ? rows.slice(0, limit) : rows;
  const hidden = rows.length - shown.length;
  return (
    <Stack gap="sm">
      <Stack as="ul" aria-label={name} gap={dense ? undefined : "xs"}>
        {shown.map((row) => (
          <Stack as="li" key={row.key}>
            <Row row={row} dense={dense} />
          </Stack>
        ))}
      </Stack>
      {limit !== undefined && rows.length > limit ? (
        <Inline justify="center">
          <Button variant="ghost" size="sm" aria-expanded={all} onClick={() => setAll((now) => !now)}>
            <Glyph name={all ? "minus" : "plus"} />
            {all ? "접기" : `더 보기 (${hidden})`}
          </Button>
        </Inline>
      ) : null}
    </Stack>
  );
};
