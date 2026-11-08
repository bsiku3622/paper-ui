import { useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

import { Box, elevation } from "@studio-baeks/paper-ui";

import { axisText, calloutText, edge, frame, heatPlot, heatRow, heatTip, heat, hit, ink, inkRing, plot, probe, scale, scaleBar, scaleLabels, tipAt, tipName, tipRow, tipTitle, tipValue, tooltip, valueText, well } from "./charts.css";
import { useSize } from "./useSize";

type Matrix = readonly (readonly number[])[];

type Props = {
  points: Matrix;
  mesh: Matrix;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  limit: number;
  smooth: boolean;
  probed: boolean;
  values: boolean;
  grid: boolean;
};

const MARGIN = { left: 44, right: 8, top: 8, bottom: 26 };

const edges = (n: number, probes: number) => {
  const at = (k: number) => (k * (probes - 1)) / Math.max(1, n - 1);
  return Array.from({ length: n + 1 }, (_, k) => (k === 0 ? -0.5 : k === n ? probes - 0.5 : (at(k - 1) + at(k)) / 2));
};

const locate = (index: number, list: readonly number[]) => {
  for (let k = 0; k < list.length - 1; k++) if (index < list[k + 1]!) return Math.max(0, k);
  return list.length - 2;
};

const signed = (value: number) => `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(3)}`;

export const HeatMap = ({ points, mesh, bounds, limit, smooth, probed, values, grid }: Props) => {
  const [ref, size] = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<{ row: number; col: number; left: number; top: number } | null>(null);
  const field = smooth ? mesh : points;
  const rows = field.length;
  const cols = field[0]?.length ?? 0;
  const probeRows = points.length;
  const probeCols = points[0]?.length ?? 0;
  const spanX = bounds.maxX - bounds.minX;
  const spanY = bounds.maxY - bounds.minY;
  const width = Math.max(size.width - 76, 220);
  const plotW = width - MARGIN.left - MARGIN.right;
  const cell = plotW / probeCols;
  const plotH = cell * probeRows;
  const height = plotH + MARGIN.top + MARGIN.bottom;
  const xEdges = edges(cols, probeCols);
  const yEdges = edges(rows, probeRows);
  const px = (index: number) => MARGIN.left + (index + 0.5) * cell;
  const py = (index: number) => MARGIN.top + plotH - (index + 0.5) * cell;

  let high = { row: 0, col: 0, value: -Infinity };
  let low = { row: 0, col: 0, value: Infinity };
  points.forEach((line, row) =>
    line.forEach((value, col) => {
      if (value > high.value) high = { row, col, value };
      if (value < low.value) low = { row, col, value };
    }),
  );

  const onMove = (event: ReactPointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    const col = locate(x / cell - 0.5, xEdges);
    const row = locate((plotH - y) / cell - 0.5, yEdges);
    setHover({ col, row, left: px((xEdges[col]! + xEdges[col + 1]!) / 2), top: py((yEdges[row]! + yEdges[row + 1]!) / 2) });
  };

  const hoverValue = hover ? field[hover.row]?.[hover.col] ?? 0 : 0;
  const hoverX = hover ? bounds.minX + (hover.col / Math.max(1, cols - 1)) * spanX : 0;
  const hoverY = hover ? bounds.minY + (hover.row / Math.max(1, rows - 1)) * spanY : 0;
  const xTicks = [50, 100, 150, 200].filter((value) => value >= bounds.minX && value <= bounds.maxX);
  const yTicks = [50, 100, 150, 200].filter((value) => value >= bounds.minY && value <= bounds.maxY);
  const xPos = (value: number) => px(((value - bounds.minX) / spanX) * (probeCols - 1));
  const yPos = (value: number) => py(((value - bounds.minY) / spanY) * (probeRows - 1));

  return (
    <div ref={ref} className={`${frame} ${heatRow}`}>
      <Box className={heatPlot} width={width} height={height}>
        <svg width={width} height={height} role="img" aria-label={`베드 메시 높이 지도. 최대 ${signed(high.value)} mm, 최소 ${signed(low.value)} mm`} className={plot}>
          <rect className={well} x={MARGIN.left} y={MARGIN.top} width={plotW} height={plotH} />
          {field.map((line, row) =>
            line.map((value, col) => {
              const x0 = px(xEdges[col]!);
              const x1 = px(xEdges[col + 1]!);
              const y1 = py(yEdges[row]!);
              const y0 = py(yEdges[row + 1]!);
              return <rect key={`${row}-${col}`} x={x0} y={y0} width={x1 - x0} height={y1 - y0} shapeRendering="crispEdges" className={value >= 0 ? heat.high : heat.low} style={{ "--heat": Math.abs(value) / limit } as CSSProperties} />;
            }),
          )}
          {grid
            ? Array.from({ length: probeCols + 1 }, (_, k) => (
                <line key={`gx${k}`} x1={MARGIN.left + k * cell} x2={MARGIN.left + k * cell} y1={MARGIN.top} y2={MARGIN.top + plotH} className={edge} />
              ))
            : null}
          {grid
            ? Array.from({ length: probeRows + 1 }, (_, k) => (
                <line key={`gy${k}`} x1={MARGIN.left} x2={MARGIN.left + plotW} y1={MARGIN.top + k * cell} y2={MARGIN.top + k * cell} className={edge} />
              ))
            : null}
          {xTicks.map((value) => (
            <text key={`x${value}`} className={axisText} x={xPos(value)} y={height - 8} textAnchor="middle">{value}</text>
          ))}
          {yTicks.map((value) => (
            <text key={`y${value}`} className={axisText} x={MARGIN.left - 8} y={yPos(value)} textAnchor="end" dominantBaseline="middle">{value}</text>
          ))}
          <text className={axisText} x={MARGIN.left - 8} y={height - 8} textAnchor="end">mm</text>
          {probed
            ? points.map((line, row) =>
                line.map((value, col) => (
                  <g key={`p${row}-${col}`}>
                    <circle cx={px(col)} cy={py(row)} r={3.5} className={probe} />
                    {values && cell > 40 ? (
                      <text className={`${valueText} ${ink}`} x={px(col)} y={py(row) + 15} textAnchor="middle">{value.toFixed(3)}</text>
                    ) : null}
                  </g>
                )),
              )
            : null}
          {[
            { at: high, name: "최대" },
            { at: low, name: "최소" },
          ].map(({ at, name }) => (
            <g key={name}>
              <circle cx={px(at.col)} cy={py(at.row)} r={7} className={inkRing} />
              {values && cell > 40 ? null : (
                <text className={`${valueText} ${ink} ${calloutText}`} x={px(at.col)} y={py(at.row) + (py(at.row) < MARGIN.top + 24 ? 24 : -13)} textAnchor="middle">{name} {signed(at.value)}</text>
              )}
            </g>
          ))}
          {hover ? (
            <rect
              x={px(xEdges[hover.col]!)}
              y={py(yEdges[hover.row + 1]!)}
              width={px(xEdges[hover.col + 1]!) - px(xEdges[hover.col]!)}
              height={py(yEdges[hover.row]!) - py(yEdges[hover.row + 1]!)}
              className={inkRing}
            />
          ) : null}
          <rect className={hit} x={MARGIN.left} y={MARGIN.top} width={plotW} height={plotH} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} />
        </svg>
        {hover ? (
          <div className={`${tooltip} ${tipAt} ${heatTip} ${elevation.overlay}`} style={{ "--tip-x": `${hover.left}px`, "--tip-y": `${hover.top}px` } as CSSProperties}>
            <div className={tipTitle}>X {hoverX.toFixed(1)} · Y {hoverY.toFixed(1)}</div>
            <div className={tipRow}>
              <span className={tipValue}>{signed(hoverValue)} mm</span>
              <span className={tipName}>{smooth ? "보간" : "측정"}</span>
            </div>
          </div>
        ) : null}
      </Box>
      <Box role="img" aria-label={`색 범위 ${signed(-limit)}에서 ${signed(limit)} mm`} className={scale} height={plotH}>
        <div className={scaleBar} />
        <div className={scaleLabels}>
          <span>{signed(limit)}</span>
          <span>0</span>
          <span>{signed(-limit)}</span>
        </div>
      </Box>
    </div>
  );
};
