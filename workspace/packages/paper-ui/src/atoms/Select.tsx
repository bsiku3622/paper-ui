// Select — native select anatomy를 Root · Option · Group으로 드러낸다.

import {
  forwardRef,
  type OptgroupHTMLAttributes,
  type OptionHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

import { joinClass } from "../internal/joinClass";
import type { ControlSize } from "../tokens";
import { selectRoot, selectSize, selectPill } from "./Select.css";

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children" | "size"> & {
  children: ReactNode;
  size?: ControlSize;
  shape?: "default" | "pill";
  className?: string;
};

const SelectRoot = forwardRef<HTMLSelectElement, SelectProps>(function SelectRoot(
  { children, size = "md", shape = "default", className, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={joinClass(selectRoot, selectSize[size], shape === "pill" && selectPill, className)}
      {...rest}
    >
      {children}
    </select>
  );
});

export type SelectOptionProps = Omit<OptionHTMLAttributes<HTMLOptionElement>, "children"> & {
  children: string | number;
};
export const SelectOption = ({ children, ...rest }: SelectOptionProps) => <option {...rest}>{children}</option>;

export type SelectGroupProps = Omit<OptgroupHTMLAttributes<HTMLOptGroupElement>, "children"> & {
  label: string;
  children: ReactNode;
};
export const SelectGroup = ({ children, ...rest }: SelectGroupProps) => <optgroup {...rest}>{children}</optgroup>;

export const Select = Object.assign(SelectRoot, {
  Option: SelectOption,
  Group: SelectGroup,
});
