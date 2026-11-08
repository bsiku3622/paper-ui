import { forwardRef, useState, type ChangeEvent, type CSSProperties } from "react";

import { joinClass } from "../internal/joinClass";
import { rangeShare } from "../internal/measure";
import { controlClass } from "../primitives/control/Control";
import { sliderPaint, sliderShareProperty } from "../primitives/paint/recipes.css";
import { useInputControl, type MarkProps } from "./input-control";
import { sliderRoot } from "./Slider.css";

export type SliderProps = Omit<MarkProps, "value" | "defaultValue" | "min" | "max"> & {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  style?: CSSProperties;
};

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { status, size, value, defaultValue, min, max, onChange, className, style, ...rest },
  ref,
) {
  const { inputProps, frameProps } = useInputControl(rest, { status });
  const [inner, setInner] = useState(defaultValue);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    if (value === undefined) setInner(Number(event.currentTarget.value));
  };
  return (
    <input
      type="range"
      ref={ref}
      min={min}
      max={max}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={handleChange}
      style={{ ...style, [sliderShareProperty]: String(rangeShare(value ?? inner, min, max)) }}
      className={joinClass(controlClass({ size, anatomy: "slider" }), sliderPaint, sliderRoot, className)}
      {...frameProps}
      {...inputProps}
    />
  );
});
