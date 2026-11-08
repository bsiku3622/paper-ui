import { useState } from "react";

import { Badge, Button, Grid, Inline, Pressable, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph } from "../../../../kit";
import { applyPlan, MAX_PLAN_RESULTS, totalCredits, type PlanChoice, type PlanResult } from "../../lib/trade";
import { formatTimes, koreanName, sectionNumber } from "../../lib/utils";
import { Card, Hint } from "../../ui/parts";
import type { TradeModel } from "./model";

const STEP = 8;

const Change = ({ choice }: { choice: PlanChoice }) => (
  <Inline as="span" gap="sm" align="baseline" wrap>
    {!choice.from ? <Text as="span" ink="secondary">+</Text> : null}
    <Text as="span" strong>{koreanName(choice.subject)}</Text>
    <Text as="span" variant="caption" ink="secondary">
      {choice.from && choice.to ? `${sectionNumber(choice.from.section)}분반 → ${sectionNumber(choice.to.section)}분반 · ${formatTimes(choice.to.times)}` : null}
      {choice.from && !choice.to ? "드랍" : null}
      {!choice.from && choice.to ? `${sectionNumber(choice.to.section)}분반 · ${formatTimes(choice.to.times)}` : null}
    </Text>
  </Inline>
);

const PlanFace = ({ model, plan, number }: { model: TradeModel; plan: PlanResult; number: number }) => {
  const active = model.preview?.key === plan.key;
  const picked = model.chosen?.key === plan.key;
  const credits = totalCredits(applyPlan(model.schedule, plan));
  const diff = credits - model.credits.now;
  return (
    <Surface
      as={Pressable}
      fill="sunken"
      radius="md"
      padding="md"
      width="full"
      height="full"
      hoverable
      selected={active}
      aria-pressed={picked}
      aria-label={`조합 ${number}, ${plan.choices.map((choice) => koreanName(choice.subject)).join(", ")} 바꾸기. 시간표에 미리 보기`}
      onPress={() => model.pickPlan(picked ? null : plan.key)}
    >
      <Stack as="span" gap="sm" align="stretch">
        <Inline as="span" justify="between" align="center" gap="sm" wrap>
          <Inline as="span" gap="sm" align="baseline">
            <Text as="span" strong>조합 {number}</Text>
            <Text as="span" variant="caption" ink="tertiary" numeric>{credits}학점{diff !== 0 ? ` (${diff > 0 ? "+" : "−"}${Math.abs(diff)})` : ""}</Text>
          </Inline>
          <Inline as="span" gap="xs">
            {plan.moveCount > 0 ? <Badge size="xs" variant="soft">이동 {plan.moveCount}</Badge> : null}
            {plan.dropCount > 0 ? <Badge size="xs" variant="soft">드랍 {plan.dropCount}</Badge> : null}
            {plan.addCount > 0 ? <Badge size="xs" variant="soft">추가 {plan.addCount}</Badge> : null}
          </Inline>
        </Inline>
        <Stack as="span" gap="xs" align="start">
          {plan.choices.map((choice) => (
            <Change key={choice.subject} choice={choice} />
          ))}
        </Stack>
        <Inline as="span" gap="xs" align="center">
          {active ? <Glyph name="check" ink="tertiary" /> : null}
          <Text as="span" variant="label" strong={false} ink="tertiary">{active ? (picked ? "미리보는 중" : "자동 미리보기 중") : "눌러서 미리보기"}</Text>
        </Inline>
      </Stack>
    </Surface>
  );
};

export const PlansCard = ({ model }: { model: TradeModel }) => {
  const { search } = model;
  const [shown, setShown] = useState(STEP);
  const activeIndex = model.preview ? search.results.findIndex((plan) => plan.key === model.preview?.key) : -1;
  const visible = search.results.slice(0, Math.max(shown, activeIndex + 1));
  const rest = search.results.length - visible.length;

  const description =
    search.results.length > 0
      ? `${search.results.length}${search.truncated ? "개 이상" : "개"} · 바꾸는 것이 적은 순서입니다. 눌러서 시간표에 미리 봅니다.`
      : "표시한 이동·드랍·추가에서 시간이 겹치지 않는 조합을 모두 찾습니다.";

  return (
    <Card title="가능한 조합" description={description}>
      {search.variables === 0 ? (
        <Empty
          glyph="arrow-left-right"
          title="바꿀 과목을 골라 주세요"
          description="내 과목에서 이동이나 드랍을 고르거나 과목을 더하면 시간이 겹치지 않는 조합을 찾습니다."
          action={
            model.suggestions.length > 0 ? (
              <Button variant="hairline" size="sm" onClick={model.suggest}>
                예시로 채우기
              </Button>
            ) : undefined
          }
        />
      ) : search.results.length === 0 ? (
        <Empty
          glyph="triangle-alert"
          title="가능한 조합이 없습니다"
          description="표시한 항목끼리, 또는 지키는 과목과 시간이 겹칩니다. 다른 과목도 이동이나 드랍으로 바꾸거나 분반을 ‘자동’으로 두면 탐색 범위가 넓어집니다."
          action={
            model.reasons.length > 0 ? (
              <Stack as="ul" gap="xs" align="center">
                {model.reasons.map((reason) => (
                  <Text as="li" key={reason} variant="caption" ink="warning">{reason}</Text>
                ))}
              </Stack>
            ) : undefined
          }
        />
      ) : (
        <Stack gap="md">
          <Grid as="ul" columns={{ base: 1, md: 2 }} gap="sm">
            {visible.map((plan, index) => (
              <Stack as="li" key={plan.key} align="stretch">
                <PlanFace model={model} plan={plan} number={index + 1} />
              </Stack>
            ))}
          </Grid>
          {rest > 0 ? (
            <Inline justify="center">
              <Button variant="ghost" size="sm" onClick={() => setShown((now) => now + STEP)}>
                <Glyph name="plus" />
                조합 더 보기 ({rest})
              </Button>
            </Inline>
          ) : null}
          {search.truncated ? <Hint>{MAX_PLAN_RESULTS}개까지만 찾았습니다. 더 있습니다. 이동할 분반을 직접 고르거나 바꿀 과목을 줄이면 좁혀집니다.</Hint> : null}
        </Stack>
      )}
    </Card>
  );
};
