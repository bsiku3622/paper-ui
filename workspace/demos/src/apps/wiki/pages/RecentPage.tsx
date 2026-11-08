// RecentPage.tsx — the newest edits across the whole wiki, grouped by day, with filters: how far back, new articles or reverts,
// minor edits, one editor.

import { Fragment, useMemo, useState } from "react";

import { Box, Checkbox, Divider, Inline, Select, Stack, Text } from "@studio-baeks/paper-ui";

import { Anchor, Empty, Stat, StatRow } from "../../../kit";
import { DAY_MS, present } from "../lib/text";
import { Page } from "../parts/Page";
import { Pager, usePage } from "../parts/Pager";
import { DayHeading, dayKey, RevisionRow, Rows } from "../parts/Rows";
import { useWiki } from "../state/store";

const SIZE = 40;

export const RecentPage = () => {
  const { index } = useWiki();
  const [period, setPeriod] = useState("all");
  const [kind, setKind] = useState("all");
  const [hideMinor, setHideMinor] = useState(false);
  const [who, setWho] = useState("");

  const now = present();
  const authors = useMemo(() => [...new Set(index.revs.map((rev) => rev.author))].sort((a, b) => a.localeCompare(b, "ko")), [index]);
  const stats = useMemo(() => {
    const day = index.revs.filter((rev) => now - rev.at < DAY_MS);
    const season = index.revs.filter((rev) => now - rev.at < 90 * DAY_MS);
    return {
      day: day.length,
      people: new Set(day.map((rev) => rev.author)).size,
      created: season.filter((rev) => rev.kind === "create").length,
      reverted: season.filter((rev) => rev.kind === "revert").length,
    };
  }, [index, now]);

  const filtered = useMemo(
    () =>
      index.revs.filter(
        (rev) =>
          (period === "all" || now - rev.at < Number(period) * DAY_MS) &&
          (kind === "all" || rev.kind === kind) &&
          (!hideMinor || !rev.minor) &&
          (who === "" || rev.author === who),
      ),
    [index, period, kind, hideMinor, who, now],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / SIZE));
  const [page, setPage] = usePage(pages);
  const slice = filtered.slice((page - 1) * SIZE, page * SIZE);
  const days: { key: string; at: number; items: typeof slice }[] = [];
  for (const rev of slice) {
    const key = dayKey(rev.at);
    const last = days[days.length - 1];
    if (last && last.key === key) last.items.push(rev);
    else days.push({ key, at: rev.at, items: [rev] });
  }
  return (
    <Page title="최근 변경" description="위키 전체의 편집을 시간 순서로 모았습니다.">
      <Stack gap="xl">
        <Anchor>
          <StatRow min="6rem">
            <Stat label="24시간 동안 편집" value={stats.day.toLocaleString("ko-KR")} unit="건" note={`편집한 사람 ${stats.people}명`} />
            <Stat label="90일 동안 새 문서" value={stats.created.toLocaleString("ko-KR")} unit="개" note={`되돌림 ${stats.reverted}건`} />
            <Stat label="전체 편집" value={index.revs.length.toLocaleString("ko-KR")} unit="건" note={`문서 ${index.articles.size}개`} />
          </StatRow>
        </Anchor>

        <Inline gap="md" align="center" wrap>
          <Box width="md">
            <Select size="sm" aria-label="기간" value={period} onChange={(event) => { setPeriod(event.currentTarget.value); setPage(1); }}>
              <Select.Option value="1">최근 24시간</Select.Option>
              <Select.Option value="7">최근 7일</Select.Option>
              <Select.Option value="30">최근 30일</Select.Option>
              <Select.Option value="all">전체 기간</Select.Option>
            </Select>
          </Box>
          <Box width="md">
            <Select size="sm" aria-label="종류" value={kind} onChange={(event) => { setKind(event.currentTarget.value); setPage(1); }}>
              <Select.Option value="all">모든 종류</Select.Option>
              <Select.Option value="create">새 문서만</Select.Option>
              <Select.Option value="revert">되돌림만</Select.Option>
            </Select>
          </Box>
          <Box width="md">
            <Select size="sm" aria-label="편집한 사람" value={who} onChange={(event) => { setWho(event.currentTarget.value); setPage(1); }}>
              <Select.Option value="">모든 편집자</Select.Option>
              {authors.map((name) => (
                <Select.Option key={name} value={name}>{name}</Select.Option>
              ))}
            </Select>
          </Box>
          <Inline as="label" gap="sm">
            <Checkbox checked={hideMinor} onChange={(event) => { setHideMinor(event.currentTarget.checked); setPage(1); }} />
            <Text as="span" variant="body">사소한 편집 숨기기</Text>
          </Inline>
          <Text as="p" variant="caption" ink="tertiary" numeric>{filtered.length.toLocaleString("ko-KR")}건</Text>
        </Inline>

        {filtered.length === 0 ? (
          <Empty glyph="refresh-cw" title="조건에 맞는 편집이 없습니다" description="기간이나 종류를 바꿔 보세요." />
        ) : (
          <Stack gap="xl">
            {days.map((group) => (
              <Fragment key={group.key}>
                <Stack gap="sm">
                  <DayHeading at={group.at} count={group.items.length} />
                  <Divider />
                  <Rows>
                    {group.items.map((rev) => (
                      <RevisionRow key={`${rev.title}@${rev.n}`} rev={rev} time="clock" />
                    ))}
                  </Rows>
                </Stack>
              </Fragment>
            ))}
            <Pager page={page} pages={pages} onPage={setPage} />
          </Stack>
        )}
      </Stack>
    </Page>
  );
};
