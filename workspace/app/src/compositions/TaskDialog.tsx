// TaskDialog — "새 작업" as a modal dialog: a Button opens it, a FormField names the one input, and the actions are
// a hairline Close and a submit. Submitting adds the task, closes the dialog and announces it, because the page
// behind a modal is hidden from assistive technology until the dialog has left. The package has no dialog, so this is
// the app's composition of Floating, FormField and Field.

import { useState, type FormEvent } from "react";

import { Button, Field, Floating, FormField, Inline, Stack, Text, announce, surfaceClass, useFloatingContext } from "@studio-baeks/paper-ui";

import { joinClass } from "../joinClass";
import { PlusIcon } from "./icons";
import * as s from "./task-dialog.css";

export const TASK_ADDED = "새 작업을 추가했습니다";

const NewTask = ({ onAdd }: { onAdd: (title: string) => void }) => {
  const { close } = useFloatingContext();
  const [title, setTitle] = useState("");
  const [invalid, setInvalid] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const name = title.trim();
    if (!name) {
      setInvalid(true);
      return;
    }
    onAdd(name);
    announce(TASK_ADDED);
    close();
  };
  return (
    <form noValidate onSubmit={submit}>
      <Stack gap="lg">
        <Text as="h2" variant="heading">새 작업</Text>
        <FormField label="작업 이름" required invalid={invalid} error="작업 이름을 입력해주세요.">
          <Field value={title} onChange={(event) => { setTitle(event.target.value); setInvalid(false); }} />
        </FormField>
        <Inline gap="sm" justify="end">
          <Button as={Floating.Close} variant="hairline">취소</Button>
          <Button type="submit">추가</Button>
        </Inline>
      </Stack>
    </form>
  );
};

export const TaskDialog = ({ onAdd }: { onAdd: (title: string) => void }) => (
  <Floating>
    <Button as={Floating.Trigger}><PlusIcon /> 새 작업</Button>
    <Floating.Content presentation="modal" aria-label="새 작업" className={joinClass(surfaceClass({ fill: "raised", border: true, radius: "md" }), s.dialog)}>
      <NewTask onAdd={onAdd} />
    </Floating.Content>
  </Floating>
);
