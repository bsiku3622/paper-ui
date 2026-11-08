import { forwardRef } from "react";

import { Field, Textarea, type FieldProps, type TextareaProps } from "@studio-baeks/paper-ui";

import { monoArea, monoAreaWrap, monoField } from "./mono.css";

export const MonoField = forwardRef<HTMLInputElement, FieldProps>(function MonoField(props, ref) {
  return <Field ref={ref} {...props} className={monoField} />;
});

export const CodeTextarea = forwardRef<HTMLTextAreaElement, TextareaProps & { wrapLines?: boolean }>(function CodeTextarea({ wrapLines = false, ...props }, ref) {
  return <Textarea ref={ref} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap={wrapLines ? "soft" : "off"} {...props} className={wrapLines ? monoAreaWrap : monoArea} />;
});
