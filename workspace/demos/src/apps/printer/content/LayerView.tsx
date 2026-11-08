import { useMemo } from "react";

import { axisText, bed, clip, faint, frame, gridMajor, gridMinor, halo, nozzleDot, plot, strokeOf, type Tone } from "./charts.css";
import { BED, buildLayer, partFor, type Quality } from "./layers";
import { useSize } from "./useSize";

type Props = {
  name: string;
  layer: number;
  total: number;
  layerHeight: number;
  mode: "feature" | "speed" | "layer";
  travel: boolean;
  previous: boolean;
  grid: boolean;
  fit: boolean;
  lineScale: number;
  quality: Quality;
  nozzle: { x: number; y: number } | null;
};

const SPEED = { outer: 45, inner: 80, infill: 120, solid: 70 } as const;
const share = (speed: number) => 35 + 65 * ((speed - 30) / 120);

const featureTone = { outer: "primary", inner: "info", infill: "warning", solid: "success" } as const satisfies Record<string, Tone>;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const LayerView = ({ name, layer, total, layerHeight, mode, travel, previous, grid, fit, lineScale, quality, nozzle }: Props) => {
  const [ref, size] = useSize<HTMLDivElement>();
  const part = useMemo(() => partFor(name), [name]);
  const current = useMemo(() => buildLayer(part, layer, total, layerHeight, quality), [part, layer, total, layerHeight, quality]);
  const before = useMemo(() => (previous && layer > 1 ? buildLayer(part, layer - 1, total, layerHeight, quality) : null), [part, layer, total, layerHeight, quality, previous]);
  const side = Math.max(260, Math.min(size.width, 720));
  const margin = 28;
  const inner = side - margin;
  const reach = part.outline.kind === "rrect" ? Math.max(part.outline.w, part.outline.h) / 2 : Math.max(part.outline.rx, part.outline.ry);
  const span = fit ? Math.min(BED, Math.max(48, reach * 2 * 1.35)) : BED;
  const x0 = fit ? clamp(part.centre[0] - span / 2, 0, BED - span) : 0;
  const y0 = fit ? clamp(part.centre[1] - span / 2, 0, BED - span) : 0;
  const k = inner / span;
  const f = total <= 1 ? 0 : (layer - 1) / (total - 1);
  const paint = (feature: keyof typeof featureTone) => {
    if (mode === "feature") return { className: strokeOf[featureTone[feature]], strokeOpacity: 1 };
    if (mode === "speed") return { className: strokeOf.info, strokeOpacity: share(SPEED[feature]) / 100 };
    return { className: strokeOf.primary, strokeOpacity: (30 + 70 * f) / 100 };
  };
  const stroke = 0.45 * lineScale;
  const step = [5, 10, 20, 25, 50].find((s) => span / s <= 6) ?? 50;
  const ticksX: number[] = [];
  for (let v = Math.ceil(x0 / step) * step; v <= x0 + span + 1e-6; v += step) ticksX.push(v);
  const ticksY: number[] = [];
  for (let v = Math.ceil(y0 / step) * step; v <= y0 + span + 1e-6; v += step) ticksY.push(v);
  const lines: number[] = [];
  for (let v = Math.ceil(x0 / 10) * 10; v <= x0 + span; v += 10) lines.push(v);
  const rows: number[] = [];
  for (let v = Math.ceil(y0 / 10) * 10; v <= y0 + span; v += 10) rows.push(v);
  return (
    <div ref={ref} className={frame}>
      <svg width={side} height={side} role="img" aria-label={`${name}의 ${layer}번째 레이어, 높이 ${current.z} mm`} className={plot}>
        <svg x={margin} y={0} width={inner} height={inner} viewBox={`${x0} ${BED - y0 - span} ${span} ${span}`} className={clip}>
          <rect x={0} y={0} width={BED} height={BED} className={bed} />
          {grid
            ? [
                ...lines.map((v) => <line key={`x${v}`} x1={v} x2={v} y1={0} y2={BED} className={v % 50 === 0 ? gridMajor : gridMinor} />),
                ...rows.map((v) => <line key={`y${v}`} x1={0} x2={BED} y1={BED - v} y2={BED - v} className={v % 50 === 0 ? gridMajor : gridMinor} />),
              ]
            : null}
          {before ? (
            <g fill="none" className={faint}>
              <path d={`${before.outer}${before.inner}${before.infill}${before.solid}`} strokeWidth={stroke} className={strokeOf.neutral} />
            </g>
          ) : null}
          {travel ? <path d={current.travel} fill="none" strokeWidth={stroke * 0.5} strokeDasharray="1.4 1.4" className={strokeOf.neutral} /> : null}
          <g fill="none" strokeLinejoin="round" strokeLinecap="round">
            <path d={current.infill} strokeWidth={stroke} {...paint("infill")} />
            <path d={current.solid} strokeWidth={stroke} {...paint("solid")} />
            <path d={current.inner} strokeWidth={stroke} {...paint("inner")} />
            <path d={current.outer} strokeWidth={stroke * 1.15} {...paint("outer")} />
          </g>
          {nozzle ? (
            <g>
              <circle cx={nozzle.x} cy={BED - nozzle.y} r={5} className={halo} />
              <circle cx={nozzle.x} cy={BED - nozzle.y} r={2} strokeWidth={1} className={nozzleDot} />
            </g>
          ) : null}
        </svg>
        {ticksX.map((v) => (
          <text key={`tx${v}`} className={axisText} x={margin + (v - x0) * k} y={inner + 18} textAnchor="middle">{v}</text>
        ))}
        {ticksY.map((v) => (
          <text key={`ty${v}`} className={axisText} x={margin - 6} y={(y0 + span - v) * k} textAnchor="end" dominantBaseline="middle">{v}</text>
        ))}
      </svg>
    </div>
  );
};
