// Radio — 여럿 중 하나. 관련 선택지는 사용하는 화면에서 묶는다.
//   status  error — 경계가 오류 잉크로 바뀐다. 한 묶음의 Radio 는 모두 같은 status 를 주거나 radiogroup 에 aria-invalid 를 준다.

import { forwardRef, type InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { mergeProps } from "../primitives";
import { markPaint } from "../primitives/paint/recipes.css";
import type { ChoiceStatus, ControlSize } from "../tokens";
import { useInputControl } from "./input-control";
import { radioRoot, radioSize } from "./Radio.css";
import { selectionBox, selectionReach, selectionSize } from "./recipes/selection-control.css";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size"> & {
  status?: ChoiceStatus;
  // 크기 3 단 (sm·md·lg). Checkbox 와 같은 변 사다리.
  size?: ControlSize;
  className?: string;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { status, size = "md", className, id, disabled, required, "aria-invalid": ariaInvalid, "aria-describedby": describedBy, ...rest },
  ref,
) {
  const { controlProps, focusHandlers, frameProps } = useInputControl({ id, disabled, required, "aria-invalid": ariaInvalid, "aria-describedby": describedBy, status });
  return (
    <input
      type="radio"
      ref={ref}
      className={joinClass(selectionBox, markPaint.radio, radioRoot, selectionSize[size], selectionReach[size], radioSize[size], className)}
      {...frameProps}
      {...mergeProps(focusHandlers, rest, controlProps)}
    />
  );
});
