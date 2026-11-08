// The input family. Field, Textarea and Select stand on the same two primitives and say the same things about them, and so do
// Checkbox, Radio and Switch, so the words are said here once: the FormField's relations and the one word for invalid
// (useFormFieldControl), whether the keyboard put the focus there (useFocusRing), and what the frame shows of both.
//
// The frame is the element that draws the border and the ring. For a Textarea or a selection mark that is the control
// itself; for Field and Select it is the wrapper around the native control, which keeps the handlers and the relations.

import type { InputHTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { useFocusRing } from "../primitives/a11y/focus";
import { mergeProps } from "../primitives/composition";
import { controlClass, type ControlForm } from "../primitives/control/Control";
import { useFormFieldControl, type FormFieldControlOptions } from "../primitives/field/FormField";
import { fieldFace, fieldLinelessPaint, fieldPaint } from "../primitives/paint/recipes.css";
import { restingShadow } from "../primitives/paint/Surface.css";
import { resolveFill } from "../resolvers";
import { VALUE_ATTRIBUTE, stateAttributes, type ChoiceStatus, type ControlAnatomy, type InputVariant, type Status, type SurfaceFill } from "../tokens";
import { inputFrame } from "./recipes/input-frame.css";

type InputControlOptions = Pick<FormFieldControlOptions, "status"> & {
  /** A text control shows its ring for Tab and not for typing. */
  textInput?: boolean;
};

// Takes what the caller gave the native control and hands back the two things to spread: inputProps on the native control, with the
// caller's handlers first, and frameProps on the frame, with the status it draws (error while invalid) and the states its stylesheet reads.
export function useInputControl<Props extends Omit<FormFieldControlOptions, "status">>(props: Props, { status, textInput }: InputControlOptions = {}) {
  const { id, disabled, required, "aria-invalid": ariaInvalid, "aria-describedby": describedBy, ...rest } = props;
  const { controlProps, isInvalid, visualStatus } = useFormFieldControl({ id, disabled, required, "aria-invalid": ariaInvalid, "aria-describedby": describedBy, status });
  const { focusProps, isFocusVisible } = useFocusRing({ textInput });
  const isDisabled = controlProps.disabled === true;
  return {
    isDisabled,
    inputProps: mergeProps(rest, { onFocus: focusProps.onFocus, onBlur: focusProps.onBlur }, controlProps),
    frameProps: {
      ...stateAttributes({ focusVisible: isFocusVisible, disabled: isDisabled, invalid: isInvalid }),
      ...(visualStatus !== undefined && { [VALUE_ATTRIBUTE.status]: visualStatus }),
    },
  };
}

// What Field, Textarea and Select choose about their frame.
export type InputFrameProps = Pick<ControlForm, "size" | "fontSize"> & {
  status?: Status;
  // 면 — 안 주면 어디에 놓이든 흰 면(control.field, 다크는 카드보다 한 단계 밝은 면)이다. 회색이 필요한 자리(검색칸 같은)는
  // sunken 을 ghost 와 함께 고른다. 다크에서는 sunken 과 canvas 가 같은 단계다.
  fill?: SurfaceFill;
  // 가장자리 — hairline(실선, 기본) · ghost(선 없음). 경계는 선이 세운다: 흰 카드 위의 흰 칸도 선으로 보인다. ghost 는 면의 색이
  // 경계가 되는 자리에 쓴다. 상태의 선은 ghost 에서도 남는다.
  variant?: InputVariant;
  // 그림자. true 면 제자리 그림자를 얹는다. 기본은 없다.
  shadow?: boolean;
};

// The one way to a frame: its outline and ring, its colour, its face, and its size.
export const inputFrameClass = ({ fill, variant = "hairline", shadow, ...form }: Omit<InputFrameProps, "status"> & Pick<ControlForm, "shape" | "gap"> & { anatomy: Extract<ControlAnatomy, "input" | "frame" | "area"> }): string => {
  // A frame stands on its own white face in the one grey line, as a hairline button does. A chosen face replaces the white one, and a
  // shadow is only ever asked for.
  return joinClass(
    inputFrame,
    fieldPaint,
    variant === "ghost" && fieldLinelessPaint,
    fill === undefined ? fieldFace : resolveFill(fill),
    shadow === true && restingShadow,
    controlClass(form),
  );
};

// What Checkbox, Radio and Switch take: a selection mark is the native input itself.
export type MarkProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size"> & Pick<ControlForm, "size"> & {
  status?: ChoiceStatus;
  className?: string;
};
