// Foundations kit — Typography, Shape, Layout and Motion are drawn with this board, in the order the
// system is built: its source values, the roles that select from them, then the presets or recipes
// that combine roles into components. Color keeps its own form (AGENTS.md). The display parts at the
// end — Swatch, Chip, StepGrid, FontSample, Meter, Travel and Curve — are how every page paints a value read from a source.

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { SectionHeading } from "../../site/SectionHeading";
import * as s from "./kit.css";

type Align = keyof typeof s.align;
export type Column = { label: string; align?: Align };

export const FoundationSection = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <Stack as="section" className={s.section} gap="md">
    <SectionHeading title={title} description={description} />
    {children}
  </Stack>
);

// `template` is the board's column tracks; header, groups and rows inherit them.
export const Board = ({ columns, template, minWidth, children }: { columns: Column[]; template: string; minWidth?: string; children: ReactNode }) => (
  <Surface className={s.board} fill="raised" border radius="lg" padding="md">
    <div className={s.grid} style={{ gridTemplateColumns: `0 ${template} 0`, minWidth }}>
      <div className={s.header}>
        {columns.map((column) => <Text key={column.label} className={s.align[column.align ?? "start"]} variant="label" ink="primary">{column.label}</Text>)}
      </div>
      {children}
    </div>
  </Surface>
);

export const BoardGroup = ({ label, children }: { label?: string; children: ReactNode }) => (
  <div className={s.group}>
    {label ? <Text className={s.groupLabel} variant="label" ink="secondary">{label}</Text> : null}
    {children}
  </div>
);

export const BoardRow = ({ size = "sm", children }: { size?: keyof typeof s.row; children: ReactNode }) => (
  <div className={s.row[size]}>{children}</div>
);

export const TokenCell = ({ name, note }: { name: string; note?: ReactNode }) => (
  <Stack className={s.cell} gap="xs">
    <Text as="code" variant="caption" family="mono" ink="primary">{name}</Text>
    {note ? <Text variant="caption" ink="secondary">{note}</Text> : null}
  </Stack>
);

// Without `align` a cell fills its track; with it, the cell sits at that edge of the track.
export const Cell = ({ align, children }: { align?: Align; children: ReactNode }) => (
  <div className={align ? `${s.cell} ${s.align[align]}` : s.cell}>{children}</div>
);

export const ValueCell = ({ children, title }: { children: ReactNode; title?: string }) => (
  <Text className={s.value} variant="caption" family="mono" ink="primary" title={title}>{children}</Text>
);

export const MatrixCell = ({ caption, children }: { caption?: ReactNode; children: ReactNode }) => (
  <Stack className={s.matrixCell} gap="xs">
    {children}
    {caption ? <Text variant="caption" family="mono" ink="tertiary">{caption}</Text> : null}
  </Stack>
);

// ── Reading resolved values ─────────────────────────────────────────────────

const remToPx = (value: string) => {
  const match = /^(-?[\d.]+)rem$/.exec(value);
  return match ? `${value} · ${Math.round(Number(match[1]) * 16 * 100) / 100}px` : value;
};

// A media query reads em of the browser's default font size, so its px is the one at the default 16: "48em · 768px".
// (An em elsewhere, such as a tracking, is a ratio of its own element's font and has no px of its own.)
export const mediaValue = (value: string): string => {
  const match = /^(-?[\d.]+)em$/.exec(value);
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

// Formula roles are calc()/round() expressions; a hidden probe lets the browser evaluate them. A margin
// carries the value, since a width cannot be negative and an inset can.
export const Computed = ({ value, unit = true }: { value: string; unit?: boolean }) => {
  const probe = useRef<HTMLSpanElement>(null);
  const [length, setLength] = useState("");
  useLayoutEffect(() => {
    if (!probe.current) return;
    const n = Math.round(parseFloat(getComputedStyle(probe.current).marginLeft) * 100) / 100;
    setLength(unit ? `${n}px` : String(n));
  }, [value, unit]);
  return <>{length}<span ref={probe} aria-hidden className={s.lengthProbe} style={{ marginLeft: value }} /></>;
};

// Several sizes of one role, joined the way the docs write them: "7 · 8 · 10".
export const Ladder = ({ values }: { values: string[] }) => (
  <>{values.map((value, index) => <span key={value + index}>{index > 0 ? " · " : ""}<Computed value={value} unit={false} /></span>)}</>
);

// ── Display parts ───────────────────────────────────────────────────────────

// One palette step, painted with its generated colour.
export const Swatch = ({ color, label }: { color: string; label: string }) => (
  <Surface className={s.swatch} border radius="sm" title={`${label} · ${color}`} aria-label={`${label} ${color}`} style={{ background: color }} />
);

// A semantic role as it renders now, painted through its token.
export const Chip = ({ path }: { path: s.ChipRole }) => <Surface className={`${s.chipBox} ${s.chip[path]}`} border radius="sm" />;

export const StepGrid = ({ steps, children, ...rest }: { steps: number; children: ReactNode; "data-testid"?: string }) => (
  <div className={s.stepGrid} style={{ [s.stepsProperty]: steps } as CSSProperties} {...rest}>{children}</div>
);

// A line set in one Palette value, named by the declarations that give it.
export const FontSample = ({ font, className, children }: { font: Pick<CSSProperties, "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "letterSpacing" | "textDecoration" | "textUnderlineOffset">; className?: string; children: ReactNode }) => (
  <Text className={className} variant="body" ink="primary" style={font}>{children}</Text>
);

// A bar as long as `value` is of `max`.
export const Meter = ({ value, max }: { value: number; max: number }) => (
  <div className={s.bar} style={{ width: `${Math.round((value / max) * 1000) / 10}%` }} />
);

// A dot that crosses its track while the pointer is over it, with the given timing.
export const Travel = ({ duration, easing }: { duration: string; easing: string }) => (
  <div className={s.travelTrack} title="포인터를 올리면 움직입니다">
    <span className={s.travelDot} style={{ transitionDuration: duration, transitionTimingFunction: easing }} />
  </div>
);

// The easing drawn as its curve on a 64 × 32 plot.
export const Curve = ({ easing }: { easing: string }) => {
  const points = /cubic-bezier\(([^)]+)\)/.exec(easing)?.[1]?.split(",").map(Number) ?? [0, 0, 1, 1];
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = points;
  const d = `M0 32 C ${x1 * 64} ${32 - y1 * 32}, ${x2 * 64} ${32 - y2 * 32}, 64 0`;
  return <svg className={s.curve} viewBox="-2 -6 68 44" aria-hidden="true"><path d={d} /></svg>;
};
