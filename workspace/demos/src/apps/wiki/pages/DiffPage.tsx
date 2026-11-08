// DiffPage.tsx — what changed between two revisions: who made each, the summaries, and the lines that differ.

import { useState } from "react";
import { Link as RouterLink, useParams, useSearchParams } from "react-router-dom";

import { Badge, Button, Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, Segmented } from "../../../kit";
import type { Rev } from "../data/types";
import { diffPath, editPath, historyPath, rawPath, titleOf } from "../lib/paths";
import { signed, stamp } from "../lib/text";
import { ArticleTools } from "../parts/ArticleTools";
import { DiffView } from "../parts/DiffView";
import { Page } from "../parts/Page";
import { UserLink } from "../parts/Rows";
import { useWiki } from "../state/store";

const Side = ({ label, rev, link }: { label: string; rev: Rev; link: { to: string; text: string } | null }) => (
  <Stack gap="xs" minWidth={0}>
    <Text as="span" variant="label" strong={false} ink="tertiary">{label}</Text>
    <Inline gap="sm" align="center" wrap>
      <Text as="span" variant="subheading" numeric>r{rev.n}</Text>
      <Text as="span" variant="body" ink="secondary" numeric>{stamp(rev.at)}</Text>
      {rev.kind === "create" ? <Badge size="xs" variant="soft" accent="success">새 문서</Badge> : null}
      {rev.kind === "revert" ? <Badge size="xs" variant="soft">되돌림</Badge> : null}
      {rev.minor ? <Badge size="xs" variant="soft">사소한 편집</Badge> : null}
    </Inline>
    <Inline gap="sm" align="baseline" wrap>
      <UserLink name={rev.author} />
      <Text as="span" variant="caption" ink="tertiary">{rev.summary}</Text>
    </Inline>
    {link ? (
      <Inline>
        <Button as={RouterLink} to={link.to} size="xs" variant="ghost">{link.text}</Button>
      </Inline>
    ) : null}
  </Stack>
);

export const DiffPage = () => {
  const requested = titleOf(useParams()["*"]);
  const [params] = useSearchParams();
  const { index } = useWiki();
  const [layout, setLayout] = useState("split");
  const title = index.resolve(requested) ?? requested;
  const info = index.articles.get(title);

  if (!info) {
    return (
      <Page title={title} eyebrow="비교" actions={<ArticleTools title={title} current="history" />}>
        <Empty glyph="git-compare" title="이 문서는 아직 없습니다" action={<Button as={RouterLink} to={editPath(title)} variant="solid">새 문서 만들기</Button>} />
      </Page>
    );
  }

  const last = info.rev.n;
  const wantedOld = Number(params.get("old"));
  const wantedNew = Number(params.get("new"));
  const newer = info.revs.find((rev) => rev.n === (Number.isInteger(wantedNew) && wantedNew > 0 ? wantedNew : last));
  const older = info.revs.find((rev) => rev.n === (Number.isInteger(wantedOld) && wantedOld > 0 ? wantedOld : (newer?.n ?? 1) - 1));

  if (!older || !newer || older.n >= newer.n) {
    return (
      <Page title={title} eyebrow="비교" actions={<ArticleTools title={title} current="history" />}>
        <Empty glyph="git-compare" title="비교할 두 판을 고르지 못했습니다" description="역사에서 앞 판과 뒤 판을 골라 주세요. 앞 판이 뒤 판보다 오래되어야 합니다." action={<Button as={RouterLink} to={historyPath(title)} variant="hairline">역사로 가기</Button>} />
      </Page>
    );
  }

  const changes = newer.size - older.size;
  return (
    <Page title={title} eyebrow={`비교 · r${older.n} → r${newer.n}`} docTitle={`${title} r${older.n}–r${newer.n} 비교`} actions={<ArticleTools title={title} current="history" />}>
      <Stack gap="lg">
        <Grid columns={{ base: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }} gap="lg" align="start">
          <Side label="앞 판" rev={older} link={older.n > 1 ? { to: diffPath(title, older.n - 1, older.n), text: "← 이전 편집" } : null} />
          <Side label="뒤 판" rev={newer} link={newer.n < last ? { to: diffPath(title, newer.n, newer.n + 1), text: "다음 편집 →" } : null} />
        </Grid>
        <Inline justify="between" align="center" gap="md" wrap>
          <Segmented
            label="비교 보기"
            value={layout}
            onChange={setLayout}
            options={[
              { id: "split", label: "두 칸", glyph: "columns-2" },
              { id: "unified", label: "한 칸", glyph: "list" },
            ]}
          />
          <Inline gap="md" align="center" wrap>
            <Text as="p" variant="caption" ink={changes > 0 ? "success" : changes < 0 ? "error" : "tertiary"} numeric>{signed(changes)}바이트</Text>
            <Button as={RouterLink} to={rawPath(title, newer.n)} size="sm" variant="hairline">
              <Glyph name="scroll-text" />
              뒤 판 원문
            </Button>
          </Inline>
        </Inline>
        <DiffView before={older.text} after={newer.text} layout={layout === "unified" ? "unified" : "split"} />
      </Stack>
    </Page>
  );
};
