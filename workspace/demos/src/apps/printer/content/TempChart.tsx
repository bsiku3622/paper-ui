// The temperature chart. Paper has no chart: this draws the heaters' last minutes as lines (2px, one axis, hairline grid),
// with a crosshair that snaps to the nearest second and one readout that lists every series. Colours are Paper tokens.

import { useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

import { Box, elevation } from "@studio-baeks/paper-ui";

import { partsOf } from "../format";
import { areaOf, axisText, dotOf, frame, gridLine, guide, hit, keyBeside, keyOf, legend, legendItem, lineKey, lineOf, plot, relative, targetOf, tipAfter, tipAt, tipBefore, tipName, tipRow, tipTitle, tipValue, tooltip, valueText } from "./charts.css";
import { useSize } from "./useSize";

export type ChartSeries = {
  id: string;
  label: string;
  // Which of Paper's accents draws the line: primary is ink.
  tone: "primary" | "info" | "success" | "warning" | "error";
  temp: readonly number[];
  target: readonly number[];
  power: readonly number[];
};

type Props = {
  series: readonly ChartSeries[];
  minutes: number;
  // The mock clock (ms) of the newest sample.
  now: number;
  hour12: boolean;
  showTargets: boolean;
  showPower: boolean;
  height?: number;
};

const MARGIN = { left: 40, right: 48, top: 10, bottom: 24 };

const two = (value: number) => String(value).padStart(2, "0");

const clock = (ms: number, hour12: boolean) => {
  const { hour, minute } = partsOf(ms);
  return `${two(hour12 ? hour % 12 || 12 : hour)}:${two(minute)}`;
};

const clockSeconds = (ms: number, hour12: boolean) => {
  const { hour, minute, second } = partsOf(ms);
  return `${two(hour12 ? hour % 12 || 12 : hour)}:${two(minute)}:${two(second)}`;
};

const niceMax = (value: number) => {
  const step = value <= 100 ? 25 : 50;
  return Math.max(100, Math.ceil((value + 5) / step) * step);
};

export const TempChart = ({ series: given, minutes, now, hour12, showTargets, showPower, height = 208 }: Props) => {
  const [ref, size] = useSize<HTMLDivElement>();
  const [off, setOff] = useState<readonly string[]>([]);
  // The second under the pointer, and where its readout stands in the chart.
  const [at, setAt] = useState<{ index: number; left: number; top: number; flip: boolean } | null>(null);
  const series = given;
  const visible = series.filter((item) => !off.includes(item.id));
  const length = series[0]?.temp.length ?? 0;
  const count = Math.min(length, Math.max(2, minutes * 60));
  const first = length - count;
  const width = Math.max(size.width, 240);
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;

  let peak = 0;
  for (const item of visible) {
    for (let i = first; i < length; i++) peak = Math.max(peak, item.temp[i] ?? 0, showTargets ? item.target[i] ?? 0 : 0);
  }
  const top = niceMax(peak);

  const x = (i: number) => MARGIN.left + (i / (count - 1)) * plotW;
  const y = (value: number) => MARGIN.top + plotH - (Math.min(top, Math.max(0, value)) / top) * plotH;
  const stride = Math.max(1, Math.floor(count / Math.max(1, plotW)));

  const line = (values: readonly number[]) => {
    let d = "";
    for (let i = 0; i < count; i += stride) d += `${d ? "L" : "M"}${x(i).toFixed(1)} ${y(values[first + i] ?? 0).toFixed(1)}`;
    return `${d}L${x(count - 1).toFixed(1)} ${y(values[length - 1] ?? 0).toFixed(1)}`;
  };

  const steps = (values: readonly number[]) => {
    const parts: string[] = [];
    let previous: number | null = null;
    for (let i = 0; i < count; i++) {
      const value = values[first + i] ?? 0;
      if (previous === null) parts.push(`M${x(i).toFixed(1)} ${y(value).toFixed(1)}`);
      else if (value !== previous) parts.push(`L${x(i).toFixed(1)} ${y(previous).toFixed(1)}`, `L${x(i).toFixed(1)} ${y(value).toFixed(1)}`);
      previous = value;
    }
    parts.push(`L${x(count - 1).toFixed(1)} ${y(previous ?? 0).toFixed(1)}`);
    return parts.join("");
  };

  const area = (values: readonly number[]) => {
    const base = MARGIN.top + plotH;
    let d = `M${x(0).toFixed(1)} ${base}`;
    for (let i = 0; i < count; i += stride) d += `L${x(i).toFixed(1)} ${(base - (values[first + i] ?? 0) * plotH * 0.3).toFixed(1)}`;
    return `${d}L${x(count - 1).toFixed(1)} ${base}Z`;
  };

  const yStep = top <= 125 ? 25 : 50;
  const yTicks: number[] = [];
  for (let v = 0; v <= top; v += yStep) yTicks.push(v);

  const timeAt = (i: number) => now - (count - 1 - i) * 1000;
  const slots = Math.max(2, Math.floor(plotW / 64));
  const spacing = [1, 2, 5, 10, 15, 30].find((m) => minutes / m <= slots) ?? 30;
  const xTicks: { i: number; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const t = timeAt(i);
    if (Math.floor(t / 1000) % (spacing * 60) === 0) xTicks.push({ i, label: clock(t, hour12) });
  }

  const ends = visible.map((item) => ({ item, labelY: y(item.temp[length - 1] ?? 0) })).sort((a, b) => a.labelY - b.labelY);
  for (let k = 1; k < ends.length; k++) {
    const previous = ends[k - 1]!;
    const current = ends[k]!;
    if (current.labelY - previous.labelY < 14) current.labelY = previous.labelY + 14;
  }

  const onMove = (event: ReactPointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    const index = Math.round(ratio * (count - 1));
    const left = x(index);
    setAt({ index, left, top: MARGIN.top, flip: left > width * 0.55 });
  };

  const summary = visible.map((item) => `${item.label} ${(item.temp[length - 1] ?? 0).toFixed(1)}°C`).join(", ");
  const hoverX = at === null ? 0 : at.left;

  return (
    <div className={frame} ref={ref}>
      <div className={legend}>
        {series.map((item) => (
          <button key={item.id} type="button" className={legendItem} aria-pressed={!off.includes(item.id)} onClick={() => setOff((list) => (list.includes(item.id) ? list.filter((id) => id !== item.id) : [...list, item.id]))}>
            <span className={`${lineKey} ${keyOf[item.tone]}`} />
            {item.label}
          </button>
        ))}
      </div>
      <Box className={relative} height={height}>
        <svg width={width} height={height} role="img" aria-label={`온도 그래프, 최근 ${minutes}분. ${summary}`} className={plot}>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line className={gridLine} x1={MARGIN.left} x2={MARGIN.left + plotW} y1={y(tick)} y2={y(tick)} />
              <text className={axisText} x={MARGIN.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle">{tick}</text>
            </g>
          ))}
          {xTicks.map((tick) => (
            <text key={tick.i} className={axisText} x={x(tick.i)} y={height - 6} textAnchor="middle">{tick.label}</text>
          ))}
          {showPower ? visible.map((item) => <path key={`p-${item.id}`} d={area(item.power)} className={areaOf[item.tone]} />) : null}
          {showTargets
            ? visible.map((item) => <path key={`t-${item.id}`} d={steps(item.target)} strokeDasharray="4 4" className={targetOf[item.tone]} />)
            : null}
          {visible.map((item) => (
            <path key={item.id} d={line(item.temp)} className={lineOf[item.tone]} />
          ))}
          {ends.map(({ item, labelY }) => (
            <g key={`e-${item.id}`}>
              <circle cx={x(count - 1)} cy={y(item.temp[length - 1] ?? 0)} r={4} className={dotOf[item.tone]} />
              <text className={valueText} x={x(count - 1) + 10} y={labelY} dominantBaseline="middle">{(item.temp[length - 1] ?? 0).toFixed(1)}</text>
            </g>
          ))}
          {at !== null ? (
            <g>
              <line className={guide} x1={hoverX} x2={hoverX} y1={MARGIN.top} y2={MARGIN.top + plotH} />
              {visible.map((item) => (
                <circle key={`h-${item.id}`} cx={hoverX} cy={y(item.temp[first + at.index] ?? 0)} r={4} className={dotOf[item.tone]} />
              ))}
            </g>
          ) : null}
          <rect className={hit} x={MARGIN.left} y={MARGIN.top} width={plotW} height={plotH} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setAt(null)} />
        </svg>
        {at !== null ? (
          <div className={`${tooltip} ${tipAt} ${at.flip ? tipBefore : tipAfter} ${elevation.overlay}`} style={{ "--tip-x": `${at.left}px`, "--tip-y": `${at.top}px` } as CSSProperties}>
            <div className={tipTitle}>{clockSeconds(timeAt(at.index), hour12)}</div>
            {visible.map((item) => (
              <div className={tipRow} key={item.id}>
                <span className={tipName}>
                  <span className={`${lineKey} ${keyOf[item.tone]} ${keyBeside}`} />
                  {item.label}
                </span>
                <span className={tipValue}>
                  {(item.temp[first + at.index] ?? 0).toFixed(1)}°C
                  {showTargets && (item.target[first + at.index] ?? 0) > 0 ? <span className={tipName}> / {(item.target[first + at.index] ?? 0).toFixed(0)}</span> : null}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </Box>
    </div>
  );
};
