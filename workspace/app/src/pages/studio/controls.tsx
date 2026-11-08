// The small controls the panel is made of: a colour as a face, the palette's steps to choose one from, and a field for each other kind
// of value a token has. A colour is never typed; it is chosen from the palette.

import { useEffect, useState } from "react";

import { Field, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import type { Hint, Kind } from "./catalog";
import { Swatch } from "./chip";
import { RAMPS, stepByHex } from "./color-source";

export const stepName = (hex: string): string => stepByHex(hex)?.path ?? hex;

// The palette's steps, one row for each ramp, to choose one from. `plain` leaves out the alpha strengths (a palette entry is a plain colour).
export const StepPicker = ({ value, plain = false, onPick }: { value: string; plain?: boolean; onPick: (hex: string) => void }) => (
  <Stack gap="sm" aria-label="팔레트 단계 고르기" role="group">
    {RAMPS.filter((ramp) => !plain || !ramp.id.startsWith("alpha")).map((ramp) => (
      <Stack key={ramp.id} gap="xs">
        <Text as="span" variant="label" strong={false} ink="tertiary">{ramp.label}</Text>
        <Inline gap="xs" wrap>
          {ramp.steps.map((step) => (
            <Swatch key={step.path} color={step.hex} label={`${step.path} · ${step.hex}`} chosen={step.hex.toLowerCase() === value.toLowerCase()} onChoose={() => onPick(step.hex)} />
          ))}
        </Inline>
      </Stack>
    ))}
  </Stack>
);

// ── Numbers and lengths ───────────────────────────────────────────────────────────────

const LENGTH = /^(-?[\d.]+)(rem|px|em|%)$/;
const trim = (value: number) => String(Math.round(value * 1000) / 1000);

// A length as the field shows it: rem and px in px, since the scale is read in px; em and % as they are.
export const lengthParts = (value: string): { amount: number; unit: string } | null => {
  const found = LENGTH.exec(value);
  return found ? { amount: Number(found[1]), unit: found[2]! } : null;
};
const shown = (value: string) => {
  const parts = lengthParts(value);
  return parts ? trim(parts.unit === "rem" ? parts.amount * 16 : parts.amount) : value;
};
// The value in the unit the token is written in.
export const lengthFrom = (typed: number, original: string): string => {
  const parts = lengthParts(original);
  if (!parts) return String(typed);
  return parts.unit === "rem" ? `${trim(typed / 16)}rem` : `${trim(typed)}${parts.unit}`;
};

// Typed text is kept as typed until it is a number, so a half-written "1." is not taken away from the writer.
const useDraft = (value: string) => {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);
  return { draft, setDraft, begin: () => setEditing(true), end: () => setEditing(false) };
};

const NumberInput = ({ label, value, hint, onChange }: { label: string; value: string; hint?: Hint; onChange: (typed: number) => void }) => {
  const { draft, setDraft, begin, end } = useDraft(value);
  return (
    <Field
      size="sm"
      type="number"
      numeric
      textAlign="end"
      aria-label={label}
      value={draft}
      min={hint?.min}
      max={hint?.max}
      step={hint?.step}
      onFocus={begin}
      onBlur={end}
      onChange={(event) => {
        setDraft(event.currentTarget.value);
        const typed = Number(event.currentTarget.value);
        if (event.currentTarget.value !== "" && Number.isFinite(typed)) onChange(typed);
      }}
    />
  );
};

export const LengthValue = ({ label, value, original, hint, onChange }: { label: string; value: string; original: string; hint?: Hint; onChange: (next: string) => void }) => {
  const parts = lengthParts(original);
  const unit = parts?.unit === "rem" ? "px" : (parts?.unit ?? "");
  return (
    <Inline gap="xs" align="center">
      <NumberInput label={label} value={shown(value)} hint={hint} onChange={(typed) => onChange(lengthFrom(typed, original))} />
      <Text as="span" variant="label" strong={false} ink="tertiary">{unit}</Text>
    </Inline>
  );
};

export const NumberValue = ({ label, value, hint, onChange }: { label: string; value: string; hint?: Hint; onChange: (next: string) => void }) => (
  <NumberInput label={label} value={value} hint={hint} onChange={(typed) => onChange(trim(typed))} />
);

// "0px 8px 24px 0px": offset, offset, blur, spread.
const SHADOW_PARTS = ["가로", "세로", "흐림", "퍼짐"] as const;
export const ShadowValue = ({ label, value, onChange }: { label: string; value: string; onChange: (next: string) => void }) => {
  const numbers = value.split(/\s+/).map((part) => Number.parseFloat(part));
  return (
    <Inline gap="xs" align="center" wrap>
      {SHADOW_PARTS.map((part, index) => (
        <NumberInput
          key={part}
          label={`${label} ${part}`}
          value={trim(numbers[index] ?? 0)}
          onChange={(typed) => onChange(numbers.map((number, at) => `${trim(at === index ? typed : (number ?? 0))}px`).join(" "))}
        />
      ))}
    </Inline>
  );
};

export const TextValue = ({ label, value, onChange }: { label: string; value: string; onChange: (next: string) => void }) => (
  <Field size="sm" aria-label={label} value={value} onChange={(event) => onChange(event.currentTarget.value)} />
);

// The control a kind of value takes.
export const ValueControl = ({ kind, label, value, original, hint, onChange }: { kind: Exclude<Kind, "color">; label: string; value: string; original: string; hint?: Hint; onChange: (next: string) => void }) => {
  if (kind === "length") return <LengthValue label={label} value={value} original={original} hint={hint} onChange={onChange} />;
  if (kind === "number") return <NumberValue label={label} value={value} hint={hint} onChange={onChange} />;
  if (kind === "shadow") return <ShadowValue label={label} value={value} onChange={onChange} />;
  return <TextValue label={label} value={value} onChange={onChange} />;
};
