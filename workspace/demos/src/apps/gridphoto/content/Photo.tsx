import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { Box } from "@studio-baeks/paper-ui";
import { tokens } from "@studio-baeks/paper-ui/tokens";

import { Art } from "../../../kit";
import { homography, inDrawing, matrix3d, quadIsValid } from "../model/geometry";
import type { Filter, Photo, Quad, Win } from "../model/types";
import { capped as cappedClass, dim as dimClass, flat, frame, grey, lift, lines, lineWeight, stale as staleClass, view } from "./content.css";

const drawing = (photo: Photo) => <Art seed={photo.seed} kind={photo.art} grid={photo.grid} ratio="1 / 1" radius="none" />;

const frameProps = (aspect: number, stale?: boolean, large?: boolean) => ({
  className: [frame, large ? cappedClass : "", stale ? staleClass : ""].filter(Boolean).join(" "),
  style: { "--gp-aspect": aspect } as CSSProperties,
});

export const SourcePhoto = ({ photo, win = photo.win, aspect = photo.ratio, label, dim, stale, large, children }: { photo: Photo; win?: Win; aspect?: number; label?: string; dim?: boolean; stale?: boolean; large?: boolean; children?: ReactNode }) => {
  const [x0, y0, x1] = win;
  return (
    <div {...frameProps(aspect, stale, large)} role={label ? "img" : undefined} aria-label={label}>
      <Box className={dim ? `${view} ${dimClass}` : view} width={`${10000 / (x1 - x0)}%`} style={{ translate: `${-x0}% ${-y0}%` }}>{drawing(photo)}</Box>
      {children}
    </div>
  );
};

const OVERSAMPLE = 2;
const INSET = 0.006;

const centre = (quad: Quad) => ({ x: quad.reduce((sum, p) => sum + p.x, 0) / 4, y: quad.reduce((sum, p) => sum + p.y, 0) / 4 });

export const FlatPage = ({ photo, quad, aspect, rotation, filter, stale, large, label, children }: { photo: Photo; quad: Quad; aspect: number; rotation: number; filter: Filter; stale?: boolean; large?: boolean; label?: string; children?: ReactNode }) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [transform, setTransform] = useState<string>();
  useLayoutEffect(() => {
    const element = frameRef.current;
    if (!element) return;
    setWidth(element.getBoundingClientRect().width);
    const watch = new ResizeObserver(([entry]) => setWidth(entry!.contentRect.width));
    watch.observe(element);
    return () => watch.disconnect();
  }, []);

  const side = width * OVERSAMPLE;
  useLayoutEffect(() => {
    if (width <= 0 || !quadIsValid(quad)) {
      setTransform(undefined);
      return;
    }
    const height = width / aspect;
    const mid = centre(quad);
    const from = quad.map((p) => {
      const [x, y] = inDrawing(photo.win, { x: mid.x + (p.x - mid.x) * (1 - INSET), y: mid.y + (p.y - mid.y) * (1 - INSET) });
      return [(x * side) / 100, (y * side) / 100] as [number, number];
    });
    const corners: [number, number][] = [[0, 0], [width, 0], [width, height], [0, height]];
    const to = [0, 1, 2, 3].map((i) => corners[(i + rotation) % 4]!);
    setTransform(matrix3d(homography(from, to)));
  }, [width, aspect, quad, photo.win, rotation, side]);

  return (
    <div ref={frameRef} {...frameProps(aspect, stale, large)} role={label ? "img" : undefined} aria-label={label}>
      {transform ? <div className={flat} style={{ width: side, transform }}>{drawing(photo)}</div> : null}
      {filter !== "original" ? <div className={lift} aria-hidden="true" /> : null}
      {filter === "bw" ? <div className={grey} aria-hidden="true" /> : null}
      {children}
    </div>
  );
};

export const Lines = ({ paths }: { paths: readonly { d: string; strong?: boolean }[] }) => (
  <svg viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" className={lines}>
    {paths.map((path, index) => (
      <path
        key={index}
        d={path.d}
        fill="none"
        stroke={tokens.color.interaction.focus}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        className={path.strong ? lineWeight.strong : lineWeight.normal}
      />
    ))}
  </svg>
);

const turned = (s: number, t: number, rotation: number): [number, number] => {
  const r = ((rotation % 4) + 4) % 4;
  if (r === 1) return [1 - t, s];
  if (r === 2) return [1 - s, 1 - t];
  if (r === 3) return [t, 1 - s];
  return [s, t];
};

export const comparisonPath = (cols: number, rows: number, rotation: number, linesOnly: "rows" | "both" = "both", trim = 0): string => {
  const parts: string[] = [];
  const at = (s: number, t: number) => {
    const [x, y] = turned(s, t, rotation);
    return `${x.toFixed(4)} ${y.toFixed(4)}`;
  };
  const place = (value: number) => (value - trim) / (1 - 2 * trim);
  const inside = (value: number) => value > -1e-6 && value < 1 + 1e-6;
  if (linesOnly === "both") {
    for (let i = 0; i <= cols; i++) {
      const s = place(i / cols);
      if (inside(s)) parts.push(`M${at(s, 0)}L${at(s, 1)}`);
    }
  }
  for (let j = 0; j <= rows; j++) {
    const t = place(j / rows);
    if (inside(t)) parts.push(`M${at(0, t)}L${at(1, t)}`);
  }
  return parts.join("");
};
