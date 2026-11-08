// Meter — how full something is: a quota, a download, a print's progress, a volume. A groove on the sunken face with a
// solid bar in it. Paper has no progress part; the groove is a Surface and the bar a Paint, and only the bar's length is
// the app's own number.

import { Box, Inline, Paint, Stack, Surface, Text } from "@studio-baeks/paper-ui";
import type { Accent } from "@studio-baeks/paper-ui/tokens";

export type MeterProps = {
  // 0 to 1.
  value: number;
  label?: string;
  // Words at the end of the label row ("42.1 / 100 GB").
  valueText?: string;
  tone?: Accent;
  // thin: 4px, the default 6px, thick 10px.
  weight?: "thin" | "base" | "thick";
};

const HEIGHT = { thin: "0.25rem", base: "0.375rem", thick: "0.625rem" } as const;

export const Meter = ({ value, label, valueText, tone = "primary", weight = "base" }: MeterProps) => {
  const clamped = Math.min(1, Math.max(0, value));
  const bar = (
    <Surface
      fill="sunken"
      radius="full"
      overflow="hidden"
      height={HEIGHT[weight]}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuetext={valueText}
    >
      <Paint accent={tone} variant="solid" height="full" width={`${clamped * 100}%`} />
    </Surface>
  );
  if (!label && !valueText) return bar;
  return (
    <Stack gap="xs">
      <Inline justify="between" gap="sm">
        {label ? <Text as="span" variant="caption" ink="secondary" truncate>{label}</Text> : <Box />}
        {valueText ? <Text as="span" variant="caption" ink="tertiary" numeric>{valueText}</Text> : null}
      </Inline>
      {bar}
    </Stack>
  );
};
