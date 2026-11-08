import { Field, Inline, SegmentControl, Select, Stack, Switch, Text } from "@studio-baeks/paper-ui";

import { useSiteLocale } from "../site/locale";
import { DEFAULT_MARK } from "./Reference";
import type { Control } from "./registry";
import { labelOf } from "./registry/schema";

const OMITTED = "__pui_default__";

export const ControlRow = ({ control, value, defaults, onChange }: { control: Control; value: string | boolean | undefined; defaults: Readonly<Record<string, unknown>>; onChange: (v: string | boolean | undefined) => void }) => {
  const { locale } = useSiteLocale();
  const label = labelOf(control, locale);
  if (control.kind === "bool") {
    return (
      <Inline as="label" justify="between" align="center" gap="sm">
        <Text variant="label" as="span">{label}</Text>
        <Switch checked={Boolean(value)} onChange={(e) => onChange(e.currentTarget.checked)} />
      </Inline>
    );
  }
  const resting = control.kind === "enum" ? String(defaults[control.prop] ?? control.rootDefault ?? control.omitted ?? "") : "";
  if (control.kind === "enum" && control.options.length <= 3 && (control.required || control.options.includes(resting))) {
    return (
      <Stack gap="xs">
        <Text variant="label">{label}</Text>
        <SegmentControl
          aria-label={label}
          variant="outline"
          shape="rounded"
          size="sm"
          fullWidth
          value={value === undefined ? resting : String(value)}
          onValueChange={(next) => onChange(!control.required && next === resting ? undefined : next)}
        >
          {control.options.map((option) => <SegmentControl.Item key={option} value={option}>{control.labels?.[option] ?? option}</SegmentControl.Item>)}
        </SegmentControl>
      </Stack>
    );
  }
  const restingChoice = control.kind === "enum" && !control.required && control.options.includes(resting);
  const shown = value !== undefined ? String(value) : restingChoice ? resting : OMITTED;
  return (
    <Stack gap="xs">
      <Text variant="label">{label}</Text>
      {control.kind === "enum" ? (
        <Select
          size="sm"
          aria-label={label}
          value={shown}
          onChange={(e) => {
            const next = e.currentTarget.value;
            onChange(next === OMITTED || (restingChoice && next === resting) ? undefined : next);
          }}
        >
          {control.required || restingChoice ? null : <Select.Option value={OMITTED}>{`${resting || "none"}${DEFAULT_MARK}`}</Select.Option>}
          {control.options.map((option) => (
            <Select.Option key={option} value={option}>{`${control.labels?.[option] ?? option}${restingChoice && option === resting ? DEFAULT_MARK : ""}`}</Select.Option>
          ))}
        </Select>
      ) : (
        <Field
          size="sm"
          value={value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.currentTarget.value)}
          aria-label={label}
        />
      )}
    </Stack>
  );
};
