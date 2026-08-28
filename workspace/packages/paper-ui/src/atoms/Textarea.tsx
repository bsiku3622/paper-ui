// Textarea — 여러 줄 입력. Field 의 status 축을 그대로 쓴다(테두리로 상태 표시).

import { forwardRef, type TextareaHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import type { StatusName } from "../tokens";
import { fieldStatus } from "./Field.css";
import { textareaRoot } from "./Textarea.css";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  status?: "default" | StatusName;
  className?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { status = "default", className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={status === "error" || undefined}
      className={joinClass(textareaRoot, status !== "default" && fieldStatus[status], className)}
      {...rest}
    />
  );
});
