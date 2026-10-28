// Foundations kit — every system page is built from these pieces, in the order the system is
// built: its source values, the roles that select from them, then the presets or recipes that
// combine roles into components.

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { Box, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import * as s from "./kit.css";

type Align = keyof typeof s.align;
export type Column = { label: string; align?: Align };

// `aside` sits at the far end of the heading row — a reading hint such as a scale direction.
export const FoundationSection = ({ title, description, aside, children }: { title: string; description: string; aside?: ReactNode; children: ReactNode }) => (
  <Stack as="section" className={s.section} gap="md">
    <Inline justify="between" align="end" gap="md">
      <Stack gap="xs">
        <Text as="h2" variant="heading">{title}</Text>
        <Text variant="body" ink="soft">{description}</Text>
      </Stack>
      {aside ? <div className={s.aside}>{aside}</div> : null}
    </Inline>
    {children}
  </Stack>
);

// `template` is the board's column tracks; header, groups and rows inherit them. A `bare` board
// drops the raised box and its rules and sits straight on the page, flush with the heading —
// for specimens that are the content themselves, like the palette ramp.
export const Board = ({ columns, template, minWidth, bare = false, children }: { columns: Column[]; template: string; minWidth?: string; bare?: boolean; children: ReactNode }) => {
  const grid = (
    <div className={s.grid} style={{ gridTemplateColumns: `0 ${template} 0`, minWidth }}>
      <div className={s.header}>
        {columns.map((column) => <Text key={column.label} className={s.align[column.align ?? "start"]} variant="label" ink="base">{column.label}</Text>)}
      </div>
      {children}
    </div>
  );
  return bare ? <div className={`${s.board} ${s.bare}`}>{grid}</div> : <Box className={s.board} surface="raised" border radius="lg" padding="md">{grid}</Box>;
};

export const BoardGroup = ({ label, children }: { label?: string; children: ReactNode }) => (
  <div className={s.group}>
    {label ? <Text className={s.groupLabel} variant="label" ink="soft">{label}</Text> : null}
    {children}
  </div>
);

export const BoardRow = ({ size = "sm", children }: { size?: keyof typeof s.row; children: ReactNode }) => (
  <div className={s.row[size]}>{children}</div>
);

export const TokenCell = ({ name, note }: { name: string; note?: ReactNode }) => (
  <Stack className={s.cell} gap="xs">
    <Text as="code" variant="caption" family="mono" ink="base">{name}</Text>
    {note ? <Text variant="caption" ink="soft">{note}</Text> : null}
  </Stack>
);

// Without `align` a cell fills its track; with it, the cell sits at that edge of the track.
// `span` lets one cell cover several tracks, for a row that does not follow the column headers.
export const Cell = ({ align, span, children }: { align?: Align; span?: number; children: ReactNode }) => (
  <div className={align ? `${s.cell} ${s.align[align]}` : s.cell} style={span ? { gridColumn: `span ${span}` } : undefined}>{children}</div>
);

export const ValueCell = ({ children, title }: { children: ReactNode; title?: string }) => (
  <Text className={s.value} variant="caption" family="mono" ink="base" title={title}>{children}</Text>
);

export const MatrixCell = ({ caption, children }: { caption?: ReactNode; children: ReactNode }) => (
  <Stack className={s.matrixCell} gap="xs">
    {children}
    {caption ? <Text variant="caption" family="mono" ink="faint">{caption}</Text> : null}
  </Stack>
);

// ── Reading resolved values ─────────────────────────────────────────────────

const remToPx = (value: string) => {
  const match = /^(-?[\d.]+)rem$/.exec(value);
  return match ? `${value} · ${Math.round(Number(match[1]) * 16 * 100) / 100}px` : value;
};

// What the browser resolved for a token reference, in the current theme.
export const resolved = (ref: string): string => {
  if (!ref.startsWith("var(")) return remToPx(ref);
  const name = (ref.slice(4, -1).split(",")[0] ?? "").trim();
  return remToPx(getComputedStyle(document.documentElement).getPropertyValue(name).trim() || ref);
};

// Just the px part of a resolved length ("0.75rem · 12px" → "12px").
export const px = (ref: string): string => resolved(ref).match(/(-?[\d.]+px)$/)?.[1] ?? resolved(ref);

// Formula roles are calc()/round() expressions; a hidden probe lets the browser evaluate them.
export const Computed = ({ value, unit = true }: { value: string; unit?: boolean }) => {
  const probe = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState("");
  useLayoutEffect(() => {
    if (!probe.current) return;
    const n = Math.round(parseFloat(getComputedStyle(probe.current).width) * 100) / 100;
    setWidth(unit ? `${n}px` : String(n));
  }, [value, unit]);
  return <>{width}<span ref={probe} aria-hidden style={{ position: "absolute", visibility: "hidden", width: value }} /></>;
};

// Several sizes of one role, joined the way the docs write them: "7 · 8 · 10".
export const Ladder = ({ values }: { values: string[] }) => (
  <>{values.map((value, index) => <span key={value + index}>{index > 0 ? " · " : ""}<Computed value={value} unit={false} /></span>)}</>
);
