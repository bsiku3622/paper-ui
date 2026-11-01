// Switch — 켬/끔 토글. Checkbox 와 형제지만 즉시 적용되는 설정 자리에 쓴다.
//   status  error — 꺼진 트랙의 테가 오류 잉크로 바뀐다.

import { forwardRef, type InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { mergeProps } from "../primitives/composition";
import { markPaint } from "../primitives/paint/recipes.css";
import type { ChoiceStatus, ControlSize } from "../tokens";
import { useInputControl } from "./input-control";
import { switchReach, switchRoot, switchSize } from "./Switch.css";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size"> & {
  status?: ChoiceStatus;
  // 크기 3 단 (sm·md·lg). 트랙·손잡이 비례 스케일.
  size?: ControlSize;
  className?: string;
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { status, size = "md", className, id, disabled, required, "aria-invalid": ariaInvalid, "aria-describedby": describedBy, ...rest },
  ref,
) {
  const { controlProps, focusHandlers, frameProps } = useInputControl({ id, disabled, required, "aria-invalid": ariaInvalid, "aria-describedby": describedBy, status });
  return (
    <input
      type="checkbox"
      role="switch"
      ref={ref}
      className={joinClass(markPaint.switch, switchRoot, switchSize[size], switchReach[size], className)}
      {...frameProps}
      {...mergeProps(focusHandlers, rest, controlProps)}
    />
  );
});
