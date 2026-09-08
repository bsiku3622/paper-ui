// Spinner — 진행 중 표시. currentColor 가 아니라 잉크/괘선 토큰으로 그린다.
//
// ⚠ 나머지 속성(...rest)을 흘려 보낸다. 예전엔 세 prop 만 받고 나머지를 조용히 버려서
// data-* · id · style 같은 걸 붙여도 DOM 에 안 닿았다 — Atom 이 span 하나를 그리면서
// span 의 속성을 막으면, 쓰는 쪽은 감싸는 div 를 하나 더 만들게 된다.

import type { HTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import type { ControlSize } from "../tokens";
import { spinnerRoot, spinnerSize } from "./Spinner.css";

export type SpinnerProps = Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> & {
  // 크기 3 단 (sm·md·lg). Icon 과 같은 아이콘 사다리.
  size?: ControlSize;
  label?: string;
  className?: string;
};

export const Spinner = ({ size = "md", label = "불러오는 중", className, ...rest }: SpinnerProps) => (
  <span
    role="status"
    aria-label={label}
    className={joinClass(spinnerRoot, spinnerSize[size], className)}
    {...rest}
  />
);
