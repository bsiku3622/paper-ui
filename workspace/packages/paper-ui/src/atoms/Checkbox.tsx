// Checkbox — 표시한다/안 한다.

import { forwardRef, useCallback, type InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import type { ControlSize } from "../tokens";
import { checkboxRoot, checkboxSize } from "./Checkbox.css";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size"> & {
  // 크기 3 단 (sm·md·lg). 변 15·16·18. 큰 폼에서 라벨과 함께 커진다.
  size?: ControlSize;
  // 부분 선택 — "전체 선택"의 일부만 켜진 상태. DOM 프로퍼티라 ref 로만 세운다.
  indeterminate?: boolean;
  className?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { size = "md", indeterminate, className, ...rest },
  ref,
) {
  // indeterminate 는 속성이 아니라 프로퍼티라 element 에 직접 세운다. 넘어온 ref 도 함께 채운다.
  const setRef = useCallback(
    (el: HTMLInputElement | null) => {
      if (el) el.indeterminate = indeterminate ?? false;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref, indeterminate],
  );

  return <input type="checkbox" ref={setRef} className={joinClass(checkboxRoot, checkboxSize[size], className)} {...rest} />;
});
