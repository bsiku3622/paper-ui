import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";

import { Text } from "../Text";

export type FieldOptions = {
  id?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  "aria-describedby"?: string;
};
const hasContent = (value: ReactNode) => value !== undefined && value !== null && value !== false;
export function useField({ id, disabled = false, required = false, invalid = false, description, error, "aria-describedby": describedBy }: FieldOptions = {}) {
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
export type FieldResult = ReturnType<typeof useField>;
export type FormFieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "id"> & FieldOptions & {
  label: ReactNode;
  children: (field: FieldResult) => ReactNode;
};
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField({ label, children, id, disabled, required, invalid, description, error, "aria-describedby": describedBy, ...props }, ref) {
  const field = useField({ id, disabled, required, invalid, description, error, "aria-describedby": describedBy });
  return <div {...props} ref={ref} data-disabled={disabled || undefined} data-invalid={invalid || undefined} data-required={required || undefined}>
    <Text as="label" variant="label" data-part="label" {...field.labelProps}>{label}</Text>
    {children(field)}
    {hasContent(description) && <Text variant="caption" data-part="description" {...field.descriptionProps}>{description}</Text>}
    {invalid && hasContent(error) && <Text variant="caption" ink="error" data-part="error" {...field.errorProps}>{error}</Text>}
  </div>;
});
