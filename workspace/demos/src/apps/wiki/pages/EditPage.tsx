// EditPage.tsx — the markup as text, with the rendered article beside it as you type, a diff against the saved text, and the
// edit summary that goes into the history. Saving makes a new revision. “[편집]” beside a heading opens just that section.

import { useDeferredValue, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { Button, Checkbox, Field, FormField, Grid, IconButton, Inline, Stack, Surface, Text, Textarea } from "@studio-baeks/paper-ui";

import { Glyph, Segmented, useToast, type GlyphName } from "../../../kit";
import { parse } from "../lib/markup";
import { articlePath, historyPath, loginPath, editPath, titleOf } from "../lib/paths";
import { getSection, hasSection, replaceSection, sectionTitle } from "../lib/sections";
import { signed, sizeOf } from "../lib/text";
import { ArticleTools } from "../parts/ArticleTools";
import { Callout } from "../parts/Callout";
import { DiffView } from "../parts/DiffView";
import { Page } from "../parts/Page";
import { Body } from "../render/Body";
import { makeCtx } from "../render/ctx";
import { useWiki } from "../state/store";

type Change = { value: string; start: number; end: number };

const TOOLS: { id: string; label: string; glyph: GlyphName }[] = [
  { id: "bold", label: "굵게", glyph: "bold" },
  { id: "italic", label: "기울임", glyph: "italic" },
  { id: "link", label: "문서 링크", glyph: "link" },
  { id: "footnote", label: "각주", glyph: "asterisk" },
  { id: "heading", label: "절 제목", glyph: "heading" },
  { id: "list", label: "목록", glyph: "list" },
  { id: "numbered", label: "번호 목록", glyph: "list-ordered" },
  { id: "quote", label: "인용", glyph: "quote" },
  { id: "table", label: "표", glyph: "table" },
  { id: "figure", label: "그림", glyph: "image" },
  { id: "code", label: "코드 블록", glyph: "code" },
];

const starter = (title: string) => `'''${title}''' `;

const Editor = ({ title, section }: { title: string; section: number | null }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { index, save, loggedIn } = useWiki();
  const info = index.articles.get(title);
  const base = info?.rev.text ?? "";
  const part = info && section !== null && hasSection(base, section) ? section : null;
  const original = part === null ? base : getSection(base, part);

  const [text, setText] = useState(info ? original : starter(title));
  const [summary, setSummary] = useState("");
  const [minor, setMinor] = useState(false);
  const [view, setView] = useState("split");
  const [saving, setSaving] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  const full = part === null ? text.replace(/\s+$/, "") : replaceSection(base, part, text);
  const previewSource = useDeferredValue(part === null ? full : text);
  const parsed = useMemo(() => parse(previewSource), [previewSource]);
  const ctx = useMemo(() => makeCtx(index, parsed), [index, parsed]);
  const changed = full.trim() !== base.trim();
  const delta = sizeOf(full) - sizeOf(base);

  const edit = (change: (value: string, start: number, end: number) => Change) => {
    const el = area.current;
    const next = change(text, el?.selectionStart ?? text.length, el?.selectionEnd ?? text.length);
    setText(next.value);
    window.requestAnimationFrame(() => {
      const target = area.current;
      if (!target) return;
      target.focus();
      target.setSelectionRange(next.start, next.end);
    });
  };
  const wrap = (before: string, after: string, placeholder: string) =>
    edit((value, start, end) => {
      const chosen = value.slice(start, end) || placeholder;
      return { value: value.slice(0, start) + before + chosen + after + value.slice(end), start: start + before.length, end: start + before.length + chosen.length };
    });
  const prefix = (mark: string) =>
    edit((value, start, end) => {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lines = value.slice(lineStart, end).split("\n");
      const marked = lines.map((line) => mark + line).join("\n");
      return { value: value.slice(0, lineStart) + marked + value.slice(end), start: start + mark.length, end: end + mark.length * lines.length };
    });
  const insert = (snippet: string) =>
    edit((value, start, end) => {
      const before = value.slice(0, start);
      const lead = before === "" || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
      return { value: before + lead + snippet + "\n\n" + value.slice(end), start: start + lead.length, end: start + lead.length + snippet.length };
    });
  const run = (id: string) => {
    if (id === "bold") wrap("'''", "'''", "굵은 글자");
    else if (id === "italic") wrap("''", "''", "기울인 글자");
    else if (id === "link") wrap("[[", "]]", "문서 이름");
    else if (id === "footnote") wrap("[* ", "]", "각주 내용");
    else if (id === "heading") insert("== 새 절 ==");
    else if (id === "list") prefix("* ");
    else if (id === "numbered") prefix("1. ");
    else if (id === "quote") prefix("> ");
    else if (id === "table") insert("| 항목 | 값 |\n|---|---:|\n| 가 | 1 |\n| 나 | 2 |");
    else if (id === "figure") insert("{{그림 그림 이름 | 설명 | photo | 16 / 9}}");
    else if (id === "code") insert("```\n코드\n```");
  };

  const onSave = () => {
    if (!changed || saving) return;
    setSaving(true);
    window.setTimeout(() => {
      const note = summary.trim();
      const label = part !== null ? `/* ${sectionTitle(base, part)} */ ${note}`.trim() : note;
      const made = save({ title, text: full, summary: label, minor });
      setSaving(false);
      toast(info ? "저장했습니다" : "새 문서를 만들었습니다", {
        action: info ? { label: "되돌리기", onSelect: () => save({ title, text: base, summary: `r${made.n} 판을 되돌림`, kind: "revert", revertOf: info.rev.n }) } : undefined,
      });
      navigate(articlePath(title));
    }, 350);
  };

  const editor = (
    <Stack gap="sm" minWidth={0}>
      <Inline gap="xs" wrap role="toolbar" aria-label="서식">
        {TOOLS.map((tool) => (
          <IconButton key={tool.id} size="sm" variant="ghost" aria-label={tool.label} onClick={() => run(tool.id)}>
            <Glyph name={tool.glyph} />
          </IconButton>
        ))}
      </Inline>
      <Textarea ref={area} rows={part === null ? 28 : 16} aria-label="문서 원문" value={text} onChange={(event) => setText(event.currentTarget.value)} spellCheck={false} />
    </Stack>
  );
  const preview = (
    <Stack gap="sm" minWidth={0}>
      <Text as="h2" variant="label" ink="tertiary">미리보기</Text>
      <Surface border radius="md" padding="lg">
        {previewSource.trim() ? <Body parsed={parsed} title={title} ctx={ctx} compact={view === "split"} /> : <Text as="p" variant="body" ink="tertiary">쓴 내용이 여기에 나타납니다.</Text>}
      </Surface>
    </Stack>
  );

  return (
    <Page title={title} eyebrow={info ? (part === null ? "편집" : `편집 · ${sectionTitle(base, part)} 절`) : "새 문서"} docTitle={`${title} 편집`} actions={<ArticleTools title={title} current="edit" />}>
      <Stack gap="lg">
        {!info ? (
          <Callout glyph="file-plus">
            <Text as="p" variant="body">‘{title}’ 문서는 아직 없습니다. 저장하면 이 제목으로 새 문서가 만들어집니다.</Text>
          </Callout>
        ) : null}
        {part !== null ? (
          <Callout glyph="list-tree">
            <Text as="p" variant="body">‘{sectionTitle(base, part)}’ 절만 고치고 있습니다.</Text>
            <Inline>
              <Button as={RouterLink} to={editPath(title)} size="sm" variant="hairline">문서 전체 편집</Button>
            </Inline>
          </Callout>
        ) : null}
        {!loggedIn ? (
          <Callout glyph="user">
            <Text as="p" variant="body">로그인하지 않았습니다. 지금 저장하면 기록에 ‘손님’으로 남습니다.</Text>
            <Inline>
              <Button as={RouterLink} to={loginPath(editPath(title))} size="sm" variant="hairline">로그인</Button>
            </Inline>
          </Callout>
        ) : null}

        <Inline justify="between" align="center" gap="md" wrap>
          <Segmented
            label="편집 화면"
            value={view}
            onChange={setView}
            options={[
              { id: "edit", label: "편집" },
              { id: "split", label: "나란히" },
              { id: "preview", label: "미리보기" },
              { id: "diff", label: "변경 사항" },
            ]}
          />
          <Text as="p" variant="caption" ink="tertiary" numeric>
            {sizeOf(full).toLocaleString("ko-KR")}바이트 · 저장된 글보다 {signed(delta)}
          </Text>
        </Inline>

        {view === "split" ? (
          <Grid columns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1fr)" }} gap="lg" align="start">
            {editor}
            {preview}
          </Grid>
        ) : null}
        {view === "edit" ? editor : null}
        {view === "preview" ? preview : null}
        {view === "diff" ? <DiffView before={base} after={full} layout="split" /> : null}

        <Surface fill="sunken" radius="md" padding="lg">
          <Stack gap="md">
            <FormField label="편집 요약" description="무엇을 고쳤는지 한 줄로 적어 두면 역사에서 찾기 쉽습니다.">
              <Field fill="raised" placeholder="예: 기후 표에 단위 추가" value={summary} onChange={(event) => setSummary(event.currentTarget.value)} maxLength={120} />
            </FormField>
            <Inline justify="between" align="center" gap="md" wrap>
              <Inline as="label" gap="sm">
                <Checkbox checked={minor} onChange={(event) => setMinor(event.currentTarget.checked)} />
                <Text as="span" variant="body">사소한 편집</Text>
              </Inline>
              <Inline gap="sm">
                <Button as={RouterLink} to={info ? articlePath(title) : historyPath(title)} variant="ghost">취소</Button>
                <Button variant="solid" loading={saving} loadingLabel="저장하는 중" disabled={!changed} onClick={onSave}>
                  저장
                </Button>
              </Inline>
            </Inline>
            {!changed ? <Text as="p" variant="caption" ink="tertiary">바뀐 내용이 없어 저장할 수 없습니다.</Text> : null}
          </Stack>
        </Surface>
      </Stack>
    </Page>
  );
};

export const EditPage = () => {
  const requested = titleOf(useParams()["*"]);
  const [params] = useSearchParams();
  const { index } = useWiki();
  const title = index.resolve(requested) ?? requested;
  const raw = params.get("section");
  const section = raw === null ? null : Number(raw);
  return <Editor key={`${title}:${section ?? "all"}`} title={title} section={section !== null && Number.isInteger(section) && section >= 0 ? section : null} />;
};
