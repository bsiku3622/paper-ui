import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from "react";

import { Inline, mergeProps, Stack, Surface, Text, useFocusRing } from "@studio-baeks/paper-ui";

import {
  axisText, crosshair, dotRing, endText, fillTone, frame as frameClass, frameHeight, gridLine, hitArea, key as keyClass, keyTone, linePath,
  probeBox, probeCap, probeDot, probePad, probeRound, probeStroke, svgRoot, tipBox, tipEnd, tipStart, type Tone,
} from "./charts.css";

export type { Tone };

export type ChartSize = keyof typeof frameHeight;

type Metrics = {
  width: number;
  height: number;
  font: number;
  stroke: number;
  round: number;
  cap: number;
  dot: number;
  pad: number;
};

const useMetrics = (size: ChartSize) => {
  const frame = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  useLayoutEffect(() => {
    const frameElement = frame.current;
    const probeElement = probe.current;
    if (!frameElement || !probeElement) return;
    const read = () => {
      const [stroke, round, cap, dot, pad] = Array.from(probeElement.children).map((child) => child.getBoundingClientRect().width);
      const box = frameElement.getBoundingClientRect();
      setMetrics({ width: box.width, height: box.height, font: parseFloat(getComputedStyle(probeElement).fontSize), stroke: stroke ?? 2, round: round ?? 4, cap: cap ?? 24, dot: dot ?? 8, pad: pad ?? 12 });
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(frameElement);
    return () => observer.disconnect();
  }, [size]);
  return { frame, probe, metrics };
};

const Probe = ({ probe }: { probe: RefObject<HTMLDivElement | null> }) => (
  <div ref={probe} aria-hidden className={probeBox}>
    <div className={probeStroke} />
    <div className={probeRound} />
    <div className={probeCap} />
    <div className={probeDot} />
    <div className={probePad} />
  </div>
);

const niceMax = (value: number, whole = false) => {
  if (!(value > 0)) return whole ? 2 : 1;
  const base = 10 ** Math.floor(Math.log10(value));
  const fraction = value / base;
  const top = (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * base;
  return whole ? Math.max(2, Math.ceil(top / 2) * 2) : top;
};

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

const Key = ({ tone }: { tone: Tone }) => (
  <span className={`${keyClass} ${keyTone[tone]}`} />
);

export const Legend = ({ items }: { items: readonly { id: string; name: string; tone: Tone }[] }) => (
  <Inline as="ul" gap="lg" wrap aria-label="범례">
    {items.map((item) => (
      <Inline key={item.id} as="li" gap="sm">
        <Key tone={item.tone} />
        <Text as="span" variant="caption" ink="secondary">{item.name}</Text>
      </Inline>
    ))}
  </Inline>
);

const Tip = ({ heading, rows, x, width, offset, top, font }: { heading: string; rows: readonly { id: string; tone: Tone; value: string; name?: string }[]; x: number; width: number; offset: number; top: number; font: number }) => {
  const beside = x < width * 0.6;
  const span = font * 18;
  return (
    <foreignObject x={beside ? x + offset : x - offset - span} y={top} width={span} height={font * 8} className={tipBox}>
      <div className={beside ? tipStart : tipEnd}>
        <Surface fill="raised" border radius="sm" padding="sm" elevation="overlay">
          <Stack gap="xs">
            <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{heading}</Text>
            {rows.map((row) => (
              <Inline key={row.id} gap="sm" align="center">
                <Key tone={row.tone} />
                <Text as="span" strong numeric>{row.value}</Text>
                {row.name ? <Text as="span" variant="caption" ink="secondary">{row.name}</Text> : null}
              </Inline>
            ))}
          </Stack>
        </Surface>
      </div>
    </foreignObject>
  );
};

export type LineSeries = { id: string; name: string; tone: Tone; values: readonly number[] };

export type LineChartProps = {
  label: string;
  times: readonly number[];
  series: readonly LineSeries[];
  xTick: (time: number) => string;
  xTip: (time: number) => string;
  format: (value: number) => string;
  yTick?: (value: number) => string;
  size?: ChartSize;
  floor?: number;
};

const lineLayout = (m: Metrics, series: readonly LineSeries[], count: number, floor: number) => {
  const { width, height, font } = m;
  const max = niceMax(Math.max(floor, ...series.flatMap((item) => item.values)));
  const labelled = width >= font * 38 && series.length <= 4;
  const left = Math.ceil(font * 3.2);
  const right = labelled ? Math.ceil(font * 5.4) : Math.ceil(font * 1.4);
  const top = Math.ceil(font * 0.9);
  const bottom = Math.ceil(font * 2.2);
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  return {
    max,
    labelled,
    left,
    top,
    plotWidth,
    plotHeight,
    x: (index: number) => left + (plotWidth * index) / (count - 1),
    y: (value: number) => top + plotHeight - (value / max) * plotHeight,
  };
};

export const LineChart = ({ label, times, series, xTick, xTip, format, yTick = (value) => String(value), size = "lg", floor = 0 }: LineChartProps) => {
  const { frame, probe, metrics } = useMetrics(size);
  const { focusProps } = useFocusRing();
  const [active, setActive] = useState<number | null>(null);
  const count = times.length;
  const layout = metrics && count >= 2 ? lineLayout(metrics, series, count, floor) : null;

  const move = (event: PointerEvent<SVGRectElement>) => {
    if (!layout) return;
    const box = event.currentTarget.getBoundingClientRect();
    setActive(clamp(Math.round(((event.clientX - box.left) / layout.plotWidth) * (count - 1)), 0, count - 1));
  };

  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = count - 1;
    if (event.key === "Escape") return setActive(null);
    const next = event.key === "ArrowLeft" ? (active ?? last + 1) - 1 : event.key === "ArrowRight" ? (active ?? -1) + 1 : event.key === "Home" ? 0 : event.key === "End" ? last : null;
    if (next === null) return;
    event.preventDefault();
    const index = clamp(next, 0, last);
    setActive(index);
  };

  const draw = () => {
    if (!metrics || !layout) return null;
    const { width, height, font, stroke, dot, pad } = metrics;
    const { max, labelled, left, top, plotWidth, plotHeight, x, y } = layout;
    const ticks = [0, max / 2, max];
    const xs = [...new Set([0, Math.round((count - 1) / 3), Math.round(((count - 1) * 2) / 3), count - 1])];
    const ends = series.map((item) => y(item.values[count - 1] ?? 0));
    const touching = ends.some((a, i) => ends.some((b, j) => j > i && Math.abs(a - b) < font * 1.35));
    const dotsAt = active ?? count - 1;
    return (
      <svg width={width} height={height} aria-hidden className={svgRoot}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={left} x2={left + plotWidth} y1={y(tick)} y2={y(tick)} className={gridLine} />
            <text x={left - pad / 2} y={y(tick)} textAnchor="end" dominantBaseline="middle" className={axisText}>{yTick(tick)}</text>
          </g>
        ))}
        {xs.map((index, order) => (
          <text key={index} x={x(index)} y={top + plotHeight + font * 1.5} textAnchor={order === 0 ? "start" : order === xs.length - 1 ? "end" : "middle"} className={axisText}>{xTick(times[index] ?? 0)}</text>
        ))}
        {active !== null ? <line x1={x(active)} x2={x(active)} y1={top} y2={top + plotHeight} className={crosshair} /> : null}
        {series.map((item) => (
          <polyline
            key={item.id}
            points={item.values.map((value, index) => `${x(index)},${y(value)}`).join(" ")}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            className={linePath[item.tone]}
          />
        ))}
        {series.map((item, order) => (
          <g key={item.id}>
            <circle cx={x(dotsAt)} cy={y(item.values[dotsAt] ?? 0)} r={dot / 2 + stroke} className={dotRing} />
            <circle cx={x(dotsAt)} cy={y(item.values[dotsAt] ?? 0)} r={dot / 2} className={fillTone[item.tone]} />
            {labelled && !touching && active === null ? (
              <text x={x(count - 1) + dot + stroke} y={ends[order]} dominantBaseline="middle" className={endText}>{item.name}</text>
            ) : null}
          </g>
        ))}
        <rect
          x={left}
          y={0}
          width={plotWidth}
          height={height}
          fill="transparent"
          onPointerMove={move}
          onPointerDown={move}
          onPointerLeave={(event) => { if (event.pointerType === "mouse") setActive(null); }}
          className={hitArea}
        />
        {active !== null ? (
          <Tip
            heading={xTip(times[active] ?? 0)}
            rows={series.map((item) => ({ id: item.id, tone: item.tone, value: format(item.values[active] ?? 0), name: item.name }))}
            x={x(active)}
            width={width}
            offset={pad}
            top={top}
            font={font}
          />
        ) : null}
      </svg>
    );
  };

  return (
    <div
      ref={frame}
      role="slider"
      aria-roledescription="차트"
      aria-label={`${label}. 방향키로 시점을 옮기면 값을 읽어 줍니다.`}
      aria-valuemin={0}
      aria-valuemax={count - 1}
      aria-valuenow={active ?? count - 1}
      aria-valuetext={`${xTip(times[active ?? count - 1] ?? 0)}, ${series.map((item) => `${item.name} ${format(item.values[active ?? count - 1] ?? 0)}`).join(", ")}`}
      tabIndex={0}
      {...mergeProps(focusProps, { onFocus: () => setActive((current) => current ?? count - 1), onBlur: () => setActive(null), onKeyDown: key })}
      className={`${frameClass} ${frameHeight[size]}`}
    >
      <Probe probe={probe} />
      {draw()}
    </div>
  );
};

export type Bar = { key: string; value: number; tick?: string; heading: string };

export type BarChartProps = {
  label: string;
  bars: readonly Bar[];
  tone?: Tone;
  format: (value: number) => string;
  yTick?: (value: number) => string;
  size?: ChartSize;
  whole?: boolean;
};

const column = (x: number, y: number, width: number, height: number, radius: number) => {
  const r = Math.min(radius, width / 2, height);
  return `M${x},${y + height} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + height} Z`;
};

const barLayout = (m: Metrics, bars: readonly Bar[], whole: boolean) => {
  const { width, height, font, stroke, cap } = m;
  const max = niceMax(Math.max(...bars.map((bar) => bar.value)), whole);
  const left = Math.ceil(font * 2.6);
  const top = Math.ceil(font * 1.6);
  const bottom = Math.ceil(font * 2.2);
  const plotWidth = width - left - Math.ceil(font * 0.6);
  const plotHeight = height - top - bottom;
  const slot = plotWidth / bars.length;
  return { max, left, top, plotWidth, plotHeight, slot, thickness: Math.max(1, Math.min(cap, slot - stroke * 2)), base: top + plotHeight, center: (index: number) => left + slot * (index + 0.5) };
};

export const BarChart = ({ label, bars, tone = "info", format, yTick = (value) => String(value), size = "lg", whole = false }: BarChartProps) => {
  const { frame, probe, metrics } = useMetrics(size);
  const { focusProps } = useFocusRing();
  const [active, setActive] = useState<number | null>(null);
  const count = bars.length;
  const layout = metrics && count >= 1 ? barLayout(metrics, bars, whole) : null;

  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = count - 1;
    if (event.key === "Escape") return setActive(null);
    const next = event.key === "ArrowLeft" ? (active ?? last + 1) - 1 : event.key === "ArrowRight" ? (active ?? -1) + 1 : event.key === "Home" ? 0 : event.key === "End" ? last : null;
    if (next === null) return;
    event.preventDefault();
    const index = clamp(next, 0, last);
    setActive(index);
  };

  const shown = active !== null ? bars[active] : undefined;

  const draw = () => {
    if (!metrics || !layout) return null;
    const { width, height, font, round } = metrics;
    const { max, left, plotWidth, plotHeight, slot, thickness, base, center } = layout;
    const tallest = bars.reduce((best, bar, index) => (bar.value > (bars[best]?.value ?? -1) ? index : best), 0);
    const every = Math.max(1, Math.ceil((font * 4.2) / slot));
    return (
      <svg width={width} height={height} aria-hidden className={svgRoot}>
        {[0, max / 2, max].map((tick) => (
          <g key={tick}>
            <line x1={left} x2={left + plotWidth} y1={base - (tick / max) * plotHeight} y2={base - (tick / max) * plotHeight} className={gridLine} />
            <text x={left - font * 0.5} y={base - (tick / max) * plotHeight} textAnchor="end" dominantBaseline="middle" className={axisText}>{yTick(tick)}</text>
          </g>
        ))}
        {bars.map((bar, index) => {
          const barHeight = (bar.value / max) * plotHeight;
          const lifted = active === null || active === index;
          return (
            <g key={bar.key}>
              {bar.value > 0 ? <path d={column(center(index) - thickness / 2, base - barHeight, thickness, barHeight, round)} className={fillTone[tone]} opacity={lifted ? 1 : 0.4} /> : null}
              {index === tallest && bar.value > 0 && active === null ? (
                <text x={center(index)} y={base - barHeight - font * 0.5} textAnchor="middle" className={endText}>{format(bar.value)}</text>
              ) : null}
              {bar.tick !== undefined && index % every === 0 ? (
                <text x={center(index)} y={base + font * 1.5} textAnchor="middle" className={axisText}>{bar.tick}</text>
              ) : null}
              <rect
                x={left + slot * index}
                y={0}
                width={slot}
                height={height}
                fill="transparent"
                onPointerEnter={() => setActive(index)}
                onPointerDown={() => setActive(index)}
                onPointerLeave={(event) => { if (event.pointerType === "mouse") setActive(null); }}
              />
            </g>
          );
        })}
        {shown && active !== null ? (
          <Tip heading={shown.heading} rows={[{ id: shown.key, tone, value: format(shown.value) }]} x={center(active)} width={width} offset={metrics.pad} top={0} font={font} />
        ) : null}
      </svg>
    );
  };

  return (
    <div
      ref={frame}
      role="slider"
      aria-roledescription="차트"
      aria-label={`${label}. 방향키로 막대를 옮기면 값을 읽어 줍니다.`}
      aria-valuemin={0}
      aria-valuemax={count - 1}
      aria-valuenow={active ?? count - 1}
      aria-valuetext={`${bars[active ?? count - 1]?.heading ?? ""}, ${format(bars[active ?? count - 1]?.value ?? 0)}`}
      tabIndex={0}
      {...mergeProps(focusProps, { onFocus: () => setActive((current) => current ?? count - 1), onBlur: () => setActive(null), onKeyDown: key })}
      className={`${frameClass} ${frameHeight[size]}`}
    >
      <Probe probe={probe} />
      {draw()}
    </div>
  );
};
