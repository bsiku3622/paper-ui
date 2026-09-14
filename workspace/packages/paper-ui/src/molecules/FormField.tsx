// FormField — label · control · 설명의 접근성 관계까지 소유하는 compound field.

import { Children, cloneElement, createContext, isValidElement, useContext, useId, type ReactElement, type ReactNode } from "react";

import { Stack, Text } from "../primitives";
import { Label } from "../atoms";

type ControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

type FormFieldContextValue = {
  controlId: string;
  noteId: string;
  hasError: boolean;
  hasNote: boolean;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);
const useFormField = () => {
  const value = useContext(FormFieldContext);
  if (!value) throw new Error("FormField parts must be used inside <FormField>");
  return value;
};

const joinIds = (...ids: Array<string | undefined>): string | undefined => {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
};

export type FormFieldProps = { children: ReactNode; className?: string; id?: string };

const FormFieldRoot = ({ children, className, id }: FormFieldProps) => {
  const uid = useId();
  const parts = Children.toArray(children);
  const hasError = parts.some(
    (child) => isValidElement(child) && child.type === FormFieldError,
  );
  const hasNote = hasError || parts.some((child) => isValidElement(child) && child.type === FormFieldHint);
  const controlId = id ?? `${uid}-control`;
  return (
    <FormFieldContext.Provider value={{ controlId, noteId: `${controlId}-note`, hasError, hasNote }}>
      <Stack gap="xs" className={className}>{children}</Stack>
    </FormFieldContext.Provider>
  );
};

export type FormFieldLabelProps = { children: ReactNode };
export const FormFieldLabel = ({ children }: FormFieldLabelProps) => {
  const { controlId } = useFormField();
  return <Label htmlFor={controlId}>{children}</Label>;
};

export type FormFieldControlProps = { children: ReactElement<ControlProps> };
export const FormFieldControl = ({ children }: FormFieldControlProps) => {
  const { controlId, noteId, hasError, hasNote } = useFormField();
  return cloneElement(children, {
    id: controlId,
    "aria-describedby": joinIds(children.props["aria-describedby"], hasNote ? noteId : undefined),
    "aria-invalid": hasError ? true : children.props["aria-invalid"],
  });
};

export type FormFieldNoteProps = { children: ReactNode };
export const FormFieldHint = ({ children }: FormFieldNoteProps) => {
  const { noteId, hasError } = useFormField();
  if (hasError) return null;
  return <Text variant="caption" as="span" id={noteId}>{children}</Text>;
};

export const FormFieldError = ({ children }: FormFieldNoteProps) => {
  const { noteId } = useFormField();
  return <Text variant="caption" as="span" ink="error" id={noteId}>{children}</Text>;
};

export const FormField = Object.assign(FormFieldRoot, {
  Label: FormFieldLabel,
  Control: FormFieldControl,
  Hint: FormFieldHint,
  Error: FormFieldError,
});
