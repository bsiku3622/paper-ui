// Radio — 여럿 중 하나. 관련 선택지는 사용하는 화면에서 묶는다.
//   status  error — 경계가 오류 잉크로 바뀐다. 한 묶음의 Radio 는 모두 같은 status 를 주거나 radiogroup 에 aria-invalid 를 준다.

import { forwardRef } from "react";

import { joinClass } from "../internal/joinClass";
import { controlClass } from "../primitives/control/Control";
import { markPaint, markPressPaint } from "../primitives/paint/recipes.css";
import { useInputControl, type MarkProps } from "./input-control";
import { radioRoot } from "./Radio.css";
import { markBox } from "./recipes/mark.css";

export type RadioProps = MarkProps;

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ status, size, className, ...rest }, ref) {
  const { inputProps, frameProps } = useInputControl(rest, { status });
  return (
    <input
      type="radio"
      ref={ref}
      className={joinClass(controlClass({ size, anatomy: "mark" }), markBox, markPaint.radio, markPressPaint, radioRoot, className)}
      {...frameProps}
      {...inputProps}
    />
  );
});
