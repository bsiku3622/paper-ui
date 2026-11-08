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
  textInput?: boolean;
};

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

export type InputFrameProps = Pick<ControlForm, "size" | "fontSize"> & {
  status?: Status;
  fill?: SurfaceFill;
  variant?: InputVariant;
  shadow?: boolean;
};

export const inputFrameClass = ({ fill, variant = "hairline", shadow, ...form }: Omit<InputFrameProps, "status"> & Pick<ControlForm, "shape" | "gap"> & { anatomy: Extract<ControlAnatomy, "input" | "frame" | "area"> }): string => {
  return joinClass(
    inputFrame,
    fieldPaint,
    variant === "ghost" && fieldLinelessPaint,
    fill === undefined ? fieldFace : resolveFill(fill),
    shadow === true && restingShadow,
    controlClass(form),
  );
};

export type MarkProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size"> & Pick<ControlForm, "size"> & {
  status?: ChoiceStatus;
  className?: string;
};
