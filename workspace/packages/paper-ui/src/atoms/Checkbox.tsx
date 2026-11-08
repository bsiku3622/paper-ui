// Checkbox — 표시한다/안 한다.
//   status  error — 경계가 오류 잉크로 바뀐다. FormField 가 invalid 면 안 줘도 같다. aria-invalid 도 같이 선다.
//
// ref 는 native input 을 가리킨다. 키보드 포커스는 useFocusRing 이 input 에서 판정하고, 링도 input 이 그린다.

import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";

import { joinClass } from "../internal/joinClass";
import { useMergedRef } from "../internal/refs";
import { controlClass } from "../primitives/control/Control";
import { markPaint, markPressPaint } from "../primitives/paint/recipes.css";
import { useInputControl, type MarkProps } from "./input-control";
import { checkboxMark, checkboxRoot } from "./Checkbox.css";
import { markBox } from "./recipes/mark.css";

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

export type CheckboxProps = MarkProps & {
  // 부분 선택 — "전체 선택"의 일부만 켜진 상태. DOM 프로퍼티라 ref 로만 세운다.
  indeterminate?: boolean;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ status, size, indeterminate, className, ...rest }, ref) {
  const { inputProps, frameProps } = useInputControl(rest, { status });
  const input = useRef<HTMLInputElement>(null);
  const setRef = useMergedRef(ref, input);
  // indeterminate 는 속성이 아니라 프로퍼티라 element 에 직접 세운다. 넘어온 ref 는 그대로 두고 값이 바뀔 때만 다시 쓴다.
  useIsomorphicLayoutEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate ?? false;
  }, [indeterminate]);

  return (
    <input
      type="checkbox"
      ref={setRef}
      className={joinClass(controlClass({ size, anatomy: "mark" }), markBox, markPaint.checkbox, markPressPaint, checkboxRoot, checkboxMark, className)}
      {...frameProps}
      {...inputProps}
    />
  );
});
