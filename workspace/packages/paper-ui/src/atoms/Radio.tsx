// Radio — 여럿 중 하나. 관련 선택지는 사용하는 화면에서 묶는다.

import { forwardRef, type InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { useFormFieldControl } from "../primitives/field/FormField";
import type { ControlSize } from "../tokens";
import { radioRoot, radioSize } from "./Radio.css";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size"> & {
  // 크기 3 단 (sm·md·lg). Checkbox 와 같은 변 사다리.
  size?: ControlSize;
  className?: string;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { size = "md", className, id, disabled, required, "aria-invalid": ariaInvalid, "aria-describedby": describedBy, ...rest },
  ref,
) {
  const { controlProps } = useFormFieldControl({ id, disabled, required, "aria-invalid": ariaInvalid, "aria-describedby": describedBy });
  return <input type="radio" ref={ref} className={joinClass(radioRoot, radioSize[size], className)} {...rest} {...controlProps} />;
});
