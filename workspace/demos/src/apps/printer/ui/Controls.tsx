// The small controls the panels repeat: a number you type and confirm, a setting row, a key and its value.

import { Children, useState, type ReactNode } from "react";

import { Box, Divider, Field, Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";
import type { BoxWidth } from "@studio-baeks/paper-ui";

const limit = (value: number, min?: number, max?: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, value));

type NumberFieldProps = {
  value: number;
  onCommit: (value: number) => void;
  label: string;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  digits?: number;
  disabled?: boolean;
  size?: "xs" | "sm" | "md";
  width?: BoxWidth;
  placeholder?: string;
  leading?: ReactNode;
};

// A number is typed, and applied when the field is left or Enter is pressed. The arrow keys step it. Escape lets go.
export const NumberField = ({ value, onCommit, label, unit, step = 1, min, max, digits = 0, disabled, size = "sm", width, placeholder, leading }: NumberFieldProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const text = value.toFixed(digits);
  const commit = () => {
    if (draft === null) return;
    const parsed = Number(draft.replace(",", "."));
    setDraft(null);
    if (Number.isFinite(parsed) && draft.trim() !== "") onCommit(limit(parsed, min, max));
  };
  const field = (
    <Field
      size={size}
      aria-label={label}
      inputMode="decimal"
      numeric
      textAlign="end"
      value={draft ?? text}
      disabled={disabled}
      placeholder={placeholder}
      leading={leading}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit();
        else if (event.key === "Escape") setDraft(null);
        else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          const base = Number((draft ?? text).replace(",", "."));
          const next = limit((Number.isFinite(base) ? base : value) + (event.key === "ArrowUp" ? step : -step), min, max);
          setDraft(null);
          onCommit(Math.round(next * 1e6) / 1e6);
        }
      }}
      trailing={unit ? <Text as="span" variant="caption" ink="tertiary">{unit}</Text> : undefined}
    />
  );
  return width ? <Box width={width} maxWidth="full">{field}</Box> : field;
};

// A line of a settings page: what it is on the left (with a note under it), the control on the right.
export const SettingRow = ({ title, description, children }: { title: ReactNode; description?: ReactNode; children?: ReactNode }) => (
  <Grid columns={{ base: "minmax(0, 1fr)", sm: "minmax(0, 1fr) auto" }} gap="md" align="center">
    <Stack gap="xs" minWidth={0}>
      <Text as="span">{title}</Text>
      {description ? <Text as="span" variant="label" strong={false} ink="tertiary">{description}</Text> : null}
    </Stack>
    {children ? <Inline gap="sm" align="center" wrap>{children}</Inline> : null}
  </Grid>
);

export const SettingList = ({ children }: { children: ReactNode }) => (
  <Stack gap="md">
    {Children.toArray(children).map((child, index) => (
      <Stack key={index} gap="md">
        {index > 0 ? <Divider /> : null}
        {child}
      </Stack>
    ))}
  </Stack>
);

// A key on the left and its value on the right, rows divided by a hairline.
export const KeyValue = ({ rows }: { rows: readonly (readonly [string, ReactNode])[] }) => (
  <Stack>
    {rows.map(([key, value], index) => (
      <Stack key={key}>
        {index > 0 ? <Divider /> : null}
        <Inline justify="between" align="center" gap="md" paddingY="sm">
          <Text as="span" ink="secondary">{key}</Text>
          <Text as="span" numeric>{value}</Text>
        </Inline>
      </Stack>
    ))}
  </Stack>
);

// A small label over a value: a fact about a file or a job.
export const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack gap="xs" minWidth={0}>
    <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{label}</Text>
    <Text as="span" numeric>{children}</Text>
  </Stack>
);

export const Facts = ({ children, min = "9rem" }: { children: ReactNode; min?: string }) => (
  <Grid columns={`repeat(auto-fill, minmax(${min}, 1fr))`} gap="lg">{children}</Grid>
);
