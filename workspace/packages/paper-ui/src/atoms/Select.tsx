// Select — 목록에서 하나. native select 를 종이 결로 감싼 것.

import { forwardRef, type SelectHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import type { ControlSize } from "../tokens";
import { selectRoot, selectSize, selectPill } from "./Select.css";

export type SelectOption = { value: string; label: string };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children" | "size"> & {
  options: readonly SelectOption[];
  // 크기 3 단 (sm·md·lg). Button·Field 와 같은 사다리 — 나란히 두면 높이가 맞는다.
  size?: ControlSize;
  // 실루엣 — Button·Badge·Field 와 같은 어휘. pill 은 알약.
  shape?: "default" | "pill";
  className?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, size = "md", shape = "default", className, ...rest },
  ref,
) {
  return (
    <select ref={ref} className={joinClass(selectRoot, selectSize[size], shape === "pill" && selectPill, className)} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
});
