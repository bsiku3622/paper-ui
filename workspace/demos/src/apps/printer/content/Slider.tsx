// A slider. Paper has no range input; this is the browser's own, coloured by Paper's tokens (charts.css.ts). `onChange`
// follows the thumb; `onCommit` fires once when the thumb is let go (or a key is released), which is when a printer
// setting should be sent.

import { useState } from "react";

import { range } from "./charts.css";

type Props = {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onCommit: (value: number) => void;
};

export const Slider = ({ value, min, max, step = 1, label, disabled, onChange, onCommit }: Props) => {
  const [drag, setDrag] = useState<number | null>(null);
  const shown = drag ?? value;
  const finish = () => {
    if (drag !== null) {
      onCommit(drag);
      setDrag(null);
    }
  };
  return (
    <input
      className={range}
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={shown}
      disabled={disabled}
      onChange={(event) => {
        const next = Number(event.target.value);
        setDrag(next);
        onChange?.(next);
      }}
      onPointerUp={finish}
      onKeyUp={finish}
      onBlur={finish}
    />
  );
};
