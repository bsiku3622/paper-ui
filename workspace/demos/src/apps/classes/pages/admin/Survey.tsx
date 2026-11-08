// 전공 조사 — how many students answered the question about their major, and how many chose each track. Counts only: who chose
// what is not sent to this screen at all. The demo account's own answer is added live from the app's state, so changing the
// major on the settings page moves a bar here.

import { Button, Grid, Stack } from "@studio-baeks/paper-ui";

import { Glyph, Meter, Stat, StatRow, useToast } from "../../../../kit";
import { SURVEY_BASE } from "../../data/admin";
import { DIVISIONS } from "../../data/majors";
import { useClasses } from "../../state";
import { Card, Eyebrow, Hint } from "../../ui/parts";
import { useBriefly } from "./parts";

export const SurveyPanel = () => {
  const { major } = useClasses();
  const toast = useToast();
  const [busy, refresh] = useBriefly();

  const counts: Record<string, number> = { ...SURVEY_BASE };
  const mine = !major.answered ? "아직 답 안 함" : (major.major ?? "미정");
  counts[mine] = (counts[mine] ?? 0) + 1;
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const silent = counts["아직 답 안 함"] ?? 0;
  const undecided = counts["미정"] ?? 0;
  const answered = total - silent;
  const top = Math.max(1, ...Object.values(counts));
  const bar = (name: string) => <Meter key={name} label={name} value={(counts[name] ?? 0) / top} valueText={`${counts[name] ?? 0}명`} />;

  return (
    <Card
      title="전공 조사 현황"
      description={`학번을 확인한 계정 ${total}명 기준입니다. 누가 무엇을 골랐는지는 보이지 않고 트랙별 인원만 셉니다. 시연 계정은 세지 않습니다.`}
      padding="lg"
      actions={
        <Button variant="ghost" size="sm" loading={busy} onClick={() => refresh(() => toast("조사 현황을 새로 받았습니다"))}>
          <Glyph name="refresh-cw" />새로 받기
        </Button>
      }
    >
      <StatRow>
        <Stat small label="응답률" value={Math.round((answered / total) * 100)} unit="%" note={`${total}명 중 ${answered}명`} />
        <Stat small label="정한 사람" value={answered - undecided} unit="명" />
        <Stat small label="미정" value={undecided} unit="명" note="아직 정하지 않았다고 답함" />
        <Stat small label="답 안 함" value={silent} unit="명" note="질문을 미룬 사람" />
      </StatRow>
      <Grid columns={{ base: 1, md: 2, xl: 4 }} gap="xl" align="start">
        {DIVISIONS.map((division) => (
          <Stack key={division.name} gap="md">
            <Eyebrow>{division.name}</Eyebrow>
            {division.tracks.map(bar)}
          </Stack>
        ))}
        <Stack gap="md">
          <Eyebrow>그 밖</Eyebrow>
          {bar("미정")}
          {bar("아직 답 안 함")}
        </Stack>
      </Grid>
      <Hint>전공은 1·2학년 때 학교가 묻고 3학년 2학기까지 바꿀 수 있어서, 숫자는 학생이 직접 고쳐 쓰는 대로 움직입니다.</Hint>
    </Card>
  );
};
