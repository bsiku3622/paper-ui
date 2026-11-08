import { useEffect, useRef, useState } from "react";

import { Box, Button, IconButton, Inline, Select, Spinner, Stack, Surface, Text, Textarea } from "@studio-baeks/paper-ui";

import { Glyph, useStored } from "../../../../kit";
import { useClasses } from "../../state";
import { Notice } from "../../ui/parts";
import { SUGGESTIONS } from "./engine";
import { isBusy, MODELS, reset, send, useMessages, type Message, type Model } from "./store";

const Steps = ({ message, open, onToggle }: { message: Message; open: boolean; onToggle: () => void }) => {
  if (message.status === "done") {
    if (message.steps.length === 0) return null;
    return (
      <Stack gap="xs" align="start">
        <Button variant="ghost" size="xs" aria-expanded={open} onClick={onToggle}>
          <Glyph name={open ? "chevron-down" : "chevron-right"} />작업 {message.steps.length}단계 · {message.seconds}초
        </Button>
        {open ? message.steps.map((step) => (
          <Inline key={step.id + step.label} gap="sm" align="center" paddingX="sm">
            <Glyph name="check" ink="tertiary" />
            <Text as="span" variant="caption" ink="secondary">{step.label}</Text>
          </Inline>
        )) : null}
      </Stack>
    );
  }
  return (
    <Stack gap="xs" aria-live="polite">
      {message.status === "waking" ? (
        <Inline gap="sm" align="center">
          <Spinner size="inline" label="모델을 깨우는 중" />
          <Text as="span" variant="caption" ink="secondary">모델을 깨우는 중입니다. 데스크탑 모델은 평소 꺼져 있어 첫 답이 오래 걸립니다.</Text>
        </Inline>
      ) : null}
      {message.steps.slice(0, message.shownSteps).map((step, index) => (
        <Inline key={step.id + step.label} gap="sm" align="center">
          {index === message.shownSteps - 1 && message.status === "thinking" ? <Spinner size="inline" label={step.label} /> : <Glyph name="check" ink="tertiary" />}
          <Text as="span" variant="caption" ink="secondary">{step.label}</Text>
        </Inline>
      ))}
      {message.status === "thinking" && message.shownSteps === 0 ? (
        <Inline gap="sm" align="center">
          <Spinner size="inline" label="생각하는 중" />
          <Text as="span" variant="caption" ink="secondary">생각하는 중</Text>
        </Inline>
      ) : null}
    </Stack>
  );
};

const Thread = ({ messages }: { messages: readonly Message[] }) => {
  const [open, setOpen] = useState<number[]>([]);
  return (
    <Stack as="ol" gap="xl" aria-label="대화">
      {messages.map((message) =>
        message.role === "user" ? (
          <Stack as="li" key={message.id} align="end">
            <Surface fill="sunken" radius="lg" paddingX="lg" paddingY="md" maxWidth="measure.sm">
              <Text>{message.text}</Text>
            </Surface>
          </Stack>
        ) : (
          <Stack as="li" key={message.id} gap="sm">
            <Steps message={message} open={open.includes(message.id)} onToggle={() => setOpen((now) => (now.includes(message.id) ? now.filter((id) => id !== message.id) : [...now, message.id]))} />
            {message.text ? (
              <Stack gap="xs" maxWidth="measure.md">
                {message.text.split("\n").map((line, index) => <Text key={index} as="p" ink={line.startsWith("·") ? "secondary" : "primary"}>{line}</Text>)}
              </Stack>
            ) : null}
          </Stack>
        ),
      )}
    </Stack>
  );
};

const Greeting = ({ name, onPick }: { name: string; onPick: (question: string) => void }) => (
  <Stack gap="lg" paddingY="xl">
    <Stack gap="xs">
      <Text as="p" variant="heading">{name}님, 무엇이 궁금하세요?</Text>
      <Text ink="secondary">시간표, 빈 교실, 학사일정, 시험을 학교 시스템에서 찾아 답합니다.</Text>
    </Stack>
    <Inline gap="sm" wrap>
      {SUGGESTIONS.map((question) => (
        <Button key={question} variant="hairline" size="sm" onClick={() => onPick(question)}>{question}</Button>
      ))}
    </Inline>
  </Stack>
);

export const Chat = ({ compact = false }: { compact?: boolean }) => {
  const { data, me, clock, events, major } = useClasses();
  const messages = useMessages();
  const busy = isBusy(messages);
  const [text, setText] = useState("");
  const [model, setModel] = useStored<Model>("classes:ask-model", "gemma");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages]);

  const ask = (question: string) => {
    if (!question.trim() || busy) return;
    send(question, { data, stuId: me.stuId, clockKey: clock.key, minute: clock.minute, events, major: major.major }, model);
    setText("");
  };

  return (
    <Stack gap="lg">
      {messages.length === 0 ? <Greeting name={me.name} onPick={ask} /> : <Thread messages={messages} />}
      <Surface ref={end} />
      <Stack gap="sm">
        <Textarea
          aria-label="Ask에게 묻기"
          rows={compact ? 2 : 3}
          placeholder="무엇이 궁금하세요? Enter로 보내고, Shift+Enter로 줄을 바꿉니다"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              ask(text);
            }
          }}
        />
        <Inline justify="between" align="center" gap="sm">
          <Box width="md">
            <Select size="sm" aria-label="모델" value={model} onChange={(event) => setModel(event.target.value as Model)}>
              {MODELS.map((item) => <Select.Option key={item.id} value={item.id}>{item.label}</Select.Option>)}
            </Select>
          </Box>
          <Inline gap="sm">
            {messages.length > 0 ? <Button variant="ghost" size="sm" disabled={busy} onClick={reset}><Glyph name="pencil" />새 대화</Button> : null}
            <IconButton variant="solid" aria-label="보내기" disabled={busy || !text.trim()} onClick={() => ask(text)}>{busy ? <Spinner size="inline" ink="inherit" decorative /> : <Glyph name="send" />}</IconButton>
          </Inline>
        </Inline>
      </Stack>
      <Notice tone="primary" glyph="lock">대화는 이 탭의 메모리에만 있고 새로고침하면 사라집니다. 답은 틀릴 수 있으니 중요한 일정은 공지를 한 번 더 확인하세요.</Notice>
    </Stack>
  );
};
