import { Fragment, type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Badge, Divider, Inline, Link, Stack, Text } from "@studio-baeks/paper-ui";

import type { Rev, Thread } from "../data/types";
import { articlePath, categoryPath, diffPath, discussPath, historyPath, threadPath, userPath } from "../lib/paths";
import { clock, day, longDay, signed, since, size, stamp } from "../lib/text";

export const Rows = ({ children }: { children: ReactNode[] }) => (
  <Stack as="ul">
    {children.map((child, index) => (
      <Fragment key={index}>
        {index > 0 ? <Divider /> : null}
        <Stack as="li" paddingY="sm">
          {child}
        </Stack>
      </Fragment>
    ))}
  </Stack>
);

export const UserLink = ({ name }: { name: string }) => (
  <Link as={RouterLink} to={userPath(name)} underline="hover">
    <Text as="span" variant="caption" ink="inherit">{name}</Text>
  </Link>
);

const Delta = ({ value }: { value: number }) => (
  <Text as="span" variant="caption" ink={value > 0 ? "success" : value < 0 ? "error" : "tertiary"} numeric>{signed(value)}</Text>
);

const Flags = ({ rev }: { rev: Rev }) => (
  <>
    {rev.kind === "create" ? <Badge size="xs" variant="soft" accent="success">새 문서</Badge> : null}
    {rev.kind === "revert" ? <Badge size="xs" variant="soft">되돌림</Badge> : null}
    {rev.minor ? <Badge size="xs" variant="soft">사소한 편집</Badge> : null}
  </>
);

export const RevisionRow = ({ rev, time, showAuthor = true }: { rev: Rev; time: "clock" | "since" | "stamp"; showAuthor?: boolean }) => (
  <Stack gap="xs">
    <Inline justify="between" align="baseline" gap="md">
      <Inline gap="sm" align="center" minWidth={0} wrap>
        <Text as="span" variant="body" strong>
          <Link as={RouterLink} to={articlePath(rev.title)} underline="hover">{rev.title}</Link>
        </Text>
        <Link as={RouterLink} to={rev.n > 1 ? diffPath(rev.title, rev.n - 1, rev.n) : historyPath(rev.title)} underline="hover">
          <Text as="span" variant="caption" ink="inherit" numeric>r{rev.n}</Text>
        </Link>
        <Flags rev={rev} />
      </Inline>
      <Text as="span" variant="caption" ink="tertiary" numeric>{time === "clock" ? clock(rev.at) : time === "since" ? since(rev.at) : stamp(rev.at)}</Text>
    </Inline>
    <Inline justify="between" align="baseline" gap="md">
      <Text as="span" variant="caption" ink="tertiary" truncate>{rev.summary}</Text>
      <Inline gap="md" align="baseline">
        {showAuthor ? <UserLink name={rev.author} /> : null}
        <Delta value={rev.delta} />
      </Inline>
    </Inline>
  </Stack>
);

export const DayHeading = ({ at, count }: { at: number; count: number }) => (
  <Inline justify="between" align="baseline" gap="md">
    <Text as="h2" variant="subheading">{longDay(at)}</Text>
    <Text as="span" variant="caption" ink="tertiary" numeric>{count.toLocaleString("ko-KR")}건</Text>
  </Inline>
);

export const dayKey = (at: number) => day(at);

export const ThreadRow = ({ thread, showArticle = true }: { thread: Thread; showArticle?: boolean }) => {
  const last = thread.comments[thread.comments.length - 1]!;
  return (
    <Stack gap="xs">
      <Inline justify="between" align="baseline" gap="md">
        <Inline gap="sm" align="center" minWidth={0} wrap>
          <Text as="span" variant="body" strong>
            <Link as={RouterLink} to={threadPath(thread.id)} underline="hover">{thread.title}</Link>
          </Text>
          <Badge size="xs" variant="soft" accent={thread.status === "open" ? "info" : "primary"}>{thread.status === "open" ? "진행 중" : "닫힘"}</Badge>
        </Inline>
        <Text as="span" variant="caption" ink="tertiary" numeric>{since(last.at)}</Text>
      </Inline>
      <Inline justify="between" align="baseline" gap="md">
        <Inline gap="sm" align="baseline" minWidth={0}>
          {showArticle ? (
            <Link as={RouterLink} to={discussPath(thread.article)} underline="hover">
              <Text as="span" variant="caption" ink="inherit">{thread.article}</Text>
            </Link>
          ) : null}
          <Text as="span" variant="caption" ink="tertiary" truncate>마지막 글 · {last.author}</Text>
        </Inline>
        <Text as="span" variant="caption" ink="tertiary" numeric>댓글 {thread.comments.length}</Text>
      </Inline>
    </Stack>
  );
};

export const ArticleRow = ({ title, categories, bytes, at, note }: { title: string; categories: readonly string[]; bytes: number; at: number; note?: ReactNode }) => (
  <Stack gap="xs">
    <Inline justify="between" align="baseline" gap="md">
      <Text as="span" variant="body" strong>
        <Link as={RouterLink} to={articlePath(title)} underline="hover">{title}</Link>
      </Text>
      <Text as="span" variant="caption" ink="tertiary" numeric>{since(at)}</Text>
    </Inline>
    <Inline justify="between" align="baseline" gap="md">
      <Inline gap="sm" align="baseline" minWidth={0} wrap>
        {categories.length > 0 ? (
          categories.map((name) => (
            <Link key={name} as={RouterLink} to={categoryPath(name)} underline="hover">
              <Text as="span" variant="caption" ink="inherit">{name}</Text>
            </Link>
          ))
        ) : (
          <Text as="span" variant="caption" ink="tertiary">분류 없음</Text>
        )}
      </Inline>
      <Inline gap="md" align="baseline">
        {note}
        <Text as="span" variant="caption" ink="tertiary" numeric>{size(bytes)}</Text>
      </Inline>
    </Inline>
  </Stack>
);
