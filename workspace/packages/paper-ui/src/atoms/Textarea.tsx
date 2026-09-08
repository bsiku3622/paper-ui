// Textarea — 여러 줄 입력. Field 의 status 축을 그대로 쓴다(테두리로 상태 표시).
//
// size 는 Button·Field·Select 와 같은 컨트롤 사다리다. 높이만 예외 — 줄 수(rows)가
// 정하므로 size 가 움직이는 건 여백과 글자뿐이다. 대신 첫 줄이 같은 size 의 Field 와
// 같은 자리에서 시작한다.

import { forwardRef, type TextareaHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import type { ControlSize, StatusName } from "../tokens";
import { fieldStatus } from "./Field.css";
import { textareaRoot, textareaSize } from "./Textarea.css";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  status?: "default" | StatusName;
  // 크기 3 단 (sm·md·lg). Button·Field·Select 와 같은 여백·글자 사다리.
  size?: ControlSize;
  className?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { status = "default", size = "md", className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={status === "error" || undefined}
      className={joinClass(textareaRoot, textareaSize[size], status !== "default" && fieldStatus[status], className)}
      {...rest}
    />
  );
});
