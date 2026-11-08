// Slider — a seek bar and a volume: Paper's Slider with the arguments the player passes (a value in, a number out).

import { Slider as PaperSlider } from "@studio-baeks/paper-ui";

export type SliderProps = {
  label: string;
  value: number;
  min?: number;
  max: number;
  step?: number | "any";
  onChange: (value: number) => void;
  // A slimmer bar, for the floating player.
  bare?: boolean;
  valueText?: string;
  disabled?: boolean;
};

export const Slider = ({ label, value, min = 0, max, step = 1, onChange, bare = false, valueText, disabled }: SliderProps) => (
  <PaperSlider
    aria-label={label}
    aria-valuetext={valueText}
    min={min}
    max={max}
    step={step}
    value={value}
    disabled={disabled}
    size={bare ? "xs" : "md"}
    onChange={(event) => onChange(Number(event.target.value))}
  />
);
