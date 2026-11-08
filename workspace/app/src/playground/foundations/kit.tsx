import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { pick as inLocale, useSiteLocale, useWords, type Bilingual } from "../../site/locale";
import { SectionHeading } from "../../site/SectionHeading";

export const useT = () => {
  const { locale } = useSiteLocale();
  return <T,>(words: Bilingual<T>): T => inLocale(words, locale);
};
import * as s from "./kit.css";

type Align = keyof typeof s.align;
export type Column = { label: string; align?: Align; track: string };

export const FoundationSection = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <Stack as="section" className={s.section} gap="md">
    <SectionHeading title={title} description={description} />
    {children}
  </Stack>
);

export const Board = ({ columns, minWidth, children }: { columns: Column[]; minWidth?: string; children: ReactNode }) => (
  <Surface className={s.board} fill="raised" border radius="lg" padding="md">
    <div className={s.grid} style={{ gridTemplateColumns: `0 ${columns.map((column) => column.track).join(" ")} 0`, minWidth }}>
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

const remToPx = (value: string) => {
  const match = /^(-?[\d.]+)rem$/.exec(value);
  return match ? `${value} · ${Math.round(Number(match[1]) * 16 * 100) / 100}px` : value;
};

export const mediaValue = (value: string): string => {
  const match = /^(-?[\d.]+)em$/.exec(value);
  return match ? `${value} · ${Math.round(Number(match[1]) * 16 * 100) / 100}px` : value;
};

export const resolved = (ref: string): string => {
  if (!ref.startsWith("var(")) return remToPx(ref);
  const name = (ref.slice(4, -1).split(",")[0] ?? "").trim();
  return remToPx(getComputedStyle(document.documentElement).getPropertyValue(name).trim() || ref);
};

export const px = (ref: string): string => resolved(ref).match(/(-?[\d.]+px)$/)?.[1] ?? resolved(ref);

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

export const Ladder = ({ values }: { values: string[] }) => (
  <>{values.map((value, index) => <span key={value + index}>{index > 0 ? " · " : ""}<Computed value={value} unit={false} /></span>)}</>
);

export const Swatch = ({ color, label }: { color: string; label: string }) => (
  <Surface className={s.swatch} border radius="sm" title={`${label} · ${color}`} aria-label={`${label} ${color}`} style={{ background: color }} />
);

export const Chip = ({ path }: { path: s.ChipRole }) => <Surface className={`${s.chipBox} ${s.chip[path]}`} border radius="sm" />;

export const StepGrid = ({ steps, children, ...rest }: { steps: number; children: ReactNode; "data-testid"?: string }) => (
  <div className={s.stepGrid} style={{ [s.stepsProperty]: steps } as CSSProperties} {...rest}>{children}</div>
);

export const FontSample = ({ font, className, children }: { font: Pick<CSSProperties, "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "letterSpacing" | "textDecoration" | "textUnderlineOffset">; className?: string; children: ReactNode }) => (
  <Text className={className} variant="body" ink="primary" style={font}>{children}</Text>
);

export const Meter = ({ value, max }: { value: number; max: number }) => (
  <div className={s.bar} style={{ width: `${Math.round((value / max) * 1000) / 10}%` }} />
);

const TRAVEL_TITLE: Bilingual = { ko: "포인터를 올리면 움직입니다", en: "Moves when the pointer is over it" };
export const Travel = ({ duration, easing }: { duration: string; easing: string }) => (
  <div className={s.travelTrack} title={useWords(TRAVEL_TITLE)}>
    <span className={s.travelDot} style={{ transitionDuration: duration, transitionTimingFunction: easing }} />
  </div>
);

export const Curve = ({ easing }: { easing: string }) => {
  const points = /cubic-bezier\(([^)]+)\)/.exec(easing)?.[1]?.split(",").map(Number) ?? [0, 0, 1, 1];
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = points;
  const d = `M0 32 C ${x1 * 64} ${32 - y1 * 32}, ${x2 * 64} ${32 - y2 * 32}, 64 0`;
  return <svg className={s.curve} viewBox="-2 -6 68 44" aria-hidden="true"><path d={d} /></svg>;
};
