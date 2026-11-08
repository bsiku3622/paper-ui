// Layers — things laid over a picture: a number and a warning dot on a page's thumbnail, a card over the photo that is being
// worked on. Paper's Box has no position and no inset, so nothing it draws can sit on top of something else; this is that
// one gap. The things laid over are still Paper parts, passed in as children of a slot.

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
