// Select — 목록에서 하나. native select 를 종이 결로 감싼 것.

import type { SelectHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { selectRoot } from "./Select.css";

export type SelectOption = { value: string; label: string };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children"> & {
  options: readonly SelectOption[];
  className?: string;
};

export const Select = ({ options, className, ...rest }: SelectProps) => (
  <select className={joinClass(selectRoot, className)} {...rest}>
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);
