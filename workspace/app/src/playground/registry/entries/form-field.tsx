import { useState } from "react";

import { Button, Field, FormField, Stack, type FormFieldProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, flag } from "../schema";
import { pick as inLocale, useWords } from "../../../site/locale";

const WORDS = {
  ko: { label: "이메일", description: "연락받을 이메일을 입력해주세요.", error: "이메일 형식을 확인해주세요.", clear: "오류 해제", show: "오류 표시" },
  en: { label: "Email", description: "Enter an email address we can reach you at.", error: "Check the email format.", clear: "Clear error", show: "Show error" },
};

export default defineSpec({
  name: "FormField",
  blurb: { ko: "Label·입력·설명·오류의 ID 관계를 연결하고, 그 사이 간격을 스스로 갖습니다. 입력 종류와 시각적 상태는 기존 Atom이 소유합니다.", en: "Connects the IDs of the label, input, description and error, and keeps the spacing between them. Input kinds and visual states belong to the existing Atoms." },
  controls: [
    boolControl<FormFieldProps, "disabled">("disabled"),
    boolControl<FormFieldProps, "required">("required", true),
  ],
  defaults: { disabled: false, required: false },
  useHarness: () => {
    const [invalid, setInvalid] = useState(false);
    return { invalid, toggle: () => setInvalid((value) => !value) };
  },
  subject: (state, { invalid }, locale) => {
    const w = inLocale(WORDS, locale);
    return (
    <FormField
      label={w.label}
      description={w.description}
      error={w.error}
      invalid={invalid}
      required={flag(state, "required")}
      disabled={flag(state, "disabled")}
    >
      <Field type="email" />
    </FormField>
    );
  },
  Stage: ({ subject, harness }) => {
    const w = useWords(WORDS);
    return (
    <Stack gap="md" width="full">
      {subject}
      <Button onClick={harness.toggle}>{harness.invalid ? w.clear : w.show}</Button>
    </Stack>
    );
  },
});
