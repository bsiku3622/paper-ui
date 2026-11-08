// A question with one line for an answer: the prototype asked for an image address, a video address and the name of an
// event with the browser's window.prompt. This is the same question in Paper's modal, with the same words.

import { useRef, useState, type FormEvent, type RefObject } from "react";

import { Button, Field, Floating, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

export type Question = { title: string; placeholder?: string };

const Form = ({ question, field, onClose, onAnswer }: { question: Question; field: RefObject<HTMLInputElement | null>; onClose: () => void; onAnswer: (text: string) => void }) => {
  const [value, setValue] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = value.trim();
    if (text) onAnswer(text);
  };
  return (
    <Stack as="form" gap="lg" onSubmit={submit}>
      <Text as="h2" variant="subheading">{question.title}</Text>
      <Field ref={field} aria-label={question.title} placeholder={question.placeholder} value={value} onChange={(event) => setValue(event.target.value)} />
      <Inline justify="end" gap="sm">
        <Button type="button" variant="ghost" onClick={onClose}>취소</Button>
        <Button type="submit" disabled={!value.trim()}>확인</Button>
      </Inline>
    </Stack>
  );
};

export const Ask = ({ question, onClose, onAnswer }: { question: Question | null; onClose: () => void; onAnswer: (text: string) => void }) => {
  const field = useRef<HTMLInputElement>(null);
  return (
    <Floating open={question !== null} onOpenChange={(next) => { if (!next) onClose(); }}>
      <Floating.Content as={Surface} fill="raised" radius="lg" padding="xl" width="xl" presentation="modal" aria-label={question?.title ?? "질문"} initialFocusRef={field}>
        {question ? <Form question={question} field={field} onClose={onClose} onAnswer={onAnswer} /> : null}
      </Floating.Content>
    </Floating>
  );
};
