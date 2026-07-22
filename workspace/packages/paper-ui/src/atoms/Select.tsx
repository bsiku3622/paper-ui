// Select — 목록에서 하나. native select 를 종이 결로 감싼 것.

import type { SelectHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import type { ControlSize } from "../tokens";
import { selectRoot, selectSize } from "./Select.css";

export type SelectOption = { value: string; label: string };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children" | "size"> & {
  options: readonly SelectOption[];
  // 크기 3 단 (sm·md·lg). Button·Field 와 같은 사다리 — 나란히 두면 높이가 맞는다.
  size?: ControlSize;
  className?: string;
};

export const Select = ({ options, size = "md", className, ...rest }: SelectProps) => (
  <select className={joinClass(selectRoot, selectSize[size], className)} {...rest}>
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);
