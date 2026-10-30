import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";

import { VALUE_ATTRIBUTE, stateAttributes } from "../../tokens";
import { Text } from "../Text";

export type FormFieldOptions = {
  id?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  "aria-describedby"?: string;
};
const part = (name: "label" | "description" | "error") => ({ [VALUE_ATTRIBUTE.part]: name });
const hasContent = (value: ReactNode) => value !== undefined && value !== null && value !== false;
export function useFormField({ id, disabled = false, required = false, invalid = false, description, error, "aria-describedby": describedBy }: FormFieldOptions = {}) {
  const generatedId = useId();
  const controlId = id ?? `pui-field-${generatedId}`;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const ids = [...new Set([describedBy, hasContent(description) ? descriptionId : undefined, invalid && hasContent(error) ? errorId : undefined].filter(Boolean).flatMap((value) => value!.split(/\s+/)))].join(" ") || undefined;
  return {
    controlProps: { id: controlId, disabled, required, "aria-invalid": invalid || undefined, "aria-describedby": ids },
    labelProps: { htmlFor: controlId },
    descriptionProps: { id: descriptionId },
    errorProps: { id: errorId },
  };
}
export type FormFieldResult = ReturnType<typeof useFormField>;
export type FormFieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "id"> & FormFieldOptions & {
  label: ReactNode;
  children: (field: FormFieldResult) => ReactNode;
};
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField({ label, children, id, disabled, required, invalid, description, error, "aria-describedby": describedBy, ...props }, ref) {
  const field = useFormField({ id, disabled, required, invalid, description, error, "aria-describedby": describedBy });
  return <div {...props} ref={ref} {...stateAttributes({ disabled, invalid, required })}>
    <Text as="label" variant="label" {...part("label")} {...field.labelProps}>{label}</Text>
    {children(field)}
    {hasContent(description) && <Text variant="caption" {...part("description")} {...field.descriptionProps}>{description}</Text>}
    {invalid && hasContent(error) && <Text variant="caption" ink="error" {...part("error")} {...field.errorProps}>{error}</Text>}
  </div>;
});
