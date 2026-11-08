import { Box, Inline, Paint, Stack, Surface, Text } from "@studio-baeks/paper-ui";
import type { Accent } from "@studio-baeks/paper-ui/tokens";

export type MeterProps = {
  value: number;
  label?: string;
  valueText?: string;
  tone?: Accent;
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
