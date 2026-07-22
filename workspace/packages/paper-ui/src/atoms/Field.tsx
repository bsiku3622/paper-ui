// Field — 한 줄 입력. 상태는 status 축 하나로 받는다 (invalid boolean 대신).
//   status   default · info · success · warning · danger
//   numeric  포맷 축 — 상태가 아니라 자리맞춤(tabular·우측정렬). status 와 직교.
//
// status="danger" 는 aria-invalid 도 함께 세운다. 포커스하면 상태색 테두리보다
// 파란 링이 이긴다 (지금 무엇을 만지는지가 먼저다).

import type { InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import type { StatusName, ControlSize } from "../tokens";
import { fieldRoot, fieldSize, fieldStatus, fieldNumeric } from "./Field.css";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "size"> & {
  status?: "default" | StatusName;
  // 크기 3 단 (sm·md·lg). Button 과 같은 사다리 — 나란히 두면 높이가 맞는다.
  size?: ControlSize;
  numeric?: boolean;
  className?: string;
};

export const Field = ({ status = "default", size = "md", numeric, className, ...rest }: FieldProps) => (
  <input
    aria-invalid={status === "danger" || undefined}
    className={joinClass(
      fieldRoot,
      fieldSize[size],
      status !== "default" && fieldStatus[status],
      numeric && fieldNumeric,
      className,
    )}
    {...rest}
  />
);
