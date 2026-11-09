import { forwardRef, useState, type ChangeEvent, type CSSProperties } from "react";

import { joinClass } from "../internal/joinClass";
import { rangeShare } from "../internal/measure";
import { controlClass } from "../primitives/control/Control";
import { sliderOriginPaint, sliderOriginProperty, sliderPaint, sliderShareProperty } from "../primitives/paint/recipes.css";
import { useInputControl, type MarkProps } from "./input-control";
import { sliderRoot } from "./Slider.css";

export type SliderProps = Omit<MarkProps, "value" | "defaultValue" | "min" | "max"> & {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  // The value the fill grows from; without it the fill starts at min.
  origin?: number;
  style?: CSSProperties;
};

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { status, size, value, defaultValue, min, max, origin, onChange, className, style, ...rest },
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
      style={{
        ...style,
        [sliderShareProperty]: String(rangeShare(value ?? inner, min, max)),
        ...(origin === undefined ? {} : { [sliderOriginProperty]: String(rangeShare(origin, min, max)) }),
      }}
      className={joinClass(controlClass({ size, anatomy: "slider" }), sliderPaint, origin !== undefined && sliderOriginPaint, sliderRoot, className)}
      {...frameProps}
      {...inputProps}
    />
  );
});
