import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { Badge, Box, Button, Field, Grid, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";
import type { Accent, Breakpoint } from "@studio-baeks/paper-ui/tokens";

import { formatDate, formatTime, Glyph } from "../../../../kit";
import type { Clock } from "../../state";
import { Dialog } from "../../ui/parts";

export const stamp = (clock: Clock) => `${clock.key}T${String(Math.floor(clock.minute / 60)).padStart(2, "0")}:${String(clock.minute % 60).padStart(2, "0")}:00+09:00`;

export const whenLabel = (iso: string) => {
  const date = new Date(iso);
  return `${formatDate(date)} ${formatTime(date)}`;
};
export const dayLabel = (iso: string) => formatDate(new Date(iso));

export const nextId = (rows: readonly { id: number }[]) => Math.max(0, ...rows.map((row) => row.id)) + 1;

export const useBriefly = (milliseconds = 700) => {
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const run = useCallback(
    (done?: () => void) => {
      window.clearTimeout(timer.current);
      setBusy(true);
      timer.current = window.setTimeout(() => {
        setBusy(false);
        done?.();
      }, milliseconds);
    },
    [milliseconds],
  );
  return [busy, run] as const;
};

export const Mono = ({ children, strong = false, ink }: { children: ReactNode; strong?: boolean; ink?: "primary" | "secondary" | "tertiary" }) => (
  <Text as="span" family="mono" strong={strong} ink={ink}>{children}</Text>
);

export const Toolbar = ({ start, end }: { start?: ReactNode; end?: ReactNode }) => (
  <Inline justify="between" align="center" gap="md" wrap>
    <Inline gap="sm" align="center" wrap minWidth={0}>{start}</Inline>
    <Inline gap="sm" align="center" wrap>{end}</Inline>
  </Inline>
);

export const SearchField = ({ value, onChange, placeholder, label }: { value: string; onChange: (value: string) => void; placeholder: string; label: string }) => (
  <Box width="full" maxWidth="xl">
    <Field aria-label={label} placeholder={placeholder} leading={<Glyph name="search" />} value={value} clearable onChange={(event) => onChange(event.target.value)} />
  </Box>
);

export const StatusDot = ({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) => (
  <Inline as="span" gap="xs" align="center">
    <Badge dot size="xs" variant="soft" accent={on ? "success" : "primary"} aria-label="" />
    <Text as="span" variant="caption" ink={on ? "success" : "tertiary"}>{on ? onLabel : offLabel}</Text>
  </Inline>
);

export type Tracks = string | { base?: string; sm?: string; md?: string; lg?: string; xl?: string };
export type Column = { head: ReactNode; hideBelow?: Breakpoint; end?: boolean };
export type TableRow = { id: string | number; cells: ReactNode[] };

export const Table = ({ label, columns, tracks, rows }: { label: string; columns: readonly Column[]; tracks: Tracks; rows: readonly TableRow[] }) => (
  <Stack>
    <Grid columns={tracks} gap="md" align="center" paddingX="md" paddingY="sm" hideBelow="md" aria-hidden>
      {columns.map((column, index) => (
        <Box key={index} hideBelow={column.hideBelow} minWidth={0}>
          {column.end ? (
            <Inline justify="end"><Text as="span" variant="label" strong={false} ink="tertiary">{column.head}</Text></Inline>
          ) : (
            <Text as="span" variant="label" strong={false} ink="tertiary">{column.head}</Text>
          )}
        </Box>
      ))}
    </Grid>
    <Stack as="ul" aria-label={label}>
      {rows.map((row) => (
        <Surface as="li" key={row.id} border="top" paddingX="md" paddingY="sm">
          <Grid columns={tracks} gap="md" align="center">
            {columns.map((column, index) => (
              <Box key={index} hideBelow={column.hideBelow} minWidth={0}>
                {column.end ? <Inline justify="end" align="center" gap="xs">{row.cells[index]}</Inline> : row.cells[index]}
              </Box>
            ))}
          </Grid>
        </Surface>
      ))}
    </Stack>
  </Stack>
);

export const Pager = ({ page, pages, onPage, note }: { page: number; pages: number; onPage: (page: number) => void; note?: ReactNode }) => (
  <Inline gap="sm" align="center" wrap>
    {note ? <Text as="span" variant="caption" ink="tertiary">{note}</Text> : null}
    <IconButton variant="hairline" size="sm" aria-label="이전 쪽" disabled={page <= 1} onClick={() => onPage(page - 1)}><Glyph name="chevron-left" /></IconButton>
    <Text as="span" variant="caption" numeric>{page} / {pages} 쪽</Text>
    <IconButton variant="hairline" size="sm" aria-label="다음 쪽" disabled={page >= pages} onClick={() => onPage(page + 1)}><Glyph name="chevron-right" /></IconButton>
  </Inline>
);

export const ConfirmDialog = ({ open, onClose, title, description, confirmLabel, tone, onConfirm, children }: { open: boolean; onClose: () => void; title: string; description?: ReactNode; confirmLabel: string; tone?: Accent; onConfirm: () => void; children?: ReactNode }) => (
  <Dialog
    open={open}
    onOpenChange={(next) => {
      if (!next) onClose();
    }}
    title={title}
    description={description}
    size="measure.xs"
    footer={
      <>
        <Button variant="hairline" onClick={onClose}>취소</Button>
        <Button variant="solid" accent={tone} onClick={onConfirm}>{confirmLabel}</Button>
      </>
    }
  >
    {children ?? null}
  </Dialog>
);
