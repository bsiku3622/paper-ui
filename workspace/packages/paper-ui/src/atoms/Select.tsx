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
import { CONTROL_ICON, type ControlShape, type ControlSize, type TextVariant } from "../tokens";
import { Icon } from "../primitives/Icon";
import { selectRoot, selectSize, selectFontSize, selectPill, selectWrap, selectArrow, selectArrowSize } from "./Select.css";

// className/style target the visible wrapper; ref and native attributes target select.
export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children" | "size"> & {
  children: ReactNode;
  size?: ControlSize;
  fontSize?: TextVariant;
  shape?: ControlShape;
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
      <Icon size={CONTROL_ICON[size]} className={joinClass(selectArrow, selectArrowSize[size])}><path d="m6 9 6 6 6-6" /></Icon>
    </span>
  );
});

export type SelectOptionProps = Omit<OptionHTMLAttributes<HTMLOptionElement>, "children"> & {
  children: string | number;
};

export type SelectGroupProps = Omit<OptgroupHTMLAttributes<HTMLOptGroupElement>, "children"> & {
  label: string;
  children: ReactNode;
};

export const Select = Object.assign(SelectRoot, {
  Option: ({ children, ...rest }: SelectOptionProps) => <option {...rest}>{children}</option>,
  Group: ({ children, ...rest }: SelectGroupProps) => <optgroup {...rest}>{children}</optgroup>,
});
