// The timetable of the person being planned, in a week grid. With nothing chosen it is the timetable they have; with a
// combination chosen (or the first one, while something is left to "자동") it is the timetable after it. A cell wears a
// colour only when it means something: moved, coming in, in the way. Pointing at a subject in the lists lights its cells.
//
// The card is sticky: the lists beside it are long, and the grid they change stays in the window next to them.

import { useMemo } from "react";

import { Badge, Button, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, useFace } from "../../../../kit";
import { slotKey, type Day } from "../../data/periods";
import type { SectionInfo } from "../../lib/trade";
import { koreanName, sectionNumber } from "../../lib/utils";
import { Heading, Hint, SlotGrid, type Slot } from "../../ui/parts";
import type { TradeModel } from "./model";

export const PreviewCard = ({ model }: { model: TradeModel }) => {
  const face = useFace();
  const { planned, highlight, chosen, preview, changed } = model;

  const bySlot = useMemo(() => {
    const map = new Map<string, SectionInfo[]>();
    for (const section of planned.sections) for (const slot of section.slots) map.set(slot, [...(map.get(slot) ?? []), section]);
    return map;
  }, [planned]);

  const cell = (day: Day, period: number): Slot | undefined => {
    const here = bySlot.get(slotKey(day, period));
    const first = here?.[0];
    if (!here || !first) return undefined;
    const subjects = here.map((section) => section.subject);
    const tone = subjects.some((subject) => planned.conflicting.has(subject)) ? "warning" : subjects.some((subject) => planned.moved.has(subject)) ? "info" : subjects.some((subject) => planned.entering.has(subject)) ? "success" : "plain";
    const lit = highlight !== null && subjects.includes(highlight);
    // Two subjects in one hour are named one under the other; one subject has its section under its name.
    const [one, two] = subjects.map((subject) => koreanName(subject));
    return { text: one, sub: two ?? `${sectionNumber(first.section)}분반`, tone: lit ? "strong" : tone };
  };

  const title = chosen ? "미리보기" : preview ? "자동 미리보기" : changed ? "반영한 시간표" : "지금 시간표";
  const legend = [
    { id: "moved", label: "이동", accent: "info", count: planned.moved.size },
    { id: "entering", label: "들어옴", accent: "success", count: planned.entering.size },
    { id: "conflicting", label: "충돌", accent: "warning", count: planned.conflicting.size },
  ] as const;

  return (
    <Surface as="section" {...face} radius="lg" padding="xl" elevation="sticky" top="lg" overflowY="auto" aria-label={title}>
      <Stack gap="lg">
        <Heading
          title={title}
          description={`${model.name} · ${planned.sections.length}과목 · ${model.credits.planned}학점`}
          actions={
            chosen ? (
              <Button variant="hairline" size="sm" onClick={() => model.pickPlan(null)}>
                <Glyph name="x" />
                미리보기 끄기
              </Button>
            ) : null
          }
        />
        <SlotGrid label={`${model.name}의 ${title}`} rowHeight="2.5rem" cell={cell} />
        {legend.some((item) => item.count > 0) ? (
          <Inline gap="sm" align="center" wrap>
            <Text as="span" variant="label" strong={false} ink="tertiary">표시</Text>
            {legend.filter((item) => item.count > 0).map((item) => (
              <Badge key={item.id} variant="soft" accent={item.accent} size="sm">{item.label} {item.count}</Badge>
            ))}
          </Inline>
        ) : null}
        <Hint>
          {chosen
            ? "고른 조합을 적용한 모습입니다. 실제 신청은 학교 시스템에서 직접 해야 합니다."
            : preview
              ? "자동으로 맡긴 항목을 가능한 조합의 첫 번째로 놓아 본 모습입니다. 아래 조합을 눌러 다른 모습을 볼 수 있습니다."
              : changed
                ? "지정한 드랍·이동·추가를 바로 반영한 모습입니다. 겹치는 칸은 충돌로 표시합니다."
                : "지금 시간표입니다. 드랍·이동·추가를 정하면 바로 반영됩니다. 목록에서 과목을 가리키면 그 과목의 칸이 짙어집니다."}
        </Hint>
      </Stack>
    </Surface>
  );
};
