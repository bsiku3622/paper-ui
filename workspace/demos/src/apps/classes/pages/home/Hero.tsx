import { useMemo, useState } from "react";

import { Badge, Button, IconButton, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, Meter } from "../../../../kit";
import { hhmm } from "../../data/periods";
import { dayBlocks, type HomeData, type HomeView } from "../../lib/home";
import { dateLabel, duration, koreanName, periodRuns, sectionNumber } from "../../lib/utils";
import { Eyebrow, PlanMark } from "../../ui/parts";

const daysBetween = (from: string, to: string) => Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86_400_000);

export const Hero = ({ home, view, quip, planned = false }: { home: HomeData; view: HomeView; quip: string | null; planned?: boolean }) => {
  const { periods, minute, today } = home;
  const { current, currentPeriods, next, periodLabel, breakKind } = view;
  const blocks = useMemo(() => dayBlocks(home), [home]);
  const [browseIndex, setBrowseIndex] = useState<number | null>(null);

  const startOf = (period: number | undefined) => periods.find((item) => item.period === period);
  const blockStart = currentPeriods.length > 0 ? startOf(currentPeriods[0]) : undefined;
  const blockEnd = currentPeriods.length > 0 ? startOf(currentPeriods[currentPeriods.length - 1]) : undefined;
  const nextStart = next ? startOf(next.period)?.start ?? null : null;
  const untilNext = nextStart !== null ? nextStart - minute : null;

  const liveIndex = currentPeriods.length ? blocks.findIndex((block) => block.periods[0] === currentPeriods[0]) : -1;
  const browsing = browseIndex === null ? null : (blocks[browseIndex] ?? null);
  const anchorIndex = liveIndex >= 0 ? liveIndex : next ? blocks.findIndex((block) => block.periods.includes(next.period)) - 1 : blocks.length - 1;
  const cursor = browseIndex ?? anchorIndex;
  const step = (delta: number) => {
    const to = cursor + delta;
    if (to < 0 || to >= blocks.length) return;
    setBrowseIndex(to === liveIndex ? null : to);
  };

  const shown = browsing ? browsing.klass : current;
  const shownStart = browsing ? browsing.start : blockStart;
  const shownEnd = browsing ? browsing.end : blockEnd;
  const shownNext = browsing ? (blocks[browseIndex! + 1]?.klass ?? null) : next;
  const shownNextStart = browsing ? (blocks[browseIndex! + 1]?.start.start ?? null) : nextStart;
  const moving = Boolean(shown && shownNext && shown.room !== shownNext.room);

  const remaining = (() => {
    if (!shownStart || !shownEnd) return null;
    if (minute >= shownEnd.end) return "이미 끝남";
    if (minute < shownStart.start) return `${duration(shownStart.start - minute)} 뒤`;
    return `${duration(Math.max(0, shownEnd.end - minute))} 남음`;
  })();
  const progress = shownStart && shownEnd ? Math.min(1, Math.max(0, (minute - shownStart.start) / (shownEnd.end - shownStart.start))) : 0;

  const headline = current
    ? koreanName(current.subject)
    : !home.hasClass
      ? (home.offLabel ?? "휴일")
      : today.length === 0
        ? "수업 없는 날"
        : !next
          ? "일과 종료"
          : (home.breakName ?? breakKind);

  const vacation = home.vacation;
  const vacationDone = vacation ? Math.min(1, Math.max(0, daysBetween(vacation.since, home.date) / Math.max(1, daysBetween(vacation.since, vacation.resumesOn)))) : 0;
  const md = (key: string) => `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`;

  return (
    <Stack gap="md" minWidth={0}>
      <Inline justify="between" align="center" gap="md" wrap>
        <Inline gap="sm" align="center">
          <Text as="span" variant="caption" ink="tertiary">{dateLabel(home.date)}</Text>
          {planned ? <PlanMark /> : null}
        </Inline>
        {browsing ? (
          <Text as="span" variant="label" ink="tertiary">{periodRuns(browsing.periods)}</Text>
        ) : periodLabel ? (
          current ? <Badge variant="solid" size="sm">{periodLabel}</Badge> : <Text as="span" variant="label" ink="tertiary">{periodLabel}</Text>
        ) : null}
      </Inline>

      {blocks.length > 0 ? (
        <Inline gap="xs" align="center">
          <IconButton variant="ghost" size="xs" aria-label="이전 수업" disabled={cursor <= 0} onClick={() => step(-1)}><Glyph name="chevron-left" /></IconButton>
          <IconButton variant="ghost" size="xs" aria-label="다음 수업" disabled={cursor >= blocks.length - 1} onClick={() => step(1)}><Glyph name="chevron-right" /></IconButton>
          {browsing ? <Button size="xs" variant="hairline" onClick={() => setBrowseIndex(null)}><Glyph name="locate-fixed" />지금으로</Button> : null}
        </Inline>
      ) : null}

      <Text as="p" variant="display">{browsing ? koreanName(browsing.klass.subject) : headline}</Text>

      {shown ? (
        <Inline gap="sm" align="center" wrap>
          <Glyph name="map-pin" ink="tertiary" />
          <Text as="span" strong>{shown.room}</Text>
          <Text as="span" ink="secondary">· {shown.teacher}</Text>
          <Text as="span" ink="secondary">· {sectionNumber(shown.section)}분반</Text>
        </Inline>
      ) : (
        <Text as="p" ink="secondary">{untilNext !== null && untilNext > 0 ? `다음 수업까지 ${duration(untilNext)}` : (quip ?? "오늘 수업은 모두 끝났습니다.")}</Text>
      )}

      {vacation ? <Meter value={vacationDone} label={`종업 ${md(vacation.since)}`} valueText={`개학 ${md(vacation.resumesOn)} · D-${vacation.daysLeft}`} /> : null}

      {shownStart && shownEnd && remaining !== null ? <Meter value={progress} label={`${hhmm(shownStart.start)} – ${hhmm(shownEnd.end)}`} valueText={remaining} weight="thick" /> : null}

      {shownNext ? (
        <Inline gap="sm" align="center" wrap>
          <Eyebrow>다음</Eyebrow>
          <Glyph name="arrow-right" ink="tertiary" />
          <Text as="span" strong>{shownNext.period}교시 {koreanName(shownNext.subject)}</Text>
          <Text as="span" ink="tertiary">{shownNext.room}</Text>
          {shownNextStart !== null ? <Text as="span" ink="tertiary" numeric>{hhmm(shownNextStart)}</Text> : null}
          {moving ? <Badge variant="soft" size="sm" accent="info"><Glyph name="footprints" />교실 이동</Badge> : null}
        </Inline>
      ) : null}
    </Stack>
  );
};
