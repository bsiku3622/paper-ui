// Select — native select anatomy를 Root · Option · Group으로 드러낸다.
// 래퍼가 틀(inputFrame)이라 면·테두리·키보드 포커스 링을 지고, 안쪽 native select 가 값·폼·포커스를 맡는다.
// status 는 Field 와 같은 축이다(error 는 aria-invalid 도). 여러 개 고르기(multiple)는 없다.

import {
  forwardRef,
  type CSSProperties,
  type OptgroupHTMLAttributes,
  type OptionHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

import { joinClass } from "../internal/joinClass";
import { Icon } from "../primitives/Icon";
import { mergeProps } from "../primitives/composition";
import { fieldPaint, selectArrowPaint, selectEmptyPaint } from "../primitives/paint/recipes.css";
import { resolveControlFontSize, resolveFill, resolvePreset } from "../resolvers";
import { CONTROL_ICON, type ControlFontSize, type ControlShape, type ControlSize, type Status, type SurfaceFill } from "../tokens";
import { useInputControl } from "./input-control";
import { inputFrame, inputFramePill } from "./recipes/input-frame.css";
import { selectRoot, selectSize, selectWrap, selectArrow, selectArrowSize } from "./Select.css";

// className/style/data-testid target the visible wrapper; ref and native attributes target select.
export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children" | "size" | "multiple" | "style"> & {
  children: ReactNode;
  status?: Status;
  size?: ControlSize;
  // 면의 깊이 — Field 와 같다. raised 가 기본, sunken 은 canvas 안에서 살짝 눌린 선택.
  fill?: Extract<SurfaceFill, "raised" | "sunken">;
  fontSize?: ControlFontSize;
  shape?: ControlShape;
  className?: string;
  style?: CSSProperties;
  "data-testid"?: string;
};

const SelectRoot = forwardRef<HTMLSelectElement, SelectProps>(function SelectRoot(
  { children, status, size = "md", fill = "raised", fontSize, shape = "rounded", className, style, "data-testid": testid, id, disabled, required, "aria-invalid": ariaInvalid, "aria-describedby": describedBy, ...rest },
  ref,
) {
  const { controlProps, focusHandlers, frameProps } = useInputControl({ id, disabled, required, "aria-invalid": ariaInvalid, "aria-describedby": describedBy, status });
  return (
    <span
      style={style}
      data-testid={testid}
      className={joinClass(inputFrame, fieldPaint, selectEmptyPaint, selectWrap, resolveFill(fill), selectSize[size], resolvePreset("field", size), resolveControlFontSize(fontSize), shape === "pill" && inputFramePill, className)}
      {...frameProps}
    >
      <select ref={ref} className={selectRoot} {...mergeProps(focusHandlers, rest, controlProps)}>
        {children}
      </select>
      <Icon size={CONTROL_ICON[size]} className={joinClass(selectArrow, selectArrowPaint, selectArrowSize[size])}><path d="m6 9 6 6 6-6" /></Icon>
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

const SelectOption = forwardRef<HTMLOptionElement, SelectOptionProps>(function SelectOption({ children, ...rest }, ref) {
  return <option ref={ref} {...rest}>{children}</option>;
});

const SelectGroup = forwardRef<HTMLOptGroupElement, SelectGroupProps>(function SelectGroup({ children, ...rest }, ref) {
  return <optgroup ref={ref} {...rest}>{children}</optgroup>;
});

export const Select = Object.assign(SelectRoot, { Option: SelectOption, Group: SelectGroup });
