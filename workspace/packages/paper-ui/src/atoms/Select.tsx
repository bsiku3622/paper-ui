// Select — native select anatomy를 Root · Option · Group으로 드러낸다.

import {
  forwardRef,
  type OptgroupHTMLAttributes,
  type OptionHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

import { joinClass } from "../internal/joinClass";
import { resolveControlTypography } from "../resolvers";
import type { ControlSize, TextVariant } from "../tokens";
import { selectRoot, selectSize, selectFontSize, selectPill, selectWrap, selectArrow } from "./Select.css";

// className/style target the visible wrapper; ref and native attributes target select.
export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children" | "size"> & {
  children: ReactNode;
  size?: ControlSize;
  fontSize?: TextVariant;
  shape?: "rounded" | "pill";
  className?: string;
};

const SelectRoot = forwardRef<HTMLSelectElement, SelectProps>(function SelectRoot(
  { children, size = "md", fontSize, shape = "rounded", className, style, onPointerDown, onBlur, ...rest },
  ref,
) {
  return (
    <span style={style} className={joinClass(selectWrap, selectSize[size], resolveControlTypography("field", size), fontSize && selectFontSize[fontSize], shape === "pill" && selectPill, className)}>
      <select
        ref={ref}
        onPointerDown={(event) => {
          event.currentTarget.dataset.puiPointerFocus = "true";
          onPointerDown?.(event);
        }}
        onBlur={(event) => {
          delete event.currentTarget.dataset.puiPointerFocus;
          onBlur?.(event);
        }}
        className={selectRoot}
        {...rest}
      >
        {children}
      </select>
      <svg className={selectArrow} viewBox="0 0 12 8" aria-hidden="true" focusable="false"><path d="M1 1.5 6 6.5 11 1.5" /></svg>
    </span>
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
