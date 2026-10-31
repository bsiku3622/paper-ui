// ProgressBar — how far along, as a bar. The track is the control track and the fill an accent's solid, which
// Color declares for a progress bar; the width is the runtime value. The package has no progress bar, so this is
// the app's composition of Box and Paint.

import { Box, Paint } from "@studio-baeks/paper-ui";
import type { Accent } from "@studio-baeks/paper-ui/tokens";

import * as s from "./progress-bar.css";

export type ProgressBarProps = {
  value: number;
  min?: number;
  max?: number;
  label: string;
  accent?: Accent;
};

// The share of the way from min to max, held between 0 and 100.
export const progressPercent = (value: number, min = 0, max = 100) => (max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0);

export const ProgressBar = ({ value, min = 0, max = 100, label, accent = "primary" }: ProgressBarProps) => (
  <Box className={s.track} role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={min} aria-valuemax={max}>
    <Paint accent={accent} variant="solid" className={s.fill} style={{ width: `${progressPercent(value, min, max)}%` }} />
  </Box>
);
