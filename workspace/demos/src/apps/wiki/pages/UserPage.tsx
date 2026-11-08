import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import { Badge, Button, Inline, Link, Stack, Text } from "@studio-baeks/paper-ui";

import { Anchor, Avatar, Empty, Stat, StatRow, Tabs } from "../../../kit";
import { isAnonymous, userByName } from "../data/users";
import { inlineText, parseComment } from "../lib/markup";
import { articlePath, loginPath, threadPath, userPath } from "../lib/paths";
import { day, present, since } from "../lib/text";
import { Page } from "../parts/Page";
import { Pager, usePage } from "../parts/Pager";
import { RevisionRow, Rows } from "../parts/Rows";
import { useWiki } from "../state/store";

const SIZE = 15;

export const UserPage = () => {
  const name = useParams().name ?? "";
  const { index, threads, user, loggedIn } = useWiki();
  const [tab, setTab] = useState("edits");
  const known = userByName(name);
  const contribs = index.revs.filter((rev) => rev.author === name);
  const created = contribs.filter((rev) => rev.kind === "create");
  const posts = threads
    .flatMap((thread) => thread.comments.filter((comment) => comment.author === name).map((comment) => ({ thread, comment })))
    .sort((a, b) => b.comment.at - a.comment.at);
  const firstAt = contribs[contribs.length - 1]?.at;
  const joined = known?.joined ?? firstAt ?? present();
  const role = known?.role ?? (isAnonymous(name) ? "비로그인" : "편집자");
  const mine = loggedIn && user === name;

  const list = tab === "edits" ? contribs : tab === "created" ? created : [];
  const total = tab === "posts" ? posts.length : list.length;
  const pages = Math.max(1, Math.ceil(total / SIZE));
  const [page, setPage] = usePage(pages);
  const from = (page - 1) * SIZE;
  const days = Math.max(1, Math.round((present() - joined) / 86_400_000));

  return (
    <Page
      title={name}
      eyebrow="사용자"
      docTitle={`사용자:${name}`}
      description={known?.bio ?? (contribs.length === 0 && posts.length === 0 ? "아직 활동 기록이 없는 사용자입니다." : "소개를 적지 않았습니다.")}
      meta={
        <>
          <Badge size="sm" variant="soft" accent={role === "관리자" ? "info" : "primary"}>{role}</Badge>
          <Text as="span" variant="caption" ink="tertiary" numeric>가입 {day(joined)} · {days.toLocaleString("ko-KR")}일째</Text>
          {mine ? <Badge size="sm" variant="soft" accent="success">나</Badge> : null}
        </>
      }
      actions={<Avatar name={name} size="lg" />}
    >
      <Stack gap="xl">
        <Anchor>
          <StatRow min="6rem">
            <Stat label="편집" value={contribs.length.toLocaleString("ko-KR")} unit="건" note={firstAt ? `첫 편집 ${day(firstAt)}` : undefined} />
            <Stat label="만든 문서" value={String(created.length)} unit="개" />
            <Stat label="토론 댓글" value={String(posts.length)} unit="개" />
          </StatRow>
        </Anchor>

        {!loggedIn && contribs.length === 0 ? (
          <Inline gap="sm" align="center" wrap>
            <Text as="p" variant="body" ink="secondary">내 계정으로 글을 쓰려면 로그인하세요.</Text>
            <Button as={RouterLink} to={loginPath(userPath(name))} size="sm" variant="hairline">로그인</Button>
          </Inline>
        ) : null}

        <Tabs
          label="사용자 활동"
          value={tab}
          onChange={(next) => {
            setTab(next);
            setPage(1);
          }}
          items={[
            { id: "edits", label: "기여", count: contribs.length },
            { id: "created", label: "만든 문서", count: created.length },
            { id: "posts", label: "토론", count: posts.length },
          ]}
        />

        {total === 0 ? (
          <Empty glyph={tab === "posts" ? "messages-square" : "file-text"} title={tab === "posts" ? "쓴 댓글이 없습니다" : tab === "created" ? "만든 문서가 없습니다" : "편집 기록이 없습니다"} description="활동이 생기면 여기에 나타납니다." />
        ) : (
          <Stack gap="lg">
            {tab === "posts" ? (
              <Rows>
                {posts.slice(from, from + SIZE).map(({ thread, comment }) => (
                  <Stack key={`${thread.id}-${comment.n}`} gap="xs">
                    <Inline justify="between" align="baseline" gap="md">
                      <Text as="span" variant="body" strong>
                        <Link as={RouterLink} to={threadPath(thread.id)} underline="hover">{thread.title}</Link>
                      </Text>
                      <Text as="span" variant="caption" ink="tertiary" numeric>{since(comment.at)}</Text>
                    </Inline>
                    <Text as="p" variant="caption" ink="tertiary" truncate>{inlineText(parseComment(comment.text.split("\n")[0] ?? ""))}</Text>
                    <Link as={RouterLink} to={articlePath(thread.article)} underline="hover"><Text as="span" variant="caption" ink="inherit">{thread.article}</Text></Link>
                  </Stack>
                ))}
              </Rows>
            ) : (
              <Rows>
                {list.slice(from, from + SIZE).map((rev) => (
                  <RevisionRow key={`${rev.title}@${rev.n}`} rev={rev} time="since" showAuthor={false} />
                ))}
              </Rows>
            )}
            <Pager page={page} pages={pages} onPage={setPage} />
          </Stack>
        )}
      </Stack>
    </Page>
  );
};
