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
