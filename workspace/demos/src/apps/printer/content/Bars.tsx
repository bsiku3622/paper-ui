import { useState, type CSSProperties } from "react";

import { Box, elevation } from "@studio-baeks/paper-ui";

import { axisText, bar as barRow, barOf, cell, dim, frame, gridLine, part as partClass, plot, relative, tipAfter, tipAt, tipBefore, tipName, tipRow, tipTitle, tipValue, tooltip, type Tone } from "./charts.css";
import { useSize } from "./useSize";

export type Column = { id: string; label: string; value: number; title: string; readout: string };

type ColumnsProps = { data: readonly Column[]; tone?: Tone; unit: string; height?: number; label: string };

const MARGIN = { left: 40, right: 8, top: 10, bottom: 24 };

const niceTop = (value: number) => {
  if (value <= 0) return 1;
  const exponent = 10 ** Math.floor(Math.log10(value));
  const fraction = value / exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * exponent;
};

export const ColumnChart = ({ data, tone = "info", unit, height = 188, label }: ColumnsProps) => {
  const [ref, size] = useSize<HTMLDivElement>();
  const [at, setAt] = useState<{ index: number; left: number; top: number; flip: boolean } | null>(null);
  const width = Math.max(size.width, 240);
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const top = niceTop(Math.max(0, ...data.map((item) => item.value)));
  const slot = plotW / Math.max(1, data.length);
  const bar = Math.min(24, slot * 0.62);
  const y = (value: number) => MARGIN.top + plotH - (value / top) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((share) => share * top);
  const radius = 4;
  const hold = (index: number) => setAt({ index, left: MARGIN.left + slot * index + slot / 2, top: MARGIN.top, flip: index > data.length * 0.6 });
  return (
    <div ref={ref} className={frame}>
      <Box className={relative} height={height}>
        <svg width={width} height={height} role="img" aria-label={label} className={plot}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line className={gridLine} x1={MARGIN.left} x2={MARGIN.left + plotW} y1={y(tick)} y2={y(tick)} />
              <text className={axisText} x={MARGIN.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle">{Number.isInteger(tick) ? tick : tick.toFixed(1)}</text>
            </g>
          ))}
          {data.map((item, index) => {
            const x = MARGIN.left + slot * index + (slot - bar) / 2;
            const h = (item.value / top) * plotH;
            const base = MARGIN.top + plotH;
            const r = Math.min(radius, h);
            return (
              <g key={item.id}>
                {item.value > 0 ? (
                  <path
                    d={`M${x} ${base}V${base - h + r}Q${x} ${base - h} ${x + r} ${base - h}H${x + bar - r}Q${x + bar} ${base - h} ${x + bar} ${base - h + r}V${base}Z`}
                    className={at === null || at.index === index ? barOf[tone] : `${barOf[tone]} ${dim}`}
                  />
                ) : null}
                <text className={axisText} x={x + bar / 2} y={height - 6} textAnchor="middle">{item.label}</text>
                <rect
                  className={cell}
                  x={MARGIN.left + slot * index}
                  y={MARGIN.top}
                  width={slot}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  role="img"
                  aria-label={`${item.title}: ${item.readout}`}
                  onPointerEnter={() => hold(index)}
                  onPointerLeave={() => setAt(null)}
                  onFocus={() => hold(index)}
                  onBlur={() => setAt(null)}
                />
              </g>
            );
          })}
          <text className={axisText} x={MARGIN.left} y={MARGIN.top - 2} dominantBaseline="auto" aria-hidden="true">{unit}</text>
        </svg>
        {at !== null && data[at.index] ? (
          <div className={`${tooltip} ${tipAt} ${at.flip ? tipBefore : tipAfter} ${elevation.overlay}`} style={{ "--tip-x": `${at.left}px`, "--tip-y": `${at.top}px` } as CSSProperties}>
            <div className={tipTitle}>{data[at.index]!.title}</div>
            <div className={tipRow}>
              <span className={tipValue}>{data[at.index]!.readout}</span>
              <span className={tipName}>{unit}</span>
            </div>
          </div>
        ) : null}
      </Box>
    </div>
  );
};

export type Part = { id: string; label: string; value: number; tone: Tone };

export const SegmentedBar = ({ parts, label }: { parts: readonly Part[]; label: string }) => {
  const shown = parts.filter((part) => part.value > 0);
  return (
    <div role="img" aria-label={label} className={barRow}>
      {shown.map((part) => (
        <span key={part.id} title={`${part.label} ${part.value}`} className={`${partClass} ${barOf[part.tone]}`} style={{ flexGrow: part.value }} />
      ))}
    </div>
  );
};
