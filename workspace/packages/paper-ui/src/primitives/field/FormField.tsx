import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, type AriaAttributes, type HTMLAttributes, type ReactNode } from "react";

import { paperError } from "../../internal/errors";
import { VALUE_ATTRIBUTE, stateAttributes, type Status } from "../../tokens";
import { usePortalDepth } from "../a11y/Portal";
import { Text } from "../Text";

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

type FormFieldControlProps = {
  id: string;
  disabled?: true;
  required?: true;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

// What a FormField tells the one control inside it.
type FormFieldContextValue = {
  controlProps: FormFieldControlProps;
  invalid: boolean;
  /** A control announces itself; the field reports when a second one does. The returned function takes it back. */
  claim: () => () => void;
  portalDepth: number;
};
const FormFieldContext = createContext<FormFieldContextValue | null>(null);

// The field around a control. A portal between them cuts it: a control in a panel opened from a field is not that
// field's, though React context crosses the portal.
const useFieldAround = (): FormFieldContextValue | null => {
  const field = useContext(FormFieldContext);
  const portalDepth = usePortalDepth();
  return field?.portalDepth === portalDepth ? field : null;
};

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
const joinIds = (...lists: Array<string | undefined>) => [...new Set(lists.filter(Boolean).flatMap((list) => list!.split(/\s+/)))].join(" ") || undefined;

// The relationships of one control with its label, description and error, without rendering anything.
export function useFormField({ id, disabled = false, required = false, invalid = false, description, error, "aria-describedby": describedBy }: FormFieldOptions = {}) {
  const generatedId = useId();
  const controlId = id ?? `pui-field-${generatedId}`;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const ids = joinIds(describedBy, hasContent(description) ? descriptionId : undefined, invalid && hasContent(error) ? errorId : undefined);
  const controlProps = useMemo<FormFieldControlProps>(() => ({
    id: controlId,
    ...(disabled && { disabled: true as const }),
    ...(required && { required: true as const }),
    ...(invalid && { "aria-invalid": true as const }),
    ...(ids && { "aria-describedby": ids }),
  }), [controlId, disabled, required, invalid, ids]);
  return {
    controlProps,
    labelProps: { htmlFor: controlId },
    descriptionProps: { id: descriptionId },
    errorProps: { id: errorId },
  };
}
export type FormFieldResult = ReturnType<typeof useFormField>;

export type FormFieldControlOptions = {
  id?: string;
  disabled?: boolean;
  required?: boolean;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  "aria-describedby"?: string;
  /** An error status makes the control invalid, as the field being invalid does. */
  status?: Status;
};
export type FormFieldControlResult = {
  /** Spread on the control after its own props. Only the keys that have a value are in it. */
  controlProps: {
    id?: string;
    disabled?: true;
    required?: true;
    "aria-invalid"?: AriaAttributes["aria-invalid"];
    "aria-describedby"?: string;
  };
  isInvalid: boolean;
  /** The status the control should draw: error while it is invalid, else the status it was given. */
  visualStatus: Status | undefined;
  isInField: boolean;
};

// The one control of a FormField, or any control outside one. Inside a field the field's id, relationships and state
// reach the control: disabled and required add up, describedby is the control's own ids and then the field's, and
// aria-invalid is the control's own word if it gave one, else error status or the field being invalid.
export function useFormFieldControl({ id, disabled, required, "aria-invalid": explicit, "aria-describedby": describedBy, status }: FormFieldControlOptions = {}): FormFieldControlResult {
  const field = useFieldAround();
  const claim = field?.claim;
  const own = field?.controlProps;
  const mismatch = id !== undefined && own !== undefined && id !== own.id;
  useIsomorphicLayoutEffect(() => (claim ? claim() : undefined), [claim]);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && mismatch) console.error(paperError(`A control inside a FormField takes the field's id (${own?.id}); its own id "${id}" is ignored.`).message);
  }, [mismatch, own?.id, id]);
  const isDisabled = disabled || own?.disabled;
  const isRequired = required || own?.required;
  const ids = joinIds(describedBy, own?.["aria-describedby"]);
  const invalid = explicit ?? (status === "error" || field?.invalid ? true : undefined);
  const isInvalid = invalid !== undefined && invalid !== false && invalid !== "false";
  const controlId = own?.id ?? id;
  return {
    controlProps: {
      ...(controlId !== undefined && { id: controlId }),
      ...(isDisabled && { disabled: true as const }),
      ...(isRequired && { required: true as const }),
      ...(invalid !== undefined && { "aria-invalid": invalid }),
      ...(ids && { "aria-describedby": ids }),
    },
    isInvalid,
    visualStatus: isInvalid ? "error" : status,
    isInField: field !== null,
  };
}

export type FormFieldState = { isDisabled: boolean; isInvalid: boolean; isRequired: boolean };
export type FormFieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "id"> & FormFieldOptions & {
  label: ReactNode;
  children?: ReactNode | ((state: FormFieldState) => ReactNode);
};
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField({ label, children, id, disabled = false, required = false, invalid = false, description, error, "aria-describedby": describedBy, ...props }, ref) {
  const field = useFormField({ id, disabled, required, invalid, description, error, "aria-describedby": describedBy });
  const claimed = useRef(0);
  const claim = useCallback(() => {
    claimed.current += 1;
    if (process.env.NODE_ENV !== "production" && claimed.current > 1) console.error(paperError("A FormField holds one control; a second one inside it gets the same id.").message);
    return () => { claimed.current -= 1; };
  }, []);
  const { controlProps } = field;
  const portalDepth = usePortalDepth();
  const context = useMemo<FormFieldContextValue>(() => ({ controlProps, invalid, claim, portalDepth }), [controlProps, invalid, claim, portalDepth]);
  return <FormFieldContext.Provider value={context}>
    <div {...props} ref={ref} {...stateAttributes({ disabled, invalid, required })}>
      <Text as="label" variant="label" {...part("label")} {...field.labelProps}>{label}</Text>
      {typeof children === "function" ? children({ isDisabled: disabled, isInvalid: invalid, isRequired: required }) : children}
      {hasContent(description) && <Text variant="caption" {...part("description")} {...field.descriptionProps}>{description}</Text>}
      {invalid && hasContent(error) && <Text variant="caption" ink="error" {...part("error")} {...field.errorProps}>{error}</Text>}
    </div>
  </FormFieldContext.Provider>;
});
