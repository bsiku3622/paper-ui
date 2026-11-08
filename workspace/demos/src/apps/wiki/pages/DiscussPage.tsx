import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { Button, Field, FormField, Inline, Stack, Surface, Text, Textarea } from "@studio-baeks/paper-ui";

import { Empty, Glyph, Tabs, useToast } from "../../../kit";
import type { Thread } from "../data/types";
import { articlePath, editPath, loginPath, threadPath, titleOf, discussPath } from "../lib/paths";
import { ArticleTools } from "../parts/ArticleTools";
import { Callout } from "../parts/Callout";
import { Page } from "../parts/Page";
import { Rows, ThreadRow } from "../parts/Rows";
import { useWiki } from "../state/store";

export const lastAt = (thread: Thread) => thread.comments[thread.comments.length - 1]?.at ?? thread.at;

export const DiscussPage = () => {
  const requested = titleOf(useParams()["*"]);
  const navigate = useNavigate();
  const toast = useToast();
  const { index, threads, addThread, loggedIn, user } = useWiki();
  const title = index.resolve(requested) ?? requested;
  const exists = index.articles.has(title);

  const all = threads.filter((thread) => thread.article === title).sort((a, b) => lastAt(b) - lastAt(a));
  const open = all.filter((thread) => thread.status === "open");
  const closed = all.filter((thread) => thread.status === "closed");
  const [tab, setTab] = useState("open");
  const [composing, setComposing] = useState(false);
  const [topic, setTopic] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const shown = tab === "open" ? open : closed;
  const showForm = composing || all.length === 0;

  const submit = () => {
    if (!topic.trim() || !body.trim() || busy) return;
    setBusy(true);
    window.setTimeout(() => {
      const thread = addThread({ article: title, title: topic, text: body });
      setBusy(false);
      toast("토론을 열었습니다");
      navigate(threadPath(thread.id));
    }, 300);
  };

  return (
    <Page title={title} eyebrow="토론" docTitle={`${title} 토론`} actions={<ArticleTools title={title} current="discuss" />}>
      <Stack gap="lg">
        {!exists ? (
          <Callout glyph="file-question">
            <Text as="p" variant="body">‘{title}’ 문서는 아직 없지만 토론은 열 수 있습니다.</Text>
            <Inline>
              <Button as={RouterLink} to={editPath(title)} size="sm" variant="hairline">새 문서 만들기</Button>
            </Inline>
          </Callout>
        ) : null}

        <Inline justify="between" align="center" gap="md" wrap>
          <Tabs
            label="토론 상태"
            value={tab}
            onChange={setTab}
            items={[
              { id: "open", label: "진행 중", count: open.length },
              { id: "closed", label: "닫힘", count: closed.length },
            ]}
          />
          <Button variant={showForm ? "hairline" : "solid"} size="sm" onClick={() => setComposing(!composing)} disabled={all.length === 0}>
            <Glyph name={showForm ? "x" : "plus"} />
            {showForm ? "접기" : "새 토론 시작"}
          </Button>
        </Inline>

        {showForm ? (
          <Surface fill="sunken" radius="md" padding="lg">
            <Stack gap="md">
              <Text as="h2" variant="subheading">새 토론</Text>
              {!loggedIn ? (
                <Text as="p" variant="caption" ink="tertiary">
                  로그인하지 않았습니다. ‘손님’으로 올라갑니다.{" "}
                  <Button as={RouterLink} to={loginPath(discussPath(title))} size="xs" variant="ghost">로그인</Button>
                </Text>
              ) : null}
              <FormField label="주제">
                <Field fill="raised" placeholder="예: 연표의 순서 정리" value={topic} onChange={(event) => setTopic(event.currentTarget.value)} maxLength={80} />
              </FormField>
              <FormField label="첫 글" description="문서 이름은 [[문서]], 굵게는 '''글자'''로 쓸 수 있습니다.">
                <Textarea fill="raised" rows={5} value={body} onChange={(event) => setBody(event.currentTarget.value)} />
              </FormField>
              <Inline justify="end" gap="sm">
                {all.length > 0 ? <Button variant="ghost" onClick={() => setComposing(false)}>취소</Button> : null}
                <Button variant="solid" loading={busy} loadingLabel="올리는 중" disabled={!topic.trim() || !body.trim()} onClick={submit}>
                  {user}님으로 올리기
                </Button>
              </Inline>
            </Stack>
          </Surface>
        ) : null}

        {shown.length === 0 ? (
          <Empty
            glyph="messages-square"
            title={tab === "open" ? "진행 중인 토론이 없습니다" : "닫힌 토론이 없습니다"}
            description={tab === "open" ? "고칠 점이나 궁금한 점이 있으면 토론을 열어 보세요." : "닫힌 토론은 여기에 모입니다."}
            action={<Button as={RouterLink} to={articlePath(title)} variant="hairline" size="sm">문서로 돌아가기</Button>}
          />
        ) : (
          <Rows>
            {shown.map((thread) => (
              <ThreadRow key={thread.id} thread={thread} showArticle={false} />
            ))}
          </Rows>
        )}
      </Stack>
    </Page>
  );
};
