// FormField — 라벨 · 컨트롤 · 설명 한 벌.
//
// TextField 가 Field 하나만 위한 빠른 길이라면, FormField 는 Select·Textarea·RadioGroup까지
// 같은 수직 리듬과 접근성 연결로 감싸는 바깥 골격이다. 컨트롤의 시각 상태(status)는 각 Atom이
// 계속 소유한다 — 여기서 새로운 form 색 축을 만들지 않는다.

import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";

import { Stack, Text } from "../primitives";
import { Label } from "../atoms";

type ControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

export type FormFieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  // RadioGroup처럼 이미 자기 접근 이름을 갖는 컨트롤은 label 없이 hint만 둘 수 있다.
  children: ReactNode;
  className?: string;
};

const joinIds = (...ids: Array<string | undefined>): string | undefined => {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
};

export const FormField = ({ label, hint, error, children, className }: FormFieldProps) => {
  const uid = useId();
  const controlId = `${uid}-control`;
  const noteId = `${uid}-note`;
  const note = error ?? hint;

  // control의 기존 id·설명 관계는 보존하고, FormField가 맡은 연결만 덧댄다. Atom 외의
  // control도 받을 수 있게 DOM prop만 주입한다 — status 같은 시각 prop은 건드리지 않는다.
  const control = isValidElement<ControlProps>(children)
    ? cloneElement(children as ReactElement<ControlProps>, {
        id: children.props.id ?? controlId,
        "aria-describedby": joinIds(children.props["aria-describedby"], note ? noteId : undefined),
        "aria-invalid": error ? true : children.props["aria-invalid"],
      })
    : children;

  return (
    <Stack gap="xs" className={className}>
      {label ? <Label htmlFor={isValidElement<ControlProps>(children) ? children.props.id ?? controlId : undefined}>{label}</Label> : null}
      {control}
      {note ? (
        <Text variant="caption" as="span" ink={error ? "error" : undefined} id={noteId}>
          {note}
        </Text>
      ) : null}
    </Stack>
  );
};
