import type { ReactNode } from "react";

import { layers, place } from "./content.css";

type Place = keyof typeof place;

export const Layers = ({ base, ratio, over }: { base: ReactNode; ratio?: string; over: Partial<Record<Place, ReactNode>> }) => (
  <div className={layers} style={ratio ? { aspectRatio: ratio } : undefined}>
    {base}
    {(Object.keys(over) as Place[]).map((at) =>
      over[at] ? (
        <div key={at} className={place[at]}>
          {over[at]}
        </div>
      ) : null,
    )}
  </div>
);
