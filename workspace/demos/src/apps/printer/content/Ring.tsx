// A ring that fills as a value rises: a print's progress in the status header, the CPU and memory loads of the host.
// Paper has the kit's linear Meter and an indeterminate Spinner, but no round gauge, so it is drawn here from Paper's tokens.

import type { ReactNode } from "react";

import { ringArc, ringLabel, ringRoot, ringSize, ringSvg, ringTrack, type Tone } from "./charts.css";

type Props = {
  // 0 to 1.
  value: number;
  tone?: Exclude<Tone, "neutral">;
  size?: "sm" | "md" | "lg";
  label?: string;
  // Drawn in the middle of the ring.
  children?: ReactNode;
};

const RADIUS = 15.9155;

export const Ring = ({ value, tone = "info", size = "md", label, children }: Props) => {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <span role="img" aria-label={label ?? `${Math.round(clamped * 100)}%`} className={`${ringRoot} ${ringSize[size]}`}>
      <svg viewBox="0 0 36 36" width="100%" height="100%" aria-hidden="true" className={ringSvg}>
        <circle cx="18" cy="18" r={RADIUS} strokeWidth={size === "sm" ? 4 : 3} className={ringTrack} />
        <circle cx="18" cy="18" r={RADIUS} strokeWidth={size === "sm" ? 4 : 3} strokeDasharray={`${clamped * 100} 100`} className={ringArc[tone]} />
      </svg>
      {children ? <span className={ringLabel}>{children}</span> : null}
    </span>
  );
};
