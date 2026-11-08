import { useMemo } from "react";
import { Link as RouterLink, Navigate, useParams, useSearchParams } from "react-router-dom";

import { Badge, Button, Divider, Inline, Link, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph } from "../../../kit";
import { suggest } from "../data/search";
import { parsedOf } from "../data";
import { parse } from "../lib/markup";
import { articlePath, backlinksPath, discussPath, editPath, historyPath, diffPath, homePath, searchPath, titleOf } from "../lib/paths";
import { stamp } from "../lib/text";
import { Callout } from "../parts/Callout";
import { Page } from "../parts/Page";
import { ArticleTools } from "../parts/ArticleTools";
import { Body } from "../render/Body";
import { makeCtx } from "../render/ctx";
import { useWiki } from "../state/store";

const Missing = ({ title }: { title: string }) => {
  const { index, loggedIn } = useWiki();
  const similar = suggest(index, title.slice(0, Math.max(2, Math.ceil(title.length / 2))), 6);
  const wanted = index.wanted.find((item) => item.title === title);
  return (
    <Page title={title} eyebrow="없는 문서" docTitle={`${title} (문서 없음)`}>
      <Stack gap="lg">
        <Empty
          glyph="file-question"
          title="이 문서는 아직 없습니다"
          description={wanted ? `${wanted.from.length}개 문서가 이 제목을 링크하고 있습니다. 첫 글을 써 주세요.` : "다른 이름의 문서가 있는지 찾아 보거나, 새로 만들어 주세요."}
          action={
            <Inline gap="sm" wrap justify="center">
              <Button as={RouterLink} to={editPath(title)} variant="solid">
                <Glyph name="file-plus" />
                새 문서 만들기
              </Button>
              <Button as={RouterLink} to={searchPath(title)} variant="hairline">
                <Glyph name="search" />
                ‘{title}’ 검색
              </Button>
            </Inline>
          }
        />
        {!loggedIn ? (
          <Callout glyph="info">
            <Text as="p" variant="body">로그인하지 않고 만든 문서는 기록에 ‘손님’으로 남습니다.</Text>
          </Callout>
        ) : null}
        {similar.length > 0 ? (
          <Stack gap="sm">
            <Text as="h2" variant="subheading">비슷한 제목</Text>
            <Inline gap="md" wrap>
              {similar.map((name) => (
                <Link key={name} as={RouterLink} to={articlePath(name)} underline="hover">{name}</Link>
              ))}
            </Inline>
          </Stack>
        ) : null}
        {wanted ? (
          <Stack gap="sm">
            <Text as="h2" variant="subheading">이 제목을 링크한 문서</Text>
            <Inline gap="md" wrap>
              {wanted.from.map((name) => (
                <Link key={name} as={RouterLink} to={articlePath(name)} underline="hover">{name}</Link>
              ))}
            </Inline>
          </Stack>
        ) : null}
      </Stack>
    </Page>
  );
};

export const ArticlePage = () => {
  const requested = titleOf(useParams()["*"]);
  const [params] = useSearchParams();
  const { index } = useWiki();
  const resolved = index.resolve(requested);
  const title = resolved ?? requested;
  const info = index.articles.get(title);
  const from = params.get("from");
  const wantedRev = Number(params.get("rev"));
  const rev = info && Number.isInteger(wantedRev) && wantedRev > 0 ? info.revs.find((item) => item.n === wantedRev) : undefined;
  const raw = params.get("raw") === "1";
  const shown = rev ?? info?.rev;
  const parsed = useMemo(() => (shown ? (rev ? parse(rev.text) : parsedOf(shown.text)) : null), [shown, rev]);
  const ctx = useMemo(() => makeCtx(index, parsed), [index, parsed]);

  if (requested === "") return <Navigate to={homePath()} replace />;
  if (!info || !shown || !parsed) return <Missing title={requested} />;
  if (index.articles.get(requested)?.redirect && resolved && resolved !== requested) {
    return <Navigate to={`${articlePath(resolved)}?from=${encodeURIComponent(requested)}`} replace />;
  }

  const parent = title.includes("/") ? title.slice(0, title.lastIndexOf("/")) : null;
  const old = rev !== undefined && rev.n !== info.rev.n;
  const newer = old ? info.revs.find((item) => item.n === rev.n + 1) : undefined;

  return (
    <Page
      title={title}
      toc={parsed.toc}
      eyebrow={
        parent && index.resolve(parent) ? (
          <Link as={RouterLink} to={articlePath(parent)} underline="hover">← {parent}</Link>
        ) : undefined
      }
      meta={
        <>
          <Text as="span" variant="caption" ink="tertiary">최근 수정 시각: {stamp(info.rev.at)}</Text>
          {info.rev.minor ? <Badge size="xs" variant="soft">사소한 편집</Badge> : null}
        </>
      }
      actions={<ArticleTools title={title} current="article" />}
    >
      <Stack gap="xl">
        {from ? (
          <Callout glyph="corner-down-right">
            <Text as="p" variant="body">‘{from}’에서 넘어왔습니다.</Text>
          </Callout>
        ) : null}
        {old ? (
          <Callout glyph="history" tone="warning">
            <Text as="p" variant="body">
              r{rev.n} 판(<Text as="span" variant="body" ink="inherit" numeric>{stamp(rev.at)}</Text>, {rev.author})을 보고 있습니다. 현재 판이 아닙니다.
            </Text>
            <Inline gap="sm" wrap>
              <Button as={RouterLink} to={articlePath(title)} size="sm" variant="hairline">현재 판 보기</Button>
              <Button as={RouterLink} to={diffPath(title, rev.n, info.rev.n)} size="sm" variant="hairline">현재 판과 비교</Button>
              {newer ? <Button as={RouterLink} to={articlePath(title, undefined, newer.n)} size="sm" variant="ghost">다음 판 r{newer.n} →</Button> : null}
            </Inline>
          </Callout>
        ) : null}
        {parsed.redirect ? (
          <Callout glyph="corner-down-right" tone="warning">
            <Text as="p" variant="body">이 문서는 없는 문서 ‘{parsed.redirect}’로 넘겨주는 문서입니다.</Text>
          </Callout>
        ) : null}
        {raw ? (
          <Stack gap="md">
            <Inline justify="between" align="center">
              <Text as="h2" variant="heading">원문</Text>
              <Button as={RouterLink} to={articlePath(title, undefined, old ? rev.n : null)} size="sm" variant="hairline">렌더링된 문서 보기</Button>
            </Inline>
            <Surface fill="sunken" radius="md" padding="md" overflowX="auto">
              <Text as="pre" family="mono" variant="caption">{shown.text}</Text>
            </Surface>
          </Stack>
        ) : (
          <Body parsed={parsed} title={title} ctx={ctx} editable={!old} />
        )}
        <Stack gap="md">
          <Divider />
          <Inline justify="between" align="center" gap="md" wrap>
            <Text as="p" variant="caption" ink="tertiary">
              {stamp(shown.at)}에 {shown.author}님이 r{shown.n} 판으로 저장했습니다. 이 위키의 글은 모두 데모를 위해 새로 쓴 것입니다.
            </Text>
            <Inline gap="md" wrap>
              <Link as={RouterLink} to={backlinksPath(title)} underline="hover"><Text as="span" variant="caption" ink="inherit">역링크 {info.inbound.length}</Text></Link>
              <Link as={RouterLink} to={historyPath(title)} underline="hover"><Text as="span" variant="caption" ink="inherit">역사 {info.revs.length}판</Text></Link>
              <Link as={RouterLink} to={discussPath(title)} underline="hover"><Text as="span" variant="caption" ink="inherit">토론</Text></Link>
            </Inline>
          </Inline>
        </Stack>
      </Stack>
    </Page>
  );
};
