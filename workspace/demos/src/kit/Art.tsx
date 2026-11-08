import { useId } from "react";

import { Surface } from "@studio-baeks/paper-ui";
import { tokens, type SurfaceRadius } from "@studio-baeks/paper-ui/tokens";

const RAMPS = ["info", "success", "warning", "error", "primary"] as const;
type Ramp = (typeof RAMPS)[number];
type Tone = "soft" | "solid" | "subtle";
const color = (ramp: Ramp, tone: Tone) => tokens.color.accent[ramp][tone];
const WHITE = tokens.color.bg.raised;
const MARKER = tokens.color.marker.fill;
const COLORED = 4;

const hash = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
};
export const random = (seed: string | number) => {
  let a = typeof seed === "number" ? seed >>> 0 : hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type ArtKind = "cover" | "photo" | "document" | "pattern";

export type ArtProps = {
  seed: string;
  kind?: ArtKind;
  ratio?: string;
  radius?: SurfaceRadius | "none";
  label?: string;
  grid?: boolean;
};

const Cover = ({ seed, id }: { seed: string; id: string }) => {
  const r = random(seed);
  const a = RAMPS[Math.floor(r() * COLORED)]!;
  const b = RAMPS[(RAMPS.indexOf(a) + 1 + Math.floor(r() * 3)) % COLORED]!;
  const dark = r() < 0.35;
  const tones: Tone[] = dark ? ["subtle", "solid", "solid"] : ["soft", "solid", "solid"];
  const shapes = Array.from({ length: 3 + Math.floor(r() * 3) }, (_, index) => ({
    x: r() * 100, y: r() * 100, size: 18 + r() * 46, ramp: index % 2 ? a : b, tone: tones[Math.floor(r() * 3)]!, round: r() < 0.6, turn: r() * 90,
  }));
  return (
    <>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2={r() < 0.5 ? "1" : "0"} y2="1">
          <stop offset="0" stopColor={color(a, dark ? "subtle" : "soft")} />
          <stop offset="1" stopColor={color(b, dark ? "solid" : "soft")} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-g)`} />
      {shapes.map((shape, index) => shape.round
        ? <circle key={index} cx={shape.x} cy={shape.y} r={shape.size / 2} fill={color(shape.ramp, shape.tone)} opacity={0.85} />
        : <rect key={index} x={shape.x - shape.size / 2} y={shape.y - shape.size / 2} width={shape.size} height={shape.size * 0.6} rx={4} fill={color(shape.ramp, shape.tone)} opacity={0.8} transform={`rotate(${shape.turn} ${shape.x} ${shape.y})`} />)}
      {r() < 0.3 ? <circle cx={20 + r() * 60} cy={20 + r() * 60} r={6 + r() * 6} fill={MARKER} /> : null}
    </>
  );
};

const ridge = (r: () => number, base: number, roughness: number) => {
  const points: string[] = ["0,100"];
  let y = base;
  for (let x = 0; x <= 100; x += 10) {
    y = Math.min(95, Math.max(base - 25, y + (r() - 0.5) * roughness));
    points.push(`${x},${y.toFixed(1)}`);
  }
  points.push("100,100");
  return points.join(" ");
};

const Photo = ({ seed, id }: { seed: string; id: string }) => {
  const r = random(seed);
  const evening = r() < 0.35;
  const sky: [string, string] = evening ? [color("warning", "soft"), color("error", "soft")] : [color("info", "soft"), WHITE];
  const land: Ramp = r() < 0.5 ? "success" : "primary";
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-sky)`} />
      <circle cx={15 + r() * 70} cy={18 + r() * 22} r={6 + r() * 7} fill={evening ? color("warning", "solid") : WHITE} opacity={0.9} />
      <polygon points={ridge(r, 58, 18)} fill={color(land, "solid")} opacity={0.3} />
      <polygon points={ridge(r, 70, 14)} fill={color(land, "solid")} opacity={0.6} />
      <polygon points={ridge(r, 84, 10)} fill={color(land, "solid")} />
    </>
  );
};

const Document = ({ seed, grid }: { seed: string; grid: boolean }) => {
  const r = random(seed);
  const tilt = (r() - 0.5) * 6;
  const lines = Array.from({ length: 9 }, (_, index) => ({ y: 30 + index * 7, width: 36 + r() * 22 }));
  return (
    <>
      <rect width="100" height="100" fill={color("primary", "soft")} />
      <g transform={`rotate(${tilt} 50 50)`}>
        <rect x="14" y="8" width="72" height="84" rx="1.5" fill={WHITE} />
        {grid
          ? Array.from({ length: 13 }, (_, index) => (
            <g key={index}>
              <line x1={14 + index * 6} y1="8" x2={14 + index * 6} y2="92" stroke={color("info", "solid")} strokeOpacity={0.3} strokeWidth="0.4" />
              <line x1="14" y1={8 + index * 7} x2="86" y2={8 + index * 7} stroke={color("info", "solid")} strokeOpacity={0.3} strokeWidth="0.4" />
            </g>
          ))
          : null}
        <rect x="22" y="16" width={28 + r() * 20} height="4" rx="1" fill={color("primary", "subtle")} />
        {lines.map((line, index) => <rect key={index} x="22" y={line.y} width={line.width} height="2" rx="1" fill={color("primary", "solid")} opacity={0.35} />)}
        {r() < 0.6 ? <path d={`M24 ${76 + r() * 6} q 10 -8 20 0 t 20 0`} stroke={color("info", "solid")} strokeWidth="1.2" fill="none" /> : null}
      </g>
    </>
  );
};

const Pattern = ({ seed }: { seed: string }) => {
  const r = random(seed);
  const ramp = RAMPS[Math.floor(r() * COLORED)]!;
  const kind = Math.floor(r() * 3);
  const back = color(ramp, "soft");
  const fore = color(ramp, "solid");
  const strength = r() < 0.5 ? 0.35 : 0.5;
  return (
    <>
      <rect width="100" height="100" fill={back} />
      <g opacity={strength}>
        {kind === 0 ? Array.from({ length: 12 }, (_, index) => <rect key={index} x={index * 9 - 10} y="-10" width="4" height="130" fill={fore} transform="rotate(30 50 50)" />) : null}
        {kind === 1 ? Array.from({ length: 49 }, (_, index) => <circle key={index} cx={(index % 7) * 15 + 5} cy={Math.floor(index / 7) * 15 + 5} r="2.4" fill={fore} />) : null}
        {kind === 2 ? Array.from({ length: 7 }, (_, index) => <path key={index} d={`M0 ${index * 15 + 8} q 12.5 -8 25 0 t 25 0 t 25 0 t 25 0`} stroke={fore} strokeWidth="3" fill="none" />) : null}
      </g>
    </>
  );
};

export const Art = ({ seed, kind = "cover", ratio = "1 / 1", radius = "md", label, grid = false }: ArtProps) => {
  const id = useId().replace(/:/g, "");
  return (
    <Surface radius={radius === "none" ? undefined : radius} overflow="hidden" width="full" style={{ aspectRatio: ratio, lineHeight: 0 }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
        {kind === "cover" ? <Cover seed={seed} id={id} /> : null}
        {kind === "photo" ? <Photo seed={seed} id={id} /> : null}
        {kind === "document" ? <Document seed={seed} grid={grid} /> : null}
        {kind === "pattern" ? <Pattern seed={seed} /> : null}
      </svg>
    </Surface>
  );
};
