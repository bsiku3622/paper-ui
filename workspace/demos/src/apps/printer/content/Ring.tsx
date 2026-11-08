import type { ReactNode } from "react";

import { ringArc, ringLabel, ringRoot, ringSize, ringSvg, ringTrack, type Tone } from "./charts.css";

type Props = {
  value: number;
  tone?: Exclude<Tone, "neutral">;
  size?: "sm" | "md" | "lg";
  label?: string;
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
