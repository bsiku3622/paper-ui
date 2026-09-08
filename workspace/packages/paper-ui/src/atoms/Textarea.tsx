// Textarea — 여러 줄 입력. Field 의 status 축을 그대로 쓴다(테두리로 상태 표시).
//
// size 는 Button·Field·Select 와 같은 컨트롤 사다리다. 높이만 예외 — 줄 수(rows)가
// 정하므로 size 가 움직이는 건 여백과 글자뿐이다. 대신 첫 줄이 같은 size 의 Field 와
// 같은 자리에서 시작한다.
//
// ⚠ **shape="pill" 은 여기 없다.** 알약은 "높이의 절반" 이라는 규칙이라 한 줄짜리
// 컨트롤에서만 알약이 된다. 96px 짜리 Textarea 에 걸면 반경이 48 이 되어 경기장 모양이
// 나오고, 첫 줄·마지막 줄이 곡선 아래로 밀려 왼쪽 정렬이 무너진다(네이티브 resize
// 손잡이도 모양 밖으로 나간다). 어휘가 여기서 멈추는 건 빠뜨린 게 아니라 경계다.

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
