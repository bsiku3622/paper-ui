// Field — 한 줄 입력.

import type { InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { fieldRoot, fieldNumeric } from "./Field.css";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  // 금액·수량 자리 — mono + tabular + 우측정렬.
  numeric?: boolean;
  invalid?: boolean;
  className?: string;
};

export const Field = ({ numeric, invalid, className, ...rest }: FieldProps) => (
  <input
    aria-invalid={invalid || undefined}
    className={joinClass(fieldRoot, numeric && fieldNumeric, className)}
    {...rest}
  />
);
