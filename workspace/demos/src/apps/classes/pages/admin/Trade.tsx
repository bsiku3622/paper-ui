// 수강 정정 — whether the course-change search is open, until when, and for which term. This is the app's shared setting, not
// a copy: the sidebar's 수강 정정 item and the banner on the home page read the same value, so flipping the switch here changes
// them at once. A deadline that has already passed is refused; to close now, turn the switch off.

import { useState, type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Badge, Button, Field, Grid, Inline, Select, Stack, Surface, Switch, Text } from "@studio-baeks/paper-ui";

import { Glyph, useToast } from "../../../../kit";
import { TERMS, termLabel } from "../../data/build";
import { weekdayOf } from "../../lib/utils";
import { path, useClasses } from "../../state";
import { Card } from "../../ui/parts";

const Setting = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <Surface as="li" border="top" paddingY="lg">
    <Grid columns={{ base: 1, md: "minmax(0, 1fr) minmax(0, 18rem)" }} gap="md" align="center">
      <Stack gap="xs" minWidth={0}>
        <Text strong>{title}</Text>
        <Text variant="caption" ink="tertiary">{description}</Text>
      </Stack>
      {children}
    </Grid>
  </Surface>
);

export const TradePanel = () => {
  const { tradeConfig, setTradeConfig, tradeOpen, term, clock } = useClasses();
  const toast = useToast();
  const [deadline, setDeadline] = useState(tradeConfig.deadline);

  const past = deadline !== "" && deadline < clock.key;
  const sameTerm = termLabel(term) === tradeConfig.term;
  const reason = !tradeConfig.enabled
    ? "스위치가 꺼져 있습니다."
    : !sameTerm
      ? `지금 보고 있는 학기(${termLabel(term)})가 정해 둔 학기(${tradeConfig.term})와 달라 메뉴가 보이지 않습니다.`
      : `${tradeConfig.deadline}(${weekdayOf(tradeConfig.deadline)})까지 열려 있습니다.`;

  return (
    <Card
      title="수강 정정 탐색"
      description="수강 정정을 앞두고 트레이드 조합을 찾는 화면을 언제까지 열어 둘지 정합니다. 사이드바의 ‘수강 정정’ 메뉴와 홈의 안내 배너가 전부 이 설정 하나를 따릅니다."
      padding="lg"
    >
      <Inline gap="sm" align="center" wrap>
        <Badge variant="soft" size="md" accent={tradeOpen ? "success" : "primary"}>{tradeOpen ? "열림" : "닫힘"}</Badge>
        <Text ink="secondary">{reason}</Text>
      </Inline>

      <Stack as="ul" aria-label="수강 정정 설정">
        <Setting title="수강 정정 탐색" description="기간과 상관없이 지금 닫고 싶을 때 끕니다.">
          <Inline as="label" gap="sm" align="center">
            <Switch
              checked={tradeConfig.enabled}
              onChange={(event) => {
                setTradeConfig({ ...tradeConfig, enabled: event.target.checked });
                toast(event.target.checked ? "수강 정정 탐색을 켰습니다" : "수강 정정 탐색을 껐습니다");
              }}
            />
            <Text as="span">{tradeConfig.enabled ? "켜짐" : "꺼짐"}</Text>
          </Inline>
        </Setting>
        <Setting title="마감일" description="이 날이 끝나면 닫힙니다. 마감하는 날은 하루 종일 열려 있습니다.">
          <Stack gap="xs">
            <Field
              type="date"
              aria-label="마감일"
              value={deadline}
              status={past ? "error" : undefined}
              onChange={(event) => {
                const next = event.target.value;
                setDeadline(next);
                if (next && next >= clock.key) {
                  setTradeConfig({ ...tradeConfig, deadline: next });
                  toast("마감일을 바꿨습니다");
                }
              }}
            />
            {past ? <Text variant="caption" ink="error">오늘({clock.key}) 이후의 날짜를 골라 주세요. 지금 닫으려면 스위치를 끄세요.</Text> : null}
          </Stack>
        </Setting>
        <Setting title="학기" description="이 학기를 보고 있는 사람에게만 메뉴가 뜹니다.">
          <Select
            aria-label="수강 정정 학기"
            value={tradeConfig.term}
            onChange={(event) => {
              setTradeConfig({ ...tradeConfig, term: event.target.value });
              toast(`수강 정정 학기를 ${event.target.value}로 바꿨습니다`);
            }}
          >
            {TERMS.map((item) => <Select.Option key={termLabel(item)} value={termLabel(item)}>{`${termLabel(item)}학기`}</Select.Option>)}
          </Select>
        </Setting>
      </Stack>

      <Inline justify="between" align="center" gap="md" wrap>
        <Text variant="caption" ink="tertiary">
          지금 사이드바에 ‘수강 정정’ 메뉴가 <Text as="span" variant="caption" strong ink="secondary">{tradeOpen ? "보입니다" : "보이지 않습니다"}</Text>.
        </Text>
        <Button as={RouterLink} to={path("/trade")} variant="hairline" size="sm"><Glyph name="arrow-left-right" />수강 정정 화면 열기</Button>
      </Inline>
    </Card>
  );
};
