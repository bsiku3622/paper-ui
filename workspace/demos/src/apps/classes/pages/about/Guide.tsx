// 사용 안내: how each part of the app is used, one section open at a time. The examples use this demo's own people and
// rooms, not the school's.

import { useState, type ReactNode } from "react";

import { Grid, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { type GlyphName } from "../../../../kit";
import { Card, Eyebrow } from "../../ui/parts";
import { Collapse } from "../../ui/Collapse";

const Code = ({ children }: { children: ReactNode }) => (
  <Surface as="span" fill="sunken" radius="sm" paddingX="sm">
    <Text as="span" family="mono" variant="caption" strong>{children}</Text>
  </Surface>
);

const Item = ({ code, children }: { code: ReactNode; children: ReactNode }) => (
  <Grid columns={{ base: 1, sm: "minmax(0, 12rem) minmax(0, 1fr)" }} gap="sm" align="start">
    <Inline>{code}</Inline>
    <Text ink="secondary">{children}</Text>
  </Grid>
);

const Example = ({ children }: { children: ReactNode }) => (
  <Surface fill="sunken" radius="md" padding="md">
    <Stack gap="xs">
      <Eyebrow>예시</Eyebrow>
      {children}
    </Stack>
  </Surface>
);

const SECTIONS: { title: string; glyph: GlyphName; body: ReactNode }[] = [
  {
    title: "검색 — 기본",
    glyph: "search",
    body: (
      <>
        <Text ink="secondary">검색창에 말을 넣으면 과목, 학생, 교사, 강의실, 시간을 한꺼번에 찾습니다. 줄여 쓴 말과 초성도 알아듣습니다.</Text>
        <Stack gap="sm">
          <Item code={<Code>이름</Code>}>학생이나 교사의 이름의 일부</Item>
          <Item code={<Code>학번</Code>}>학번 (예: 25-307)</Item>
          <Item code={<Code>과목명</Code>}>과목 이름의 일부 (한글과 영문 모두)</Item>
          <Item code={<Code>형3407</Code>}>강의실 이름</Item>
          <Item code={<Code>월1</Code>}>요일과 교시 — 그 시간의 수업</Item>
          <Item code={<Code>ㅈㅂㄱㅎ3</Code>}>초성만 입력해도 됩니다 (정보과학3)</Item>
          <Item code={<Code>정3</Code>}>줄여 써도 찾습니다 (정3 → 정보과학3, 일물실1 → 일반물리학실험1)</Item>
          <Item code={<Code>체육4/2,3</Code>}>과목/분반 — 그 분반만. 여럿은 쉼표로 이어 씁니다</Item>
        </Stack>
      </>
    ),
  },
  {
    title: "검색 — 대상 고르기",
    glyph: "zap",
    body: (
      <>
        <Text ink="secondary">앞에 종류를 붙이면 그 종류만 찾고, 시간표로 바로 보여 줍니다.</Text>
        <Stack gap="sm">
          <Item code={<Code>student:학번</Code>}>한 학생의 전체 시간표와 수강 과목 (s: st: 로 줄임)</Item>
          <Item code={<Code>teacher:이름</Code>}>한 교사의 담당 수업 (t: te:)</Item>
          <Item code={<Code>room:강의실</Code>}>한 강의실에서 열리는 수업 (r: ro:)</Item>
        </Stack>
        <Example>
          <Text variant="caption" ink="secondary"><Code>student:25-307</Code> — 한지우의 시간표</Text>
          <Text variant="caption" ink="secondary"><Code>room:형3407</Code> — 형설관 3407호에서 열리는 수업</Text>
        </Example>
      </>
    ),
  },
  {
    title: "검색 — 논리식",
    glyph: "list",
    body: (
      <>
        <Text ink="secondary">여러 조건을 묶어 묻습니다. 괄호가 들어간 이름은 링크가 알아서 풀어 줍니다.</Text>
        <Stack gap="sm">
          <Item code={<Code>a &amp; b</Code>}>그리고 — 둘 다 맞는 수업</Item>
          <Item code={<Code>a + b</Code>}>또는 — 하나라도 맞는 수업</Item>
          <Item code={<Code>!a</Code>}>아닌 것</Item>
          <Item code={<Code>( … )</Code>}>묶음 — 먼저 계산할 것</Item>
        </Stack>
        <Example>
          <Text variant="caption" ink="secondary"><Code>student:25-307 &amp; student:25-310</Code> — 두 학생이 함께 듣는 수업, 시간이 겹치는 곳은 경고로 알려 줍니다</Text>
          <Text variant="caption" ink="secondary"><Code>자료구조 + 알고리즘</Code> — 둘 중 하나라도 있는 수업</Text>
        </Example>
      </>
    ),
  },
  {
    title: "탐색 — 학생, 교사, 교육과정, 친구",
    glyph: "library",
    body: (
      <>
        <Text ink="secondary">탐색에서는 전교생과 교사를 훑어 보고, 과목들이 어떻게 이어지는지 그래프로 봅니다.</Text>
        <Stack gap="sm">
          <Item code={<Code>학생</Code>}>이름과 학번으로 찾고, 학번(학년)별로 거릅니다. 줄을 누르면 그 학생의 시간표를 찾습니다</Item>
          <Item code={<Code>교사</Code>}>이름으로 찾고, 줄을 누르면 그 교사의 수업을 찾습니다</Item>
          <Item code={<Code>교육과정</Code>}>학과별 선수 관계 그래프. 과목을 누르면 이어진 과목만 남습니다</Item>
          <Item code={<Code>친구</Code>}>친구를 추가하면 지금 누가 공강인지, 언제 함께 비는지 보여 줍니다</Item>
        </Stack>
        <Example>
          <Text variant="caption" ink="secondary"><Code>periods:25</Code> — 주 25교시를 듣는 학생만</Text>
          <Text variant="caption" ink="secondary"><Code>subcount:8</Code> — 8과목을 듣는 학생만</Text>
        </Example>
      </>
    ),
  },
  {
    title: "빈 강의실",
    glyph: "map",
    body: (
      <>
        <Text ink="secondary">비어 있어야 하는 시간을 고르면 그때 모두 비는 교실이 층별 지도에 나타납니다.</Text>
        <Stack gap="sm">
          <Item code={<Code>시간 고르기</Code>}>요일과 교시 칸을 누릅니다. 여러 칸을 골라도 됩니다</Item>
          <Item code={<Code>교실 누르기</Code>}>시간을 고르지 않고 교실을 누르면 그 교실의 한 주가 나옵니다</Item>
          <Item code={<Code>흐린 칸</Code>}>그 시간에 쓰이고 있거나 교실이 아닌 방입니다</Item>
        </Stack>
      </>
    ),
  },
  {
    title: "자몽과 수강 정정",
    glyph: "graduation-cap",
    body: (
      <>
        <Text ink="secondary">자몽은 졸업 요건을 채워 가는 기록장이고, 수강 정정은 시간표를 바꿀 수 있는 조합을 찾는 도구입니다.</Text>
        <Stack gap="sm">
          <Item code={<Code>학기 고르기</Code>}>과목 카드에서 학기를 고르면 들은 것으로 적힙니다. 비우면 기록이 사라집니다</Item>
          <Item code={<Code>이동 · 드랍 · 추가</Code>}>수강 정정에서 과목마다 정하면, 시간이 겹치지 않는 조합을 찾아 줍니다</Item>
        </Stack>
      </>
    ),
  },
];

export const Guide = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Card title="사용 안내" description="각 기능의 쓰는 법입니다.">
      <Stack gap="xs">
        {SECTIONS.map((section, index) => (
          <Collapse key={section.title} title={section.title} glyph={section.glyph} open={open === index} onToggle={() => setOpen(open === index ? null : index)}>
            {section.body}
          </Collapse>
        ))}
      </Stack>
    </Card>
  );
};
