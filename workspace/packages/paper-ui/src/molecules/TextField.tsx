// TextField — Label + Field + 도움말 한 묶음.
// 셋을 손으로 조립하면 id 연결을 매번 다시 하게 되고, 절반은 빠뜨린다.

import { useId, type ReactNode } from "react";

import { Stack, Text } from "../primitives";
import { Label, Field, type FieldProps } from "../atoms";

export type TextFieldProps = Omit<FieldProps, "id"> & {
  label: ReactNode;
  // 에러 문구가 있으면 그것만으로 invalid 다 — 두 번 말하지 않는다.
  error?: ReactNode;
  hint?: ReactNode;
};

export const TextField = ({ label, error, hint, ...field }: TextFieldProps) => {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error ?? hint;
  return (
    <Stack gap="xs">
      <Label htmlFor={id}>{label}</Label>
      <Field id={id} invalid={!!error} aria-describedby={note ? noteId : undefined} {...field} />
      {note ? (
        <Text variant="caption" as="span" className={error ? "paper-red-ink" : undefined} id={noteId}>
          {note}
        </Text>
      ) : null}
    </Stack>
  );
};
