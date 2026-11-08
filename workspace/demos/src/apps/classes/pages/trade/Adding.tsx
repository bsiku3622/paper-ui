import type { ReactNode } from "react";

import { Button, Field, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../../kit";
import { koreanName } from "../../lib/utils";
import { Card, Eyebrow } from "../../ui/parts";
import type { TradeModel } from "./model";

export const AddCard = ({ model }: { model: TradeModel }) => {
  const picked = new Set(model.state.addSelections.map((add) => add.subject));
  const chip = (subject: string, note: ReactNode) => (
    <Button key={subject} size="sm" variant="hairline" selected={picked.has(subject)} onClick={() => model.toggleAdd(subject)}>
      {picked.has(subject) ? <Glyph name="check" /> : null}
      {koreanName(subject)}
      <Text as="span" variant="caption" ink="tertiary" numeric>{note}</Text>
    </Button>
  );
  const query = model.addQuery.trim();

  return (
    <Card title="과목 추가" description="더 듣고 싶은 과목을 찾아 담습니다. 이미 듣는 과목은 나오지 않습니다. 담은 과목은 내 과목 맨 위에서 분반을 고릅니다.">
      {model.addable.length > 0 ? (
        <Stack gap="sm">
          <Eyebrow>드랍으로 비는 시간에 들어갈 수 있는 과목</Eyebrow>
          <Inline gap="xs" wrap>
            {model.addable.map(({ subject, sections }) => chip(subject, `${sections.length}개 분반`))}
          </Inline>
        </Stack>
      ) : null}
      <Stack gap="sm">
        <Field
          aria-label="추가할 과목 찾기"
          placeholder="과목 이름 (예: 정3, 자료구조)"
          leading={<Glyph name="search" />}
          value={model.addQuery}
          clearable
          onChange={(event) => model.setAddQuery(event.target.value)}
          onKeyDown={(event) => {
            const first = model.addMatches[0];
            if (event.key === "Enter" && !event.nativeEvent.isComposing && first && !picked.has(first.subject)) model.toggleAdd(first.subject);
          }}
        />
        {model.addMatches.length > 0 ? (
          <Inline gap="xs" wrap>
            {model.addMatches.map((subject) => {
              const summary = model.summaries.get(subject.subject);
              return chip(subject.subject, summary ? (summary.free > 0 ? `바로 가능 ${summary.free}/${summary.total}` : "지금은 겹침") : "");
            })}
          </Inline>
        ) : query ? (
          <Text ink="tertiary">찾는 과목이 없습니다. 이미 듣고 있는 과목이거나 이번 학기에 열리지 않은 과목일 수 있습니다.</Text>
        ) : null}
      </Stack>
    </Card>
  );
};
