import { useEffect, useState } from "react";

import { IconButton, Inline, Spinner, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, Segmented } from "../../../../kit";
import { mealFor, slotAt, SLOT_LABEL, SLOT_TIME, type MealSlot } from "../../data/meals";
import { addDays, fromKey, toKey } from "../../lib/calendar";
import { weekdayOf } from "../../lib/utils";

const SLOTS = (Object.keys(SLOT_LABEL) as MealSlot[]).map((id) => ({ id, label: SLOT_LABEL[id] }));
const REACH = 31;

export const MealPanel = ({ today, minute }: { today: string; minute: number }) => {
  const [offset, setOffset] = useState(0);
  const [slot, setSlot] = useState<MealSlot>(slotAt(minute) ?? "dinner");
  const [loading, setLoading] = useState(true);
  const key = toKey(addDays(fromKey(today), offset));
  const [, month, day] = key.split("-").map(Number) as [number, number, number];

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, [key]);

  const posted = offset <= 14;
  const dishes = posted ? mealFor(key)[slot] : [];

  return (
    <Stack gap="md" height="full">
      <Inline justify="between" align="center" gap="sm">
        <Stack gap="xs">
          <Text as="h2" variant="subheading">급식</Text>
          <Text as="span" variant="caption" ink="tertiary">{month}월 {day}일 {weekdayOf(key)}요일{offset === 0 ? " · 오늘" : ""}</Text>
        </Stack>
        <Inline gap="xs">
          <IconButton variant="ghost" size="xs" aria-label="전날" disabled={offset <= -REACH} onClick={() => setOffset((value) => value - 1)}><Glyph name="chevron-left" /></IconButton>
          <IconButton variant="ghost" size="xs" aria-label="다음 날" disabled={offset >= REACH} onClick={() => setOffset((value) => value + 1)}><Glyph name="chevron-right" /></IconButton>
        </Inline>
      </Inline>
      <Segmented label="끼니" options={SLOTS} value={slot} onChange={(id) => setSlot(id as MealSlot)} size="xs" stretch />
      <Stack gap="xs" aria-live="polite">
        {loading ? (
          <Inline gap="sm" align="center" paddingY="md">
            <Spinner size="sm" label="급식을 불러오는 중" />
            <Text as="span" ink="tertiary">불러오는 중</Text>
          </Inline>
        ) : !posted ? (
          <Text ink="tertiary">아직 급식이 올라오지 않았습니다.</Text>
        ) : (
          <>
            {dishes.map((dish, index) => <Text key={`${dish}-${index}`} as="span">{dish}</Text>)}
            <Text as="span" variant="caption" ink="tertiary">{SLOT_LABEL[slot]} {SLOT_TIME[slot]}</Text>
          </>
        )}
      </Stack>
    </Stack>
  );
};
