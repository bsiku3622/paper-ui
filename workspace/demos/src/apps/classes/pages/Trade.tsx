import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { Badge, Button, Grid, Stack, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, PageHeader } from "../../../kit";
import { termLabel, TERMS } from "../data/build";
import { dateLabel } from "../lib/utils";
import { hasRole, path, useClasses } from "../state";
import { Card } from "../ui/parts";
import { AddCard } from "./trade/Adding";
import { ChooserCard } from "./trade/Chooser";
import { useTradeModel } from "./trade/model";
import { PartnersCard } from "./trade/Partners";
import { PlansCard } from "./trade/Plans";
import { PreviewCard } from "./trade/Preview";
import { SubjectsCard } from "./trade/Subjects";

const daysUntil = (from: string, to: string) => Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86_400_000);
const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const Closed = ({ pretend }: { pretend: "term" | "off" | null }) => {
  const { term, tradeConfig, session } = useClasses();
  const until = isDate(tradeConfig.deadline) ? dateLabel(tradeConfig.deadline) : tradeConfig.deadline;
  const off = pretend ? pretend === "off" : !tradeConfig.enabled;
  const viewing = pretend === "term" ? termLabel(TERMS.find((item) => termLabel(item) !== tradeConfig.term) ?? term) : termLabel(term);
  return (
    <>
      <PageHeader eyebrow={`${viewing}학기`} title="수강 정정" description="시간표가 겹치지 않게 분반을 옮기고, 드랍하고, 과목을 더하는 조합을 찾는 도구입니다." />
      <Card label="수강 정정 기간 안내">
        <Empty
          glyph="calendar-clock"
          title="지금은 수강 정정 기간이 아닙니다"
          description={`수강 정정은 ${tradeConfig.term}학기에 ${until}까지 열립니다.`}
          action={
            <Stack align="center" gap="md">
              <Text ink="tertiary">
                {off
                  ? "지금은 관리자가 정정 기간을 닫아 두었습니다. 열리면 사이드바에 ‘수강 정정’이 나타납니다."
                  : `지금은 ${viewing}학기를 보고 있습니다. 위쪽 학기 전환에서 ${tradeConfig.term}학기를 고르면 열립니다.`}
              </Text>
              {hasRole(session.role, "admin") ? (
                <Button as={RouterLink} to={path("/admin")} variant="hairline" size="sm">
                  <Glyph name="shield-check" />
                  관리에서 기간 바꾸기
                </Button>
              ) : (
                <Text variant="caption" ink="tertiary">기간을 바꿔야 한다면 관리자에게 요청해 주세요.</Text>
              )}
            </Stack>
          }
        />
      </Card>
    </>
  );
};

const Workspace = () => {
  const { term, tradeConfig, clock } = useClasses();
  const model = useTradeModel();
  const left = isDate(tradeConfig.deadline) ? daysUntil(clock.key, tradeConfig.deadline) : null;

  return (
    <>
      <PageHeader
        eyebrow={`${termLabel(term)}학기 · 정정 기간`}
        title="수강 정정"
        description="분반 이동, 드랍, 추가신청을 시간이 겹치지 않는 조합으로 찾습니다. 정원은 알 수 없어 시간 충돌만 따지고, 실제 신청은 학교 시스템에서 직접 해야 합니다."
        meta={
          <>
            <Text as="span" ink="secondary">{isDate(tradeConfig.deadline) ? `${dateLabel(tradeConfig.deadline)}까지` : tradeConfig.deadline}</Text>
            {left !== null ? (
              left >= 0 ? <Badge size="sm" variant="soft" accent="info">{left === 0 ? "오늘 마감" : `${left}일 남음`}</Badge> : <Badge size="sm" variant="soft" accent="warning">마감이 지났습니다</Badge>
            ) : null}
          </>
        }
      />

      <ChooserCard model={model} />

      <Grid columns={{ base: 1, xl: "minmax(0, 5fr) minmax(0, 6fr)" }} gap="xl" align="start">
        <PreviewCard model={model} />
        <Stack gap="xl" minWidth={0}>
          <SubjectsCard model={model} />
          <AddCard model={model} />
          <PlansCard model={model} />
          <PartnersCard model={model} />
        </Stack>
      </Grid>
    </>
  );
};

export const TradePage = () => {
  const { tradeOpen } = useClasses();
  const [params] = useSearchParams();
  const demo = params.get("demo");
  const pretend = demo === "closed" ? "term" : demo === "off" ? "off" : null;
  return tradeOpen && !pretend ? <Workspace /> : <Closed pretend={pretend} />;
};
