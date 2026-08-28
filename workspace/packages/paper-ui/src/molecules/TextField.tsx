// TextField — Label + Field + 도움말 한 묶음.
// 셋을 손으로 조립하면 id 연결을 매번 다시 하게 되고, 절반은 빠뜨린다.

import { useId, type ReactNode } from "react";

import { Stack, Text } from "../primitives";
import { Label, Field, type FieldProps } from "../atoms";

export type TextFieldProps = Omit<FieldProps, "id"> & {
  // 라벨이 없는 입력(navbar 검색 등)은 TextField 가 아니라 Field 를 직접 쓴다.
  // 그래도 빈 라벨이 들어오면 빈 Label 행 + gap 이 Field 를 아래로 밀므로 렌더하지 않는다.
  label?: ReactNode;
  // 에러 문구가 있으면 그것만으로 invalid 다 — 두 번 말하지 않는다.
  error?: ReactNode;
  hint?: ReactNode;
};

export const TextField = ({ label, error, hint, status, ...field }: TextFieldProps) => {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error ?? hint;
  // 에러 문구가 있으면 그것만으로 error 다 — status 를 명시하지 않아도 빨갛게.
  const resolved = error ? "error" : status;
  return (
    <Stack gap="xs">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Field id={id} status={resolved} aria-describedby={note ? noteId : undefined} {...field} />
      {note ? (
        <Text variant="caption" as="span" ink={error ? "error" : undefined} id={noteId}>
          {note}
        </Text>
      ) : null}
    </Stack>
  );
};
