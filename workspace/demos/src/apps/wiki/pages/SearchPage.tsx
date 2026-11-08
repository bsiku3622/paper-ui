// SearchPage.tsx — a search over titles, categories and text. If the words are exactly a title there is a way straight to it;
// every result shows the sentence the words were found in, with them marked.

import { Fragment, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { Badge, Box, Button, Field, Grid, Inline, Link, Marker, Select, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph } from "../../../kit";
import { search, suggest } from "../data/search";
import { articlePath, categoryPath, editPath, searchPath } from "../lib/paths";
import { since, size } from "../lib/text";
import { Page } from "../parts/Page";
import { Pager, usePage } from "../parts/Pager";
import { Rows } from "../parts/Rows";
import { useWiki } from "../state/store";

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const Highlight = ({ text, query }: { text: string; query: string }) => {
  const words = query.trim().split(/\s+/).filter(Boolean).map(escape);
  if (words.length === 0) return <>{text}</>;
  return (
    <>
      {text.split(new RegExp(`(${words.join("|")})`, "gi")).map((part, index) => (index % 2 === 1 ? <Marker key={index}>{part}</Marker> : <Fragment key={index}>{part}</Fragment>))}
    </>
  );
};

const SIZE = 10;

export const SearchPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { index } = useWiki();
  const q = (params.get("q") ?? "").trim();
  const [draft, setDraft] = useState(q);
  const [sort, setSort] = useState("score");
  useEffect(() => setDraft(q), [q]);

  const hits = useMemo(() => search(index, q), [index, q]);
  const sorted = useMemo(
    () => (sort === "recent" ? [...hits].sort((a, b) => (index.articles.get(b.title)?.updated ?? 0) - (index.articles.get(a.title)?.updated ?? 0)) : hits),
    [hits, sort, index],
  );
  const pages = Math.max(1, Math.ceil(sorted.length / SIZE));
  const [page, setPage] = usePage(pages);
  const exact = q ? index.resolve(q) : null;
  const similar = hits.length === 0 ? suggest(index, q.slice(0, 2), 5) : [];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(searchPath(draft.trim()));
  };

  return (
    <Page title={q ? `‘${q}’ 검색` : "검색"} docTitle={q ? `${q} 검색` : "검색"} description={q ? undefined : "제목, 분류, 본문에서 찾습니다."}>
      <Stack gap="xl">
        <Stack as="form" role="search" onSubmit={submit}>
          <Grid columns="minmax(0, 1fr) auto" gap="sm">
            <Field size="lg" aria-label="검색어" placeholder="문서 제목이나 낱말" value={draft} onChange={(event) => setDraft(event.currentTarget.value)} leading={<Glyph name="search" />} clearable />
            <Button size="lg" variant="solid" type="submit">검색</Button>
          </Grid>
        </Stack>

        {q === "" ? (
          <Empty glyph="search" title="찾을 낱말을 입력해 주세요" description="제목이 정확히 같으면 바로 그 문서로 갈 수 있습니다." />
        ) : (
          <Stack gap="lg">
            {exact ? (
              <Surface fill="sunken" radius="md" padding="md">
                <Inline gap="sm" align="center" wrap>
                  <Glyph name="corner-down-right" ink="secondary" />
                  <Text as="span" variant="body">제목이 같은 문서가 있습니다.</Text>
                  <Link as={RouterLink} to={articlePath(q)} underline="always">‘{q}’ 문서로 바로 가기</Link>
                </Inline>
              </Surface>
            ) : (
              <Surface fill="sunken" radius="md" padding="md">
                <Inline gap="sm" align="center" wrap>
                  <Glyph name="file-question" ink="secondary" />
                  <Text as="span" variant="body">‘{q}’ 문서는 아직 없습니다.</Text>
                  <Link as={RouterLink} to={editPath(q)} underline="always">새로 만들기</Link>
                </Inline>
              </Surface>
            )}

            <Inline justify="between" align="center" gap="md" wrap>
              <Text as="p" variant="body" ink="secondary" numeric>검색 결과 {hits.length.toLocaleString("ko-KR")}개</Text>
              <Box width="md">
                <Select size="sm" aria-label="정렬" value={sort} onChange={(event) => { setSort(event.currentTarget.value); setPage(1); }}>
                  <Select.Option value="score">정확한 순서</Select.Option>
                  <Select.Option value="recent">최근 수정 순서</Select.Option>
                </Select>
              </Box>
            </Inline>

            {hits.length === 0 ? (
              <Empty
                glyph="search"
                title="찾은 문서가 없습니다"
                description="낱말을 줄이거나 다른 말로 찾아 보세요."
                action={
                  similar.length > 0 ? (
                    <Inline gap="md" wrap justify="center">
                      {similar.map((name) => (
                        <Link key={name} as={RouterLink} to={articlePath(name)} underline="hover">{name}</Link>
                      ))}
                    </Inline>
                  ) : undefined
                }
              />
            ) : (
              <Stack gap="lg">
                <Rows>
                  {sorted.slice((page - 1) * SIZE, page * SIZE).map((hit) => {
                    const info = index.articles.get(hit.title);
                    return (
                      <Stack key={hit.title} gap="xs">
                        <Inline gap="sm" align="baseline" wrap>
                          <Text as="h2" variant="subheading">
                            <Link as={RouterLink} to={articlePath(hit.title)} underline="hover"><Highlight text={hit.title} query={q} /></Link>
                          </Text>
                          {hit.inTitle ? <Badge size="xs" variant="soft">제목에 있음</Badge> : null}
                        </Inline>
                        {hit.snippet ? (
                          <Text as="p" variant="body" ink="secondary">
                            <Highlight text={hit.snippet} query={q} />
                          </Text>
                        ) : null}
                        {info ? (
                          <Inline gap="md" align="baseline" wrap>
                            {info.categories.slice(0, 3).map((name) => (
                              <Link key={name} as={RouterLink} to={categoryPath(name)} underline="hover"><Text as="span" variant="caption" ink="inherit">{name}</Text></Link>
                            ))}
                            <Text as="span" variant="caption" ink="tertiary" numeric>{size(info.size)} · {since(info.updated)} 수정</Text>
                          </Inline>
                        ) : null}
                      </Stack>
                    );
                  })}
                </Rows>
                <Pager page={page} pages={pages} onPage={setPage} />
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </Page>
  );
};
