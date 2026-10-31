import { useState } from "react";

import { Button, Field, FormField, Stack, type FormFieldProps, type FormFieldState } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { boolControl, defineSpec, flag } from "../schema";
import { formField } from "./examples.css";

export default defineSpec({
  name: "FormField",
  blurb: "Label·입력·설명·오류의 ID 관계를 연결합니다. 입력 종류와 시각적 상태는 기존 Atom이 소유합니다.",
  controls: [
    boolControl<FormFieldProps, "disabled">("disabled"),
    boolControl<FormFieldProps, "required">("required", true),
  ],
  defaults: { disabled: false, required: false },
  useHarness: () => {
    const [invalid, setInvalid] = useState(false);
    return { invalid, toggle: () => setInvalid((value) => !value) };
  },
  subject: (state, { invalid }) => (
    <FormField
      label="이메일"
      description="연락받을 이메일을 입력해주세요."
      error="이메일 형식을 확인해주세요."
      invalid={invalid}
      required={flag(state, "required")}
      disabled={flag(state, "disabled")}
      className={formField}
    >
      {named('({ isInvalid }) => <Field type="email" status={isInvalid ? "error" : undefined} />', ({ isInvalid }: FormFieldState) => (
        <Field type="email" status={isInvalid ? "error" : undefined} />
      ))}
    </FormField>
  ),
  Stage: ({ subject, harness }) => (
    <Stack gap="md" width="full">
      {subject}
      <Button onClick={harness.toggle}>{harness.invalid ? "오류 해제" : "오류 표시"}</Button>
    </Stack>
  ),
});
