import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { Badge, Box, Button, Checkbox, Floating, Field, FormField, Inline, Radio, Select, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, Menu, useToast } from "../../../kit";
import type { Rev } from "../data/types";
import { articlePath, diffPath, editPath, titleOf } from "../lib/paths";
import { signed, since, size, stamp } from "../lib/text";
import { ArticleTools } from "../parts/ArticleTools";
import { Page } from "../parts/Page";
import { Rows, UserLink } from "../parts/Rows";
import { useWiki } from "../state/store";

export const HistoryPage = () => {
  const requested = titleOf(useParams()["*"]);
  const navigate = useNavigate();
  const toast = useToast();
  const { index, save } = useWiki();
  const title = index.resolve(requested) ?? requested;
  const info = index.articles.get(title);

  const revs = useMemo(() => (info ? [...info.revs].reverse() : []), [info]);
  const latest = revs[0]?.n ?? 0;
  const [older, setOlder] = useState(Math.max(1, latest - 1));
  const [newer, setNewer] = useState(latest);
  const [hideMinor, setHideMinor] = useState(false);
  const [who, setWho] = useState("");
  const [target, setTarget] = useState<Rev | null>(null);
  const [note, setNote] = useState("");

  if (!info) {
    return (
      <Page title={title} eyebrow="역사" actions={<ArticleTools title={title} current="history" />}>
        <Empty glyph="history" title="이 문서는 아직 없습니다" description="문서가 만들어지면 역사가 쌓입니다." action={<Button as={RouterLink} to={editPath(title)} variant="solid">새 문서 만들기</Button>} />
      </Page>
    );
  }

  const authors = [...new Set(info.revs.map((rev) => rev.author))].sort((a, b) => a.localeCompare(b, "ko"));
  const rows = revs.filter((rev) => (!hideMinor || !rev.minor) && (who === "" || rev.author === who));
  const comparable = older < newer && older >= 1 && newer <= latest;

  const restore = () => {
    if (!target) return;
    const made = save({ title, text: target.text, summary: note.trim() || `r${target.n} 판으로 되돌림`, kind: "revert", revertOf: target.n });
    setTarget(null);
    toast(`r${target.n} 판으로 되돌렸습니다`, { action: { label: "취소", onSelect: () => save({ title, text: info.rev.text, summary: `r${made.n} 판을 되돌림`, kind: "revert", revertOf: info.rev.n }) } });
    navigate(articlePath(title));
  };

  return (
    <Page title={title} eyebrow="역사" docTitle={`${title} 역사`} actions={<ArticleTools title={title} current="history" />}>
      <Stack gap="lg">
        <Inline justify="between" align="center" gap="md" wrap>
          <Inline gap="md" align="center" wrap>
            <Button variant="solid" size="sm" disabled={!comparable} onClick={() => navigate(diffPath(title, older, newer))}>
              <Glyph name="git-compare" />
              선택한 판 비교
            </Button>
            <Text as="p" variant="caption" ink="tertiary" numeric>
              {info.revs.length}판 · {stamp(info.created)}에 시작
            </Text>
          </Inline>
          <Inline gap="md" align="center" wrap>
            <Inline as="label" gap="sm">
              <Checkbox checked={hideMinor} onChange={(event) => setHideMinor(event.currentTarget.checked)} />
              <Text as="span" variant="body">사소한 편집 숨기기</Text>
            </Inline>
            <Box width="md">
              <Select size="sm" aria-label="편집한 사람" value={who} onChange={(event) => setWho(event.currentTarget.value)}>
                <Select.Option value="">모든 편집자</Select.Option>
                {authors.map((name) => (
                  <Select.Option key={name} value={name}>{name}</Select.Option>
                ))}
              </Select>
            </Box>
          </Inline>
        </Inline>

        {rows.length === 0 ? (
          <Empty glyph="filter" title="조건에 맞는 판이 없습니다" description="필터를 풀면 모든 판이 보입니다." />
        ) : (
          <Rows>
            {rows.map((rev) => (
              <Stack key={rev.n} gap="xs">
                <Inline justify="between" align="center" gap="md">
                  <Inline gap="md" align="center" minWidth={0} wrap>
                    <Inline gap="xs" align="center">
                      <Radio name="older" size="sm" aria-label={`r${rev.n} 판을 비교의 앞 판으로`} checked={older === rev.n} onChange={() => setOlder(rev.n)} />
                      <Radio name="newer" size="sm" aria-label={`r${rev.n} 판을 비교의 뒤 판으로`} checked={newer === rev.n} onChange={() => setNewer(rev.n)} />
                    </Inline>
                    <Text as="span" variant="body" strong numeric>r{rev.n}</Text>
                    <Text as="span" variant="body" ink="secondary" numeric>{stamp(rev.at)}</Text>
                    {rev.n === latest ? <Badge size="xs" variant="soft" accent="info">현재 판</Badge> : null}
                    {rev.kind === "create" ? <Badge size="xs" variant="soft" accent="success">새 문서</Badge> : null}
                    {rev.kind === "revert" ? <Badge size="xs" variant="soft">되돌림</Badge> : null}
                    {rev.minor ? <Badge size="xs" variant="soft">사소한 편집</Badge> : null}
                  </Inline>
                  <Menu
                    label={`r${rev.n} 판 메뉴`}
                    items={[
                      { id: "view", label: "이 판 보기", glyph: "eye", onSelect: () => navigate(articlePath(title, undefined, rev.n)) },
                      { id: "prev", label: "이전 판과 비교", glyph: "diff", disabled: rev.n === 1, onSelect: () => navigate(diffPath(title, rev.n - 1, rev.n)) },
                      { id: "now", label: "현재 판과 비교", glyph: "git-compare", disabled: rev.n === latest, onSelect: () => navigate(diffPath(title, rev.n, latest)) },
                      { id: "d", divider: true },
                      { id: "restore", label: "이 판으로 되돌리기", glyph: "undo-2", disabled: rev.n === latest, onSelect: () => { setNote(""); setTarget(rev); } },
                    ]}
                  />
                </Inline>
                <Inline justify="between" align="baseline" gap="md">
                  <Inline gap="sm" align="baseline" minWidth={0}>
                    <UserLink name={rev.author} />
                    <Text as="span" variant="caption" ink="tertiary" truncate>{rev.summary}</Text>
                  </Inline>
                  <Inline gap="md" align="baseline">
                    <Text as="span" variant="caption" ink="tertiary" numeric>{since(rev.at)}</Text>
                    <Text as="span" variant="caption" ink="tertiary" numeric>{size(rev.size)}</Text>
                    <Text as="span" variant="caption" ink={rev.delta > 0 ? "success" : rev.delta < 0 ? "error" : "tertiary"} numeric>{signed(rev.delta)}</Text>
                  </Inline>
                </Inline>
              </Stack>
            ))}
          </Rows>
        )}
      </Stack>

      <Floating open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
        <Floating.Content as={Surface} fill="raised" radius="lg" padding="xl" presentation="modal" aria-label="이전 판으로 되돌리기">
          <Stack gap="lg" maxWidth="measure.xs">
            <Stack gap="xs">
              <Text as="h2" variant="heading">r{target?.n} 판으로 되돌릴까요?</Text>
              <Text as="p" variant="body" ink="secondary">현재 판 위에 r{target?.n} 판의 글이 새 판으로 저장됩니다. 지금의 판도 역사에 그대로 남습니다.</Text>
            </Stack>
            <FormField label="편집 요약">
              <Field placeholder={`r${target?.n} 판으로 되돌림`} value={note} onChange={(event) => setNote(event.currentTarget.value)} />
            </FormField>
            <Inline justify="end" gap="sm">
              <Button as={Floating.Close} variant="ghost">취소</Button>
              <Button variant="solid" onClick={restore}>되돌리기</Button>
            </Inline>
          </Stack>
        </Floating.Content>
      </Floating>
    </Page>
  );
};
