// SpecialPages.tsx — lists the wiki works out about itself: all articles, ones nothing links to, links that lead nowhere, articles
// with no category, the longest and shortest, the least recently edited, the categories.

import { useState } from "react";
import { Link as RouterLink, Navigate, useParams } from "react-router-dom";

import { Box, Button, Field, Floating, Grid, Inline, Link, Select, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, SurfaceLink, useToast, type GlyphName } from "../../../kit";
import type { ArticleInfo } from "../data";
import { articlePath, categoryPath, editPath, homePath, randomPath, recentDiscussPath, recentPath, specialPath, starredPath } from "../lib/paths";
import { collator, since, stamp } from "../lib/text";
import { Page } from "../parts/Page";
import { PAGE_SIZE, Pager, usePage } from "../parts/Pager";
import { ArticleRow, Rows } from "../parts/Rows";
import { useWiki } from "../state/store";

type Kind = "all" | "orphaned" | "wanted" | "uncategorized" | "longest" | "shortest" | "stale" | "categories";

const KINDS: Record<Kind, { title: string; description: string; glyph: GlyphName }> = {
  all: { title: "모든 문서", description: "이 위키의 모든 문서를 가나다 순서로 봅니다.", glyph: "files" },
  orphaned: { title: "고립된 문서", description: "다른 문서에서 링크하지 않는 문서입니다. 관련 문서의 본문이나 같이 보기에 링크를 걸어 주세요.", glyph: "unlink" },
  wanted: { title: "작성이 필요한 문서", description: "링크는 걸려 있지만 아직 없는 문서입니다. 많이 링크된 것부터 보여 줍니다.", glyph: "file-question" },
  uncategorized: { title: "분류 없는 문서", description: "어느 분류에도 들어 있지 않은 문서입니다.", glyph: "tag" },
  longest: { title: "긴 문서", description: "글이 긴 순서로 40개를 보여 줍니다.", glyph: "arrow-down-to-line" },
  shortest: { title: "짧은 문서", description: "글이 짧은 순서로 40개를 보여 줍니다. 보강이 필요한 문서입니다.", glyph: "arrow-up-to-line" },
  stale: { title: "오래 고치지 않은 문서", description: "마지막 수정이 가장 오래된 순서로 40개를 보여 줍니다.", glyph: "clock" },
  categories: { title: "분류 목록", description: "이 위키의 모든 분류를 문서가 많은 순서로 봅니다.", glyph: "folder-open" },
};

const isKind = (value: string | undefined): value is Kind => value !== undefined && value in KINDS;

// What the visitor has written lives only in this browser; this is the way back to the wiki as it was.
const ResetDemo = () => {
  const toast = useToast();
  const { stored, reset } = useWiki();
  const [open, setOpen] = useState(false);
  const total = stored.edits + stored.threads + stored.replies + stored.stars;
  return (
    <Stack gap="sm">
      <Text as="h2" variant="heading">이 브라우저의 기록</Text>
      <Text as="p" variant="body" ink="secondary">
        편집 {stored.edits}건 · 토론 {stored.threads}개 · 댓글 {stored.replies}개 · 문서함 {stored.stars}개가 이 브라우저에만 저장되어 있습니다.
      </Text>
      <Inline>
        <Button variant="hairline" size="sm" disabled={total === 0} onClick={() => setOpen(true)}>
          <Glyph name="rotate-ccw" />
          처음 상태로 되돌리기
        </Button>
      </Inline>
      <Floating open={open} onOpenChange={setOpen}>
        <Floating.Content as={Surface} fill="raised" radius="lg" padding="xl" presentation="modal" aria-label="처음 상태로 되돌리기">
          <Stack gap="lg" maxWidth="measure.xs">
            <Stack gap="xs">
              <Text as="h2" variant="heading">처음 상태로 되돌릴까요?</Text>
              <Text as="p" variant="body" ink="secondary">내가 쓴 편집과 토론, 댓글, 문서함이 모두 지워지고 위키가 처음 모습으로 돌아갑니다. 되돌릴 수 없습니다.</Text>
            </Stack>
            <Inline justify="end" gap="sm">
              <Button as={Floating.Close} variant="ghost">취소</Button>
              <Button
                variant="solid"
                accent="error"
                onClick={() => {
                  reset();
                  setOpen(false);
                  toast("처음 상태로 되돌렸습니다");
                }}
              >
                모두 지우기
              </Button>
            </Inline>
          </Stack>
        </Floating.Content>
      </Floating>
    </Stack>
  );
};

export const SpecialIndex = () => {
  const { index, stars } = useWiki();
  const real = [...index.articles.values()].filter((article) => !article.redirect);
  const counts: Record<Kind, number> = {
    all: real.length,
    orphaned: index.orphans.length,
    wanted: index.wanted.length,
    uncategorized: real.filter((article) => article.categories.length === 0).length,
    longest: Math.min(40, real.length),
    shortest: Math.min(40, real.length),
    stale: Math.min(40, real.length),
    categories: index.categories.size,
  };
  const others: { to: string; title: string; description: string; glyph: GlyphName }[] = [
    { to: recentPath(), title: "최근 변경", description: "위키 전체의 편집", glyph: "refresh-cw" },
    { to: recentDiscussPath(), title: "최근 토론", description: "답글이 달린 토론", glyph: "messages-square" },
    { to: randomPath(), title: "임의 문서", description: "아무 문서나 열기", glyph: "shuffle" },
    { to: starredPath(), title: "문서함", description: `내가 담은 문서 ${stars.length}개`, glyph: "star" },
    { to: homePath(), title: "대문", description: "추천 문서와 주제별 길잡이", glyph: "book-open" },
  ];
  return (
    <Page title="특수 기능" description="위키가 스스로 정리해 두는 목록과 도구입니다.">
      <Stack gap="xl">
        <Stack gap="sm">
          <Text as="h2" variant="heading">문서 목록</Text>
          <Grid columns={{ base: 1, md: 2 }} gap="sm">
            {(Object.keys(KINDS) as Kind[]).map((kind) => (
              <SurfaceLink key={kind} to={specialPath(kind)} radius="md" padding="md">
                <Inline gap="md" align="start" justify="between">
                  <Inline gap="md" align="start" minWidth={0}>
                    <Glyph name={KINDS[kind].glyph} ink="secondary" />
                    <Stack gap="xs" minWidth={0}>
                      <Text as="span" strong>{KINDS[kind].title}</Text>
                      <Text as="span" variant="caption" ink="tertiary">{KINDS[kind].description}</Text>
                    </Stack>
                  </Inline>
                  <Text as="span" variant="caption" ink="tertiary" numeric>{counts[kind]}</Text>
                </Inline>
              </SurfaceLink>
            ))}
          </Grid>
        </Stack>
        <Stack gap="sm">
          <Text as="h2" variant="heading">바로 가기</Text>
          <Grid columns={{ base: 1, md: 2 }} gap="sm">
            {others.map((item) => (
              <SurfaceLink key={item.to} to={item.to} radius="md" padding="md">
                <Inline gap="md" align="start">
                  <Glyph name={item.glyph} ink="secondary" />
                  <Stack gap="xs" minWidth={0}>
                    <Text as="span" strong>{item.title}</Text>
                    <Text as="span" variant="caption" ink="tertiary">{item.description}</Text>
                  </Stack>
                </Inline>
              </SurfaceLink>
            ))}
          </Grid>
        </Stack>
        <ResetDemo />
      </Stack>
    </Page>
  );
};

const articleRows = (items: readonly ArticleInfo[]) =>
  items.map((article) => <ArticleRow key={article.title} title={article.title} categories={article.categories} bytes={article.size} at={article.updated} />);

export const SpecialList = () => {
  const raw = useParams().kind;
  const { index } = useWiki();
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("title");
  const kind = isKind(raw) ? raw : null;

  const real = [...index.articles.values()].filter((article) => !article.redirect);
  const wanted = index.wanted;
  const categories = [...index.categories.entries()].sort((a, b) => b[1].length - a[1].length || collator.compare(a[0], b[0]));

  let articles: ArticleInfo[] = [];
  if (kind === "all") {
    const needle = filter.trim().toLowerCase();
    articles = real.filter((article) => !needle || article.title.toLowerCase().includes(needle));
    if (sort === "title") articles.sort((a, b) => collator.compare(a.title, b.title));
    else if (sort === "updated") articles.sort((a, b) => b.updated - a.updated);
    else articles.sort((a, b) => b.size - a.size);
  } else if (kind === "orphaned") articles = index.orphans.map((title) => index.articles.get(title)).filter((item): item is ArticleInfo => item !== undefined);
  else if (kind === "uncategorized") articles = real.filter((article) => article.categories.length === 0).sort((a, b) => collator.compare(a.title, b.title));
  else if (kind === "longest") articles = [...real].sort((a, b) => b.size - a.size).slice(0, 40);
  else if (kind === "shortest") articles = [...real].sort((a, b) => a.size - b.size).slice(0, 40);
  else if (kind === "stale") articles = [...real].sort((a, b) => a.updated - b.updated).slice(0, 40);

  const total = kind === "wanted" ? wanted.length : kind === "categories" ? categories.length : articles.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const [page, setPage] = usePage(pages);
  const from = (page - 1) * PAGE_SIZE;

  if (!kind) return <Navigate to={specialPath()} replace />;
  const meta = KINDS[kind];

  return (
    <Page
      title={meta.title}
      eyebrow={
        <Link as={RouterLink} to={specialPath()} underline="hover">← 특수 기능</Link>
      }
      description={meta.description}
      meta={<Text as="span" variant="caption" ink="tertiary" numeric>{total.toLocaleString("ko-KR")}개</Text>}
    >
      <Stack gap="lg">
        {kind === "all" ? (
          <Inline gap="md" align="center" wrap>
            <Box width="lg">
              <Field size="sm" aria-label="제목 걸러 보기" placeholder="제목 걸러 보기" value={filter} onChange={(event) => { setFilter(event.currentTarget.value); setPage(1); }} leading={<Glyph name="search" />} clearable />
            </Box>
            <Box width="md">
              <Select size="sm" aria-label="정렬" value={sort} onChange={(event) => { setSort(event.currentTarget.value); setPage(1); }}>
                <Select.Option value="title">가나다 순서</Select.Option>
                <Select.Option value="updated">최근 수정 순서</Select.Option>
                <Select.Option value="size">글이 긴 순서</Select.Option>
              </Select>
            </Box>
          </Inline>
        ) : null}

        {total === 0 ? (
          <Empty glyph={meta.glyph} title="해당하는 문서가 없습니다" description={kind === "orphaned" ? "모든 문서가 다른 문서와 이어져 있습니다." : "조건을 바꿔 보세요."} />
        ) : kind === "wanted" ? (
          <Stack gap="lg">
            <Rows>
              {wanted.slice(from, from + PAGE_SIZE).map((item) => (
                <Stack key={item.title} gap="xs">
                  <Inline justify="between" align="baseline" gap="md">
                    <Text as={RouterLink} to={editPath(item.title)} variant="body" ink="error" strong>{item.title}</Text>
                    <Text as="span" variant="caption" ink="tertiary" numeric>{item.from.length}개 문서가 링크</Text>
                  </Inline>
                  <Inline gap="sm" align="baseline" wrap>
                    {item.from.slice(0, 4).map((name) => (
                      <Link key={name} as={RouterLink} to={articlePath(name)} underline="hover"><Text as="span" variant="caption" ink="inherit">{name}</Text></Link>
                    ))}
                    {item.from.length > 4 ? <Text as="span" variant="caption" ink="tertiary">외 {item.from.length - 4}개</Text> : null}
                  </Inline>
                </Stack>
              ))}
            </Rows>
            <Pager page={page} pages={pages} onPage={setPage} />
          </Stack>
        ) : kind === "categories" ? (
          <Stack gap="lg">
            <Rows>
              {categories.slice(from, from + PAGE_SIZE).map(([name, members]) => (
                <Inline key={name} justify="between" align="baseline" gap="md">
                  <Text as="span" variant="body" strong>
                    <Link as={RouterLink} to={categoryPath(name)} underline="hover">{name}</Link>
                  </Text>
                  <Text as="span" variant="caption" ink="tertiary" numeric>문서 {members.length}개</Text>
                </Inline>
              ))}
            </Rows>
            <Pager page={page} pages={pages} onPage={setPage} />
          </Stack>
        ) : (
          <Stack gap="lg">
            <Rows>{articleRows(articles.slice(from, from + PAGE_SIZE))}</Rows>
            <Pager page={page} pages={pages} onPage={setPage} />
          </Stack>
        )}

        {kind === "stale" && articles[0] ? (
          <Surface fill="sunken" radius="md" padding="md">
            <Inline gap="sm" align="center" wrap>
              <Glyph name="clock" ink="secondary" />
              <Text as="span" variant="body">가장 오래된 수정은 {articles[0].title}({since(articles[0].updated)}, {stamp(articles[0].updated)})입니다.</Text>
              <Button as={RouterLink} to={editPath(articles[0].title)} size="sm" variant="hairline">고치러 가기</Button>
            </Inline>
          </Surface>
        ) : null}
      </Stack>
    </Page>
  );
};
