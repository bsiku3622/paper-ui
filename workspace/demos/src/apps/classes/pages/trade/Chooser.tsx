import { Badge, Button, Field, Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, Person, Stat, StatRow } from "../../../../kit";
import { gradeOf } from "../../lib/calendar";
import { useClasses } from "../../state";
import { Card } from "../../ui/parts";
import type { TradeModel } from "./model";

const signed = (value: number) => `${value > 0 ? "+" : "−"}${Math.abs(value)}`;

export const ChooserCard = ({ model }: { model: TradeModel }) => {
  const { clock, me } = useClasses();
  const grade = gradeOf(model.stuId, new Date(`${clock.key}T00:00:00`));
  const { credits, marks, planned, schedule } = model;
  const query = model.whoQuery.trim();

  return (
    <Card
      title="계획 대상"
      description="내 시간표로 시작합니다. 친구의 학번이나 이름을 찾으면 그 친구의 계획을 대신 짜 볼 수 있습니다."
      actions={
        <Button variant="hairline" size="sm" onClick={model.reset}>
          <Glyph name="rotate-ccw" />
          초기화
        </Button>
      }
    >
      <Grid columns={{ base: 1, xl: "minmax(0, 5fr) minmax(0, 6fr)" }} gap="xl" align="start">
        <Stack gap="md" minWidth={0}>
          <Inline justify="between" align="center" gap="md" wrap>
            <Person name={model.name} sub={`${model.stuId}${grade ? ` · ${grade}학년` : ""}`} size="md" />
            {model.isMe ? (
              <Badge size="sm" variant="soft">내 계정</Badge>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => model.chooseStudent(me.stuId)}>
                <Glyph name="user" />
                내 시간표로
              </Button>
            )}
          </Inline>
          <Field
            aria-label="학번이나 이름으로 학생 찾기"
            placeholder="친구 계획 봐 주기 — 학번이나 이름"
            leading={<Glyph name="user-search" />}
            value={model.whoQuery}
            clearable
            onChange={(event) => model.setWhoQuery(event.target.value)}
            onKeyDown={(event) => {
              const first = model.matches[0];
              if (event.key === "Enter" && !event.nativeEvent.isComposing && first) model.chooseStudent(first.stuId);
            }}
          />
          {model.matches.length > 0 ? (
            <Inline gap="xs" wrap>
              {model.matches.map((student) => (
                <Button key={student.stuId} size="xs" variant="muted" selected={student.stuId === model.stuId} aria-label={`${student.name} ${student.stuId}의 계획 짜기`} onClick={() => model.chooseStudent(student.stuId)}>
                  <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{student.stuId}</Text>
                  {student.name}
                </Button>
              ))}
            </Inline>
          ) : query ? (
            <Text variant="caption" ink="tertiary">찾는 학생이 없습니다. 이름의 일부나 초성, 학번(25-301)으로 찾아 보세요.</Text>
          ) : null}
        </Stack>

        <StatRow min="10rem">
          <Stat small label="수강 과목" value={schedule.length} unit="개" note={planned.sections.length !== schedule.length ? `계획대로면 ${planned.sections.length}개` : "그대로"} />
          <Stat
            small
            label="학점"
            value={credits.delta !== 0 ? `${credits.now} → ${credits.planned}` : credits.now}
            unit={credits.delta !== 0 ? undefined : "학점"}
            note={[credits.delta !== 0 ? `${signed(credits.delta)}학점` : "", credits.unknown.length > 0 ? `학점을 모르는 ${credits.unknown.length}과목은 뺐습니다` : ""].filter(Boolean).join(" · ") || undefined}
          />
          <Stat small label="바꾸는 중" value={marks.move + marks.drop + marks.add} unit="과목" note={`이동 ${marks.move} · 드랍 ${marks.drop} · 추가 ${marks.add}`} />
        </StatRow>
      </Grid>
    </Card>
  );
};
