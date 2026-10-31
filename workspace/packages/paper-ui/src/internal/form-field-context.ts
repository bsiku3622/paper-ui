// What a FormField tells the one control inside it. The context lives here, below the primitives, so that a Floating
// panel can reset it without leaning on the Field folder: a control in a panel opened from a field is not that field's.

import { createContext } from "react";

export type FormFieldControlProps = {
  id: string;
  disabled?: true;
  required?: true;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

export type FormFieldContextValue = {
  controlProps: FormFieldControlProps;
  invalid: boolean;
  /** A control announces itself; the field reports when a second one does. The returned function takes it back. */
  claim: () => () => void;
};

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);
