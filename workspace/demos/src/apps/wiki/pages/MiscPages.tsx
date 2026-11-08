// MiscPages.tsx — the small pages: the articles a reader starred (문서함), the articles that link to one (역링크), and what is
// shown for an address the wiki does not have.

import { Link as RouterLink, useParams } from "react-router-dom";

import { Button, IconButton, Inline, Link, Stack, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, useToast } from "../../../kit";
import { snippetOf } from "../data/search";
import { articlePath, backlinksPath, editPath, homePath, randomPath, titleOf } from "../lib/paths";
import { since } from "../lib/text";
import { ArticleTools } from "../parts/ArticleTools";
import { Page } from "../parts/Page";
import { ArticleRow, Rows } from "../parts/Rows";
import { useWiki } from "../state/store";

export const StarredPage = () => {
  const toast = useToast();
  const { index, stars, toggleStar } = useWiki();
  const items = stars.map((title) => index.articles.get(title)).filter((item) => item !== undefined);
  return (
    <Page title="문서함" description="별을 눌러 담아 둔 문서입니다. 이 기기에만 저장됩니다.">
      {items.length === 0 ? (
        <Empty
          glyph="star"
          title="담아 둔 문서가 없습니다"
          description="문서 위쪽의 별 단추를 누르면 여기에 모입니다."
          action={<Button as={RouterLink} to={randomPath()} variant="hairline" size="sm">임의 문서 열어 보기</Button>}
        />
      ) : (
        <Rows>
          {items.map((article) => (
            <ArticleRow
              key={article.title}
              title={article.title}
              categories={article.categories}
              bytes={article.size}
              at={article.updated}
              note={
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label={`${article.title}을 문서함에서 빼기`}
                  onClick={() => {
                    toggleStar(article.title);
                    toast("문서함에서 뺐습니다", { action: { label: "되돌리기", onSelect: () => toggleStar(article.title) } });
                  }}
                >
                  <Glyph name="star-off" />
                </IconButton>
              }
            />
          ))}
        </Rows>
      )}
    </Page>
  );
};

export const BacklinksPage = () => {
  const requested = titleOf(useParams()["*"]);
  const { index } = useWiki();
  const title = index.resolve(requested) ?? requested;
  const info = index.articles.get(title);
  const inbound = info?.inbound ?? [];
  return (
    <Page title={title} eyebrow="역링크" docTitle={`${title} 역링크`} actions={<ArticleTools title={title} current="article" />} meta={<Text as="span" variant="caption" ink="tertiary" numeric>이 문서를 링크한 문서 {inbound.length}개</Text>}>
      {inbound.length === 0 ? (
        <Empty
          glyph="unlink"
          title={info ? "이 문서를 링크한 문서가 없습니다" : "이 문서는 아직 없습니다"}
          description={info ? "관련 문서의 본문이나 같이 보기에 링크를 걸어 주세요." : "문서를 만들면 링크한 문서가 여기에 모입니다."}
          action={info ? undefined : <Button as={RouterLink} to={editPath(title)} variant="solid" size="sm">새 문서 만들기</Button>}
        />
      ) : (
        <Rows>
          {inbound.map((from) => {
            const other = index.articles.get(from);
            const snippet = other ? snippetOf(other.parsed.plain, title) : null;
            return (
              <Stack key={from} gap="xs">
                <Inline justify="between" align="baseline" gap="md">
                  <Text as="span" variant="body" strong>
                    <Link as={RouterLink} to={articlePath(from)} underline="hover">{from}</Link>
                  </Text>
                  {other ? <Text as="span" variant="caption" ink="tertiary" numeric>{since(other.updated)}</Text> : null}
                </Inline>
                {snippet ? <Text as="p" variant="caption" ink="tertiary">{snippet}</Text> : null}
              </Stack>
            );
          })}
        </Rows>
      )}
    </Page>
  );
};

export const NotFoundPage = () => (
  <Page title="이 주소에는 페이지가 없습니다" eyebrow="404">
    <Empty
      glyph="compass"
      title="찾는 페이지가 없습니다"
      description="주소가 바뀌었거나 잘못 입력했을 수 있습니다."
      action={
        <Inline gap="sm" wrap justify="center">
          <Button as={RouterLink} to={homePath()} variant="solid" size="sm">대문으로</Button>
          <Button as={RouterLink} to={backlinksPath("대문")} variant="hairline" size="sm">대문을 링크한 문서</Button>
        </Inline>
      }
    />
  </Page>
);
