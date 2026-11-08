// Slider — 범위 안의 값 하나를 끌어서 고른다. native range 이므로 끌기 · 방향키 · 폼은 브라우저가 맡는다.
//   size    컨트롤 사다리. 막대는 Switch 트랙과 같은 높이다.
//   status  error — 막대에 오류 잉크의 테가 생긴다.
//
// ref 는 native input 을 가리킨다. 채워진 끝은 값에서 계산해 변수로 넘긴다. 나머지는 스타일시트가 그린다.

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
  // 안 주면 native range 와 같은 0 · 100 이다.
  min?: number;
  max?: number;
  style?: CSSProperties;
};

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { status, size, value, defaultValue, min, max, onChange, className, style, ...rest },
  ref,
) {
  const { inputProps, frameProps } = useInputControl(rest, { status });
  // The fill follows what the input really holds: left open, that is the native range's middle.
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
