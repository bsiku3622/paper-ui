// RecentDiscussPage.tsx — every thread in the wiki, the most recently answered first.

import { useState } from "react";

import { Stack } from "@studio-baeks/paper-ui";

import { Anchor, Empty, Stat, StatRow, Tabs } from "../../../kit";
import { DAY_MS, present } from "../lib/text";
import { Page } from "../parts/Page";
import { Pager, usePage } from "../parts/Pager";
import { Rows, ThreadRow } from "../parts/Rows";
import { useWiki } from "../state/store";
import { lastAt } from "./DiscussPage";

const SIZE = 12;

export const RecentDiscussPage = () => {
  const { threads } = useWiki();
  const [tab, setTab] = useState("open");
  const now = present();
  const sorted = [...threads].sort((a, b) => lastAt(b) - lastAt(a));
  const open = sorted.filter((thread) => thread.status === "open");
  const closed = sorted.filter((thread) => thread.status === "closed");
  const list = tab === "open" ? open : closed;
  const pages = Math.max(1, Math.ceil(list.length / SIZE));
  const [page, setPage] = usePage(pages);
  const comments = threads.flatMap((thread) => thread.comments);

  return (
    <Page title="최근 토론" description="문서마다 열린 토론을 가장 최근에 글이 달린 순서로 모았습니다.">
      <Stack gap="xl">
        <Anchor>
          <StatRow min="6rem">
            <Stat label="진행 중인 토론" value={String(open.length)} unit="개" />
            <Stat label="24시간 동안 새 댓글" value={String(comments.filter((comment) => now - comment.at < DAY_MS).length)} unit="개" />
            <Stat label="전체 댓글" value={String(comments.length)} unit="개" note={`토론 ${threads.length}개`} />
          </StatRow>
        </Anchor>
        <Tabs
          label="토론 상태"
          value={tab}
          onChange={(next) => {
            setTab(next);
            setPage(1);
          }}
          items={[
            { id: "open", label: "진행 중", count: open.length },
            { id: "closed", label: "닫힘", count: closed.length },
          ]}
        />
        {list.length === 0 ? (
          <Empty glyph="messages-square" title="토론이 없습니다" description="문서의 토론 탭에서 새 토론을 열 수 있습니다." />
        ) : (
          <Stack gap="lg">
            <Rows>
              {list.slice((page - 1) * SIZE, page * SIZE).map((thread) => (
                <ThreadRow key={thread.id} thread={thread} />
              ))}
            </Rows>
            <Pager page={page} pages={pages} onPage={setPage} />
          </Stack>
        )}
      </Stack>
    </Page>
  );
};
