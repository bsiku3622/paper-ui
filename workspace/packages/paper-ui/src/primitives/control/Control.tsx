// Control — 크기를 입히는 2차 primitive. 크기가 있는 Atom 의 형태가 모두 여기서 온다.
//
// 높이 · 안쪽 여백 · 모서리 · 글자 · 아이콘 크기를 size 하나로 함께 정한다. anatomy 는 그 크기로 무엇을 그리는가이다. Atom 은
// Control × Paint × 행동이다. 색을 칠하지 않고 선도 긋지 않으며(Paint · Line), 누르는 일도 하지 않는다(Press).
//
// 값의 사다리가 달라도(표식은 selection.size, Badge 는 자기 원본) size class 가 변수를 하나 더 정할 뿐이고 anatomy 가 고른다.

import { forwardRef, type ElementType } from "react";

import { joinClass } from "../../internal/joinClass";
import { resolveControlFontSize, resolveControlStrong, resolvePreset } from "../../resolvers";
import { CONTROL_ANATOMY_PRESET, type Align, type ControlAnatomy, type ControlFontSize, type ControlShape, type ControlSize, type IconSize, type Justify, type Space } from "../../tokens";
import { Box, type BoxOwnProps } from "../Box";
import type { PolymorphicComponent, PolymorphicProps } from "../polymorphic";
import { controlAlign, controlAnatomy, controlGap, controlIconSize, controlJustify, controlPill, controlSize } from "./Control.css";

// Atom 의 prop 도 이 타입에서 뽑아 쓴다. 그래서 Atom = Control × Paint × 행동이 타입에도 그대로 적힌다.
export type ControlForm = {
  // 높이 사다리 — 글자 · 여백 · 모서리 · 아이콘이 함께 움직인다. 안 주면 md 다.
  size?: ControlSize;
  // label 은 글자가 상자를 정하고, icon 은 정사각, input 은 상자가 먼저이고, frame 은 안쪽 요소가 여백을 갖고, area 는 줄 수가 높이를
  // 정한다. mark 는 Checkbox · Radio 의 네모, track 은 Switch 의 막대, badge 는 낱말 하나, spinner 는 도는 원이다.
  anatomy?: ControlAnatomy;
  // 실루엣 — rounded 는 크기에 맞는 시스템 곡선(radius.control), pill 은 알약(radius.pill). 값이 둘뿐인 건 의도다. 고르는 건 알약이냐
  // 아니냐이지 곡선의 크기가 아니다.
  shape?: ControlShape;
  // 실루엣은 유지하고 글자만 조정하는 통로. 안 주면 size 사다리를 따른다.
  fontSize?: ControlFontSize;
  // 글자의 강조 한 비트 — 생략이면 preset 의 굵기, false 면 regular. 상자의 기하는 그대로다.
  strong?: boolean;
  // 내용을 늘어놓는 방식이고 크기와 따로 고른다. 안 주면 anatomy 의 기본을 쓴다. justify 는 상자가 내용보다 넓을 때 뜻이 생긴다.
  gap?: Space;
  align?: Align;
  justify?: Justify;
  // 안의 Icon 크기. 안 주면 컨트롤 높이를 따르고, Icon 에 직접 준 size 가 이긴다.
  iconSize?: IconSize;
};

export type ControlOwnProps = BoxOwnProps & ControlForm;
export type ControlProps<As extends ElementType = "div"> = PolymorphicProps<ControlOwnProps, As>;

// Atom 이 컨트롤 크기에 닿는 유일한 길.
export const controlClass = ({ size = "md", anatomy = "label", shape, fontSize, strong, gap, align, justify, iconSize }: ControlForm = {}): string => {
  const preset = CONTROL_ANATOMY_PRESET[anatomy];
  return joinClass(
    controlSize[size],
    controlAnatomy[anatomy],
    shape === "pill" && controlPill,
    // A Badge's text stays at one size, so its preset has no ladder.
    preset === "badge" ? resolvePreset(preset) : preset && resolvePreset(preset, size),
    resolveControlFontSize(fontSize),
    resolveControlStrong(strong),
    gap && controlGap[gap],
    align && controlAlign[align],
    justify && controlJustify[justify],
    iconSize && controlIconSize[iconSize],
  );
};

const ControlImpl = forwardRef<HTMLElement, Omit<ControlProps, "as" | "ref"> & { as?: ElementType }>(function Control({
  size,
  anatomy,
  shape,
  fontSize,
  strong,
  gap,
  align,
  justify,
  iconSize,
  className,
  ...rest
}, ref) {
  return <Box ref={ref} className={joinClass(controlClass({ size, anatomy, shape, fontSize, strong, gap, align, justify, iconSize }), className)} {...rest} />;
});

export const Control = ControlImpl as PolymorphicComponent<ControlOwnProps, "div">;
