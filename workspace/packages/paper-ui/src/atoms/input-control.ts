// The control inside an input frame — Field, Textarea and Select stand on the same two primitives and say the same
// things about them, and so do Checkbox, Radio and Switch, so the words are said here once: the FormField's relations and
// the one word for invalid (useFormFieldControl), whether the keyboard put the focus there (useFocusRing), and what the
// frame shows of both.
//
// The frame is the element that draws the border and the ring. For a Textarea or a selection mark that is the control
// itself; for Field and Select it is the wrapper around the native control, which keeps the focus handlers and the controlProps.

import { useFocusRing } from "../primitives/a11y/focus";
import { useFormFieldControl, type FormFieldControlOptions } from "../primitives/field/FormField";
import { VALUE_ATTRIBUTE, stateAttributes } from "../tokens";

export type InputControlOptions = FormFieldControlOptions & {
  /** A text control shows its ring for Tab and not for typing. */
  textInput?: boolean;
};

export function useInputControl({ textInput, ...options }: InputControlOptions) {
  const { controlProps, isInvalid, visualStatus } = useFormFieldControl(options);
  const { focusProps, isFocusVisible } = useFocusRing({ textInput });
  return {
    controlProps,
    // Merged on the native control after the caller's props, so the caller's handler runs first.
    focusHandlers: { onFocus: focusProps.onFocus, onBlur: focusProps.onBlur },
    // Spread on the frame: the status it draws (error while invalid), and the states its stylesheet reads.
    frameProps: {
      ...stateAttributes({ focusVisible: isFocusVisible, disabled: controlProps.disabled === true, invalid: isInvalid }),
      ...(visualStatus !== undefined && { [VALUE_ATTRIBUTE.status]: visualStatus }),
    },
  };
}
