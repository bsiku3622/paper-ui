// A skewed sheet turning into a straight one: the whole app, in one look. It is a drawing, not a picture of anything, so it
// lives here rather than in <Art>; its strokes are Paper's inks.

import { diagram, drawn } from "./content.css";

type Point = [number, number];

const skew = (s: number, t: number): Point => {
  const top: Point = [22 + s * 48, 12 - s * 7];
  const bottom: Point = [8 + s * 78, 76 + s * 8];
  return [top[0] + (bottom[0] - top[0]) * t, top[1] + (bottom[1] - top[1]) * t];
};

const line = (a: Point, b: Point) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;

const outline = [line(skew(0, 0), skew(1, 0)), line(skew(1, 0), skew(1, 1)), line(skew(1, 1), skew(0, 1)), line(skew(0, 1), skew(0, 0))].join("");
const skewedText: string[] = [];
const straightText: string[] = [];
for (let i = 0; i < 5; i++) {
  const t = 0.2 + i * 0.15;
  const end = i === 4 ? 0.6 : 0.84;
  skewedText.push(line(skew(0.16, t), skew(end, t)));
  straightText.push(`M167 ${(11 + 65 * t).toFixed(1)}H${(160 + 46 * end).toFixed(1)}`);
}

export const Diagram = () => (
  <svg viewBox="0 0 226 92" aria-hidden="true" className={diagram}>
    <path d={outline} className={drawn.skewed} />
    <path d={skewedText.join("")} className={drawn.skewedText} />
    <path d="M106 45h26m-7-6 7 6-7 6" className={drawn.arrow} />
    <path d="M160 11h46v65h-46Z" className={drawn.straight} />
    <path d={straightText.join("")} className={drawn.straightText} />
  </svg>
);
