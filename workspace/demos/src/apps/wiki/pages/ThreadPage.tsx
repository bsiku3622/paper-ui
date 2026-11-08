// ThreadPage.tsx — one discussion: the comments in order, and a box to answer. A closed thread can be read but not answered
// until someone reopens it.

import { useRef, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import { Badge, Button, FormField, Inline, Link, Stack, Surface, Text, Textarea } from "@studio-baeks/paper-ui";

import { Empty, Glyph, useToast } from "../../../kit";
import type { Comment } from "../data/types";
import { parseComment } from "../lib/markup";
import { articlePath, discussPath, loginPath, threadPath } from "../lib/paths";
import { stamp } from "../lib/text";
import { Callout } from "../parts/Callout";
import { Page } from "../parts/Page";
import { UserLink } from "../parts/Rows";
import { Inlines } from "../render/Inlines";
import { makeCtx } from "../render/ctx";
import { jump } from "../render/jump";
import { useWiki } from "../state/store";

const Line = ({ text, ctx }: { text: string; ctx: ReturnType<typeof makeCtx> }) =>
  text.startsWith(">") ? (
    <Surface border="start" paddingX="md">
      <Text as="p" variant="body" ink="secondary">
        <Inlines nodes={parseComment(text.replace(/^>\s?/, ""))} ctx={ctx} />
      </Text>
    </Surface>
  ) : (
    <Text as="p" variant="body">
      <Inlines nodes={parseComment(text)} ctx={ctx} />
    </Text>
  );

const Post = ({ comment, starter, onQuote, ctx }: { comment: Comment; starter: string; onQuote: (comment: Comment) => void; ctx: ReturnType<typeof makeCtx> }) => (
  <Stack gap="sm" id={`c${comment.n}`}>
    <Surface fill="sunken" radius="sm" paddingX="md" paddingY="xs">
      <Inline justify="between" align="center" gap="md" wrap>
        <Inline gap="sm" align="baseline">
          <Text as="span" variant="label" ink="tertiary" numeric>#{comment.n}</Text>
          <UserLink name={comment.author} />
          {comment.author === starter ? <Badge size="xs" variant="soft">글쓴이</Badge> : null}
        </Inline>
        <Inline gap="sm" align="center">
          <Text as="span" variant="caption" ink="tertiary" numeric>{stamp(comment.at)}</Text>
          <Button size="xs" variant="ghost" onClick={() => onQuote(comment)}>
            <Glyph name="quote" />
            인용
          </Button>
        </Inline>
      </Inline>
    </Surface>
    <Stack gap="sm" paddingX="md">
      {comment.text.split("\n").filter((line) => line.trim() !== "").map((line, index) => (
        <Line key={index} text={line} ctx={ctx} />
      ))}
    </Stack>
  </Stack>
);

export const ThreadPage = () => {
  const { id = "" } = useParams();
  const toast = useToast();
  const { index, threads, reply, setStatus, user, loggedIn } = useWiki();
  const thread = threads.find((item) => item.id === id);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  if (!thread) {
    return (
      <Page title="토론을 찾을 수 없습니다" eyebrow="토론">
        <Empty glyph="messages-square" title="이 토론은 없습니다" description="지워졌거나 주소가 잘못되었습니다." action={<Button as={RouterLink} to="/wiki/recent-discuss" variant="hairline">최근 토론 보기</Button>} />
      </Page>
    );
  }

  const ctx = makeCtx(index, null);
  const body = { ...ctx, variant: "body" as const };
  const closed = thread.status === "closed";

  const quote = (comment: Comment) => {
    const first = comment.text.split("\n").find((line) => line.trim() !== "" && !line.startsWith(">")) ?? "";
    const text = `>#${comment.n} ${comment.author}: ${first.length > 60 ? `${first.slice(0, 60)}…` : first}\n`;
    setDraft((now) => `${now}${now && !now.endsWith("\n") ? "\n" : ""}${text}`);
    window.requestAnimationFrame(() => area.current?.focus());
  };

  const post = () => {
    if (!draft.trim() || busy || closed) return;
    setBusy(true);
    window.setTimeout(() => {
      reply(thread.id, draft);
      setDraft("");
      setBusy(false);
      toast("댓글을 등록했습니다");
      window.setTimeout(() => jump(`c${thread.comments.length + 1}`), 80);
    }, 300);
  };

  return (
    <Page
      title={thread.title}
      docTitle={`${thread.title} · ${thread.article} 토론`}
      eyebrow={<Link as={RouterLink} to={discussPath(thread.article)} underline="hover">← {thread.article} 토론</Link>}
      meta={
        <>
          <Badge size="sm" variant="soft" accent={closed ? "primary" : "info"}>{closed ? "닫힘" : "진행 중"}</Badge>
          <Text as="span" variant="caption" ink="tertiary" numeric>{stamp(thread.at)}에 {thread.author}님이 시작 · 댓글 {thread.comments.length}</Text>
        </>
      }
      actions={
        <>
          <Button as={RouterLink} to={articlePath(thread.article)} variant="hairline" size="sm">
            <Glyph name="file-text" />
            문서 보기
          </Button>
          <Button
            variant="hairline"
            size="sm"
            onClick={() => {
              setStatus(thread.id, closed ? "open" : "closed");
              toast(closed ? "토론을 다시 열었습니다" : "토론을 닫았습니다", { action: { label: "되돌리기", onSelect: () => setStatus(thread.id, closed ? "closed" : "open") } });
            }}
          >
            <Glyph name={closed ? "rotate-ccw" : "lock"} />
            {closed ? "다시 열기" : "토론 닫기"}
          </Button>
        </>
      }
    >
      <Stack gap="xl">
        <Stack gap="lg">
          {thread.comments.map((comment) => (
            <Post key={comment.n} comment={comment} starter={thread.author} onQuote={quote} ctx={body} />
          ))}
        </Stack>

        {closed ? (
          <Callout glyph="lock">
            <Text as="p" variant="body">닫힌 토론입니다. 글을 이어 쓰려면 먼저 토론을 다시 열어 주세요.</Text>
          </Callout>
        ) : (
          <Surface fill="sunken" radius="md" padding="lg">
            <Stack gap="md">
              <FormField label={`${user}님의 댓글`} description="문서 이름은 [[문서]], 굵게는 '''글자'''로 쓸 수 있고 줄 맨 앞에 >를 붙이면 인용입니다.">
                <Textarea ref={area} fill="raised" rows={4} value={draft} onChange={(event) => setDraft(event.currentTarget.value)} placeholder="의견을 적어 주세요." />
              </FormField>
              <Inline justify="between" align="center" gap="md" wrap>
                {!loggedIn ? (
                  <Inline gap="xs" align="center">
                    <Text as="span" variant="caption" ink="tertiary">로그인하지 않았습니다.</Text>
                    <Button as={RouterLink} to={loginPath(threadPath(thread.id))} size="xs" variant="ghost">로그인</Button>
                  </Inline>
                ) : (
                  <Text as="span" variant="caption" ink="tertiary">{draft.trim() ? `${draft.trim().length}자` : ""}</Text>
                )}
                <Button variant="solid" loading={busy} loadingLabel="등록하는 중" disabled={!draft.trim()} onClick={post}>
                  <Glyph name="send" />
                  댓글 등록
                </Button>
              </Inline>
            </Stack>
          </Surface>
        )}
      </Stack>
    </Page>
  );
};
