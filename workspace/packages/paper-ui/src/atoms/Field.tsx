// Field — 한 줄 입력. 상태는 status 축 하나로 받는다 (invalid boolean 대신).
//   status   default · info · success · warning · danger
//   numeric  포맷 축 — 상태가 아니라 자리맞춤(tabular·우측정렬). status 와 직교.
//
// status="danger" 는 aria-invalid 도 함께 세운다. 포커스하면 상태색 테두리보다
// 파란 링이 이긴다 (지금 무엇을 만지는지가 먼저다).

import type { InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import type { StatusName } from "../tokens";
import { fieldRoot, fieldStatus, fieldNumeric } from "./Field.css";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  status?: "default" | StatusName;
  numeric?: boolean;
  className?: string;
};

export const Field = ({ status = "default", numeric, className, ...rest }: FieldProps) => (
  <input
    aria-invalid={status === "danger" || undefined}
    className={joinClass(
      fieldRoot,
      status !== "default" && fieldStatus[status],
      numeric && fieldNumeric,
      className,
    )}
    {...rest}
  />
);
